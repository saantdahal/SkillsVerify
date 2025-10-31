from django.db import models

class SkillVerification(models.Model):
    github_username = models.CharField(max_length=100)
    resume_file_name = models.CharField(max_length=255)
    resume_skills = models.JSONField(default=list)
    github_skills = models.JSONField(default=list)
    verification_result = models.JSONField(default=dict)
    hash_value = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Verification for {self.github_username}"