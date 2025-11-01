import { createBrowserRouter } from "react-router-dom";
import NotFound from "@/pages/NotFoundPage";
import HomePage from "../pages/HomePage";
import Layout from "../layout/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import VerificationReportPage from "@/pages/VerificationReportPage";
import HRDashboard from "@/pages/HrDashboard";
import ResumeUploadForm from "@/components/ResumeUploadForm";
import OAuthCallback from "@/pages/OAuthCallbackPage";

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
    path: "/auth/callback",
    element: <OAuthCallback />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/upload-resume", element: <ResumeUploadForm /> },
      {
        element: <ProtectedRoute redirectPath="/login" />,
        children: [
          // { path: "/profile", element: <ProfilePage /> },
          { path: "/verification/:verification_id", element:  <VerificationReportPage /> },
        ],
      },
    ],
  },

  {
    path: "/hrdashboard",
    element: <HRDashboard />,
  },
  {
    path: "/hrdashboard/manish",
    element: <HRDashboard />,
  },

]);

export default routes;
