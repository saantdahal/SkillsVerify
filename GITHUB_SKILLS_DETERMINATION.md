# How GitHub Skills Are Determined in SkillVerifier

## Overview

GitHub skills in SkillVerifier are determined through a multi-layered AI-powered analysis system that examines a user's GitHub profile data and extracts technical skills intelligently. The process combines GitHub API data collection with AI analysis using DeepSeek LLM.

---

## Complete Process Flow

```
┌─────────────────────────────────────┐
│ 1. GitHub Data Collection           │
│    (GitHubService)                  │
└────────────┬────────────────────────┘
             │
             ├─→ User Repositories
             ├─→ Programming Languages
             ├─→ Repository Topics
             ├─→ README Files
             ├─→ Commits
             └─→ Repository Metadata
             │
             ▼
┌─────────────────────────────────────┐
│ 2. Data Condensation                │
│    (SkillAnalyzer)                  │
└────────────┬────────────────────────┘
             │
             └─→ Prepare concise data
                 for AI analysis
             │
             ▼
┌─────────────────────────────────────┐
│ 3. AI Analysis                      │
│    (DeepSeek LLM)                   │
└────────────┬────────────────────────┘
             │
             └─→ Extract technical skills
                 from condensed data
             │
             ▼
┌─────────────────────────────────────┐
│ 4. Skill Verification               │
│    (vs Resume Skills)               │
└────────────┬────────────────────────┘
             │
             └─→ Compare and verify skills
                 using advanced matching
             │
             ▼
         GitHub Skills List
```

---

## Step 1: GitHub Data Collection

### File: `github_service.py`

The `GitHubService` class collects comprehensive data from GitHub API for the first 5 repositories.

#### Data Collected Per Repository:

```python
{
    'name': 'repository_name',
    'languages': {
        'Python': 5000,      # Bytes of code
        'JavaScript': 3000,
        'HTML': 1000
    },
    'topics': ['web', 'api', 'rest'],
    'readme': 'Full README content',
    'commits': [list of 10 recent commits],
    'description': 'Repository description',
    'stars': 42,
    'forks': 5,
    'created_at': '2022-01-01T00:00:00Z',
    'updated_at': '2024-10-31T12:00:00Z'
}
```

#### Data Sources:

| Data Type     | Source                 | API Endpoint                      | Purpose                                      |
| ------------- | ---------------------- | --------------------------------- | -------------------------------------------- |
| **Languages** | `get_repo_languages()` | `/repos/{owner}/{repo}/languages` | Identifies programming languages used        |
| **Topics**    | `get_repo_topics()`    | `/repos/{owner}/{repo}/topics`    | Tags/labels for repository classification    |
| **README**    | `get_repo_readme()`    | `/repos/{owner}/{repo}/readme`    | Documentation and project description        |
| **Commits**   | `get_repo_commits()`   | `/repos/{owner}/{repo}/commits`   | Development activity and patterns            |
| **Metadata**  | `get_user_repos()`     | `/users/{username}/repos`         | Repository info (stars, forks, created date) |

### Key GitHub API Calls:

```python
# 1. Get user repositories
GET https://api.github.com/users/{username}/repos

# 2. Get repository languages
GET https://api.github.com/repos/{username}/{repo}/languages

# 3. Get repository topics
GET https://api.github.com/repos/{username}/{repo}/topics
Accept: application/vnd.github.mercy-preview+json

# 4. Get repository README
GET https://api.github.com/repos/{username}/{repo}/readme

# 5. Get recent commits
GET https://api.github.com/repos/{username}/{repo}/commits?per_page=10

# 6. Get user information
GET https://api.github.com/users/{username}
```

### Example GitHub Data Structure:

```json
{
  "username": "johndoe",
  "repos": [
    {
      "name": "ecommerce-api",
      "description": "REST API for ecommerce platform",
      "languages": {
        "Python": 45000,
        "JavaScript": 2000,
        "HTML": 500
      },
      "topics": ["api", "rest", "django", "ecommerce"],
      "readme": "# Ecommerce API\nBuilt with Django and PostgreSQL...",
      "commits": [
        {
          "message": "Add payment processing with Stripe",
          "author": "John Doe",
          "date": "2024-10-30"
        },
        ...
      ],
      "stars": 28,
      "forks": 5,
      "created_at": "2022-06-15",
      "updated_at": "2024-10-31"
    },
    ...
  ]
}
```

---

## Step 2: Data Condensation

### File: `skill_analyzer.py` - `analyze_github_skills()` method

The raw GitHub data is condensed to extract only relevant information for AI analysis.

#### Why Condense?

1. **API Efficiency**: Reduces tokens sent to OpenRouter API
2. **Focus**: Removes unnecessary details, keeps skill-relevant info
3. **Cost**: Smaller payloads = lower API costs
4. **Quality**: Less noise improves AI accuracy

#### Condensed Data Format:

```python
condensed_data = {
    'username': 'johndoe',
    'repos': [
        {
            'name': 'ecommerce-api',
            'description': 'REST API for ecommerce platform',
            'languages': {
                'Python': 45000,
                'JavaScript': 2000
            },
            'topics': ['api', 'rest', 'django', 'ecommerce'],
            'readme_snippet': 'First 500 chars of README',
            'key_files': ['requirements.txt', 'package.json', 'Dockerfile']
        },
        ...
    ]
}
```

#### Data Extraction:

```python
condensed_data = {
    'username': github_data.get('username'),
    'repos': [
        {
            'name': repo.get('name'),
            'description': repo.get('description'),
            'languages': repo.get('languages'),
            'topics': repo.get('topics'),
            'readme_snippet': (repo.get('readme') or '')[:500],  # First 500 chars
            'key_files': repo.get('key_files', [])   # Important config files
        } for repo in github_data.get('repos', [])
    ]
}
```

---

## Step 3: AI Analysis

### Model: DeepSeek Chat (via OpenRouter API)

The condensed data is sent to DeepSeek LLM for intelligent skill extraction.

### AI Analysis Process:

#### Prompt Instructions:

```
1. **Examine Core Technologies:**
   - Identify programming languages from `languages` field
   - Extract frameworks from `topics` field
   - Find libraries mentioned in `description`

   Example:
   - Languages: Python, JavaScript → Skills: "Python", "JavaScript"
   - Topics: ["django", "rest"] → Skills: "Django", "REST API"

2. **Inspect Key Files:**
   - `package.json` → Node.js, npm
   - `requirements.txt` → Python, pip
   - `Dockerfile` → Docker
   - `pom.xml` → Java, Maven
   - `go.mod` → Go
   - `Gemfile` → Ruby, Bundler

   Example:
   - If file contains "requirements.txt" → Add "Python package management"
   - If file contains "package.json" → Add "npm", "Node.js"

3. **Infer Tools and Platforms:**
   - Databases: PostgreSQL, MongoDB, Redis, MySQL
   - Cloud: AWS, GCP, Azure
   - CI/CD: GitHub Actions, Jenkins, Travis CI
   - Containers: Docker, Kubernetes
   - Message Queues: RabbitMQ, Redis

   Example in README:
   - Mentions "deployed on AWS S3" → Add "AWS", "AWS S3"
   - References "Docker compose" → Add "Docker", "Docker Compose"

4. **Consolidate and Normalize:**
   - "React.js" + "React" → "React"
   - "NodeJS" → "Node.js"
   - "Python 3.8" → "Python"

   Example:
   - ["react", "React", "React.js"] → ["React"]
   - ["nodejs", "node", "Node.js"] → ["Node.js"]

5. **Be Specific:**
   - Prefer "AWS S3" over just "AWS" if evidence shows S3
   - Prefer "Express.js" over "Node.js" if Express is used
   - Use "AWS" only if general cloud usage is implied
```

#### AI Output:

The LLM returns a JSON array of extracted skills:

```json
[
  "Python",
  "Django",
  "JavaScript",
  "React",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Git",
  "REST API",
  "pytest",
  "Webpack"
]
```

---

## Step 4: Skill Verification

### File: `skill_analyzer.py` - `verify_skills_with_llm()` method

The extracted GitHub skills are compared with resume skills using intelligent LLM-based matching.

### Verification Process:

```
Resume Skills          GitHub Skills         Verification
─────────────────      ──────────────         ────────────

Python            →    Python            →    ✓ VERIFIED (Direct match)
React             →    React             →    ✓ VERIFIED (Direct match)
Node.js           →    Node.js           →    ✓ VERIFIED (Direct match)
Express.js        →    Express           →    ✓ VERIFIED (Alias match)
AWS               →    AWS S3, AWS EC2   →    ✓ VERIFIED (Hierarchical)
Machine Learning  →    (not found)       →    ✗ UNVERIFIED

GitHub Only:
          (not in resume) ← PostgreSQL   →    + ADDITIONAL SKILL
          (not in resume) ← Docker       →    + ADDITIONAL SKILL
```

### Verification Types:

#### 1. Direct Match

```
Resume Skill: "Python"
GitHub Skill: "Python"
Result: ✓ VERIFIED
Reasoning: "Direct match"
```

#### 2. Alias Match

```
Resume Skill: "Express"
GitHub Skill: "express.js"
Result: ✓ VERIFIED
Reasoning: "Alias match - common naming variations"
```

#### 3. Hierarchical Match

```
Resume Skill: "Node.js"
GitHub Skill: "Express.js"
Result: ✓ VERIFIED
Reasoning: "Express.js is a Node.js framework"

Resume Skill: "AWS"
GitHub Skill: ["AWS S3", "AWS Lambda"]
Result: ✓ VERIFIED
Reasoning: "AWS S3 and Lambda are AWS services"
```

#### 4. No Match

```
Resume Skill: "Machine Learning"
GitHub Skill: (not found)
Result: ✗ UNVERIFIED
Reasoning: "Not found in GitHub profile"
```

### LLM Verification Output:

```json
{
  "verified_skills": [
    {
      "skill": "Python",
      "evidence": ["Python"],
      "reasoning": "Direct match - Python is the primary language"
    },
    {
      "skill": "Node.js",
      "evidence": ["Express.js", "npm"],
      "reasoning": "Hierarchical match - Express.js is a Node.js framework"
    }
  ],
  "unverified_skills": ["Machine Learning", "Kubernetes"],
  "additional_skills": ["Docker", "PostgreSQL", "Redis"],
  "verification_percentage": 75,
  "summary": "Candidate has demonstrated strong Python and web development skills..."
}
```

---

## Caching Strategy

### Why Cache?

1. **Performance**: Avoid repeated GitHub API calls
2. **Rate Limiting**: GitHub API has rate limits (60 unauthenticated, 5000 authenticated requests/hour)
3. **Cost**: OpenRouter API charges per token
4. **User Experience**: Faster response times

### Cache Configuration:

**File:** `backend/settings.py`

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'skillverify-cache',
    }
}

GITHUB_CACHE_TIMEOUT = 60 * 30  # 30 minutes
VERIFICATION_CACHE_TIMEOUT = 6  # 6 seconds
```

### Cache Keys:

| Data                   | Cache Key                                           | Timeout |
| ---------------------- | --------------------------------------------------- | ------- |
| User repos             | `{username}_user_repos`                             | 30 min  |
| Repo languages         | `{username}_{repo}_repo_languages`                  | 30 min  |
| Repo topics            | `{username}_{repo}_repo_topics`                     | 30 min  |
| Repo README            | `{username}_{repo}_repo_readme`                     | 30 min  |
| All GitHub data        | `{username}_all_github_data_{max_repos}`            | 30 min  |
| GitHub skills analysis | `github_skills_analysis_{username}_{repos}`         | 30 min  |
| Skill verification     | `verify_skills_llm_{resume_skills}_{github_skills}` | 6 sec   |

---

## Complete Example: Determining Skills

### Input: GitHub Username

```
username: "alice-dev"
```

### Step 1: Collect GitHub Data

```
GET /users/alice-dev/repos
→ Returns 15 repositories, take first 5

For each repository:
├─ Get languages: Python (60%), JavaScript (30%), HTML (10%)
├─ Get topics: ["web", "api", "django"]
├─ Get README: "Built with Django and PostgreSQL..."
├─ Get commits: Last 10 commits
└─ Get metadata: 15 stars, 3 forks
```

### Step 2: Condense Data

```json
{
  "username": "alice-dev",
  "repos": [
    {
      "name": "blog-platform",
      "description": "Personal blog with comments",
      "languages": {
        "Python": 60,
        "JavaScript": 30,
        "HTML": 10
      },
      "topics": ["web", "api", "django"],
      "readme_snippet": "Built with Django...",
      "key_files": ["requirements.txt", "manage.py"]
    },
    {
      "name": "weather-app",
      "description": "React weather application",
      "languages": {
        "JavaScript": 100
      },
      "topics": ["react", "api"],
      "readme_snippet": "React app using...",
      "key_files": ["package.json"]
    }
  ]
}
```

### Step 3: Send to AI

**DeepSeek LLM Analysis:**

```
Analysis:
- Languages found: Python (blog), JavaScript (both)
- Frameworks: Django (blog), React (weather)
- Key files indicate: requirements.txt (Python/pip), package.json (npm/Node)
- Topics mention: "api", "web", "django", "react"
- README mentions: Django, PostgreSQL

Extracted Skills: [
  "Python", "Django", "PostgreSQL",
  "JavaScript", "React", "Node.js", "npm",
  "REST API", "HTML", "CSS"
]
```

### Step 4: Verification Results

**Comparing Resume Skills vs GitHub Skills:**

```
Resume: ["Python", "Django", "React", "Machine Learning", "AWS"]
GitHub: ["Python", "Django", "PostgreSQL", "JavaScript", "React", "Node.js"]

Results:
✓ Python → Verified
✓ Django → Verified
✓ React → Verified
✗ Machine Learning → Unverified
✗ AWS → Unverified

Additional Skills Found:
+ PostgreSQL
+ Node.js
+ JavaScript

Verification Score: 60% (3 of 5 resume skills verified)
```

---

## Key Files Overview

| File                | Purpose                        | Key Method                 |
| ------------------- | ------------------------------ | -------------------------- |
| `github_service.py` | Collects raw GitHub data       | `get_all_github_data()`    |
| `skill_analyzer.py` | Analyzes GitHub data using AI  | `analyze_github_skills()`  |
| `skill_analyzer.py` | Verifies against resume skills | `verify_skills_with_llm()` |
| `views.py`          | Orchestrates the process       | `VerifySkillsView.post()`  |

---

## API Requirements

### GitHub API Token

**Required for:**

- Making authenticated requests (higher rate limits)
- Accessing private repository data (if applicable)

**Get Token:**

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create token with scopes: `public_repo`, `read:user`

**Configure:**

```python
# settings.py
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
```

### OpenRouter API Key (for DeepSeek LLM)

**Required for:**

- AI skill analysis
- LLM-powered verification

**Get Key:**

1. Sign up at OpenRouter.ai
2. Create API key
3. Add credits

**Configure:**

```python
# settings.py
OPENROUTER_API_KEY = os.getenv('DEEPSEEK_API_KEY')
```

---

## Performance Metrics

### Average Processing Time:

- GitHub data collection: 2-3 seconds
- Data condensation: <100ms
- AI analysis (DeepSeek): 3-5 seconds
- Skill verification: 2-3 seconds
- **Total: 7-11 seconds per verification**

### With Caching:

- **<100ms if all data is cached**

### API Costs (Approximate):

**Per Verification:**

- GitHub API: Free (with token) or rate-limited (without)
- OpenRouter (DeepSeek): ~$0.01-0.05 per verification

---

## Troubleshooting

### Issue: No skills found

**Causes:**

- GitHub profile has no repositories
- Repositories have no languages detected
- AI model failed to parse response

**Solutions:**

1. Verify GitHub username is correct
2. Check GitHub profile has public repositories
3. Check OpenRouter API key is valid
4. Review API response in debug logs

### Issue: Skills extraction seems incomplete

**Causes:**

- Only first 5 repositories analyzed
- Topics not set on repositories
- README files missing or minimal

**Solutions:**

1. Add topics to GitHub repositories
2. Write comprehensive README files
3. Commit code in multiple repositories
4. Use diverse programming languages

### Issue: False verification matches

**Causes:**

- AI hallucination
- Poor prompt instructions
- Ambiguous skill names

**Solutions:**

1. Improve AI prompt instructions
2. Use specific skill names
3. Review verification results manually
4. Adjust matching logic

---

## Future Improvements

1. **Multi-language Support**

   - Detect README in multiple languages

2. **Commit Pattern Analysis**

   - Analyze commit messages for tool mentions
   - Calculate skill proficiency from commit frequency

3. **Contribution Analysis**

   - Analyze contributions to other projects
   - Identify skills from contributed code

4. **Dependency Analysis**

   - Parse package.json, requirements.txt
   - Extract exact library versions

5. **Enhanced Caching**

   - Redis backend for distributed caching
   - Smarter cache invalidation

6. **Skill Scoring**

   - Calculate proficiency level (Beginner/Intermediate/Expert)
   - Score based on usage frequency and project count

7. **Blockchain Integration**
   - Store verification hash on blockchain
   - Enable skill credential sharing

---

## References

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [DeepSeek Model Card](https://huggingface.co/deepseek-ai/deepseek-chat)
