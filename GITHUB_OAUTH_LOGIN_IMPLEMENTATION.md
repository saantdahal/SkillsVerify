# GitHub OAuth Login Implementation Guide

## Overview

This document describes the complete GitHub OAuth login implementation for SkillVerifier. The flow enables users to authenticate using their GitHub account without creating separate credentials.

---

## Quick Start

### 1. Configure GitHub OAuth App

#### Create GitHub OAuth Application:

1. Go to **GitHub Settings → Developer settings → OAuth Apps**
2. Click **New OAuth App**
3. Fill in the application details:

   - **Application name:** SkillVerifier
   - **Homepage URL:** `http://localhost:3000` (dev) or your domain (prod)
   - **Authorization callback URL:** `http://localhost:3000/auth/callback` (dev)
   - **Description:** (optional) Verify your skills using your GitHub profile

4. Note your:
   - **Client ID**
   - **Client Secret** (keep this secret!)

#### For Production:

Update the Authorization callback URL to: `https://yourdomain.com/auth/callback`

### 2. Setup Environment Variables

#### Backend (.env):

```bash
GITHUB_CLIENT_ID=your_client_id_from_github
GITHUB_CLIENT_SECRET=your_client_secret_from_github
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
```

#### Frontend (.env):

```bash
VITE_APP_BACKEND_URL=http://127.0.0.1:8000
VITE_GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
```

---

## Login Flow Architecture

### Complete OAuth Flow Diagram

```
┌─────────────────┐
│   LoginPage     │
│   (React)       │
└────────┬────────┘
         │
         │ User clicks "Sign in with GitHub"
         │
         ▼
┌─────────────────────────────────────┐
│ Fetch /api/auth/github/authorize/   │
│ (Backend returns GitHub auth URL)    │
└────────┬────────────────────────────┘
         │
         │ Store random state in sessionStorage
         │
         ▼
┌──────────────────────────┐
│ Redirect to GitHub OAuth │
│ https://github.com/...   │
└────────┬─────────────────┘
         │
         │ User logs in to GitHub
         │ User approves scopes
         │
         ▼
┌─────────────────────────────────────────────┐
│ GitHub redirects to:                        │
│ http://localhost:3000/auth/callback?       │
│   code=xxx&state=yyy                        │
└────────┬────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ OAuthCallbackPage loads             │
│ - Extracts code & state from URL   │
│ - Verifies state (CSRF protection) │
└────────┬───────────────────────────┘
         │
         │ POST /api/auth/github/callback/
         │ { code: "xxx" }
         │
         ▼
┌───────────────────────────────────────┐
│ Backend:                              │
│ 1. Exchange code for access token    │
│ 2. Fetch user info from GitHub API   │
│ 3. Generate JWT token                │
│ 4. Return user data & token          │
└────────┬──────────────────────────────┘
         │
         │ Response:
         │ { token: "jwt_xxx", user: {...} }
         │
         ▼
┌─────────────────────────────────────┐
│ Frontend stores:                    │
│ - User data in sessionStorage       │
│ - JWT token in sessionStorage       │
│ - isLoggedIn = true                 │
└────────┬────────────────────────────┘
         │
         │ Navigate based on user role
         │
         ▼
    ┌────────────────────┐
    │ /upload-resume     │
    │ OR                 │
    │ /hrdashboard       │
    └────────────────────┘
```

---

## Frontend Implementation

### 1. LoginPage.tsx

**Location:** `/frontend/src/pages/LoginPage.tsx`

**Key Features:**

- Displays "Sign in with GitHub" button
- Initiates proper OAuth flow with CSRF protection
- Fallback option: Direct GitHub username login
- Error handling and loading states

**OAuth Button Handler:**

```typescript
const handleGitHubLogin = async () => {
  setIsLoading(true);
  setError("");
  try {
    // Fetch GitHub authorization URL from backend
    const response = await fetch(
      "http://127.0.0.1:8000/api/auth/github/authorize/"
    );

    if (!response.ok) {
      throw new Error("Failed to get authorization URL");
    }

    const data = await response.json();
    const authorizeUrl = data.authorize_url;

    // Generate and store state for CSRF protection
    const state = generateRandomState();
    sessionStorage.setItem("oauth_state", state);

    // Add state to URL and redirect to GitHub
    const url = new URL(authorizeUrl);
    url.searchParams.set("state", state);
    window.location.href = url.toString();
  } catch (error) {
    console.error("OAuth error:", error);
    setError("Failed to initiate GitHub login. Please try again.");
    setIsLoading(false);
  }
};
```

### 2. OAuthCallbackPage.tsx

**Location:** `/frontend/src/pages/OAuthCallbackPage.tsx`

**Key Features:**

- Handles GitHub callback with authorization code
- Verifies state parameter (CSRF protection)
- Exchanges code for JWT token
- Stores user session
- Redirects to appropriate page

**Process:**

1. Extract `code` and `state` from URL
2. Verify state matches stored value
3. Send code to backend callback endpoint
4. Store returned token and user data
5. Redirect to upload-resume or hrdashboard

### 3. UserContext.tsx

**Location:** `/frontend/src/context/UserContext.tsx`

**Updates:**

- `login(githubUsername?)` - Handles direct username login
- Updated to throw errors for better error handling
- Properly stores user data and JWT token

**User Data Stored:**

```typescript
interface UserDetails {
  email: string;
  name: string;
  address?: string;
  github_username?: string;
  avatar_url?: string;
}
```

---

## Backend Implementation

### 1. GitHub OAuth Handler

**File:** `/backend/skill_verifier/github_oauth.py`

**Class: GitHubOAuthHandler**

#### Configuration:

```python
def __init__(self):
    self.client_id = settings.GITHUB_CLIENT_ID
    self.client_secret = settings.GITHUB_CLIENT_SECRET
    self.redirect_uri = settings.GITHUB_REDIRECT_URI
```

#### Methods:

**get_authorize_url()**

- Generates GitHub authorization URL
- Includes scopes: `user:email read:user`
- Returns: Authorization URL string

**exchange_code_for_token(code)**

- Exchanges authorization code for access token
- Makes POST request to GitHub OAuth token endpoint
- Returns: `(access_token, error)` tuple

**get_user_info(access_token)**

- Fetches user profile from GitHub API
- Returns user data: username, id, name, email, avatar_url, bio, company, location

**generate_jwt_token(user_data)**

- Creates JWT token with user information
- Payload includes:
  - github_id
  - github_username
  - email
  - name
  - iat (issued at)
  - exp (expiration: 30 days)
- Signed with Django SECRET_KEY

### 2. API Views

**File:** `/backend/skill_verifier/views.py`

#### Endpoint 1: Get Authorization URL

```
GET /api/auth/github/authorize/
```

**Response:**

```json
{
  "authorize_url": "https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=user:email%20read:user&state=..."
}
```

#### Endpoint 2: Handle OAuth Callback

```
POST /api/auth/github/callback/
Content-Type: application/json

{
  "code": "authorization_code_from_github"
}
```

**Process:**

1. Receive authorization code
2. Exchange for access token
3. Get user info from GitHub
4. Generate JWT token
5. Return user data and token

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "github_username": "johndoe",
    "github_id": 12345678,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://avatars.githubusercontent.com/u/12345678",
    "bio": "Developer",
    "company": "Tech Corp"
  }
}
```

#### Endpoint 3: Direct GitHub Username Authentication

```
POST /api/auth/github/authenticate/
Content-Type: application/json

{
  "github_username": "username"
}
```

**Response:** Same as callback endpoint

### 3. Django Settings

**File:** `/backend/backend/settings.py`

```python
# GitHub OAuth Configuration
GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID', '')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET', '')
GITHUB_REDIRECT_URI = os.getenv('GITHUB_REDIRECT_URI', 'http://localhost:8000/api/auth/github/callback/')
```

---

## Security Features

### 1. CSRF Protection

- **State Parameter**: Random string generated during authorization
- **Storage**: Stored in sessionStorage on frontend
- **Verification**: Verified when handling callback
- **Purpose**: Prevent cross-site request forgery attacks

### 2. JWT Token Security

- **Signing**: Digitally signed with Django SECRET_KEY
- **Expiration**: 30-day expiration
- **Content**: Contains github_id, github_username, email, name
- **Transport**: Stored in sessionStorage (frontend)

### 3. OAuth Scopes

Only minimal required scopes:

- `user:email` - Read user email
- `read:user` - Read user public profile

### 4. HTTPS Requirements

- Development: HTTP allowed (localhost)
- Production: **HTTPS REQUIRED**
  - All tokens must be transmitted over HTTPS
  - Secure cookies with HttpOnly flag
  - SameSite cookie policy

---

## Testing the Implementation

### Test Setup

1. **Start Backend:**

```bash
cd backend
source env/bin/activate
python manage.py runserver
```

2. **Start Frontend:**

```bash
cd frontend
npm run dev
```

3. **Access Application:**

```
http://localhost:3000
```

### Manual OAuth Flow Test

1. Navigate to `http://localhost:3000` (should redirect to login)
2. Click "Sign in with GitHub"
3. Should redirect to GitHub login
4. Log in with GitHub credentials
5. Approve requested permissions
6. Should redirect back to `http://localhost:3000/auth/callback`
7. Should then redirect to `/upload-resume`
8. User data should be stored in sessionStorage

### Direct Username Login Test

1. Go to login page
2. Enter GitHub username in "Or use username directly" section
3. Click "Login with Username"
4. Should authenticate directly without GitHub OAuth

### Browser Console Tests

**Check stored data:**

```javascript
// Check user data
console.log(JSON.parse(sessionStorage.getItem("userDetails")));

// Check token
console.log(sessionStorage.getItem("token"));

// Check login state
console.log(sessionStorage.getItem("isLoggedIn"));
```

---

## Troubleshooting

### Issue 1: "State mismatch" Error

**Cause:** State parameter doesn't match stored value

**Solutions:**

1. Clear sessionStorage and try again
2. Check browser console for errors
3. Verify GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are correct
4. Ensure callback URL matches GitHub app settings

**Test:**

```javascript
// Manually clear
sessionStorage.clear();
// Retry login
```

### Issue 2: "No authorization code received"

**Cause:** GitHub didn't return authorization code

**Solutions:**

1. Check GitHub OAuth app settings
2. Verify callback URL matches exactly
3. Check browser redirect history
4. Ensure user clicked "Authorize"

**GitHub App Settings to Verify:**

- Authorization callback URL: `http://localhost:3000/auth/callback`
- Client ID and Secret are correct
- App is not restricted by IP

### Issue 3: "Failed to get authorization URL"

**Cause:** Backend endpoint not responding or not configured

**Solutions:**

1. Check backend is running: `python manage.py runserver`
2. Verify environment variables are set
3. Check CORS settings in Django
4. Check network tab in browser DevTools

**Verify Backend:**

```bash
curl http://127.0.0.1:8000/api/auth/github/authorize/
```

### Issue 4: JWT Token Decoding Error

**Cause:** SECRET_KEY mismatch or token corruption

**Solutions:**

1. Check Django SECRET_KEY is consistent
2. Don't modify token in sessionStorage
3. Check token expiration hasn't passed
4. Clear token and re-authenticate

### Issue 5: CORS Errors

**Cause:** Frontend and backend on different origins

**Solutions:**

1. Verify CORS_ALLOWED_ORIGINS in Django settings
2. Check it includes `http://localhost:3000`
3. Restart Django server after changes

**Django Settings (backend/backend/settings.py):**

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]
```

---

## Production Deployment Checklist

- [ ] Create GitHub OAuth app for production
- [ ] Update GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
- [ ] Set GITHUB_REDIRECT_URI to production domain
- [ ] Update frontend API URLs from localhost to production
- [ ] Use HTTPS for all OAuth transactions
- [ ] Generate new strong SECRET_KEY in Django
- [ ] Enable secure cookies (HTTPS only)
- [ ] Set SameSite cookie policy to Strict
- [ ] Enable CSRF protection
- [ ] Remove DEBUG = True
- [ ] Set ALLOWED_HOSTS to production domain
- [ ] Update CORS_ALLOWED_ORIGINS
- [ ] Add error logging and monitoring
- [ ] Test OAuth flow end-to-end
- [ ] Set up SSL/TLS certificates
- [ ] Review and store secrets securely

---

## Database Integration (Optional Future)

### Create User Model

```python
from django.db import models

class User(models.Model):
    github_id = models.IntegerField(unique=True)
    github_username = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    company = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.github_username
```

### Link to SkillVerification

```python
class SkillVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verifications')
    resume_file_name = models.CharField(max_length=255)
    resume_skills = models.JSONField(default=list)
    github_skills = models.JSONField(default=list)
    verification_result = models.JSONField(default=dict)
    hash_value = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## API Reference Summary

| Endpoint                         | Method | Body                | Purpose                 | Auth |
| -------------------------------- | ------ | ------------------- | ----------------------- | ---- |
| `/api/auth/github/authorize/`    | GET    | -                   | Get GitHub OAuth URL    | ❌   |
| `/api/auth/github/callback/`     | POST   | `{code}`            | Exchange code for token | ❌   |
| `/api/auth/github/authenticate/` | POST   | `{github_username}` | Direct username auth    | ❌   |

---

## Next Steps

1. **Add JWT Middleware** - Validate tokens on protected endpoints
2. **Add Refresh Tokens** - Extend sessions without re-authentication
3. **Implement Logout** - Clear tokens and session data
4. **Add Rate Limiting** - Prevent OAuth abuse
5. **User Profile Management** - Update/edit user data
6. **Session Timeout** - Auto-logout after inactivity
7. **Remember Me** - Persistent login option
8. **Multi-factor Authentication** - Enhanced security

---

## References

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub API User Endpoint](https://docs.github.com/en/rest/users/users)
- [JWT.io - Introduction to JWT](https://jwt.io/introduction)
- [Django Authentication](https://docs.djangoproject.com/en/stable/topics/auth/)
- [OWASP OAuth 2.0 Security](https://owasp.org/www-community/attacks/csrf)
