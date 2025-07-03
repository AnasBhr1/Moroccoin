from django.contrib import admin
from .models import AdminUser, User, Transaction, Refund, UserActivity, ChatMessage, Notification

@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'email', 'first_name', 'last_name', 'country', 'verification_status', 'balance', 'is_active']
    list_filter = ['verification_status', 'country', 'is_active', 'created_at']
    search_fields = ['user_id', 'email', 'first_name', 'last_name', 'phone']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'sender_name', 'receiver_name', 'amount', 'currency', 'status', 'transaction_type', 'created_at']
    list_filter = ['status', 'transaction_type', 'currency', 'created_at']
    search_fields = ['transaction_id', 'sender_name', 'receiver_name', 'sender_id', 'receiver_id']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ['refund_id', 'transaction_id', 'user_id', 'amount', 'status', 'processed_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['refund_id', 'transaction_id', 'user_id']
    readonly_fields = ['created_at', 'processed_at']

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['activity_id', 'user_id', 'activity_type', 'description', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user_id', 'activity_type', 'description']
    readonly_fields = ['created_at']

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['message_id', 'user_id', 'admin_id', 'sender_type', 'is_read', 'created_at']
    list_filter = ['sender_type', 'is_read', 'created_at']
    search_fields = ['user_id', 'admin_id', 'message']
    readonly_fields = ['created_at']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['notification_id', 'user_id', 'title', 'notification_type', 'status', 'sent_by', 'created_at']
    list_filter = ['notification_type', 'status', 'created_at']
    search_fields = ['user_id', 'title', 'message']
    readonly_fields = ['created_at', 'sent_at']