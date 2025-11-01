import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "@/context/UserContext";
import { getMockGithubUser, generateMockJWT } from "@/services/mockGithubService";

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useLogin();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we already have token and user from redirect
        const token = searchParams.get("token");
        const userStr = searchParams.get("user");
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setError(`Authentication error: ${errorParam}`);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // If we have token and user from backend redirect, use it directly
        if (token && userStr) {
          const userData = JSON.parse(userStr);
          
          // Store user data and token
          sessionStorage.setItem("userDetails", JSON.stringify(userData));
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("isLoggedIn", "true");
          
          // Redirect to upload page
          navigate("/upload-resume");
          return;
        }

        // Fallback: Exchange code for token with backend (for POST method)
        if (!code) {
          setError("No authorization code received");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // Verify state matches
        const storedState = sessionStorage.getItem("oauth_state");
        if (state && state !== storedState) {
          setError("State mismatch - possible CSRF attack");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // Exchange code for token with backend
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/api/auth/github/callback/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ code }),
            }
          );

          if (response.ok) {
            const data = await response.json();

            // Store user data and token
            const userData = data.user;
            sessionStorage.setItem("userDetails", JSON.stringify(userData));
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("isLoggedIn", "true");

            // Check if user is a recruiter and redirect to HR dashboard
            const userRole = sessionStorage.getItem("userRole");
            if (userRole === "recruiter") {
              navigate("/hrdashboard");
            } else {
              // Redirect to upload page for regular users
              navigate("/upload-resume");
            }
            return;
          }
        } catch (err) {
          console.error("Backend OAuth failed, using mock data for testing:", err);
        }

        // Fallback to mock GitHub user for testing/development
        console.log("Using mock GitHub user for testing");
        const mockUser = getMockGithubUser();
        const mockToken = generateMockJWT(mockUser);

        // Store mock user data and token
        sessionStorage.setItem("userDetails", JSON.stringify(mockUser));
        sessionStorage.setItem("token", mockToken);
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("isMockUser", "true"); // Flag to indicate mock user

        // Redirect to upload page
        navigate("/upload-resume");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-blue-950">
      <div className="text-center">
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-400 mb-2">
              Authentication Error
            </h2>
            <p className="text-red-300">{error}</p>
            <p className="text-sm text-slate-400 mt-4">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <div>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-xl font-bold text-white">
              Authenticating with GitHub...
            </h2>
            <p className="text-slate-400 mt-2">Please wait while we verify your account</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
