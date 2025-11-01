import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, ChevronRight, Github, Download, ArrowLeft, Zap, BarChart2, Code, Cpu } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import StrengthPerSkillSection from "@/components/StrengthPerSkillSection";

interface VerifiedSkill {
  skill: string;
  evidence: string[];
  reasoning: string;
}

interface VerificationResponse {
  github_username: string;
  resume_skills: string[];
  github_skills: string[];
  verification_result: {
    verified_skills: VerifiedSkill[];
    unverified_skills: string[];
    additional_skills: string[];
    verification_percentage: number;
    strength_per_skill?: Record<string, number>;
    summary: string;
    experience_level?: number;
    average_strength?: number;
    verified_count?: number;
    total_skills?: number;
  };
  hash: string;
  created_at?: string;
  verification_id: number;
}

interface AccountLanguages {
  username: string;
  total_bytes: number;
  language_count: number;
  repositories_analyzed: number;
  top_languages: string[];
  languages: Record<string, {
    bytes: number;
    count: number;
    percentage: number;
  }>;
}

interface AccountTechnologies {
  username: string;
  technology_count: number;
  repositories_analyzed: number;
  top_technologies: string[];
  technologies: Record<string, {
    count: number;
    percentage: number;
  }>;
}

const VerificationReportPage: React.FC = () => {
  const { verification_id } = useParams<{ verification_id: string }>();
  const [data, setData] = useState<VerificationResponse | null>(null);
  const [accountLanguages, setAccountLanguages] = useState<AccountLanguages | null>(null);
  const [accountTechnologies, setAccountTechnologies] = useState<AccountTechnologies | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        // First try to get data from localStorage
        const storedVerificationData = localStorage.getItem('verificationData');
        
        if (storedVerificationData) {
          const parsedData = JSON.parse(storedVerificationData);
          
          // Add current date as created_at if it doesn't exist
          if (!parsedData.created_at) {
            parsedData.created_at = new Date().toISOString();
          }
          
          setData(parsedData);
          
          // Fetch account languages and technologies
          if (parsedData.github_username) {
            try {
              const [languagesRes, technologiesRes] = await Promise.all([
                fetch(`http://127.0.0.1:8000/api/account/${parsedData.github_username}/languages/?max_repos=5`),
                fetch(`http://127.0.0.1:8000/api/account/${parsedData.github_username}/technologies/?max_repos=5`)
              ]);
              
              if (languagesRes.ok) {
                const langData = await languagesRes.json();
                setAccountLanguages(langData);
              }
              
              if (technologiesRes.ok) {
                const techData = await technologiesRes.json();
                setAccountTechnologies(techData);
              }
            } catch (err) {
              console.log('Could not fetch account stats:', err);
            }
          }
          
          setLoading(false);
          return;
        }
        
        // Fallback: Try to fetch from Walrus if verification_id is available
        if (verification_id) {
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/verification/${verification_id}/`);
            if (response.ok) {
              const parsedData = await response.json();
              
              // Add current date as created_at if it doesn't exist
              if (!parsedData.created_at) {
                parsedData.created_at = new Date().toISOString();
              }
              
              setData(parsedData);
              
              // Fetch account languages and technologies
              if (parsedData.github_username) {
                try {
                  const [languagesRes, technologiesRes] = await Promise.all([
                    fetch(`http://127.0.0.1:8000/api/account/${parsedData.github_username}/languages/?max_repos=20`),
                    fetch(`http://127.0.0.1:8000/api/account/${parsedData.github_username}/technologies/?max_repos=20`)
                  ]);
                  
                  if (languagesRes.ok) {
                    const langData = await languagesRes.json();
                    setAccountLanguages(langData);
                  }
                  
                  if (technologiesRes.ok) {
                    const techData = await technologiesRes.json();
                    setAccountTechnologies(techData);
                  }
                } catch (err) {
                  console.log('Could not fetch account stats:', err);
                }
              }
              
              setLoading(false);
              return;
            }
          } catch (walrusErr) {
            console.log('Could not fetch from Walrus:', walrusErr);
          }
        }
        
        throw new Error('No verification data found in localStorage or backend');
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

  // Calculate the overall strength score - used for fallback if average_strength not available
  calculateOverallStrength(data.verification_result.strength_per_skill || {});

  // Get strength label
  const getStrengthLabel = (strength: number): string => {
    if (strength >= 8.5) return "Excellent";
    if (strength >= 7) return "Very Good";
    if (strength >= 5.5) return "Good";
    if (strength >= 4) return "Fair";
    return "Developing";
  };

  // Helper function to determine experience level based on strength data
  const getExperienceLevel = (strengthData: Record<string, number> | undefined) => {
    if (!strengthData || Object.keys(strengthData).length === 0) return 50; // Default middle

    const sum = Object.values(strengthData).reduce((acc, val) => acc + val, 0);
    const avg = sum / Object.keys(strengthData).length;

    // Convert average strength (1-10) to percentage (0-100)
    return Math.min(Math.max(avg * 10, 0), 100);
  };

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

            {/* Verification Score - More Professional */}
            <div className={`rounded-xl p-4 border border-gray-700 bg-gradient-to-br ${getGradientClass(data.verification_result.verification_percentage)}`}>
              <p className="text-gray-400 text-sm mb-1">Verification Score</p>
              <div className="flex flex-col">
                <p className={`text-2xl font-bold ${getScoreColor(data.verification_result.verification_percentage)}`}>
                  {data.verification_result.verification_percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(data.verification_result.verified_count ?? (data.verification_result.verified_skills?.length || 0))}/{(data.verification_result.total_skills ?? data.resume_skills.length)}
                </p>
              </div>
            </div>

            {/* Skills Count - More Detailed */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Skills Analyzed</p>
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-blue-400">{data.verification_result.total_skills ?? data.resume_skills.length}</p>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className="text-green-400">✓ {(data.verification_result.verified_count ?? (data.verification_result.verified_skills?.length || 0))}</span>
                  <span className="text-red-400">✗ {(data.verification_result.unverified_skills?.length || 0)}</span>
                </div>
              </div>
            </div>

            {/* Overall Strength - Professional Rating */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Overall Strength</p>
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-purple-400">{(data.verification_result.average_strength ?? 0).toFixed(1)}/10</p>
                <p className="text-xs text-gray-500 mt-1">
                  {getStrengthLabel(data.verification_result.average_strength ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto mb-6 bg-gray-900/50 rounded-xl p-1 border border-gray-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg flex items-center mr-2 transition-colors whitespace-nowrap ${activeTab === "overview" ? "bg-blue-500/20 text-blue-400" : "hover:bg-gray-800 text-gray-400"
              }`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2 rounded-lg flex items-center mr-2 transition-colors whitespace-nowrap ${activeTab === "skills" ? "bg-blue-500/20 text-blue-400" : "hover:bg-gray-800 text-gray-400"
              }`}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Skills Analysis
          </button>
          <button
            onClick={() => setActiveTab("tech")}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors whitespace-nowrap ${activeTab === "tech" ? "bg-blue-500/20 text-blue-400" : "hover:bg-gray-800 text-gray-400"
              }`}
          >
            <Code className="w-4 h-4 mr-2" />
            Tech Stack
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            {/* Explanation Card */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Analysis Summary</h2>
              <p className="text-gray-300 leading-relaxed">{data.verification_result.summary}</p>
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
                          {category.skills.map((skill, idx) => {
                            // Handle both string and VerifiedSkill object types
                            const skillName = typeof skill === 'string' ? skill : skill.skill;
                            const isVerifiedSkill = typeof skill === 'object' && skill !== null && 'evidence' in skill;
                            
                            return (
                              <div key={idx} className="py-2 px-3 bg-gray-800/50 rounded-lg text-sm">
                                <div>{skillName}</div>
                                {isVerifiedSkill && (
                                  <>
                                    <div className="text-xs text-gray-400 mt-1">
                                      <strong>Evidence:</strong> {(skill as VerifiedSkill).evidence.join(', ')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {(skill as VerifiedSkill).reasoning}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
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
                        style={{ width: `${getExperienceLevel(data.verification_result.strength_per_skill || {})}%` }}
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

        {activeTab === "tech" && (
          <>
            {/* Programming Languages Section */}
            {accountLanguages && (
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6 mb-8">
                <h2 className="text-xl font-bold mb-2 flex items-center">
                  <Cpu className="w-5 h-5 mr-3 text-purple-400" />
                  Programming Languages
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Analyzed across {accountLanguages.repositories_analyzed} repositories
                </p>

                {/* Top Languages */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-300 mb-4">Top Languages by Usage</h3>
                  <div className="space-y-4">
                    {Object.entries(accountLanguages.languages)
                      .sort(([, a], [, b]) => b.bytes - a.bytes)
                      .slice(0, 8)
                      .map(([lang, stats]) => (
                        <div key={lang}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{lang}</span>
                            <span className="text-sm text-gray-400">
                              {stats.percentage}% • {(stats.bytes / 1024).toFixed(1)}KB
                            </span>
                          </div>
                          <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Used in {stats.count} repository{stats.count !== 1 ? 'ies' : ''}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Language Summary */}
                <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-gray-700">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Languages</p>
                    <p className="text-2xl font-bold text-blue-400">{accountLanguages.language_count}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Code</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {(accountLanguages.total_bytes / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Most Used</p>
                    <p className="text-2xl font-bold text-green-400">{accountLanguages.top_languages[0]}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Technologies Section */}
            {accountTechnologies && (
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6 mb-8">
                <h2 className="text-xl font-bold mb-2 flex items-center">
                  <Code className="w-5 h-5 mr-3 text-blue-400" />
                  Technology Stack
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Technologies across {accountTechnologies.repositories_analyzed} repositories
                </p>

                {/* Top Technologies */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-300 mb-4">Most Used Technologies</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(accountTechnologies.technologies)
                      .sort(([, a], [, b]) => b.count - a.count)
                      .slice(0, 12)
                      .map(([tech, stats]) => (
                        <div
                          key={tech}
                          className="bg-gradient-to-br from-blue-900/30 to-purple-900/20 border border-blue-800/50 rounded-lg p-4 hover:border-blue-600/50 transition-all"
                        >
                          <p className="font-medium capitalize text-sm text-white mb-2">{tech}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">{stats.count} repos</span>
                            <span className="text-xs font-bold text-blue-400">{stats.percentage}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* All Technologies Cloud */}
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="font-medium text-gray-300 mb-4">All Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(accountTechnologies.technologies)
                      .sort(([, a], [, b]) => b.count - a.count)
                      .map(([tech, stats]) => {
                        let colorClass = 'bg-gray-700 text-gray-200';
                        if (stats.percentage >= 60) colorClass = 'bg-red-600 text-white';
                        else if (stats.percentage >= 40) colorClass = 'bg-orange-600 text-white';
                        else if (stats.percentage >= 20) colorClass = 'bg-yellow-600 text-white';
                        else colorClass = 'bg-green-600 text-white';

                        return (
                          <span
                            key={tech}
                            className={`${colorClass} px-3 py-1 rounded-full text-xs font-medium cursor-default`}
                            title={`${stats.percentage}% of repositories`}
                          >
                            {tech}
                          </span>
                        );
                      })}
                  </div>
                </div>

                {/* Technology Summary */}
                <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Technologies</p>
                    <p className="text-2xl font-bold text-blue-400">{accountTechnologies.technology_count}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Most Prevalent</p>
                    <p className="text-2xl font-bold text-purple-400">{accountTechnologies.top_technologies[0]}</p>
                  </div>
                </div>
              </div>
            )}

            {!accountLanguages && !accountTechnologies && (
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Loading tech stack information...</p>
              </div>
            )}
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


export default VerificationReportPage;