# backend/backend/urls.py
from django.contrib import admin
from django.urls import path,include
from django.http import JsonResponse

def api_root(request):

    return JsonResponse({
        "message": "Welcome to SkillVerify API",
        "version": "1.0.0",
        "endpoints": {
            "admin": "/admin/",
            "api": {
                "verify_skills": "/api/verify-skills/",
                "documentation": "API endpoints available at /api/"
            }
        },
        "status": "running"
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('skill_verifier.urls')),
]
