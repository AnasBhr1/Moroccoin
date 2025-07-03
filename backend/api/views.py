from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Sum
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import requests
import uuid

from .models import AdminUser, User, Transaction, Refund, UserActivity, ChatMessage, Notification
from .serializers import (
    AdminUserSerializer, UserSerializer, TransactionSerializer, RefundSerializer,
    UserActivitySerializer, ChatMessageSerializer, NotificationSerializer,
    LoginSerializer, RefundCreateSerializer, NotificationCreateSerializer
)
from .authentication import generate_jwt_token

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Admin login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        if user and user.is_active:
            token = generate_jwt_token(user)
            return Response({
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role
                }
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    """Admin logout endpoint"""
    # In a real app, you might want to blacklist the token
    return Response({'message': 'Successfully logged out'})

@api_view(['GET'])
def profile_view(request):
    """Get current admin user profile"""
    serializer = AdminUserSerializer(request.user)
    return Response(serializer.data)

# Health Check
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'healthy', 'timestamp': timezone.now()})

# User Management Views
class UserListView(generics.ListAPIView):
    """List all users with search and filtering"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'user_id']
    ordering_fields = ['created_at', 'last_login', 'balance']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        country_filter = self.request.query_params.get('country', None)
        verification_status = self.request.query_params.get('verification_status', None)
        
        if status_filter:
            queryset = queryset.filter(is_active=(status_filter == 'active'))
        if country_filter:
            queryset = queryset.filter(country__icontains=country_filter)
        if verification_status:
            queryset = queryset.filter(verification_status=verification_status)
            
        return queryset

class UserDetailView(generics.RetrieveAPIView):
    """Get user details"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'user_id'

# Transaction Management Views
class TransactionListView(generics.ListAPIView):
    """List all transactions with filtering"""
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['transaction_id', 'sender_name', 'receiver_name', 'sender_id']
    ordering_fields = ['created_at', 'amount', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        transaction_type = self.request.query_params.get('type', None)
        user_id = self.request.query_params.get('user_id', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        if user_id:
            queryset = queryset.filter(Q(sender_id=user_id) | Q(receiver_id=user_id))
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
            
        return queryset

class TransactionDetailView(generics.RetrieveAPIView):
    """Get transaction details"""
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    lookup_field = 'transaction_id'

@api_view(['GET'])
def user_transactions(request, user_id):
    """Get all transactions for a specific user"""
    transactions = Transaction.objects.filter(
        Q(sender_id=user_id) | Q(receiver_id=user_id)
    ).order_by('-created_at')
    
    paginator = PageNumberPagination()
    paginated_transactions = paginator.paginate_queryset(transactions, request)
    serializer = TransactionSerializer(paginated_transactions, many=True)
    
    return paginator.get_paginated_response(serializer.data)

# Refund Management Views
class RefundListView(generics.ListCreateAPIView):
    """List and create refunds"""
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RefundCreateSerializer
        return RefundSerializer
    
    def perform_create(self, serializer):
        refund = serializer.save(
            refund_id=str(uuid.uuid4()),
            processed_by=str(self.request.user.id)
        )
        # In a real app, you would process the refund here
        return refund

@api_view(['POST'])
def process_refund(request, refund_id):
    """Process a refund (approve/reject)"""
    try:
        refund = Refund.objects.get(refund_id=refund_id)
        action = request.data.get('action')  # 'approve' or 'reject'
        
        if action not in ['approve', 'reject']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
        refund.status = 'approved' if action == 'approve' else 'rejected'
        refund.processed_by = str(request.user.id)
        refund.processed_at = timezone.now()
        refund.save()
        
        if action == 'approve':
            # In a real app, you would process the actual refund here
            # Update the original transaction status
            try:
                transaction = Transaction.objects.get(transaction_id=refund.transaction_id)
                transaction.status = 'refunded'
                transaction.save()
            except Transaction.DoesNotExist:
                pass
        
        serializer = RefundSerializer(refund)
        return Response(serializer.data)
        
    except Refund.DoesNotExist:
        return Response({'error': 'Refund not found'}, status=status.HTTP_404_NOT_FOUND)

# Customer Support Views
class ChatMessageListView(generics.ListCreateAPIView):
    """List and create chat messages"""
    serializer_class = ChatMessageSerializer
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            return ChatMessage.objects.filter(user_id=user_id).order_by('created_at')
        return ChatMessage.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(
            message_id=str(uuid.uuid4()),
            admin_id=str(self.request.user.id),
            sender_type='admin'
        )

@api_view(['POST'])
def send_notification(request):
    """Send notification to user (email/SMS)"""
    serializer = NotificationCreateSerializer(data=request.data)
    if serializer.is_valid():
        notification = serializer.save(
            notification_id=str(uuid.uuid4()),
            sent_by=str(request.user.id)
        )
        
        # Send actual notification
        success = send_user_notification(notification)
        
        if success:
            notification.status = 'sent'
            notification.sent_at = timezone.now()
        else:
            notification.status = 'failed'
        
        notification.save()
        
        response_serializer = NotificationSerializer(notification)
        return Response(response_serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def send_user_notification(notification):
    """Helper function to send notifications"""
    try:
        user = User.objects.get(user_id=notification.user_id)
        
        if notification.notification_type == 'email':
            send_mail(
                notification.title,
                notification.message,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            return True
        elif notification.notification_type == 'sms':
            # Mock SMS sending - in production, integrate with SMS provider
            # return send_sms(user.phone, notification.message)
            print(f"SMS to {user.phone}: {notification.message}")
            return True
        
        return False
    except Exception as e:
        print(f"Failed to send notification: {e}")
        return False

# User Activity Views
class UserActivityListView(generics.ListAPIView):
    """List user activities"""
    queryset = UserActivity.objects.all()
    serializer_class = UserActivitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['user_id', 'activity_type', 'description']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id', None)
        activity_type = self.request.query_params.get('activity_type', None)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
            
        return queryset

# Analytics and Dashboard Views
@api_view(['GET'])
def dashboard_stats(request):
    """Get dashboard statistics"""
    # Calculate date ranges
    today = timezone.now().date()
    last_30_days = today - timedelta(days=30)
    last_7_days = today - timedelta(days=7)
    
    # Basic stats
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    verified_users = User.objects.filter(verification_status='verified').count()
    
    total_transactions = Transaction.objects.count()
    completed_transactions = Transaction.objects.filter(status='completed').count()
    pending_transactions = Transaction.objects.filter(status='pending').count()
    failed_transactions = Transaction.objects.filter(status='failed').count()
    
    # Financial stats
    total_volume = Transaction.objects.filter(status='completed').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    total_fees = Transaction.objects.filter(status='completed').aggregate(
        total=Sum('fees')
    )['total'] or 0
    
    # Recent activity
    recent_transactions_count = Transaction.objects.filter(
        created_at__gte=last_7_days
    ).count()
    
    recent_users_count = User.objects.filter(
        created_at__gte=last_7_days
    ).count()
    
    # Refund stats
    pending_refunds = Refund.objects.filter(status='pending').count()
    total_refunds = Refund.objects.count()
    
    # Top countries
    top_countries = User.objects.values('country').annotate(
        count=Count('country')
    ).order_by('-count')[:5]
    
    return Response({
        'users': {
            'total': total_users,
            'active': active_users,
            'verified': verified_users,
            'recent': recent_users_count
        },
        'transactions': {
            'total': total_transactions,
            'completed': completed_transactions,
            'pending': pending_transactions,
            'failed': failed_transactions,
            'recent': recent_transactions_count
        },
        'financial': {
            'total_volume': float(total_volume),
            'total_fees': float(total_fees),
            'currency': 'MAD'
        },
        'refunds': {
            'pending': pending_refunds,
            'total': total_refunds
        },
        'top_countries': list(top_countries)
    })

@api_view(['GET'])
def transaction_chart_data(request):
    """Get transaction data for charts"""
    days = int(request.query_params.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)
    
    # Daily transaction counts
    daily_data = []
    current_date = start_date
    
    while current_date <= end_date:
        transactions_count = Transaction.objects.filter(
            created_at__date=current_date
        ).count()
        
        volume = Transaction.objects.filter(
            created_at__date=current_date,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        daily_data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'transactions': transactions_count,
            'volume': float(volume)
        })
        
        current_date += timedelta(days=1)
    
    # Transaction status distribution
    status_data = Transaction.objects.values('status').annotate(
        count=Count('status')
    ).order_by('-count')
    
    return Response({
        'daily_data': daily_data,
        'status_distribution': list(status_data)
    })