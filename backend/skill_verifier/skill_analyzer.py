import google.generativeai as genai
from django.conf import settings
import hashlib
import json
from django.core.cache import cache

# SkillAnalyzer class to analyze GitHub data and verify skills:
class SkillAnalyzer:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-pro-latest')
    
    def _get_cache_key(self, method_name, *args):
        """Generate a cache key based on method name and arguments"""
        key_parts = [method_name]
        for arg in args:
            if isinstance(arg, (list, dict)):
                key_parts.append(hashlib.md5(json.dumps(arg, sort_keys=True).encode()).hexdigest())
            else:
                key_parts.append(str(arg))
        key = "_".join(key_parts)
        # Create a hash for long keys
        if len(key) > 250:
            key = f"skill_{hashlib.md5(key.encode()).hexdigest()}"
        return key
    
    # Analyze GitHub data to extract skills using AI, with caching
    def analyze_github_skills(self, github_data):
        """Use AI to analyze GitHub data and extract skills with caching"""
        # Create cache key based on essential GitHub data
        cache_key = self._get_cache_key("github_skills_analysis", 
                                        github_data['username'],
                                        [repo['name'] for repo in github_data['repos']])
        cached_skills = cache.get(cache_key)
        
        if cached_skills is not None:
            print(f"Cache hit: {cache_key}")
            return cached_skills
            
        # Prepare a condensed version of the GitHub data to fit within token limits
        condensed_data = {
            'username': github_data['username'],
            'repos': []
        }
        
        for repo in github_data['repos']:
            # Only include essential information
            condensed_repo = {
                'name': repo['name'],
                'description': repo['description'],
                'languages': repo['languages'],
                'topics': repo['topics'],
                'stars': repo['stars'],
                'readme_snippet': repo['readme'][:500] if repo['readme'] else ""
            }
            condensed_data['repos'].append(condensed_repo)
        
        prompt = f"""
        Based on this GitHub profile data, identify the technical skills demonstrated:
        {json.dumps(condensed_data, indent=2)}
        
        Please analyze the repositories, languages used, topics, and README content to determine:
        1. Programming languages the user is proficient in
        2. Frameworks and libraries they have experience with
        3. Tools and technologies they work with
        
        Return ONLY a JSON array of skills like: ["Python", "Django", "React", "AWS"]
        """
        
        try:
            response = self.model.generate_content(prompt)
            skills_text = response.text.strip()
            
            # Clean up the response to ensure it's valid JSON
            skills_text = skills_text.replace("```json", "").replace("```", "").strip()
            skills = []
            
            try:
                skills = eval(skills_text)
                if not isinstance(skills, list):
                    skills = []
                    
                # Cache the result
                cache.set(cache_key, skills, settings.VERIFICATION_CACHE_TIMEOUT)
                return skills
            except:
                print("Error parsing AI response to JSON")
                return []
        except Exception as e:
            print(f"Error using Gemini API: {e}")
            return []

# Verify skills by comparing resume skills with GitHub skills using AI, with caching
    def verify_skills_with_llm(self, resume_skills, github_skills):
        """Use LLM to intelligently compare resume skills with GitHub skills, with caching"""
        # Create cache key based on resume skills and GitHub skills
        cache_key = self._get_cache_key("verify_skills_llm", resume_skills, github_skills)
        cached_result = cache.get(cache_key)
        
        if cached_result is not None:
            print(f"Cache hit: {cache_key}")
            return cached_result
        
        prompt = f"""
        I need to compare skills claimed in a resume with skills demonstrated on GitHub.
        
        Resume skills: {json.dumps(resume_skills)}
        GitHub skills: {json.dumps(github_skills)}
        
        Please analyze these skills and identify:
        1. Which resume skills are verified by GitHub (considering variations in naming, e.g., "React.js" and "React" are the same)
        2. Which resume skills could not be verified on GitHub
        3. Which additional skills were found on GitHub but not mentioned in the resume
        4. Calculate a verification percentage (verified skills / total resume skills)
        
        Consider that some technologies may be related or nested:
        - "HTML & CSS" relates to both "HTML" and "CSS"
        - "Express.js" is the same as "Express"
        - "React.js" is the same as "React"
        - "Tailwind CSS" relates to "CSS" but is more specific

        Return your analysis as a JSON object with these keys:
        - verified_skills: array of verified skills (use the resume's naming)
        - unverified_skills: array of skills from the resume not verified
        - additional_skills: array of skills found on GitHub but not in resume
        - verification_percentage: percentage of resume skills verified (0-100)
        - explanation: brief text explaining your reasoning
        """
        
        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean up the response to ensure it's valid JSON
            result_text = result_text.replace("```json", "").replace("```", "").strip()
            result = {}
            
            try:
                result = json.loads(result_text)
                # Ensure all required keys exist
                required_keys = ['verified_skills', 'unverified_skills', 'additional_skills', 'verification_percentage', 'explanation']
                for key in required_keys:
                    if key not in result:
                        if key == 'explanation':
                            result[key] = "No explanation provided"
                        else:
                            result[key] = [] if 'skills' in key else 0
                
                # Cache the result
                cache.set(cache_key, result, settings.VERIFICATION_CACHE_TIMEOUT)
                return result
            except Exception as e:
                print(f"Error parsing AI verification response: {e}")
                # Fallback to basic verification
                result = self.basic_skill_verification(resume_skills, github_skills)
                return result
        except Exception as e:
            print(f"Error using Gemini API for verification: {e}")
            # Fallback to basic verification
            return self.basic_skill_verification(resume_skills, github_skills)
    
    # basic skill verification method:
    def basic_skill_verification(self, resume_skills, github_skills):
        """Basic fallback method for skill verification"""
        # Convert to lowercase for case-insensitive comparison
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        github_skills_lower = [skill.lower() for skill in github_skills]
        
        # Find common skills (this is a simple approach as fallback)
        common_skills = list(set(resume_skills_lower) & set(github_skills_lower))
        
        # Skills in resume but not found in GitHub
        unverified_skills = [skill for skill in resume_skills if skill.lower() not in github_skills_lower]
        
        # Skills in GitHub but not mentioned in resume
        additional_skills = [skill for skill in github_skills if skill.lower() not in resume_skills_lower]
        
        return {
            'verified_skills': common_skills,
            'unverified_skills': unverified_skills,
            'additional_skills': additional_skills,
            'verification_percentage': len(common_skills) / len(resume_skills) * 100 if resume_skills else 0,
            'explanation': "Basic comparison performed. This is a fallback method."
        }
    # Generate a hash of verified skills for blockchain storage
    def generate_verification_hash(self, github_username, verified_skills):
        """Generate a hash of verified skills that can be stored on blockchain"""
        skills_string = ",".join(sorted([skill.lower() for skill in verified_skills]))
        data_to_hash = f"{github_username}:{skills_string}:{settings.SECRET_KEY}"
        hash_object = hashlib.sha256(data_to_hash.encode())
        return hash_object.hexdigest()
