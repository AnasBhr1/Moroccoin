from rest_framework import serializers
from .models import AdminUser, User, Transaction, Refund, UserActivity, ChatMessage, Notification

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
        extra_kwargs = {'password': {'write_only': True}}

class UserSerializer(serializers.ModelSerializer):
    total_transactions = serializers.SerializerMethodField()
    total_sent = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = '__all__'
    
    def get_total_transactions(self, obj):
        # In a real app, this would be calculated from the database
        return Transaction.objects.filter(sender_id=obj.user_id).count()
    
    def get_total_sent(self, obj):
        # In a real app, this would be calculated from the database
        transactions = Transaction.objects.filter(sender_id=obj.user_id, status='completed')
        return sum(t.amount for t in transactions)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class RefundSerializer(serializers.ModelSerializer):
    transaction_details = serializers.SerializerMethodField()
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Refund
        fields = '__all__'
    
    def get_transaction_details(self, obj):
        try:
            transaction = Transaction.objects.get(transaction_id=obj.transaction_id)
            return {
                'sender_name': transaction.sender_name,
                'receiver_name': transaction.receiver_name,
                'amount': transaction.amount,
                'currency': transaction.currency
            }
        except Transaction.DoesNotExist:
            return None
    
    def get_user_details(self, obj):
        try:
            user = User.objects.get(user_id=obj.user_id)
            return {
                'name': f"{user.first_name} {user.last_name}",
                'email': user.email,
                'phone': user.phone
            }
        except User.DoesNotExist:
            return None

class UserActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = UserActivity
        fields = '__all__'
    
    def get_user_name(self, obj):
        try:
            user = User.objects.get(user_id=obj.user_id)
            return f"{user.first_name} {user.last_name}"
        except User.DoesNotExist:
            return "Unknown User"

class ChatMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    admin_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = '__all__'
    
    def get_user_name(self, obj):
        try:
            user = User.objects.get(user_id=obj.user_id)
            return f"{user.first_name} {user.last_name}"
        except User.DoesNotExist:
            return "Unknown User"
    
    def get_admin_name(self, obj):
        if obj.admin_id:
            try:
                admin = AdminUser.objects.get(id=obj.admin_id)
                return f"{admin.first_name} {admin.last_name}"
            except AdminUser.DoesNotExist:
                return "Unknown Admin"
        return None

class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    sent_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = '__all__'
    
    def get_user_name(self, obj):
        try:
            user = User.objects.get(user_id=obj.user_id)
            return f"{user.first_name} {user.last_name}"
        except User.DoesNotExist:
            return "Unknown User"
    
    def get_sent_by_name(self, obj):
        try:
            admin = AdminUser.objects.get(id=obj.sent_by)
            return f"{admin.first_name} {admin.last_name}"
        except AdminUser.DoesNotExist:
            return "Unknown Admin"

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class RefundCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = ['transaction_id', 'user_id', 'amount', 'reason']

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['user_id', 'title', 'message', 'notification_type']