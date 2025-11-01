

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
        # Generate a cache key based on method name and arguments
    def _get_cache_key(self, method_name, *args):
        """Generate a cache key based on method name and arguments"""
        key_parts = [self.username, method_name]
        key_parts.extend([str(arg) for arg in args])
        key = "_".join(key_parts)
        # Create  hash for long keys
        if len(key) > 245:
            key = f"gh_{hashlib.md5(key.encode()).hexdigest()}"
        return key
        # Get list of user's public repositories with caching
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
        # Get languages used in a repository with caching    
    def get_repo_languages(self, repo_name):
        """Get languages used in a repository with caching"""
        cache_key = self._get_cache_key("repo_languages", repo_name)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
            
        url = f"https://api.github.com/repos/{self.username}/{repo_name}/languages"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 250:
            data = response.json()
            cache.set(cache_key, data, settings.GITHUB_CACHE_TIMEOUT)
            return data
        else:
            return {}
        # Get recent commits in a repository with caching 
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
        # Get repository README content with caching  
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
        
        # Get repository topics/tags with caching
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
        # Collect data for a single repository    
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
        
        # Collect all relevant GitHub data for the user
    def get_all_github_data(self, max_repos=5):
        """Get all relevant GitHub data for the user with caching"""
        cache_key = self._get_cache_key("all_github_data", max_repos)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
        
        print(f"\n[GitHub Service] Fetching data for user: {self.username}")
        repos = self.get_user_repos()
        print(f"[GitHub Service] Found {len(repos)} total repositories, processing first {max_repos}")
        
        all_data = {
            'username': self.username,
            'repos': []
        }
        
        # Only process a limited number of repos for performance
        for idx, repo in enumerate(repos[:max_repos]):
            repo_name = repo.get('name')
            print(f"[GitHub Service] Processing repo {idx+1}/{min(len(repos), max_repos)}: {repo_name}")
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
        
        print(f"[GitHub Service] Successfully collected data for {len(all_data['repos'])} repositories")
        print(f"[GitHub Service] All GitHub Data collected:\n{json.dumps(all_data, indent=2, default=str)}\n")
        
        cache.set(cache_key, all_data, settings.GITHUB_CACHE_TIMEOUT)    
        return all_data
    
    def get_user_info(self):
        """Get user information from GitHub"""
        cache_key = self._get_cache_key("user_info")
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
        
        url = f"https://api.github.com/users/{self.username}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            user_data = response.json()
            # Extract relevant user information
            user_info = {
                'id': user_data.get('id'),
                'login': user_data.get('login'),
                'name': user_data.get('name'),
                'email': user_data.get('email'),
                'avatar_url': user_data.get('avatar_url'),
                'bio': user_data.get('bio'),
                'company': user_data.get('company'),
                'location': user_data.get('location'),
                'public_repos': user_data.get('public_repos'),
                'followers': user_data.get('followers'),
                'following': user_data.get('following'),
                'created_at': user_data.get('created_at'),
            }
            cache.set(cache_key, user_info, settings.GITHUB_CACHE_TIMEOUT)
            return user_info
        else:
            print(f"Error fetching user info: {response.status_code}")
            return None
    
    def get_account_programming_languages(self, max_repos=10):
        """
        Analyze programming languages across all user repositories.
        Returns aggregated language statistics for the entire account.
        """
        cache_key = self._get_cache_key("account_languages", max_repos)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
        
        repos = self.get_user_repos()
        language_stats = {}
        total_bytes = 0
        
        print(f"\n[GitHub Service] Analyzing languages across {min(len(repos), max_repos)} repositories")
        
        for repo in repos[:max_repos]:
            repo_name = repo.get('name')
            languages = self.get_repo_languages(repo_name)
            
            if languages:
                for language, bytes_count in languages.items():
                    if language not in language_stats:
                        language_stats[language] = {
                            'bytes': 0,
                            'count': 0,  # Number of repos using this language
                            'percentage': 0
                        }
                    language_stats[language]['bytes'] += bytes_count
                    language_stats[language]['count'] += 1
                    total_bytes += bytes_count
        
        # Calculate percentages
        for language in language_stats:
            if total_bytes > 0:
                language_stats[language]['percentage'] = round(
                    (language_stats[language]['bytes'] / total_bytes) * 100, 2
                )
        
        # Sort by bytes (usage)
        sorted_languages = dict(sorted(
            language_stats.items(),
            key=lambda x: x[1]['bytes'],
            reverse=True
        ))
        
        result = {
            'username': self.username,
            'total_bytes': total_bytes,
            'languages': sorted_languages,
            'top_languages': list(sorted_languages.keys())[:5],
            'language_count': len(sorted_languages),
            'repositories_analyzed': min(len(repos), max_repos)
        }
        
        cache.set(cache_key, result, settings.GITHUB_CACHE_TIMEOUT)
        return result
    
    def get_account_technologies(self, max_repos=10):
        """
        Aggregate all topics/technologies across user repositories.
        Returns a comprehensive list of technologies used in the account.
        """
        cache_key = self._get_cache_key("account_technologies", max_repos)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
        
        repos = self.get_user_repos()
        technology_stats = {}
        
        print(f"\n[GitHub Service] Analyzing technologies across {min(len(repos), max_repos)} repositories")
        
        for repo in repos[:max_repos]:
            repo_name = repo.get('name')
            topics = self.get_repo_topics(repo_name)
            
            if topics:
                for topic in topics:
                    if topic not in technology_stats:
                        technology_stats[topic] = {
                            'count': 0,
                            'percentage': 0
                        }
                    technology_stats[topic]['count'] += 1
        
        # Calculate percentages
        total_repos = min(len(repos), max_repos)
        for tech in technology_stats:
            if total_repos > 0:
                technology_stats[tech]['percentage'] = round(
                    (technology_stats[tech]['count'] / total_repos) * 100, 2
                )
        
        # Sort by count (usage frequency)
        sorted_technologies = dict(sorted(
            technology_stats.items(),
            key=lambda x: x[1]['count'],
            reverse=True
        ))
        
        result = {
            'username': self.username,
            'technologies': sorted_technologies,
            'top_technologies': list(sorted_technologies.keys())[:10],
            'technology_count': len(sorted_technologies),
            'repositories_analyzed': total_repos
        }
        
        cache.set(cache_key, result, settings.GITHUB_CACHE_TIMEOUT)
        return result
    
    def get_account_summary(self, max_repos=10):
        """
        Get comprehensive account summary including languages, technologies, and user info.
        """
        cache_key = self._get_cache_key("account_summary", max_repos)
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            print(f"Cache hit: {cache_key}")
            return cached_data
        
        user_info = self.get_user_info()
        languages = self.get_account_programming_languages(max_repos)
        technologies = self.get_account_technologies(max_repos)
        repos = self.get_user_repos()
        
        result = {
            'user_info': user_info,
            'programming_languages': languages,
            'technologies': technologies,
            'total_repositories': len(repos),
            'repositories_analyzed': min(len(repos), max_repos)
        }
        
        cache.set(cache_key, result, settings.GITHUB_CACHE_TIMEOUT)
        return result
