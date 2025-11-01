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
  login: () => void;
  logOut: () => void;
  loading: boolean;
}

const UserContext = createContext<LoginContextType | undefined>(undefined);

interface UserDetails {
  email: string;
  name: string;
  address?: string;
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

  const login = async () => {
    // Simple auth: just set logged in with mock user
    const userData = {
      email: "user@example.com",
      name: "Demo User",
    };
    setUserDetails(userData);
    setIsLoggedIn(true);
    sessionStorage.setItem("userDetails", JSON.stringify(userData));
    sessionStorage.setItem("isLoggedIn", "true");
  };

  const logOut = async () => {
    clearStates();
  };

  const clearStates = () => {
    setIsLoggedIn(false);
    setUserDetails(UserDetailsInitialValues);
    sessionStorage.clear();
  };

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("userDetails");
    const sessionLoginState = sessionStorage.getItem("isLoggedIn");

    if (sessionUser && sessionLoginState === "true") {
      setUserDetails(JSON.parse(sessionUser));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const contextValue: LoginContextType = {
    isLoggedIn,
    userDetails,
    login,
    logOut,
    loading,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {loading ? (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-xl">Logging in...</div>
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
