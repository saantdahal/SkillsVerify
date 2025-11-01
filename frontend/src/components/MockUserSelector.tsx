import React from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_GITHUB_USERS, generateMockJWT } from "@/services/mockGithubService";
import { Github, X } from "lucide-react";

interface MockUserSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MockUserSelector: React.FC<MockUserSelectorProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleSelectMockUser = (user: typeof MOCK_GITHUB_USERS[0]) => {
    const mockToken = generateMockJWT(user);

    // Store mock user data and token
    sessionStorage.setItem("userDetails", JSON.stringify(user));
    sessionStorage.setItem("token", mockToken);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("isMockUser", "true");

    // Close modal and redirect
    onClose();
    navigate("/upload-resume");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Select Mock User
            </h2>
            <p className="text-slate-400 text-sm">
              For testing - choose a mock GitHub user profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User List */}
        <div className="p-6 space-y-3">
          {MOCK_GITHUB_USERS.map((user) => (
            <div
              key={user.github_id}
              onClick={() => handleSelectMockUser(user)}
              className="p-4 border border-slate-700 rounded-xl bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Github className="w-6 h-6 text-white" />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-sm text-slate-400">@{user.github_username}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {user.bio}
                  </p>
                  <div className="flex gap-2 mt-2 text-xs text-slate-500">
                    <span>📍 {user.location}</span>
                    <span>🏢 {user.company}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-slate-400 group-hover:text-blue-400 transition-colors">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-6 bg-slate-800/50">
          <p className="text-xs text-slate-500 text-center">
            💡 Tip: These are mock users for testing purposes only. In production,
            real GitHub OAuth will be used.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockUserSelector;
