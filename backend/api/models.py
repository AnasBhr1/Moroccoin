from django.db import models

# Create your models here.
from djongo import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

class AdminUser(AbstractUser):
    """Custom admin user model"""
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('support', 'Support'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='support')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'admin_users'

class User(models.Model):
    """Moroccoin app users"""
    user_id = models.CharField(max_length=100, unique=True, primary_key=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    country = models.CharField(max_length=50)
    verification_status = models.CharField(
        max_length=20, 
        choices=[
            ('pending', 'Pending'),
            ('verified', 'Verified'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'users'
        
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

class Transaction(models.Model):
    """Transaction model"""
    transaction_id = models.CharField(max_length=100, unique=True, primary_key=True)
    sender_id = models.CharField(max_length=100)
    receiver_id = models.CharField(max_length=100, null=True, blank=True)
    sender_name = models.CharField(max_length=200)
    receiver_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='MAD')
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
            ('cancelled', 'Cancelled')
        ],
        default='pending'
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=[
            ('send', 'Send Money'),
            ('receive', 'Receive Money'),
            ('topup', 'Top Up'),
            ('withdrawal', 'Withdrawal')
        ]
    )
    fees = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.transaction_id} - {self.amount} {self.currency}"

class Refund(models.Model):
    """Refund model"""
    refund_id = models.CharField(max_length=100, unique=True, primary_key=True, default=uuid.uuid4)
    transaction_id = models.CharField(max_length=100)
    user_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('completed', 'Completed')
        ],
        default='pending'
    )
    processed_by = models.CharField(max_length=100, null=True, blank=True)  # Admin user ID
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'refunds'
        ordering = ['-created_at']

class UserActivity(models.Model):
    """User activity logs"""
    activity_id = models.CharField(max_length=100, unique=True, primary_key=True, default=uuid.uuid4)
    user_id = models.CharField(max_length=100)
    activity_type = models.CharField(
        max_length=30,
        choices=[
            ('login', 'Login'),
            ('logout', 'Logout'),
            ('transaction', 'Transaction'),
            ('profile_update', 'Profile Update'),
            ('password_change', 'Password Change'),
            ('verification', 'Verification'),
            ('support_contact', 'Support Contact')
        ]
    )
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activities'
        ordering = ['-created_at']

class ChatMessage(models.Model):
    """Chat messages between users and support"""
    message_id = models.CharField(max_length=100, unique=True, primary_key=True, default=uuid.uuid4)
    user_id = models.CharField(max_length=100)
    admin_id = models.CharField(max_length=100, null=True, blank=True)
    message = models.TextField()
    sender_type = models.CharField(
        max_length=10,
        choices=[
            ('user', 'User'),
            ('admin', 'Admin')
        ]
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_messages'
        ordering = ['-created_at']

class Notification(models.Model):
    """Notifications sent to users"""
    notification_id = models.CharField(max_length=100, unique=True, primary_key=True, default=uuid.uuid4)
    user_id = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=[
            ('email', 'Email'),
            ('sms', 'SMS'),
            ('push', 'Push Notification'),
            ('in_app', 'In-App')
        ]
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('sent', 'Sent'),
            ('failed', 'Failed')
        ],
        default='pending'
    )
    sent_by = models.CharField(max_length=100)  # Admin user ID
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']