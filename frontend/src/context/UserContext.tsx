import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface LoginContextType {
  isLoggedIn: boolean;
  userDetails: UserDetails;
  login: (githubUsername?: string) => void;
  logOut: () => void;
  loading: boolean;
  token: string | null;
}

const UserContext = createContext<LoginContextType | undefined>(undefined);

interface UserDetails {
  email: string;
  name: string;
  address?: string;
  github_username?: string;
  avatar_url?: string;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserDetailsInitialValues = {
  email: "",
  name: "",
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetails>(
    UserDetailsInitialValues
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  const login = async (githubUsername?: string) => {
    try {
      if (githubUsername) {
        // Direct GitHub username authentication
        const response = await fetch("http://127.0.0.1:8000/api/auth/github/authenticate/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ github_username: githubUsername }),
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          setUserDetails({
            email: userData.email || "",
            name: userData.name || "",
            github_username: userData.github_username,
            avatar_url: userData.avatar_url,
          });
          setToken(data.token);
          setIsLoggedIn(true);
          sessionStorage.setItem("userDetails", JSON.stringify(userData));
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("token", data.token);
        } else {
          const errorData = await response.json();
          console.error("Authentication failed:", errorData.error);
          throw new Error(errorData.error || "Authentication failed");
        }
      } else {
        // OAuth login - redirect to GitHub authorization
        try {
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
          const state = Math.random().toString(36).substring(2, 15) +
                       Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem("oauth_state", state);

          // Add state parameter to the authorization URL
          const url = new URL(authorizeUrl);
          url.searchParams.set("state", state);

          // Redirect to GitHub OAuth authorization
          window.location.href = url.toString();
        } catch (error) {
          console.error("OAuth error:", error);
          throw new Error("Failed to initiate GitHub login");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logOut = async () => {
    clearStates();
  };

  const clearStates = () => {
    setIsLoggedIn(false);
    setUserDetails(UserDetailsInitialValues);
    setToken(null);
    sessionStorage.clear();
  };

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("userDetails");
    const sessionLoginState = sessionStorage.getItem("isLoggedIn");
    const sessionToken = sessionStorage.getItem("token");

    if (sessionUser && sessionLoginState === "true") {
      try {
        const userData = JSON.parse(sessionUser);
        setUserDetails({
          email: userData.email || "",
          name: userData.name || "",
          github_username: userData.github_username,
          avatar_url: userData.avatar_url,
        });
        setIsLoggedIn(true);
        if (sessionToken) {
          setToken(sessionToken);
        }
      } catch (error) {
        console.error("Error parsing user details:", error);
        clearStates();
      }
    }
    setLoading(false);
  }, []);

  const contextValue: LoginContextType = {
    isLoggedIn,
    userDetails,
    login,
    logOut,
    loading,
    token,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {loading ? (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useLogin must be used within UserProvider");
  }
  return context;
};
