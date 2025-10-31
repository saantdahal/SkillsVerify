# URL configurations for skill_verifier app:
from django.urls import path
from .views import VerifySkillsView, GetVerificationView, ClearCacheView

# basic url patterns for skill_verifier app:
urlpatterns = [
    path('verify-skills/', VerifySkillsView.as_view(), name='verify_skills'),
    path('verification/<int:verification_id>/', GetVerificationView.as_view(), name='get_verification'),
    path('clear-cache/', ClearCacheView.as_view(), name='clear_cache'),
]
