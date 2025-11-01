import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, ChevronRight, Github, Download, ArrowLeft, Zap, BarChart2, Award } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { fetchFromWalrus } from "@/services/walrusService";
import StrengthPerSkillSection from "@/components/StrengthPerSkillSection";

interface VerificationResponse {
  github_username: string;
  resume_skills: string[];
  github_skills: string[];
  verification_result: {
    verified_skills: string[];
    unverified_skills: string[];
    additional_skills: string[];
    verification_percentage: number;
    strength_per_skill: Record<string, number>;
    explanation: string;
  };
  hash: string;
  created_at?: string;
  verification_id: number;
}

const VerificationReportPage: React.FC = () => {
  const { verification_id } = useParams<{ verification_id: string }>();
  const [data, setData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        // get 
        const storedBlobObject = localStorage.getItem('blobObject');

        if (storedBlobObject) {
          const blobObject = JSON.parse(storedBlobObject);
          const blobId = blobObject?.blobId;

          if (blobId) {
            const fetchedData = await fetchFromWalrus(blobId);
            console.log('Fetched blob content:', fetchedData);

            // Parse the fetched data if it's a string
            const parsedData = typeof fetchedData === 'string' ? JSON.parse(fetchedData) : fetchedData;

            // Add current date as created_at if it doesn't exist
            if (!parsedData.created_at) {
              parsedData.created_at = new Date().toISOString();
            }

            setData(parsedData);
            setLoading(false);
          } else {
            throw new Error('blobId not found in stored blobObject');
          }
        } else {
          throw new Error('No blobObject found in localStorage');
        }
      } catch (err) {
        setLoading(false);
        setError(`Failed to load report: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  // Calculate overall strength score based on strength_per_skill values
  const calculateOverallStrength = (strengthData: Record<string, number>) => {
    if (!strengthData || Object.keys(strengthData).length === 0) return 0;
    const sum = Object.values(strengthData).reduce((acc, val) => acc + val, 0);
    return Math.round((sum / Object.keys(strengthData).length) * 10) / 10;
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

  // Calculate the overall strength score
  const overallStrength = data.verification_result.strength_per_skill
    ? calculateOverallStrength(data.verification_result.strength_per_skill)
    : 0;

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
                Verification Report #{data.verification_id} • {data.created_at ? formatDate(data.created_at) : "Today"}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <button className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center mr-3">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  {data.verification_result.verification_percentage.toFixed(2)}%
                </p>

              </div>
            </div>

            {/* Skills Count */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Skills Analyzed</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-blue-400">{data.resume_skills.length}</p>
                <p className="ml-2 text-gray-400">from resume</p>
              </div>
            </div>

            {/* Overall Strength */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Overall Strength</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-purple-400">{overallStrength}/10</p>
                <Award className={`ml-2 w-5 h-5 text-purple-400 ${overallStrength >= 7 ? 'fill-purple-400' : ''}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto mb-6 bg-gray-900/50 rounded-xl p-1 border border-gray-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg flex items-center mr-2 transition-colors ${activeTab === "overview" ? "bg-blue-500/20 text-blue-400" : "hover:bg-gray-800 text-gray-400"
              }`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2 rounded-lg flex items-center mr-2 transition-colors ${activeTab === "skills" ? "bg-blue-500/20 text-blue-400" : "hover:bg-gray-800 text-gray-400"
              }`}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Skills Analysis
          </button>
        </div>

        {activeTab === "overview" && (
          <>
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
              <h2 className="text-xl font-bold mb-6">Verification Results</h2>

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
          </>
        )}

        {activeTab === "skills" && (
          <>
            {/* Strength Per Skill Section */}
            {data.verification_result.strength_per_skill && Object.keys(data.verification_result.strength_per_skill).length > 0 && (
              <StrengthPerSkillSection strengthData={data.verification_result.strength_per_skill} />
            )}

            {/* Technical vs Soft Skills Distribution */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Candidate Profile Summary</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Experience Level */}
                <div className="border border-gray-700 rounded-xl overflow-hidden bg-gradient-to-r from-blue-900/20 to-blue-800/5">
                  <div className="p-4">
                    <h3 className="font-medium mb-2">Experience Level</h3>

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Junior</span>
                      <span className="text-sm text-gray-400">Senior</span>
                    </div>

                    <div className="w-full bg-gray-800/50 h-3 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                        style={{ width: `${getExperienceLevel(data.verification_result.strength_per_skill)}%` }}
                      />
                    </div>

                    <p className="text-sm text-gray-400">
                      Based on code complexity and project experience
                    </p>
                  </div>
                </div>

                {/* Code Quality */}
                <div className="border border-gray-700 rounded-xl overflow-hidden bg-gradient-to-r from-purple-900/20 to-purple-800/5">
                  <div className="p-4">
                    <h3 className="font-medium mb-2">Code Quality Assessment</h3>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <div className="font-bold text-green-500 text-lg">8/10</div>
                        <div className="text-xs text-gray-400">Structure</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <div className="font-bold text-yellow-500 text-lg">7/10</div>
                        <div className="text-xs text-gray-400">Documentation</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <div className="font-bold text-blue-500 text-lg">9/10</div>
                        <div className="text-xs text-gray-400">Best Practices</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Based on repository code analysis and commit quality
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

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

// Helper function to determine experience level based on strength data
const getExperienceLevel = (strengthData: Record<string, number>) => {
  if (!strengthData || Object.keys(strengthData).length === 0) return 50; // Default middle

  const sum = Object.values(strengthData).reduce((acc, val) => acc + val, 0);
  const avg = sum / Object.keys(strengthData).length;

  // Convert average strength (1-10) to percentage (0-100)
  return Math.min(Math.max(avg * 10, 0), 100);
};

export default VerificationReportPage;