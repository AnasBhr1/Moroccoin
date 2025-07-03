import os
import django
import sys
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moroccoin_admin.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import User, Transaction, Refund, UserActivity, ChatMessage, Notification

AdminUser = get_user_model()

def create_admin_users():
    """Create admin users"""
    print("Creating admin users...")
    
    # Create superuser admin
    if not AdminUser.objects.filter(username='admin').exists():
        admin = AdminUser.objects.create_user(
            username='admin',
            email='admin@moroccoin.com',
            password='admin123',
            first_name='Super',
            last_name='Admin',
            role='admin',
            is_staff=True,
            is_superuser=True
        )
        print(f"Created admin user: {admin.username}")
    
    # Create support users
    support_users = [
        {'username': 'sarah_support', 'email': 'sarah@moroccoin.com', 'first_name': 'Sarah', 'last_name': 'Hassan'},
        {'username': 'ahmed_support', 'email': 'ahmed@moroccoin.com', 'first_name': 'Ahmed', 'last_name': 'Benali'},
    ]
    
    for user_data in support_users:
        if not AdminUser.objects.filter(username=user_data['username']).exists():
            user = AdminUser.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password='support123',
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role='support'
            )
            print(f"Created support user: {user.username}")

def create_users():
    """Create sample users"""
    print("Creating sample users...")
    
    sample_users = [
        {
            'user_id': 'user_001',
            'email': 'youssef.alami@gmail.com',
            'phone': '+212612345678',
            'first_name': 'Youssef',
            'last_name': 'Alami',
            'country': 'Morocco',
            'verification_status': 'verified',
            'balance': Decimal('5000.00')
        },
        {
            'user_id': 'user_002',
            'email': 'fatima.benali@gmail.com',
            'phone': '+212687654321',
            'first_name': 'Fatima',
            'last_name': 'Benali',
            'country': 'Morocco',
            'verification_status': 'verified',
            'balance': Decimal('2500.00')
        },
        {
            'user_id': 'user_003',
            'email': 'mohamed.hassan@gmail.com',
            'phone': '+212698765432',
            'first_name': 'Mohamed',
            'last_name': 'Hassan',
            'country': 'Morocco',
            'verification_status': 'pending',
            'balance': Decimal('1000.00')
        },
        {
            'user_id': 'user_004',
            'email': 'aisha.khalil@gmail.com',
            'phone': '+212611223344',
            'first_name': 'Aisha',
            'last_name': 'Khalil',
            'country': 'Morocco',
            'verification_status': 'verified',
            'balance': Decimal('3500.00')
        },
        {
            'user_id': 'user_005',
            'email': 'omar.idrissi@gmail.com',
            'phone': '+212655443322',
            'first_name': 'Omar',
            'last_name': 'Idrissi',
            'country': 'France',
            'verification_status': 'verified',
            'balance': Decimal('7500.00')
        }
    ]
    
    for user_data in sample_users:
        user, created = User.objects.get_or_create(
            user_id=user_data['user_id'],
            defaults=user_data
        )
        if created:
            print(f"Created user: {user.first_name} {user.last_name}")

def create_transactions():
    """Create sample transactions"""
    print("Creating sample transactions...")
    
    users = list(User.objects.all())
    if len(users) < 2:
        print("Need at least 2 users to create transactions")
        return
    
    transaction_types = ['send', 'receive', 'topup', 'withdrawal']
    statuses = ['completed', 'pending', 'failed']
    
    for i in range(50):
        sender = random.choice(users)
        receiver = random.choice([u for u in users if u != sender])
        
        transaction = Transaction.objects.create(
            transaction_id=f'txn_{str(uuid.uuid4())[:8]}',
            sender_id=sender.user_id,
            receiver_id=receiver.user_id if random.choice([True, False]) else None,
            sender_name=f"{sender.first_name} {sender.last_name}",
            receiver_name=f"{receiver.first_name} {receiver.last_name}",
            amount=Decimal(random.uniform(50, 2000)),
            currency='MAD',
            status=random.choice(statuses),
            transaction_type=random.choice(transaction_types),
            fees=Decimal(random.uniform(5, 50)),
            description=f"Transaction from {sender.first_name} to {receiver.first_name}",
            created_at=datetime.now() - timedelta(days=random.randint(0, 30))
        )
        
        if transaction.status == 'completed':
            transaction.completed_at = transaction.created_at + timedelta(minutes=random.randint(1, 60))
            transaction.save()

def create_refunds():
    """Create sample refunds"""
    print("Creating sample refunds...")
    
    completed_transactions = Transaction.objects.filter(status='completed')[:5]
    
    for transaction in completed_transactions:
        refund = Refund.objects.create(
            refund_id=str(uuid.uuid4()),
            transaction_id=transaction.transaction_id,
            user_id=transaction.sender_id,
            amount=transaction.amount,
            reason=f"Customer requested refund for transaction {transaction.transaction_id}",
            status=random.choice(['pending', 'approved', 'completed']),
            created_at=datetime.now() - timedelta(days=random.randint(0, 10))
        )

def create_user_activities():
    """Create sample user activities"""
    print("Creating sample user activities...")
    
    users = User.objects.all()
    activity_types = ['login', 'logout', 'transaction', 'profile_update', 'password_change', 'verification']
    
    for user in users:
        for _ in range(random.randint(5, 15)):
            UserActivity.objects.create(
                activity_id=str(uuid.uuid4()),
                user_id=user.user_id,
                activity_type=random.choice(activity_types),
                description=f"User {user.first_name} performed {random.choice(activity_types)}",
                ip_address=f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}",
                created_at=datetime.now() - timedelta(days=random.randint(0, 30))
            )

def create_chat_messages():
    """Create sample chat messages"""
    print("Creating sample chat messages...")
    
    users = User.objects.all()[:3]
    admin_users = AdminUser.objects.filter(role='support')
    
    for user in users:
        admin = random.choice(admin_users) if admin_users else None
        
        # User message
        ChatMessage.objects.create(
            message_id=str(uuid.uuid4()),
            user_id=user.user_id,
            message=f"Hello, I need help with my recent transaction",
            sender_type='user',
            created_at=datetime.now() - timedelta(hours=random.randint(1, 24))
        )
        
        # Admin response
        if admin:
            ChatMessage.objects.create(
                message_id=str(uuid.uuid4()),
                user_id=user.user_id,
                admin_id=str(admin.id),
                message=f"Hello {user.first_name}! I'd be happy to help you with your transaction. Can you provide more details?",
                sender_type='admin',
                created_at=datetime.now() - timedelta(hours=random.randint(1, 23))
            )

def create_notifications():
    """Create sample notifications"""
    print("Creating sample notifications...")
    
    users = User.objects.all()
    admin_users = AdminUser.objects.all()
    notification_types = ['email', 'sms', 'push', 'in_app']
    
    for user in users:
        admin = random.choice(admin_users) if admin_users else None
        
        for _ in range(random.randint(1, 3)):
            Notification.objects.create(
                notification_id=str(uuid.uuid4()),
                user_id=user.user_id,
                title="Transaction Update",
                message=f"Your recent transaction has been processed successfully.",
                notification_type=random.choice(notification_types),
                status=random.choice(['sent', 'pending', 'failed']),
                sent_by=str(admin.id) if admin else '1',
                created_at=datetime.now() - timedelta(days=random.randint(0, 7))
            )

def main():
    """Run all seed functions"""
    print("Starting data seeding...")
    
    try:
        create_admin_users()
        create_users()
        create_transactions()
        create_refunds()
        create_user_activities()
        create_chat_messages()
        create_notifications()
        
        print("\n✅ Data seeding completed successfully!")
        print("\nCreated:")
        print(f"- Admin Users: {AdminUser.objects.count()}")
        print(f"- Users: {User.objects.count()}")
        print(f"- Transactions: {Transaction.objects.count()}")
        print(f"- Refunds: {Refund.objects.count()}")
        print(f"- User Activities: {UserActivity.objects.count()}")
        print(f"- Chat Messages: {ChatMessage.objects.count()}")
        print(f"- Notifications: {Notification.objects.count()}")
        
        print("\nLogin credentials:")
        print("Admin: username=admin, password=admin123")
        print("Support: username=sarah_support, password=support123")
        print("Support: username=ahmed_support, password=support123")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()