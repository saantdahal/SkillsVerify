
import PyPDF2
import re
import io
from django.conf import settings
import requests
import hashlib
from django.core.cache import cache

class ResumeParser:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "deepseek/deepseek-chat"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://trustchain-ibriz.vercel.app",  # Optional
            "X-Title": "TrustChain Skills Verification",  # Optional
        }
    def extract_text_from_pdf(self, pdf_file):
        """Extract text content from PDF file"""
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    
    def _generate_pdf_hash(self, pdf_file):
        """Generate a hash of the PDF file content for caching"""
        # Reset file pointer to beginning 
        pdf_file.seek(0)
        # Read the file content 
        pdf_content = pdf_file.read()
        # Create a hash
        hash_object = hashlib.md5(pdf_content)
        # Reset file pointer again for further processing if needed
        pdf_file.seek(0)
        return hash_object.hexdigest()
        
    def extract_skills_using_ai(self, text, pdf_hash):
        """Use AI to extract skills from resume text with caching"""
        cache_key = f"resume_skills_{pdf_hash}"
        cached_skills = cache.get(cache_key)
        
        if cached_skills is not None:
            print(f"Cache hit: {cache_key}")
            return cached_skills
            
        prompt = f"""
        Extract all technical skills, programming languages, frameworks, and technologies 
        mentioned in this resume. Format the output as a JSON list of skills.
        
        Resume text:
        {text[:3000]}  # Limit text length to avoid token limits
        
        Return ONLY a JSON array of skills like: ["Python", "Django", "React", "AWS"]
        """
        
        try:
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1
            }
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            skills_text = result["choices"][0]["message"]["content"].strip()
            
            # Clean up the response to ensure it's valid JSON format
            skills_text = skills_text.replace("```json", "").replace("```", "").strip()
            skills = []
            
            try:
                skills = eval(skills_text)  # This is safer than json.loads as it can handle various formats
                if not isinstance(skills, list):
                    skills = []
                
                # Cache the result for future use
                cache.set(cache_key, skills, settings.VERIFICATION_CACHE_TIMEOUT)
                return skills
            except:
                print("Error parsing AI response to JSON")
                return []
        except Exception as e:
            print(f"Error using DeepSeek API: {e}")
            return []
    
    def parse_resume(self, pdf_file):
        """Parse resume file and extract skills with caching"""
        # Generate hash for the PDF file to use  cache key
        pdf_hash = self._generate_pdf_hash(pdf_file)
        
        # Check if we have cached results for this PDF hash
        cache_key = f"resume_parsing_{pdf_hash}"
        cached_result = cache.get(cache_key)
        
        if cached_result is not None:
            print(f"Cache hit: {cache_key}")
            return cached_result
        
        # Extract text and skills from the resume
        text = self.extract_text_from_pdf(pdf_file)
        skills = self.extract_skills_using_ai(text, pdf_hash)
        
        result = {
            'text': text[:1000],  # Just store a preview of the text for reference
            'skills': skills
        }
        

        # Cache the result for future use
        cache.set(cache_key, result, settings.VERIFICATION_CACHE_TIMEOUT)
        return result