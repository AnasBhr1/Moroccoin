import jwt
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.urls import resolve
import json

User = get_user_model()

class JWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # URLs that don't require authentication
        self.exempt_urls = [
            'api:login',
            'api:health',
            'admin:index',
        ]

    def __call__(self, request):
        # Check if the current URL requires authentication
        try:
            current_url = resolve(request.path_info).url_name
            if current_url in self.exempt_urls:
                response = self.get_response(request)
                return response
        except:
            pass
        
        # For API endpoints, check JWT token
        if request.path.startswith('/api/') and not request.path.startswith('/api/auth/'):
            token = self.get_token_from_request(request)
            if not token:
                return JsonResponse({'error': 'Authentication required'}, status=401)
            
            try:
                payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
                user_id = payload.get('user_id')
                user = User.objects.get(id=user_id)
                request.user = user
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)
        
        response = self.get_response(request)
        return response
    
    def get_token_from_request(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        return auth_header.split(' ')[1]