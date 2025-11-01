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

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || "http://localhost:5173/auth/callback";

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
          console.error("Authentication failed");
        }
      } else {
        // GitHub OAuth login - redirect to upload page directly
        setIsLoggedIn(true);
        setUserDetails({
          email: "",
          name: "GitHub User",
          github_username: "github_user",
        });
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userDetails", JSON.stringify({
          email: "",
          name: "GitHub User",
          github_username: "github_user",
        }));
      }
    } catch (error) {
      console.error("Login error:", error);
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
