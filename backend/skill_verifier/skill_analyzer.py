# Place this code in a suitable location in your Django project,
# for example: your_app/services/skill_analyzer.py

import requests
import hashlib
import json
import re
from django.conf import settings
from django.core.cache import cache

# SkillAnalyzer class to analyze GitHub data and verify skills:
class SkillAnalyzer:
    """
    An AI-powered service to analyze a developer's GitHub profile, extract technical skills,
    and verify them against a list of skills from a resume.
    """

    def __init__(self):
        """Initializes the SkillAnalyzer with API credentials and configuration."""
        # It's highly recommended to store these in your Django settings.py
        self.api_key = getattr(settings, 'OPENROUTER_API_KEY', None)
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured in Django settings.")

        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "deepseek/deepseek-chat"  # Or another model of your choice
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": getattr(settings, 'OPENROUTER_REFERRER', 'http://localhost:8000'),
            "X-Title": getattr(settings, 'OPENROUTER_TITLE', 'Your Django App'),
        }
        self.timeout = getattr(settings, 'AI_REQUEST_TIMEOUT', 45)
        self.cache_timeout = getattr(settings, 'VERIFICATION_CACHE_TIMEOUT', 3600) # 1 hour

    def _get_cache_key(self, method_name: str, *args) -> str:
        """
        Generates a consistent and safe cache key for a method and its arguments.
        """
        key_parts = [method_name]
        for arg in args:
            # Hash complex data types to create a consistent, short string representation.
            if isinstance(arg, (list, dict)):
                # Sorting ensures that lists/dicts with the same content but different order
                # result in the same hash.
                encoded_arg = json.dumps(arg, sort_keys=True).encode()
                key_parts.append(hashlib.md5(encoded_arg).hexdigest())
            else:
                key_parts.append(str(arg))
        
        key = "_".join(key_parts)
        # Hash the final key if it's too long for the cache backend.
        if len(key) > 250:
            return f"skill_{hashlib.md5(key.encode()).hexdigest()}"
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
            print(f"Cache hit for GitHub skills analysis: {cache_key}")
            return cached_skills

        condensed_data = {
            'username': github_data.get('username'),
            'repos': [
                {
                    'name': repo.get('name'),
                    'description': repo.get('description'),
                    'languages': repo.get('languages'),
                    'topics': repo.get('topics'),
                    'readme_snippet': (repo.get('readme') or '')[:500],
                    'key_files': repo.get('key_files', []) 
                } for repo in github_data.get('repos', [])
            ]
        }
        
        prompt = f"""
        Act as an AI assistant specializing in analyzing developer profiles to identify technical expertise.

        Your task is to meticulously analyze the following GitHub profile data and extract a comprehensive, flat list of technical skills.

        **GitHub Data:**```json
        {json.dumps(condensed_data, indent=2)}
        ```

        **Instructions for Analysis:**
        1.  **Examine Core Technologies:** Identify primary programming languages, frameworks, and libraries from the `languages`, `topics`, and `description` fields.
        2.  **Inspect Key Files:** Pay special attention to the `key_files` array. Filenames like `package.json` strongly indicate Node.js, NPM, and likely a JavaScript framework. `requirements.txt` indicates Python and its libraries. `Dockerfile` confirms Docker usage. `pom.xml` indicates Java and Maven.
        3.  **Infer Tools and Platforms:** Look for keywords related to databases (PostgreSQL, MongoDB), cloud services (AWS, GCP, Azure), CI/CD tools (Jenkins, GitHub Actions), and containerization (Docker, Kubernetes).
        4.  **Consolidate and Normalize:** Merge aliases. For example, "React.js" and "React" should be listed as "React". "NodeJS" should be "Node.js".
        5.  **Be Specific:** Prefer specific skills over generic ones. For instance, prefer "AWS S3" or "AWS EC2" if evident, but use "AWS" if the context is more general. Avoid vague terms like "API" or "Database" unless a specific technology is named.

        **Output Format:**
        - You MUST return ONLY a single JSON array of strings.
        - The array should be a flat list of unique skills.
        - Do not include any introductory phrases, explanations, or markdown formatting around the JSON array.

        **Example of a perfect response:**
        ["Python", "Django", "JavaScript", "React", "Node.js", "Docker", "AWS S3", "PostgreSQL", "Git"]
        """
        
        try:
            payload = {"model": self.model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.1}
            response = requests.post(
                f"{self.base_url}/chat/completions", headers=self.headers, json=payload, timeout=self.timeout
            )
            response.raise_for_status()
            
            skills_text = response.json()["choices"][0]["message"]["content"]
            skills = self._clean_and_parse_json(skills_text)
            
            if isinstance(skills, list):
                cache.set(cache_key, skills, timeout=self.cache_timeout)
                return skills
            
            print("Error: AI response for skill analysis was not a valid list.")
            return []
        except requests.RequestException as e:
            print(f"Error calling AI API for skill analysis: {e}")
            return []

# Verify skills by comparing resume skills with GitHub skills using AI, with caching
    def verify_skills_with_llm(self, resume_skills, github_skills):
        """Use LLM to intelligently compare resume skills with GitHub skills, with caching"""
        cache_key = self._get_cache_key("verify_skills_llm", resume_skills, github_skills)
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            print(f"Cache hit for skill verification: {cache_key}")
            return cached_result

        prompt = f"""
        Act as an expert Technical Recruiter and Senior Software Engineer. Your objective is to provide a detailed, evidence-based verification of skills listed on a resume against skills demonstrated on a GitHub profile. Your analysis must be objective, precise, and structured.

        **Context:**
        -   **Resume Skills:** The list of skills the candidate claims to have.
        -   **GitHub-derived Skills:** The list of skills programmatically extracted from the candidate's public repositories.

        **Input Data:**
        -   **Resume Skills:** `{json.dumps(resume_skills)}`
        -   **GitHub-derived Skills:** `{json.dumps(github_skills)}`

        **Your Step-by-Step Task:**
        1.  **Meticulously Compare:** Analyze both lists to find matches. A "verification" can be established in the following ways:
            *   **Direct Match:** The skill appears in both lists (e.g., "Python").
            *   **Alias Match:** The skill has a common alias (e.g., "React.js" on resume vs. "React" on GitHub).
            *   **Hierarchical Match (Crucial):** A specific technology on GitHub verifies a broader skill on the resume. For example:
                -   Evidence of "Express" or "NestJS" on GitHub strongly verifies the "Node.js" skill.
                -   Evidence of "AWS S3" or "AWS Lambda" on GitHub verifies the "AWS" skill.
                -   Evidence of "Flask" or "Django" on GitHub strongly verifies the "Python" skill.
        2.  **Categorize Skills:** Based on your analysis, categorize every skill from the resume.
        3.  **Identify Additional Expertise:** Note any significant technical skills found on GitHub that were not mentioned on the resume.
        4.  **Calculate Verification Score:** Compute the percentage of resume skills that you successfully verified.

        **Mandatory Output Format:**
        Your entire response MUST be a single, raw JSON object without any surrounding text, explanations, or markdown. Adhere strictly to the following structure:

        ```json
        {{
            "verified_skills": [
                {{
                    "skill": "The skill from the resume",
                    "evidence": ["The skill(s) from GitHub that prove it"],
                    "reasoning": "A brief explanation of why the evidence verifies the skill (e.g., 'Direct match', 'Express is a Node.js framework')."
                }}
            ],
            "unverified_skills": [
                "Skill from the resume that could not be substantiated"
            ],
            "additional_skills": [
                "Skill discovered on GitHub but not listed on the resume"
            ],
            "verification_percentage": 0,
            "summary": "A concise, professional summary of the findings, as you would write in a candidate report."
        }}
        ```
        """
        
        try:
            payload = {"model": self.model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}
            response = requests.post(
                f"{self.base_url}/chat/completions", headers=self.headers, json=payload, timeout=self.timeout
            )
            response.raise_for_status()
            
            result_text = response.json()["choices"][0]["message"]["content"]
            result_json = self._clean_and_parse_json(result_text)

            if result_json:
                required_keys = ['verified_skills', 'unverified_skills', 'additional_skills', 'verification_percentage', 'summary']
                if all(key in result_json for key in required_keys):
                    cache.set(cache_key, result_json, timeout=self.cache_timeout)
                    return result_json

            print("AI response for verification was missing keys or malformed. Falling back.")
            return self.basic_skill_verification(resume_skills, github_skills)

        except requests.RequestException as e:
            print(f"Error calling AI API for verification: {e}. Falling back to basic verification.")
            return self.basic_skill_verification(resume_skills, github_skills)
    
    # basic skill verification method:
    def basic_skill_verification(self, resume_skills, github_skills):
        """Basic fallback method for skill verification"""
        # Convert to lowercase for case-insensitive comparison
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        github_skills_lower = [skill.lower() for skill in github_skills]
        
        verified_skills_data = []
        unverified_skills_data = []

        for norm_skill, original_skill in resume_skills_norm.items():
            if norm_skill in github_skills_norm_set:
                verified_skills_data.append({
                    "skill": original_skill,
                    "evidence": [original_skill], # Basic evidence
                    "reasoning": "Direct match found (fallback mode)."
                })
            else:
                unverified_skills_data.append(original_skill)

        resume_norm_set = set(resume_skills_norm.keys())
        additional_skills = list({skill for skill in github_skills if normalize(skill) not in resume_norm_set})

        percentage = (len(verified_skills_data) / len(resume_skills) * 100) if resume_skills else 0
        
        return {
            'verified_skills': verified_skills_data,
            'unverified_skills': unverified_skills_data,
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
