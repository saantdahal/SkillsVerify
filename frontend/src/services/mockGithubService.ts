// Mock GitHub users for testing OAuth flow
export const MOCK_GITHUB_USERS = [
  {
    github_username: "alice",
    github_id: 1001,
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar_url: "https://api.github.com/avatars/u/1001?s=40",
    bio: "Full-stack developer passionate about open source",
    company: "Tech Startup Inc",
    location: "San Francisco, CA",
  },
  {
    github_username: "bob",
    github_id: 1002,
    name: "Bob Smith",
    email: "bob@example.com",
    avatar_url: "https://api.github.com/avatars/u/1002?s=40",
    bio: "DevOps engineer and cloud architect",
    company: "Cloud Solutions",
    location: "New York, NY",
  },
  {
    github_username: "charlie",
    github_id: 1003,
    name: "Charlie Brown",
    email: "charlie@example.com",
    avatar_url: "https://api.github.com/avatars/u/1003?s=40",
    bio: "Frontend specialist and UI/UX enthusiast",
    company: "Design Studio",
    location: "Austin, TX",
  },
  {
    github_username: "diana",
    github_id: 1004,
    name: "Diana Prince",
    email: "diana@example.com",
    avatar_url: "https://api.github.com/avatars/u/1004?s=40",
    bio: "Data scientist and ML engineer",
    company: "AI Research Lab",
    location: "Seattle, WA",
  },
  {
    github_username: "eve",
    github_id: 1005,
    name: "Eve Wilson",
    email: "eve@example.com",
    avatar_url: "https://api.github.com/avatars/u/1005?s=40",
    bio: "Mobile app developer",
    company: "Mobile First Corp",
    location: "Boston, MA",
  },
];

export const getMockGithubUser = (username?: string) => {
  if (!username) {
    // Return random mock user if no username provided
    return MOCK_GITHUB_USERS[Math.floor(Math.random() * MOCK_GITHUB_USERS.length)];
  }

  // Return specific mock user by username
  return MOCK_GITHUB_USERS.find(
    (user) => user.github_username.toLowerCase() === username.toLowerCase()
  ) || MOCK_GITHUB_USERS[0]; // Default to first user if not found
};

export const generateMockJWT = (user: typeof MOCK_GITHUB_USERS[0]) => {
  // Simple mock JWT (not a real JWT, just for testing)
  const payload = btoa(
    JSON.stringify({
      github_id: user.github_id,
      github_username: user.github_username,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
    })
  );
  return `mock_jwt_${payload}`;
};
