import { useEffect, useState } from "react";
import UploadPanel from "../components/Home/UploadPanel";
import Leaderboard from "@/components/Leaderboard";
import AskQuestions from "@/components/AskQuestions";
import { useLogin } from "@/context/UserContext";
import { SuiObjectData } from "@mysten/sui.js/client";
import LoggedOutView from "@/components/Home/LoggedOutView";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ResumeUploadForm from "@/components/ResumeUploadForm";

const HomePage = () => {
  const { isLoggedIn, userDetails } = useLogin();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handleRegisterNowClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileDialogOpen(true);
  };

  useEffect(() => {
    if (isLoggedIn && userDetails?.address) {
    }
  }, [isLoggedIn, userDetails]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <Loader className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="mb-4">
          <span className="text-red-500">{error}</span>
        </div>
      )}

      {isLoggedIn ? (
        isRegistered ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <UploadPanel />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky">
                {/* <Leaderboard /> */}
                <div className="">
                  {/* <AskQuestions /> */}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <ResumeUploadForm />
          </div>
        )
      ) : (

    <div className="flex justify-center w-full">
      <LoggedOutView />
    </div>

      )}
    </div>
  );
};

export default HomePage;