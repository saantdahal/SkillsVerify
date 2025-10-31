import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from skill_verifier.github_service import GitHubService

# Test fetching user repos
def test_github_api():
    username = input("Enter GitHub username to test: ")
    github = GitHubService(username)
    
    print("Fetching repositories...")
    repos = github.get_user_repos()
    print(f"Found {len(repos)} repositories")
    
    if repos:
        # Test fetching detailed repo info for the first repo
        repo_name = repos[0]['name']
        print(f"\nTesting detailed info for repo: {repo_name}")
        
        print("Languages:", github.get_repo_languages(repo_name))
        print("Topics:", github.get_repo_topics(repo_name))
        
        readme = github.get_repo_readme(repo_name)
        print(f"README snippet: {readme[:100]}...")
        
        # Test collecting all data
        print("\nCollecting data for all repos (limited to 3)...")
        all_data = github.get_all_github_data(max_repos=3)
        print(f"Collected data for {len(all_data['repos'])} repositories")

if __name__ == "__main__":
    test_github_api()