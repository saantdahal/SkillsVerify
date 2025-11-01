import { useLogin } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Github, Loader } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login } = useLogin();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Generate random state for CSRF protection
  const generateRandomState = () => {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Fetch GitHub authorization URL from backend
      const response = await fetch("http://127.0.0.1:8000/api/auth/github/authorize/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get authorization URL");
      }

      const data = await response.json();
      const authorizeUrl = data.authorize_url;

      // Generate and store state parameter for CSRF protection
      const state = generateRandomState();
      sessionStorage.setItem("oauth_state", state);

      // Add state parameter to the authorization URL
      const url = new URL(authorizeUrl);
      url.searchParams.set("state", state);

      // Redirect to GitHub OAuth authorization
      window.location.href = url.toString();
    } catch (error) {
      console.error("OAuth error:", error);
      setError("Failed to initiate GitHub login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Github className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to SkillVerifier
          </h2>
          <p className="text-slate-400">
            Verify your skills with your GitHub profile
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-6 bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50">
          <Button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full group relative flex justify-center items-center py-3 px-4 text-base font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Redirecting to GitHub...
              </>
            ) : (
              <>
                <Github className="w-5 h-5 mr-2" />
                Sign in with GitHub
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400">
                Or use username directly
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              GitHub Username
            </label>
            <input
              type="text"
              placeholder="Enter your GitHub username"
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              id="github-username"
            />
            <Button
              onClick={() => {
                const username = (
                  document.getElementById("github-username") as HTMLInputElement
                )?.value;
                if (username) {
                  setIsLoading(true);
                  login(username);
                }
              }}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Login with Username
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400">
                Recruiter Access
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate("/hrdashboard")}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all"
          >
            Sign in as Recruiter
          </Button>

          <p className="text-center text-xs text-slate-500 mt-6">
            We only access your public GitHub profile information
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
