# TrustChain Ibriz

A platform for skill verification using blockchain technology, AI-powered resume analysis, and GitHub integration.

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python3 -m venv venv
   ```

3. **Activate virtual environment:**

   ```bash
   source venv/bin/activate  # On Linux/Mac
   # or
   venv\Scripts\activate     # On Windows
   ```

4. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Setup environment variables:**

   - Copy the `.env` file and add your API keys:

   ```bash
   cp .env.example .env  # if you have an example file
   # or edit .env directly
   ```

   - Add your actual API keys to the `.env` file:

   ```
   GITHUB_TOKEN=your_github_personal_access_token
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

6. **Run database migrations:**

   ```bash
   python manage.py migrate
   ```

7. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## API Keys Required

- **GitHub Token:** Create a personal access token at https://github.com/settings/tokens
- **Gemini API Key:** Get your API key from https://makersuite.google.com/app/apikey

## Features

- AI-powered resume parsing using Google Gemini
- GitHub profile analysis for skill verification
- Blockchain-based skill verification certificates
- Modern React frontend with TypeScript
- Django REST API backend

## Development

Both frontend and backend support hot reloading during development.
