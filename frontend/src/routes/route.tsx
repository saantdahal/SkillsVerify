import { createBrowserRouter } from "react-router-dom";
import NotFound from "@/pages/NotFoundPage";
import HomePage from "../pages/HomePage";
import Layout from "../layout/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import VerificationReportPage from "@/pages/VerificationReportPage";

export const routes = createBrowserRouter([
  {
    path: "/*",
    element: <NotFound />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      {
        element: <ProtectedRoute redirectPath="/login" />,
        children: [
          // { path: "/profile", element: <ProfilePage /> },
          { path: "/verification/:verification_id", element:  <VerificationReportPage /> },
        ],
      },
    ],
  },
]);

export default routes;
