import requests
import json
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
import jwt
from datetime import datetime, timedelta


class GitHubOAuthHandler:
    """Handle GitHub OAuth authentication"""
    
    def __init__(self):
        self.client_id = settings.GITHUB_CLIENT_ID
        self.client_secret = settings.GITHUB_CLIENT_SECRET
        self.redirect_uri = settings.GITHUB_REDIRECT_URI
        self.oauth_authorize_url = "https://github.com/login/oauth/authorize"
        self.oauth_token_url = "https://github.com/login/oauth/access_token"
        self.api_url = "https://api.github.com/user"
    
    def get_authorize_url(self):
        """Generate GitHub OAuth authorize URL"""
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': 'user:email read:user',
            'state': 'random_state_string'  # In production, use a random string
        }
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{self.oauth_authorize_url}?{query_string}"
    
    def exchange_code_for_token(self, code):
        """Exchange authorization code for access token"""
        try:
            payload = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'code': code,
                'redirect_uri': self.redirect_uri,
            }
            
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
            
            response = requests.post(
                self.oauth_token_url,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('access_token'), None
            else:
                return None, f"Failed to get access token: {response.text}"
        
        except Exception as e:
            return None, str(e)
    
    def get_user_info(self, access_token):
        """Get user information from GitHub using access token"""
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/vnd.github.v3+json',
            }
            
            response = requests.get(
                self.api_url,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                return {
                    'github_username': user_data.get('login'),
                    'github_id': user_data.get('id'),
                    'name': user_data.get('name'),
                    'email': user_data.get('email'),
                    'avatar_url': user_data.get('avatar_url'),
                    'bio': user_data.get('bio'),
                    'company': user_data.get('company'),
                    'location': user_data.get('location'),
                }, None
            else:
                return None, f"Failed to get user info: {response.text}"
        
        except Exception as e:
            return None, str(e)
    
    def generate_jwt_token(self, user_data):
        """Generate JWT token for authenticated user"""
        try:
            payload = {
                'github_id': user_data.get('github_id'),
                'github_username': user_data.get('github_username'),
                'email': user_data.get('email'),
                'name': user_data.get('name'),
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(days=30),
            }
            
            token = jwt.encode(
                payload,
                settings.SECRET_KEY,
                algorithm='HS256'
            )
            
            return token
        except Exception as e:
            return None
