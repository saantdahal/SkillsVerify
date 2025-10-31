import requests
import base64
from django.conf import settings
import json
import hashlib
from django.core.cache import cache

class GitHubService:
    def __init__(self, username):
        self.username = username
        self.headers = {'Authorization': f'token {settings.GITHUB_TOKEN}'} if settings.GITHUB_TOKEN else {}
        
    def _get_cache_key(self, method_name, *args):
        """Generate a cache key based on method name and arguments"""
        key_parts = [self.username, method_name]
        key_parts.extend([str(arg) for arg in args])
        key = "_".join(key_parts)
        # Create a hash for long keys
        if len(key) > 250:
            key = f"gh_{hashlib.md5(key.encode()).hexdigest()}"
        return key
        
    def get_user_repos(self):
        """Get list of user's public repositories with caching"""
        cache_key = self._get_cache_key("user_repos")
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
            
        url = f"https://api.github.com/users/{self.username}/repos"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            cache.set(cache_key, data, settings.GITHUB_CACHE_TIMEOUT)
            return data
        else:
            print(f"Error fetching repos: {response.status_code}")
            return []
            
    def get_repo_languages(self, repo_name):
        """Get languages used in a repository with caching"""
        cache_key = self._get_cache_key("repo_languages", repo_name)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
            
        url = f"https://api.github.com/repos/{self.username}/{repo_name}/languages"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            cache.set(cache_key, data, settings.GITHUB_CACHE_TIMEOUT)
            return data
        else:
            return {}
            
    def get_repo_commits(self, repo_name, max_commits=10):
        """Get recent commits in a repository with caching"""
        cache_key = self._get_cache_key("repo_commits", repo_name, max_commits)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
            
        url = f"https://api.github.com/repos/{self.username}/{repo_name}/commits"
        params = {'per_page': max_commits}
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            cache.set(cache_key, data, settings.GITHUB_CACHE_TIMEOUT)
            return data
        else:
            return []
            
    def get_repo_readme(self, repo_name):
        """Get repository README content with caching"""
        cache_key = self._get_cache_key("repo_readme", repo_name)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
            
        url = f"https://api.github.com/repos/{self.username}/{repo_name}/readme"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            content = response.json().get('content', '')
            if content:
                readme = base64.b64decode(content).decode('utf-8')
                cache.set(cache_key, readme, settings.GITHUB_CACHE_TIMEOUT)
                return readme
        return ""
        
    def get_repo_topics(self, repo_name):
        """Get repository topics/tags with caching"""
        cache_key = self._get_cache_key("repo_topics", repo_name)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
            
        url = f"https://api.github.com/repos/{self.username}/{repo_name}/topics"
        # GitHub API requires a specific media type for this endpoint
        headers = self.headers.copy()
        headers['Accept'] = 'application/vnd.github.mercy-preview+json'
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json().get('names', [])
            cache.set(cache_key, data, settings.GITHUB_CACHE_TIMEOUT)
            return data
        else:
            return []
            
    def collect_repo_data(self, repo_name):
        """Collect all data for a single repository"""
        languages = self.get_repo_languages(repo_name)
        commits = self.get_repo_commits(repo_name)
        readme = self.get_repo_readme(repo_name)
        topics = self.get_repo_topics(repo_name)
        
        return {
            'name': repo_name,
            'languages': languages,
            'commits': commits,
            'readme': readme,
            'topics': topics
        }
        
    def get_all_github_data(self, max_repos=5):
        """Get all relevant GitHub data for the user with caching"""
        cache_key = self._get_cache_key("all_github_data", max_repos)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
            
        repos = self.get_user_repos()
        all_data = {
            'username': self.username,
            'repos': []
        }
        
        # Only process a limited number of repos for performance
        for repo in repos[:max_repos]:
            repo_name = repo.get('name')
            repo_data = self.collect_repo_data(repo_name)
            # Add metadata from the repo listing
            repo_data.update({
                'description': repo.get('description'),
                'stars': repo.get('stargazers_count'),
                'forks': repo.get('forks_count'),
                'created_at': repo.get('created_at'),
                'updated_at': repo.get('updated_at')
            })
            all_data['repos'].append(repo_data)
        
        cache.set(cache_key, all_data, settings.GITHUB_CACHE_TIMEOUT)    
        return all_data