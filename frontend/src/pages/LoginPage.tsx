import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

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

        <div className="mt-8 space-y-6 bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50">
          <Button
            onClick={() => navigate("/upload-resume")}
            className="w-full group relative flex justify-center items-center py-3 px-4 text-base font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all"
          >
            <Github className="w-5 h-5 mr-2" />
            Start Verification
          </Button>

          <p className="text-center text-xs text-slate-500 mt-6">
            Upload your resume to verify your skills
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
