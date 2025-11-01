# GitHub Account Programming Languages & Technologies Overview

## Overview

This guide explains how to display comprehensive programming language and technology statistics for a user's entire GitHub account. The system aggregates data across all user repositories to provide insights into their technical stack and expertise areas.

---

## API Endpoints

### 1. Get Account Programming Languages

**Endpoint:**

```
GET /api/account/{username}/languages/
```

**Query Parameters:**

```
?max_repos=10  (optional, default: 10, max: 50)
```

**Example Request:**

```bash
curl http://127.0.0.1:8000/api/account/alice-dev/languages/?max_repos=10
```

**Response:**

```json
{
  "username": "alice-dev",
  "total_bytes": 245000,
  "language_count": 5,
  "repositories_analyzed": 10,
  "top_languages": ["Python", "JavaScript", "TypeScript", "HTML", "CSS"],
  "languages": {
    "Python": {
      "bytes": 120000,
      "count": 6,
      "percentage": 48.98
    },
    "JavaScript": {
      "bytes": 85000,
      "count": 8,
      "percentage": 34.69
    },
    "TypeScript": {
      "bytes": 25000,
      "count": 3,
      "percentage": 10.2
    },
    "HTML": {
      "bytes": 10000,
      "count": 5,
      "percentage": 4.08
    },
    "CSS": {
      "bytes": 5000,
      "count": 4,
      "percentage": 2.04
    }
  }
}
```

### 2. Get Account Technologies

**Endpoint:**

```
GET /api/account/{username}/technologies/
```

**Query Parameters:**

```
?max_repos=10  (optional, default: 10, max: 50)
```

**Example Request:**

```bash
curl http://127.0.0.1:8000/api/account/alice-dev/technologies/?max_repos=10
```

**Response:**

```json
{
  "username": "alice-dev",
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
    },
    "rest-api": {
      "count": 4,
      "percentage": 40.0
    },
    "python": {
      "count": 6,
      "percentage": 60.0
    },
    "javascript": {
      "count": 8,
      "percentage": 80.0
    },
    "docker": {
      "count": 3,
      "percentage": 30.0
    },
    "kubernetes": {
      "count": 2,
      "percentage": 20.0
    }
  }
}
```

### 3. Get Account Summary

**Endpoint:**

```
GET /api/account/{username}/summary/
```

**Query Parameters:**

```
?max_repos=10  (optional, default: 10, max: 50)
```

**Example Request:**

```bash
curl http://127.0.0.1:8000/api/account/alice-dev/summary/?max_repos=10
```

**Response:**

```json
{
  "user_info": {
    "id": 12345678,
    "login": "alice-dev",
    "name": "Alice Developer",
    "email": "alice@example.com",
    "avatar_url": "https://avatars.githubusercontent.com/u/12345678",
    "bio": "Full-stack developer passionate about web technologies",
    "company": "Tech Corp",
    "location": "San Francisco",
    "public_repos": 25,
    "followers": 45,
    "following": 30,
    "created_at": "2018-03-15T10:00:00Z"
  },
  "programming_languages": {
    "username": "alice-dev",
    "total_bytes": 245000,
    "language_count": 5,
    "repositories_analyzed": 10,
    "top_languages": ["Python", "JavaScript", "TypeScript"],
    "languages": { ... }
  },
  "technologies": {
    "username": "alice-dev",
    "technology_count": 15,
    "repositories_analyzed": 10,
    "top_technologies": ["web", "api", "django"],
    "technologies": { ... }
  },
  "total_repositories": 25,
  "repositories_analyzed": 10
}
```

---

## Backend Implementation

### File: `github_service.py`

#### Method 1: `get_account_programming_languages(max_repos=10)`

**Purpose:** Aggregate programming languages across all repositories

**Process:**

```python
1. Get all user repositories
2. For each repository (up to max_repos):
   - Fetch languages using GitHub API
   - Add language bytes to total
   - Track which repositories use each language
3. Calculate percentages
4. Sort by usage (bytes)
5. Cache results for 30 minutes
```

**Key Logic:**

```python
for repo in repos[:max_repos]:
    languages = self.get_repo_languages(repo_name)
    for language, bytes_count in languages.items():
        language_stats[language]['bytes'] += bytes_count
        language_stats[language]['count'] += 1

# Calculate percentage
language_stats[language]['percentage'] = (bytes / total_bytes) * 100
```

**Returns:**

- Username
- Total bytes of code
- Language statistics (bytes, count, percentage)
- Top 5 languages
- Total language count
- Number of repositories analyzed

#### Method 2: `get_account_technologies(max_repos=10)`

**Purpose:** Aggregate topics/technologies across all repositories

**Process:**

```python
1. Get all user repositories
2. For each repository (up to max_repos):
   - Fetch topics from GitHub API
   - Count usage frequency
3. Calculate percentages
4. Sort by frequency
5. Cache results for 30 minutes
```

**Returns:**

- Username
- Technology statistics (count, percentage)
- Top 10 technologies
- Total technology count
- Number of repositories analyzed

#### Method 3: `get_account_summary(max_repos=10)`

**Purpose:** Combine all account data into comprehensive overview

**Returns:**

- User profile information
- Programming languages aggregation
- Technologies aggregation
- Total and analyzed repository counts

### File: `views.py`

#### View 1: `GetAccountLanguagesView`

```python
class GetAccountLanguagesView(APIView):
    def get(self, request, username):
        # Parse optional max_repos parameter
        max_repos = int(request.query_params.get('max_repos', 10))

        # Fetch and return language statistics
        github_service = GitHubService(username)
        languages = github_service.get_account_programming_languages(max_repos)

        return Response(languages, status=status.HTTP_200_OK)
```

#### View 2: `GetAccountTechnologiesView`

```python
class GetAccountTechnologiesView(APIView):
    def get(self, request, username):
        # Parse optional max_repos parameter
        max_repos = int(request.query_params.get('max_repos', 10))

        # Fetch and return technology statistics
        github_service = GitHubService(username)
        technologies = github_service.get_account_technologies(max_repos)

        return Response(technologies, status=status.HTTP_200_OK)
```

#### View 3: `GetAccountSummaryView`

```python
class GetAccountSummaryView(APIView):
    def get(self, request, username):
        # Parse optional max_repos parameter
        max_repos = int(request.query_params.get('max_repos', 10))

        # Fetch comprehensive account summary
        github_service = GitHubService(username)
        summary = github_service.get_account_summary(max_repos)

        return Response(summary, status=status.HTTP_200_OK)
```

---

## Frontend Implementation

### React Component: Account Overview

```typescript
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AccountOverview: React.FC<{ username: string }> = ({ username }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountSummary = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/account/${username}/summary/?max_repos=15`
        );
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching account summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountSummary();
  }, [username]);

  if (loading) return <div>Loading...</div>;
  if (!summary) return <div>Error loading account data</div>;

  const { user_info, programming_languages, technologies } = summary;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* User Info Section */}
      <div className="flex items-center mb-8">
        <img
          src={user_info.avatar_url}
          alt={user_info.name}
          className="w-16 h-16 rounded-full mr-4"
        />
        <div>
          <h1 className="text-3xl font-bold">{user_info.name}</h1>
          <p className="text-gray-600">@{user_info.login}</p>
          <p className="text-gray-500">{user_info.bio}</p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Repositories" value={summary.total_repositories} />
        <StatCard
          title="Languages"
          value={programming_languages.language_count}
        />
        <StatCard title="Technologies" value={technologies.technology_count} />
        <StatCard title="Followers" value={user_info.followers} />
      </div>

      {/* Languages Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Programming Languages</h2>
        <div className="grid grid-cols-2 gap-8">
          {/* Bar Chart */}
          <BarChart
            width={400}
            height={300}
            data={getLanguagesData(programming_languages)}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="percentage" fill="#3b82f6" />
          </BarChart>

          {/* Language List */}
          <div>
            {Object.entries(programming_languages.languages).map(
              ([lang, stats]: any) => (
                <div key={lang} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{lang}</span>
                    <span className="text-gray-600">{stats.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Technologies Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Technologies & Tools</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(technologies.technologies)
            .sort(([, a]: any, [, b]: any) => b.count - a.count)
            .slice(0, 12)
            .map(([tech, stats]: any) => (
              <div key={tech} className="bg-blue-50 p-4 rounded-lg">
                <div className="font-medium capitalize">{tech}</div>
                <div className="text-sm text-gray-600">
                  Used in {stats.count} repos ({stats.percentage}%)
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to format languages for chart
function getLanguagesData(languages: any) {
  return Object.entries(languages.languages)
    .map(([name, stats]: any) => ({
      name,
      percentage: stats.percentage,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);
}

interface StatCardProps {
  title: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="text-gray-600 text-sm">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default AccountOverview;
```

### Language Statistics Component

```typescript
const LanguageStatistics: React.FC<{ username: string }> = ({ username }) => {
  const [languages, setLanguages] = useState<any>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      const response = await fetch(
        `http://127.0.0.1:8000/api/account/${username}/languages/?max_repos=20`
      );
      const data = await response.json();
      setLanguages(data);
    };

    fetchLanguages();
  }, [username]);

  if (!languages) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Language Distribution</h3>
      <div className="space-y-3">
        {Object.entries(languages.languages)
          .sort(([, a]: any, [, b]: any) => b.bytes - a.bytes)
          .map(([lang, stats]: any) => (
            <div key={lang}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{lang}</span>
                <span className="text-sm text-gray-600">
                  {(stats.bytes / 1024).toFixed(1)}KB ({stats.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
```

### Technologies Cloud Component

```typescript
const TechnologiesCloud: React.FC<{ username: string }> = ({ username }) => {
  const [technologies, setTechnologies] = useState<any>(null);

  useEffect(() => {
    const fetchTechs = async () => {
      const response = await fetch(
        `http://127.0.0.1:8000/api/account/${username}/technologies/?max_repos=20`
      );
      const data = await response.json();
      setTechnologies(data);
    };

    fetchTechs();
  }, [username]);

  if (!technologies) return <div>Loading...</div>;

  const getTechColor = (percentage: number) => {
    if (percentage >= 60) return "bg-red-500";
    if (percentage >= 40) return "bg-orange-500";
    if (percentage >= 20) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Technology Stack</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(technologies.technologies)
          .sort(([, a]: any, [, b]: any) => b.count - a.count)
          .map(([tech, stats]: any) => (
            <div
              key={tech}
              className={`${getTechColor(
                stats.percentage
              )} text-white px-3 py-1 rounded-full text-sm font-medium`}
              title={`${stats.percentage}% of repositories`}
            >
              {tech} {stats.count > 0 && `(${stats.count})`}
            </div>
          ))}
      </div>
    </div>
  );
};
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│ User Requests: /account/{username}/summary/         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │ GetAccountSummaryView     │
         └────────────┬──────────────┘
                      │
                      ▼
         ┌───────────────────────────────────────┐
         │ GitHubService.get_account_summary()   │
         └────────────┬──────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
    get_user_info()  get_account_  get_account_
                     programming_   technologies()
                     languages()
          │           │           │
          └───────────┼───────────┘
                      │
                      ▼
         ┌───────────────────────────┐
         │ Aggregate & Format Data   │
         │ Cache Results (30 min)    │
         └────────────┬──────────────┘
                      │
                      ▼
         ┌───────────────────────────┐
         │ Return JSON Response      │
         └────────────┬──────────────┘
                      │
                      ▼
         ┌───────────────────────────┐
         │ Frontend Receives Data    │
         │ Display in Components     │
         └───────────────────────────┘
```

---

## Caching Strategy

### Cache Keys:

```python
'alice-dev_account_languages_10'      # Languages data
'alice-dev_account_technologies_10'   # Technologies data
'alice-dev_account_summary_10'        # Complete summary
```

### Cache Duration:

```python
GITHUB_CACHE_TIMEOUT = 60 * 30  # 30 minutes
```

### Benefits:

1. **Performance**: Subsequent requests return instantly
2. **API Limits**: Reduces GitHub API calls
3. **Cost**: Lower OpenRouter API usage
4. **User Experience**: Faster page loads

---

## Example Usage

### JavaScript/Fetch

```javascript
// Get languages
const getLanguages = async (username) => {
  const response = await fetch(
    `http://127.0.0.1:8000/api/account/${username}/languages/?max_repos=15`
  );
  return response.json();
};

// Get technologies
const getTechnologies = async (username) => {
  const response = await fetch(
    `http://127.0.0.1:8000/api/account/${username}/technologies/?max_repos=15`
  );
  return response.json();
};

// Get complete summary
const getAccountSummary = async (username) => {
  const response = await fetch(
    `http://127.0.0.1:8000/api/account/${username}/summary/?max_repos=15`
  );
  return response.json();
};

// Usage
const summary = await getAccountSummary("alice-dev");
console.log("Top Languages:", summary.programming_languages.top_languages);
console.log("Top Technologies:", summary.technologies.top_technologies);
```

### Python/Requests

```python
import requests

def get_account_languages(username, max_repos=10):
    url = f"http://127.0.0.1:8000/api/account/{username}/languages/"
    params = {'max_repos': max_repos}
    response = requests.get(url, params=params)
    return response.json()

def get_account_technologies(username, max_repos=10):
    url = f"http://127.0.0.1:8000/api/account/{username}/technologies/"
    params = {'max_repos': max_repos}
    response = requests.get(url, params=params)
    return response.json()

def get_account_summary(username, max_repos=10):
    url = f"http://127.0.0.1:8000/api/account/{username}/summary/"
    params = {'max_repos': max_repos}
    response = requests.get(url, params=params)
    return response.json()

# Usage
summary = get_account_summary('alice-dev', max_repos=15)
print(f"Top Languages: {summary['programming_languages']['top_languages']}")
print(f"Top Technologies: {summary['technologies']['top_technologies']}")
```

---

## Metrics & Calculations

### Language Statistics:

```
Total Bytes = Sum of all language bytes across all repositories

Language Percentage = (Language Bytes / Total Bytes) * 100

Repository Count = Number of repositories using the language
```

### Technology Statistics:

```
Repository Count = Number of repositories with this technology tag

Percentage = (Repository Count / Total Repositories Analyzed) * 100
```

### Example Calculation:

```
Repository 1: Python (60%), JavaScript (30%), HTML (10%)
Repository 2: JavaScript (100%)
Repository 3: Python (70%), SQL (30%)

Total Bytes: 60k + 30k + 10k + 100k + 70k + 30k = 300k

Python: (60k + 70k) / 300k = 43.33%
JavaScript: (30k + 100k) / 300k = 43.33%
HTML: 10k / 300k = 3.33%
SQL: 30k / 300k = 10%
```

---

## Testing

### Test Getting Account Languages

```bash
curl "http://127.0.0.1:8000/api/account/torvalds/languages/?max_repos=10"
```

### Test Getting Account Technologies

```bash
curl "http://127.0.0.1:8000/api/account/torvalds/technologies/?max_repos=10"
```

### Test Getting Account Summary

```bash
curl "http://127.0.0.1:8000/api/account/torvalds/summary/?max_repos=10"
```

---

## Performance Considerations

### Optimization Tips:

1. **Cache Results**: 30-minute cache reduces API calls significantly
2. **Limit Repos**: Analyze first 10-20 repos instead of all
3. **Batch Requests**: Get summary instead of three separate calls
4. **CDN**: Cache API responses at CDN level for production
5. **Pagination**: Add pagination for very large accounts

### Average Response Times:

- First Request: 2-4 seconds (API calls + processing)
- Cached Request: <100ms

---

## Future Enhancements

1. **Language Trends**: Show language usage over time
2. **Contributor Analysis**: Identify team member specializations
3. **Technology Recommendations**: Suggest new tech based on ecosystem
4. **Skill Proficiency**: Calculate skill levels from usage patterns
5. **Comparison**: Compare with other developers
6. **Export**: Export statistics as PDF or CSV
7. **Real-time Updates**: WebSocket for live statistics
