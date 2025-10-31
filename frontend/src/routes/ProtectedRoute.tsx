import { Navigate, Outlet } from "react-router-dom";
import { useLogin } from "@/context/UserContext";

interface ProtectedRouteProps {
  redirectPath: string;
}

export const ProtectedRoute = ({ redirectPath }: ProtectedRouteProps) => {
  const { isLoggedIn } = useLogin();

  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
