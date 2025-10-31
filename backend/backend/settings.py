# Django settings for backend project.

from pathlib import Path

import os
from dotenv import load_dotenv
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent




# SECURITY WARNING: keep the secret key used in production secret:
SECRET_KEY = 'django-insecure-aie&n=ik$og#*+)w&e1trr#ae%g9l99eb^vi*q03o@vkg%p+ux'


DEBUG = True

# all hosts are allowed in development mode:
ALLOWED_HOSTS = []


# Define the installed applications here:
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    "corsheaders",
    'rest_framework',
    'skill_verifier',
]

# middleware configuration should be done here:
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# defining templates settings:
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'



#  using sqlite database:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# setting up CORS:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8000"
]





# password validations setup:
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]



# setting up internationalization:

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type:
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# API Keys and Configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
OPENROUTER_API_KEY = os.getenv('DEEPSEEK_API_KEY')  # Using DEEPSEEK_API_KEY env var for backward compatibility

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'trustchain-cache',
    }
}

# Cache timeouts in seconds
GITHUB_CACHE_TIMEOUT = 60 * 30  # 30 minutes
VERIFICATION_CACHE_TIMEOUT = 6
