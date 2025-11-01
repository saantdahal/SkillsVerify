# Mock GitHub Users for Testing

## Features Added

### 1. **Mock GitHub Service** (`mockGithubService.ts`)

- 5 predefined mock GitHub users with realistic profiles
- Mock users: alice, bob, charlie, diana, eve
- Each user has: username, id, name, email, avatar, bio, company, location
- Functions:
  - `getMockGithubUser()` - Returns random or specific mock user
  - `generateMockJWT()` - Generates mock JWT token for testing

### 2. **Mock User Selector Component** (`MockUserSelector.tsx`)

- Beautiful modal to select mock users for testing
- Shows all 5 mock users with profile information
- One-click login with any mock user
- Works as fallback when real OAuth fails

### 3. **Enhanced OAuth Callback** (`OAuthCallbackPage.tsx`)

- Tries real GitHub OAuth first
- Falls back to mock user if backend OAuth fails
- Automatically logs in with a random mock user on error
- Stores mock indicator in sessionStorage (`isMockUser` flag)

### 4. **Enhanced Login Page** (`LoginPage.tsx`)

- Added "Test with Mock Users (Dev)" button
- Opens mock user selector modal
- Easy testing without real GitHub account

---

## Mock Users Available

| Username | Name          | Company           | Location          |
| -------- | ------------- | ----------------- | ----------------- |
| alice    | Alice Johnson | Tech Startup Inc  | San Francisco, CA |
| bob      | Bob Smith     | Cloud Solutions   | New York, NY      |
| charlie  | Charlie Brown | Design Studio     | Austin, TX        |
| diana    | Diana Prince  | AI Research Lab   | Seattle, WA       |
| eve      | Eve Wilson    | Mobile First Corp | Boston, MA        |

---

## How to Use for Testing

### **Option 1: Direct Mock User Selection**

1. Go to Login page
2. Click "Test with Mock Users (Dev)" button
3. Select any mock user
4. Automatically logs in and redirects to upload-resume

### **Option 2: Automatic Fallback on OAuth Error**

1. Click "Sign In with GitHub"
2. If GitHub OAuth fails (backend down, network error, etc.)
3. Automatically logs in with random mock user
4. Proceeds normally

### **Option 3: Direct GitHub Login (Real)**

1. Click "Sign In with GitHub"
2. If backend and OAuth are working correctly
3. Uses real GitHub OAuth flow

---

## Session Storage Flags

```javascript
// When using mock users:
sessionStorage.setItem("isMockUser", "true");
sessionStorage.setItem("userDetails", JSON.stringify(mockUser));
sessionStorage.setItem("token", mockToken);
sessionStorage.setItem("isLoggedIn", "true");
```

---

## Development vs Production

- **Development**: All 3 options work (real OAuth + mock fallback + direct selection)
- **Production**: Only real OAuth should work (mock users disabled)

---

## Testing Scenarios

1. **OAuth not configured**: ✅ Falls back to mock user
2. **Backend down**: ✅ Falls back to mock user
3. **Network error**: ✅ Falls back to mock user
4. **OAuth working**: ✅ Uses real GitHub
5. **Quick testing**: ✅ Direct mock user selection
