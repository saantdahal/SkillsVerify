# Quick Reference: Account Languages & Technologies APIs

## New Endpoints Added

### 1. Programming Languages Endpoint

```
GET /api/account/{username}/languages/?max_repos=10
```

**Returns:**

- Total bytes of code by language
- Language percentages
- Top 5 languages
- Repository count for each language

**Example:**

```bash
curl "http://127.0.0.1:8000/api/account/alice/languages/?max_repos=15"
```

---

### 2. Technologies Endpoint

```
GET /api/account/{username}/technologies/?max_repos=10
```

**Returns:**

- Technology/topic usage frequency
- Percentage of repos using each tech
- Top 10 technologies
- Total technology count

**Example:**

```bash
curl "http://127.0.0.1:8000/api/account/alice/technologies/?max_repos=15"
```

---

### 3. Account Summary Endpoint

```
GET /api/account/{username}/summary/?max_repos=10
```

**Returns (all in one):**

- User profile information
- Programming language statistics
- Technologies statistics
- Repository counts

**Example:**

```bash
curl "http://127.0.0.1:8000/api/account/alice/summary/?max_repos=15"
```

---

## Quick Display Examples

### Display Top Languages

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/api/account/alice/languages/?max_repos=10"
);
const data = await response.json();

// Top 5 languages
console.log(data.top_languages);
// Output: ["Python", "JavaScript", "TypeScript", "HTML", "CSS"]

// Language details
Object.entries(data.languages).forEach(([lang, stats]) => {
  console.log(`${lang}: ${stats.percentage}%`);
});
```

### Display Top Technologies

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/api/account/alice/technologies/?max_repos=10"
);
const data = await response.json();

// Top 10 technologies
console.log(data.top_technologies);
// Output: ["web", "api", "django", "react", "database", ...]

// Technology details
Object.entries(data.technologies).forEach(([tech, stats]) => {
  console.log(`${tech}: ${stats.count} repos (${stats.percentage}%)`);
});
```

### Display Complete Account Overview

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/api/account/alice/summary/?max_repos=10"
);
const data = await response.json();

// User info
console.log(`Name: ${data.user_info.name}`);
console.log(`Bio: ${data.user_info.bio}`);
console.log(`Followers: ${data.user_info.followers}`);

// Languages
console.log(
  `Top Languages: ${data.programming_languages.top_languages.join(", ")}`
);

// Technologies
console.log(
  `Top Technologies: ${data.technologies.top_technologies.join(", ")}`
);

// Repository counts
console.log(`Total Repos: ${data.total_repositories}`);
console.log(`Analyzed: ${data.repositories_analyzed}`);
```

---

## Response Structure

### Languages Response

```
{
  username: string
  total_bytes: number
  language_count: number
  repositories_analyzed: number
  top_languages: string[]
  languages: {
    [language_name]: {
      bytes: number
      count: number
      percentage: number
    }
  }
}
```

### Technologies Response

```
{
  username: string
  technology_count: number
  repositories_analyzed: number
  top_technologies: string[]
  technologies: {
    [tech_name]: {
      count: number
      percentage: number
    }
  }
}
```

### Summary Response

```
{
  user_info: {
    id: number
    login: string
    name: string
    email: string
    avatar_url: string
    bio: string
    company: string
    location: string
    public_repos: number
    followers: number
    following: number
    created_at: string
  }
  programming_languages: { ... }  // Full languages object
  technologies: { ... }            // Full technologies object
  total_repositories: number
  repositories_analyzed: number
}
```

---

## Files Updated

1. **Backend**

   - `github_service.py` - Added 3 new methods
   - `views.py` - Added 3 new API views
   - `urls.py` - Added 3 new URL patterns

2. **Documentation**
   - `ACCOUNT_LANGUAGES_AND_TECHNOLOGIES.md` - Comprehensive guide

---

## Testing

```bash
# Test with a real GitHub user
curl "http://127.0.0.1:8000/api/account/torvalds/summary/?max_repos=10"

# Get just languages
curl "http://127.0.0.1:8000/api/account/torvalds/languages/?max_repos=10"

# Get just technologies
curl "http://127.0.0.1:8000/api/account/torvalds/technologies/?max_repos=10"
```

---

## Integration Steps

1. **Start backend server**

   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Test endpoints**

   ```bash
   curl http://127.0.0.1:8000/api/account/github-username/summary/
   ```

3. **Integrate into frontend**
   - Use the provided React components
   - Call endpoints from your UI
   - Display results using charts/components

---

## Query Parameters

### `max_repos` Parameter

Controls how many repositories to analyze.

```bash
# Default (10 repos)
curl "http://127.0.0.1:8000/api/account/alice/languages/"

# Analyze 20 repos
curl "http://127.0.0.1:8000/api/account/alice/languages/?max_repos=20"

# Analyze all repos (use caution - slower)
curl "http://127.0.0.1:8000/api/account/alice/languages/?max_repos=50"
```

### Recommended Values

- Quick overview: `max_repos=5`
- Standard: `max_repos=10` (default)
- Comprehensive: `max_repos=20`
- Full analysis: `max_repos=50` (slowest)

---

## Performance

### Cache Times

- First request: 2-4 seconds
- Cached request: <100ms
- Cache duration: 30 minutes

### Recommended Usage

1. Display account overview on profile page
2. Show top languages prominently
3. Show top technologies in a cloud/list
4. Update cache daily or on demand
5. Use `max_repos=10` for balance

---

## Example Response - Condensed

### Languages

```json
{
  "username": "alice",
  "total_bytes": 250000,
  "top_languages": ["Python", "JavaScript", "TypeScript"],
  "languages": {
    "Python": { "bytes": 150000, "count": 8, "percentage": 60.0 },
    "JavaScript": { "bytes": 80000, "count": 6, "percentage": 32.0 },
    "TypeScript": { "bytes": 20000, "count": 4, "percentage": 8.0 }
  }
}
```

### Technologies

```json
{
  "username": "alice",
  "top_technologies": ["web", "api", "django", "react", "database"],
  "technologies": {
    "web": { "count": 8, "percentage": 80.0 },
    "api": { "count": 7, "percentage": 70.0 },
    "django": { "count": 5, "percentage": 50.0 },
    "react": { "count": 6, "percentage": 60.0 }
  }
}
```

---

## Troubleshooting

### Issue: Returns 404

**Solution:** Make sure username exists on GitHub

### Issue: Empty languages/technologies

**Solution:** Check repositories have GitHub language detection or topics set

### Issue: Slow response

**Solution:** Reduce `max_repos` parameter or wait for cache (future requests are fast)

### Issue: Incomplete data

**Solution:** Increase `max_repos` to analyze more repositories
