# Account Statistics Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       SkillVerifier Frontend                         │
│                          (React App)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────┐  ┌──────────────────────────┐         │
│  │  Account Overview        │  │ Profile Page             │         │
│  │  - User Info             │  │ - Avatar & Bio           │         │
│  │  - Language Stats        │  │ - Repository Count       │         │
│  │  - Technology Cloud      │  │ - Followers              │         │
│  └──────────────────────────┘  └──────────────────────────┘         │
│                                                                       │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ HTTP Requests
                  │ GET /api/account/{username}/summary/
                  │ GET /api/account/{username}/languages/
                  │ GET /api/account/{username}/technologies/
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Django REST Backend                              │
│                   (SkillVerifier App)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────┐                                        │
│  │    API Views (urls.py)    │                                        │
│  ├──────────────────────────┤                                        │
│  │ GetAccountSummaryView    │                                        │
│  │ GetAccountLanguagesView  │                                        │
│  │ GetAccountTechnologiesV  │                                        │
│  └──────────┬───────────────┘                                        │
│             │                                                         │
│             ▼                                                         │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │     GitHubService (github_service.py)                    │       │
│  ├──────────────────────────────────────────────────────────┤       │
│  │ + get_user_repos()                                       │       │
│  │ + get_repo_languages(repo_name)                          │       │
│  │ + get_repo_topics(repo_name)                             │       │
│  │ + get_account_programming_languages(max_repos)          │       │
│  │ + get_account_technologies(max_repos)                    │       │
│  │ + get_account_summary(max_repos)                         │       │
│  └──────────┬──────────────────────────────────────────────┘       │
│             │                                                         │
│             ├─────────────┬──────────────────┐                       │
│             ▼             ▼                  ▼                       │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Cache System     │ │ Aggregation  │ │ Formatting   │             │
│  │ (30 min TTL)     │ │ Logic        │ │ & Return     │             │
│  └──────────────────┘ └──────────────┘ └──────────────┘             │
│                                                                       │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ API Calls
                  │ (cached for 30 minutes)
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GitHub API                                        │
│              (api.github.com)                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Endpoints Called:                                                   │
│  ├─ /users/{username}/repos                                         │
│  ├─ /repos/{owner}/{repo}/languages                                │
│  ├─ /repos/{owner}/{repo}/topics                                   │
│  └─ /users/{username}                                              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Collection Process

### Step-by-Step Flow

```
1. USER REQUEST
   ├─ Frontend sends: GET /api/account/alice/summary/
   └─ max_repos parameter: 10 (analyze first 10 repos)

2. BACKEND PROCESSES REQUEST
   ├─ Check cache first
   │  ├─ If cached → Return immediately
   │  └─ If not cached → Proceed to step 3
   └─ Request reaches GetAccountSummaryView

3. GATHER DATA
   ├─ Get user profile
   │  └─ GET /users/alice → User info (name, bio, followers, etc.)
   │
   ├─ Analyze languages
   │  ├─ GET /users/alice/repos → List of 10 repositories
   │  ├─ For each repo:
   │  │  ├─ GET /repos/alice/repo1/languages → {Python: 5000}
   │  │  ├─ GET /repos/alice/repo2/languages → {JavaScript: 3000}
   │  │  └─ Aggregate all languages
   │  └─ Calculate percentages
   │
   └─ Analyze technologies
      ├─ For each repo:
      │  ├─ GET /repos/alice/repo1/topics → ["web", "api"]
      │  ├─ GET /repos/alice/repo2/topics → ["react", "web"]
      │  └─ Count frequency
      └─ Calculate percentages

4. AGGREGATE RESULTS
   ├─ Combine all data
   ├─ Calculate statistics
   ├─ Sort by relevance
   └─ Format for response

5. CACHE RESULTS
   ├─ Store in cache
   ├─ TTL: 30 minutes
   └─ Key: alice_account_summary_10

6. RETURN RESPONSE
   ├─ Send JSON response
   └─ Frontend renders data
```

---

## Language Detection Algorithm

```
For each repository in first N repos:

1. Fetch languages
   GET /repos/{owner}/{repo}/languages
   ↓
   Returns: {"Python": 5000, "JavaScript": 3000, "HTML": 1000}
   (bytes of code in each language)

2. Add to totals
   Total bytes: 5000 + 3000 + 1000 = 9000
   Language list: [Python, JavaScript, HTML]

3. Track repository count
   python_repos = python_repos + 1
   javascript_repos = javascript_repos + 1
   html_repos = html_repos + 1

Repeat for all repositories

Calculate final statistics:
├─ Python percentage = (python_bytes / total_bytes) * 100
├─ JavaScript percentage = (javascript_bytes / total_bytes) * 100
├─ HTML percentage = (html_bytes / total_bytes) * 100
└─ Repositories using each language
```

---

## Technology Detection Algorithm

```
For each repository in first N repos:

1. Fetch topics
   GET /repos/{owner}/{repo}/topics
   Accept: application/vnd.github.mercy-preview+json
   ↓
   Returns: {"names": ["web", "api", "django"]}

2. Count topics
   web_count = web_count + 1
   api_count = api_count + 1
   django_count = django_count + 1

Repeat for all repositories

Calculate final statistics:
├─ web percentage = (web_count / total_repos) * 100
├─ api percentage = (api_count / total_repos) * 100
├─ django percentage = (django_count / total_repos) * 100
└─ Repository count for each technology
```

---

## Response Format

### Summary Response Structure

```json
{
  "user_info": {
    "id": 12345678,
    "login": "alice",
    "name": "Alice Developer",
    "email": "alice@example.com",
    "avatar_url": "https://...",
    "bio": "Developer",
    "company": "Tech Corp",
    "location": "San Francisco",
    "public_repos": 25,
    "followers": 50,
    "following": 30,
    "created_at": "2018-01-01T00:00:00Z"
  },
  "programming_languages": {
    "username": "alice",
    "total_bytes": 250000,
    "language_count": 5,
    "repositories_analyzed": 10,
    "top_languages": ["Python", "JavaScript", "TypeScript", "HTML", "CSS"],
    "languages": {
      "Python": {
        "bytes": 150000,
        "count": 8,
        "percentage": 60.0
      },
      "JavaScript": {
        "bytes": 80000,
        "count": 6,
        "percentage": 32.0
      },
      "TypeScript": {
        "bytes": 20000,
        "count": 4,
        "percentage": 8.0
      },
      "HTML": {
        "bytes": 0,
        "count": 1,
        "percentage": 0.0
      },
      "CSS": {
        "bytes": 0,
        "count": 1,
        "percentage": 0.0
      }
    }
  },
  "technologies": {
    "username": "alice",
    "technology_count": 15,
    "repositories_analyzed": 10,
    "top_technologies": [
      "web",
      "api",
      "django",
      "react",
      "database",
      "rest-api",
      "python",
      "javascript",
      "docker",
      "kubernetes"
    ],
    "technologies": {
      "web": {
        "count": 8,
        "percentage": 80.0
      },
      "api": {
        "count": 7,
        "percentage": 70.0
      },
      "django": {
        "count": 5,
        "percentage": 50.0
      },
      "react": {
        "count": 6,
        "percentage": 60.0
      },
      "database": {
        "count": 6,
        "percentage": 60.0
      }
    }
  },
  "total_repositories": 25,
  "repositories_analyzed": 10
}
```

---

## Call Sequence Diagram

```
Frontend                    Backend                    GitHub API
   │                           │                            │
   │─ GET /account/alice/      │                            │
   │   summary/?max_repos=10  │                            │
   │                           │                            │
   │                    Check Cache?                        │
   │                       (MISS)                           │
   │                           │                            │
   │                           ├─ GET /users/alice          │
   │                           ├─────────────────────────► │
   │                           │◄───────────────────────── │
   │                           │                      (User Info)
   │                           │                            │
   │                           ├─ GET /users/alice/repos   │
   │                           ├─────────────────────────► │
   │                           │◄───────────────────────── │
   │                           │                      (10 repos)
   │                           │                            │
   │                    Process each repo:                  │
   │                           │                            │
   │                           ├─ GET /repos/.../languages │
   │                           ├─────────────────────────► │
   │                           │◄───────────────────────── │
   │                           │                            │
   │                           ├─ GET /repos/.../topics    │
   │                           ├─────────────────────────► │
   │                           │◄───────────────────────── │
   │                           │                            │
   │                    Aggregate Results                   │
   │                    Calculate Statistics               │
   │                    Store in Cache                     │
   │                           │                            │
   │◄─ JSON Response ──────────┤                            │
   │                           │                            │
   Display Results             │                            │
   (Languages, Tech)           │                            │
```

---

## Caching Strategy

```
Request Timeline with Caching:

Time 0:00
├─ User requests account summary
├─ Cache MISS
├─ Backend fetches from GitHub (2-3 seconds)
├─ Aggregates data (1-2 seconds)
├─ Stores in cache (TTL: 30 minutes)
└─ Response time: 3-5 seconds

Time 0:05 (5 seconds later)
├─ Another user requests same summary
├─ Cache HIT
├─ Immediate response (from memory)
└─ Response time: <100ms

Time 30:05 (30 minutes later)
├─ Cache expires
├─ Next request will fetch fresh data
└─ Cycle repeats
```

---

## Performance Metrics

### API Call Breakdown

| Operation      | Time        | Count   |
| -------------- | ----------- | ------- |
| User info      | 200ms       | 1       |
| Repos list     | 300ms       | 1       |
| Languages/repo | 100ms       | 10      |
| Topics/repo    | 100ms       | 10      |
| Aggregation    | 100ms       | 1       |
| **Total**      | **~2000ms** | **~32** |

### Caching Impact

```
Without Cache:
├─ First request: 2-4 seconds
└─ Subsequent requests: 2-4 seconds each

With Cache (30 min TTL):
├─ First request: 2-4 seconds (cache miss)
├─ Next 180 requests: <100ms (cache hits)
└─ Average response: ~1ms per request (for cached data)
```

---

## Files Changed

```
Backend/
├── skill_verifier/
│   ├── github_service.py
│   │   ├── get_account_programming_languages()    [NEW]
│   │   ├── get_account_technologies()             [NEW]
│   │   └── get_account_summary()                  [NEW]
│   │
│   ├── views.py
│   │   ├── GetAccountLanguagesView                [NEW]
│   │   ├── GetAccountTechnologiesView             [NEW]
│   │   └── GetAccountSummaryView                  [NEW]
│   │
│   └── urls.py
│       ├── /account/<username>/languages/         [NEW]
│       ├── /account/<username>/technologies/      [NEW]
│       └── /account/<username>/summary/           [NEW]

Documentation/
├── ACCOUNT_LANGUAGES_AND_TECHNOLOGIES.md          [NEW]
└── QUICK_REFERENCE_ACCOUNT_APIS.md                [NEW]
```

---

## Integration Checklist

- [x] Add methods to GitHubService
- [x] Add API views to views.py
- [x] Add URL patterns to urls.py
- [x] Create comprehensive documentation
- [ ] Add frontend components to display data
- [ ] Add error handling & validation
- [ ] Add rate limiting (optional)
- [ ] Add user authentication (optional)
- [ ] Deploy to production
- [ ] Set up monitoring & logging

---

## Example Usage Flow

```
1. User navigates to /profile/alice

2. Frontend loads profile component

3. Component fetches account summary:
   fetch('/api/account/alice/summary/?max_repos=15')

4. Backend processes request:
   ├─ Checks cache
   ├─ If hit → returns cached data
   └─ If miss → fetches from GitHub, aggregates, caches

5. Frontend receives response in 100ms (cached) or 3-4s (fresh)

6. Frontend displays:
   ├─ User avatar and bio
   ├─ Language distribution chart
   ├─ Technology cloud/list
   └─ Repository statistics

7. Result cached for 30 minutes
   ├─ Next user viewing same profile → instant load
   └─ After 30 minutes → fresh data fetched
```

---

## Key Concepts

### Language Statistics

- **Bytes**: Amount of code written in that language
- **Percentage**: (Language bytes / Total bytes) \* 100
- **Count**: Number of repositories using that language

### Technology Statistics

- **Count**: Number of repositories tagged with this technology
- **Percentage**: (Tech repos / Total repos) \* 100
- **Usage**: How widely used across the account

### Cache Benefits

- **Speed**: Responses <100ms for cached data
- **Cost**: Reduced GitHub API calls
- **Scalability**: Can handle more users
- **User Experience**: Instant profile loads

---

## Next Steps

1. **Frontend Integration**: Use provided React components
2. **Visualization**: Add charts and graphs
3. **Caching**: Consider Redis for production
4. **Monitoring**: Add logging for debugging
5. **Optimization**: Add pagination for large accounts
6. **Features**: Add comparisons, trends, recommendations
