from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import json
import hashlib
from django.core.cache import cache
from django.http import JsonResponse

from .github_service import GitHubService
from .resume_parser import ResumeParser
from .skill_analyzer import SkillAnalyzer
from .models import SkillVerification
from .github_oauth import GitHubOAuthHandler

class VerifySkillsView(APIView):
    def post(self, request):
        # Check if resume file is provided
        if 'resume_pdf' not in request.FILES:
            return Response({"error": "Resume PDF file is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        resume_file = request.FILES['resume_pdf']
        
        try:
            # Step 1: Parse resume PDF to extract skills and GitHub username
            parser = ResumeParser()
            resume_data = parser.parse_resume(resume_file)
            resume_skills = resume_data['skills']
            
            # Extract GitHub username from resume
            github_username = resume_data.get('github_username')
            
            # If GitHub username is not found in resume, check if it's provided in the request
            if not github_username:
                github_username = request.data.get('github_username')
            
            # If still no GitHub username, return error
            if not github_username:
                return Response({"error": "GitHub username not found in resume and not provided in request"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if we already have a cached full response for this combination
            pdf_hash = parser._generate_pdf_hash(resume_file)
            full_cache_key = f"full_verification_{github_username}_{pdf_hash}"
            cached_response = cache.get(full_cache_key)
            
            if cached_response is not None:
                print(f"Cache hit for full verification: {full_cache_key}")
                return Response(cached_response, status=status.HTTP_200_OK)
            
            # Step 2: Get GitHub data
            github_service = GitHubService(github_username)
            github_data = github_service.get_all_github_data()
            
            # Step 3: Analyze GitHub skills
            analyzer = SkillAnalyzer()
            github_skills = analyzer.analyze_github_skills(github_data)
            
            # Step 4: Verify skills using LLM for intelligent comparison
            verification_result = analyzer.verify_skills_with_llm(resume_skills, github_skills)
            
            # Step 4b: Calculate professional strength metrics and enhance results
            verification_result = analyzer.calculate_strength_metrics(
                verification_result,
                len(resume_skills)
            )
            
            # Step 5: Generate verification hash based on the verification result
            # Pass the full verification_result dict; the generator will extract the
            # 'verified_skills' list internally. Previously we passed the list which
            # caused a "'list' object has no attribute 'get'" error.
            hash_value = analyzer.generate_verification_hash(
                github_username,
                verification_result
            )
            
            # Step 6: Save results to database
            verification = SkillVerification.objects.create(
                github_username=github_username,
                resume_file_name=resume_file.name,
                resume_skills=resume_skills,
                github_skills=github_skills,
                verification_result=verification_result,
                hash_value=hash_value
            )
            
            # Prepare response
            response_data = {
                "github_username": github_username,
                "resume_skills": resume_skills,
                "github_skills": github_skills,
                "verification_result": verification_result,
                "hash": hash_value,
                "verification_id": verification.id
            }
            
            # Cache the full response
            cache.set(full_cache_key, response_data, settings.VERIFICATION_CACHE_TIMEOUT)
            
            # Return results
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetVerificationView(APIView):
    def get(self, request, verification_id):
        try:
            verification = SkillVerification.objects.get(id=verification_id)
            return Response({
                "github_username": verification.github_username,
                "resume_skills": verification.resume_skills,
                "github_skills": verification.github_skills,
                "verification_result": verification.verification_result,
                "hash": verification.hash_value,
                "created_at": verification.created_at
            }, status=status.HTTP_200_OK)
        except SkillVerification.DoesNotExist:
            return Response({"error": "Verification not found"}, status=status.HTTP_404_NOT_FOUND)

# Add a new view to clear the cache for testing purposes
class ClearCacheView(APIView):
    def post(self, request):
        cache.clear()
        return Response({"message": "Cache cleared successfully"}, status=status.HTTP_200_OK)


class GitHubOAuthAuthorizeView(APIView):
    """Get GitHub OAuth authorization URL"""
    def get(self, request):
        try:
            oauth_handler = GitHubOAuthHandler()
            authorize_url = oauth_handler.get_authorize_url()
            return Response({
                "authorize_url": authorize_url
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GitHubOAuthCallbackView(APIView):
    """Handle GitHub OAuth callback"""
    def post(self, request):
        try:
            code = request.data.get('code')
            if not code:
                return Response({"error": "Authorization code is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            oauth_handler = GitHubOAuthHandler()
            
            # Exchange code for access token
            access_token, error = oauth_handler.exchange_code_for_token(code)
            if error:
                return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user information
            user_info, error = oauth_handler.get_user_info(access_token)
            if error:
                return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate JWT token
            jwt_token = oauth_handler.generate_jwt_token(user_info)
            if not jwt_token:
                return Response({"error": "Failed to generate token"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Return user info and token
            return Response({
                "token": jwt_token,
                "user": user_info
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GitHubAuthenticateView(APIView):
    """Authenticate with GitHub username directly"""
    def post(self, request):
        try:
            github_username = request.data.get('github_username')
            if not github_username:
                return Response({"error": "GitHub username is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user data from GitHub
            github_service = GitHubService(github_username)
            github_data = github_service.get_user_info()
            
            if not github_data:
                return Response({"error": f"GitHub user '{github_username}' not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Create user info object
            user_info = {
                'github_username': github_username,
                'github_id': github_data.get('id'),
                'name': github_data.get('name'),
                'email': github_data.get('email'),
                'avatar_url': github_data.get('avatar_url'),
                'bio': github_data.get('bio'),
            }
            
            # Generate JWT token
            oauth_handler = GitHubOAuthHandler()
            jwt_token = oauth_handler.generate_jwt_token(user_info)
            
            return Response({
                "token": jwt_token,
                "user": user_info
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)