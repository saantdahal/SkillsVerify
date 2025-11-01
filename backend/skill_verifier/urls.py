# URL configurations for skill_verifier app:
from django.urls import path
from .views import (
    VerifySkillsView,
    GetVerificationView,
    ClearCacheView,
    GitHubOAuthAuthorizeView,
    GitHubOAuthCallbackView,
    GitHubAuthenticateView,
    GetAccountLanguagesView,
    GetAccountTechnologiesView,
    GetAccountSummaryView
)

# basic url patterns for skill_verifier app:
urlpatterns = [
    path('verify-skills/', VerifySkillsView.as_view(), name='verify_skills'),
    path('verification/<int:verification_id>/', GetVerificationView.as_view(), name='get_verification'),
    path('clear-cache/', ClearCacheView.as_view(), name='clear_cache'),
    path('auth/github/authorize/', GitHubOAuthAuthorizeView.as_view(), name='github_authorize'),
    path('auth/github/callback/', GitHubOAuthCallbackView.as_view(), name='github_callback'),
    path('auth/github/authenticate/', GitHubAuthenticateView.as_view(), name='github_authenticate'),
    path('account/<str:username>/languages/', GetAccountLanguagesView.as_view(), name='account_languages'),
    path('account/<str:username>/technologies/', GetAccountTechnologiesView.as_view(), name='account_technologies'),
    path('account/<str:username>/summary/', GetAccountSummaryView.as_view(), name='account_summary'),
]
