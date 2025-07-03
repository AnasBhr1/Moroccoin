from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health'),
    
    # Authentication
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.profile_view, name='profile'),
    
    # Users
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<str:user_id>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<str:user_id>/transactions/', views.user_transactions, name='user-transactions'),
    
    # Transactions
    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),
    path('transactions/<str:transaction_id>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    
    # Refunds
    path('refunds/', views.RefundListView.as_view(), name='refund-list'),
    path('refunds/<str:refund_id>/process/', views.process_refund, name='process-refund'),
    
    # Customer Support
    path('chat/', views.ChatMessageListView.as_view(), name='chat-list'),
    path('notifications/send/', views.send_notification, name='send-notification'),
    
    # User Activities
    path('activities/', views.UserActivityListView.as_view(), name='activity-list'),
    
    # Analytics
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/charts/', views.transaction_chart_data, name='chart-data'),
]