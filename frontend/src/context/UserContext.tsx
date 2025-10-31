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
  login: (email: string, password: string) => Promise<boolean>;
  logOut: () => void;
  loading: boolean;
}

const UserContext = createContext<LoginContextType | undefined>(undefined);

interface UserDetails {
  email: string;
  name: string;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For now, use simple authentication (replace with actual API call later)
      // This is just a demo - in production you'd call your Django backend
      if (email && password) {
        const userData = {
          email: email,
          name: email.split('@')[0], // Simple name extraction
        };

        setUserDetails(userData);
        setIsLoggedIn(true);
        sessionStorage.setItem("userDetails", JSON.stringify(userData));
        sessionStorage.setItem("isLoggedIn", "true");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logOut = () => {
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
      {children}
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
