import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, ChevronRight, Github, Download, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

interface VerificationResponse {
  github_username: string;
  resume_skills: string[];
  github_skills: string[];
  verification_result: {
    verified_skills: string[];
    unverified_skills: string[];
    additional_skills: string[];
    verification_percentage: number;
    explanation: string;
  };
  hash: string;
  created_at: string;
}

const VerificationReportPage: React.FC = () => {
  const { verification_id } = useParams<{ verification_id: string }>();
  const [data, setData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        const response = await axios.get<VerificationResponse>(
          `http://127.0.0.1:8000/api/verification/${verification_id}/`
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (axios.isAxiosError(err)) {
          setError(`Failed to load report: ${err.response?.data?.message || err.message}`);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      }
    };

    fetchVerificationData();
  }, [verification_id]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate score color
  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  // Generate background gradient based on verification percentage
  const getGradientClass = (percentage: number) => {
    if (percentage >= 70) return "from-green-900/20 to-green-800/10";
    if (percentage >= 40) return "from-yellow-900/20 to-yellow-800/10";
    return "from-red-900/20 to-red-800/10";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-medium">Loading verification report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
        <div className="max-w-lg w-full bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-800/50 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Report</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/" className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-lg transition-all inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Skill categories data
  const skillCategories = [
    {
      title: "Verified Skills",
      skills: data.verification_result.verified_skills,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      emptyMessage: "No skills were verified on GitHub",
      color: "border-green-500/30 bg-green-500/10"
    },
    {
      title: "Unverified Skills",
      skills: data.verification_result.unverified_skills,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      emptyMessage: "All skills were verified!",
      color: "border-red-500/30 bg-red-500/10"
    },
    {
      title: "Additional Skills",
      skills: data.verification_result.additional_skills,
      icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
      emptyMessage: "No additional skills found on GitHub",
      color: "border-blue-500/30 bg-blue-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resume Upload
          </Link>
        </div>
        
        {/* Header Section */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Resume Skills Verification
              </h1>
              <p className="text-gray-400 mt-1">
                Verification Report #{verification_id} • {formatDate(data.created_at)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <button className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center mr-3">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <a 
                href={`https://github.com/${data.github_username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center"
              >
                <Github className="w-4 h-4 mr-2" />
                View GitHub
              </a>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* GitHub Username */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">GitHub Username</p>
              <div className="flex items-center">
                <Github className="w-5 h-5 mr-2 text-gray-400" />
                <p className="font-medium">{data.github_username}</p>
              </div>
            </div>
            
            {/* Verification Score */}
            <div className={`rounded-xl p-4 border border-gray-700 bg-gradient-to-br ${getGradientClass(data.verification_result.verification_percentage)}`}>
              <p className="text-gray-400 text-sm mb-1">Verification Score</p>
              <div className="flex items-center">
                <p className={`text-2xl font-bold ${getScoreColor(data.verification_result.verification_percentage)}`}>
                  {data.verification_result.verification_percentage}%
                </p>
              </div>
            </div>
            
            {/* Resume Skills Count */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Skills Analyzed</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-blue-400">{data.resume_skills.length}</p>
                <p className="ml-2 text-gray-400">from resume</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Explanation Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Analysis Summary</h2>
          <p className="text-gray-300 leading-relaxed">{data.verification_result.explanation}</p>
        </div>
        
        {/* Skills Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Resume Skills */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                <Download className="w-4 h-4 text-blue-400" />
              </div>
              Resume Skills
            </h2>
            <div className="space-y-2">
              {data.resume_skills.length > 0 ? (
                data.resume_skills.map((skill, index) => (
                  <div key={index} className="rounded-lg border border-gray-700 bg-gray-800/40 py-2 px-4 flex justify-between items-center">
                    <span>{skill}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No skills detected in resume
                </div>
              )}
            </div>
          </div>
          
          {/* GitHub Skills */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                <Github className="w-4 h-4 text-blue-400" />
              </div>
              GitHub Skills
            </h2>
            <div className="space-y-2">
              {data.github_skills.length > 0 ? (
                data.github_skills.map((skill, index) => (
                  <div key={index} className="rounded-lg border border-gray-700 bg-gray-800/40 py-2 px-4">
                    {skill}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No skills detected from GitHub
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Detailed Skills Analysis */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Detailed Skills Analysis</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {skillCategories.map((category, index) => (
              <div key={index} className="border border-gray-700 rounded-xl overflow-hidden">
                <div className={`p-4 border-b ${category.color}`}>
                  <div className="flex items-center">
                    {category.icon}
                    <h3 className="font-medium ml-2">{category.title}</h3>
                  </div>
                </div>
                <div className="p-4 bg-gray-800/30">
                  {category.skills.length > 0 ? (
                    <div className="space-y-2">
                      {category.skills.map((skill, idx) => (
                        <div key={idx} className="py-2 px-3 bg-gray-800/50 rounded-lg text-sm">
                          {skill}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      {category.emptyMessage}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Hash Verification */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                <AlertCircle className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Verification Hash</p>
                <p className="text-sm font-mono text-gray-400 truncate max-w-xs md:max-w-md">
                  {data.hash}
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(data.hash)}
              className="text-gray-400 hover:text-blue-400 bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors text-xs"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationReportPage;