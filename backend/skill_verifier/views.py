from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import json
import hashlib
from django.core.cache import cache

from .github_service import GitHubService
from .resume_parser import ResumeParser
from .skill_analyzer import SkillAnalyzer
from .models import SkillVerification

class VerifySkillsView(APIView):
    def post(self, request):
        # Check if GitHub username is provided
        github_username = request.data.get('github_username')
        if not github_username:
            return Response({"error": "GitHub username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if resume file is provided
        if 'resume_pdf' not in request.FILES:
            return Response({"error": "Resume PDF file is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        resume_file = request.FILES['resume_pdf']
        
        # Check if we already have a cached full response for this combination
        parser = ResumeParser()
        pdf_hash = parser._generate_pdf_hash(resume_file)
        full_cache_key = f"full_verification_{github_username}_{pdf_hash}"
        cached_response = cache.get(full_cache_key)
        
        if cached_response is not None:
            print(f"Cache hit for full verification: {full_cache_key}")
            return Response(cached_response, status=status.HTTP_200_OK)
        
        try:
            # Step 1: Parse resume PDF
            resume_data = parser.parse_resume(resume_file)
            resume_skills = resume_data['skills']
            
            # Step 2: Get GitHub data
            github_service = GitHubService(github_username)
            github_data = github_service.get_all_github_data()
            
            # Step 3: Analyze GitHub skills
            analyzer = SkillAnalyzer()
            github_skills = analyzer.analyze_github_skills(github_data)
            
            # Step 4: Verify skills using LLM for intelligent comparison
            verification_result = analyzer.verify_skills_with_llm(resume_skills, github_skills)
            
            # Step 5: Generate verification hash based on verified skills
            hash_value = analyzer.generate_verification_hash(
                github_username, 
                verification_result['verified_skills']
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