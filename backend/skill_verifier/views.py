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
            print(f"\n[Resume Parser] Extracted skills from resume: {resume_skills}")
            
            # Extract GitHub username from resume
            github_username = resume_data.get('github_username')
            print(f"[Resume Parser] Extracted GitHub username: {github_username}")
            
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
            print(f"\n{'='*60}")
            print(f"GITHUB DATA FOR USER: {github_username}")
            print(f"{'='*60}")
            print(f"GitHub Data: {json.dumps(github_data, indent=2, default=str)}")
            print(f"{'='*60}\n")
            
            # Step 3: Analyze GitHub skills
            analyzer = SkillAnalyzer()
            github_skills = analyzer.analyze_github_skills(github_data)
            print(f"\nGitHub Skills Extracted: {github_skills}\n")
            
            # Step 4: Verify skills using LLM for intelligent comparison
            verification_result = analyzer.verify_skills_with_llm(resume_skills, github_skills)
            print(f"\n[Skill Analyzer] LLM Verification Result:")
            print(f"Verified Skills: {json.dumps(verification_result.get('verified_skills', []), indent=2)}")
            print(f"Unverified Skills: {verification_result.get('unverified_skills', [])}")
            print(f"Additional Skills: {verification_result.get('additional_skills', [])}")
            print(f"Verification Percentage: {verification_result.get('verification_percentage')}%\n")
            
            # Step 4b: Calculate professional strength metrics and enhance results
            verification_result = analyzer.calculate_strength_metrics(
                verification_result,
                len(resume_skills)
            )
            print(f"[Skill Analyzer] Enhanced with strength metrics:")
            print(f"Strength per Skill: {json.dumps(verification_result.get('strength_per_skill', {}), indent=2)}")
            print(f"Average Strength: {verification_result.get('average_strength')}/10")
            print(f"Experience Level: {verification_result.get('experience_level')}%\n")
            
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
    """Handle GitHub OAuth callback from GitHub"""
    def get(self, request):
        try:
            code = request.query_params.get('code')
            state = request.query_params.get('state')
            
            if not code:
                error_msg = request.query_params.get('error', 'Unknown error')
                return JsonResponse({
                    "error": f"Authorization failed: {error_msg}",
                    "code": None
                }, status=400)
            
            # Exchange code for access token
            oauth_handler = GitHubOAuthHandler()
            access_token, error = oauth_handler.exchange_code_for_token(code)
            if error:
                return JsonResponse({
                    "error": f"Failed to get access token: {error}",
                    "code": None
                }, status=400)
            
            # Get user information
            user_info, error = oauth_handler.get_user_info(access_token)
            if error:
                return JsonResponse({
                    "error": f"Failed to get user info: {error}",
                    "code": None
                }, status=400)
            
            # Generate JWT token
            jwt_token = oauth_handler.generate_jwt_token(user_info)
            if not jwt_token:
                return JsonResponse({
                    "error": "Failed to generate token",
                    "code": None
                }, status=500)
            
            # Store token and user data, then redirect to frontend callback
            from django.http import HttpResponseRedirect
            from urllib.parse import urlencode
            
            callback_params = {
                'code': code,
                'state': state or '',
                'token': jwt_token,
                'user': json.dumps(user_info)
            }
            
            # Redirect to frontend callback page
            frontend_callback_url = f"http://localhost:3000/auth/callback?{urlencode(callback_params)}"
            return HttpResponseRedirect(frontend_callback_url)
        
        except Exception as e:
            from django.http import HttpResponseRedirect
            return HttpResponseRedirect(f"http://localhost:3000/auth/callback?error={str(e)}")
    
    def post(self, request):
        """Handle POST requests from frontend after authorization"""
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


class GetAccountLanguagesView(APIView):
    """Get programming languages used across user's GitHub account"""
    def get(self, request, username):
        try:
            max_repos = request.query_params.get('max_repos', 5)
            try:
                max_repos = int(max_repos)
            except (ValueError, TypeError):
                max_repos = 5
            
            github_service = GitHubService(username)
            languages = github_service.get_account_programming_languages(max_repos)
            
            return Response(languages, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetAccountTechnologiesView(APIView):
    """Get technologies/topics used across user's GitHub account"""
    def get(self, request, username):
        try:
            max_repos = request.query_params.get('max_repos', 20)
            try:
                max_repos = int(max_repos)
            except (ValueError, TypeError):
                max_repos = 20
            
            github_service = GitHubService(username)
            technologies = github_service.get_account_technologies(max_repos)
            
            return Response(technologies, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetAccountSummaryView(APIView):
    """Get comprehensive account summary including user info, languages, and technologies"""
    def get(self, request, username):
        try:
            max_repos = request.query_params.get('max_repos', 20)
            try:
                max_repos = int(max_repos)
            except (ValueError, TypeError):
                max_repos = 20
            
            github_service = GitHubService(username)
            summary = github_service.get_account_summary(max_repos)
            
            return Response(summary, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
