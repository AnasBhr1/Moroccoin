from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Transaction

AdminUser = get_user_model()

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = AdminUser.objects.create_user(
            username='testadmin',
            email='test@example.com',
            password='testpass123',
            role='admin'
        )

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testadmin',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

    def test_login_invalid_credentials(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testadmin',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = AdminUser.objects.create_user(
            username='testadmin',
            email='test@example.com',
            password='testpass123',
            role='admin'
        )
        
        # Create test user
        self.test_user = User.objects.create(
            user_id='test_user_001',
            email='testuser@example.com',
            phone='+212612345678',
            first_name='Test',
            last_name='User',
            country='Morocco',
            verification_status='verified'
        )

    def test_get_users_authenticated(self):
        # Login to get token
        login_response = self.client.post('/api/auth/login/', {
            'username': 'testadmin',
            'password': 'testpass123'
        })
        token = login_response.data['token']
        
        # Test getting users with authentication
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_users_unauthenticated(self):
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)