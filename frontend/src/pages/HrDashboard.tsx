import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Github, Award, User, ChevronRight, Download, AlertCircle } from 'lucide-react';

// TypeScript interfaces - Removed SkillScores interface
interface GithubMetrics {
  contributions: number;
  repositories: number;
  stars: number;
  forks: number;
  topLanguages?: string[];
  codeQuality?: string;
  consistencyScore?: number;
}

interface CandidateListItem {
  id: string;
  name: string;
  resumeHash: string;
  techSkillRatings: { [key: string]: number }; // Technical skills with ratings
  githubMetrics: GithubMetrics;
  overallScore: number;
}

interface CandidateDetailReport extends CandidateListItem {
  email: string;
  technicalSkills: string[];
  evaluationNotes: string;
}

interface ChartDataItem {
  name: string;
  value: number;
}

// Sample blockchain connection utility
const BlockchainService = {
  getCandidates: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '0x7dF9a1a3C9AA275B58B23e4Bd48E38C0a5ccC89A',
            name: 'Alice Johnson',
            resumeHash: '0x4f32a78b...',
            techSkillRatings: {
              'React': 92,
              'Node.js': 88,
              'Solidity': 94,
              'Python': 85,
              'AWS': 79
            },
            githubMetrics: {
              contributions: 542,
              repositories: 24,
              stars: 187,
              forks: 46
            },
            overallScore: 92
          },
          {
            id: '0x3aB9A2a5C9BB275B58B23e4Bd48E38C0a5ccC76B',
            name: 'Bob Smith',
            resumeHash: '0x7a45b23c...',
            techSkillRatings: {
              'Java': 85,
              'Spring': 78,
              'MySQL': 90,
              'Docker': 88,
              'Kubernetes': 75
            },
            githubMetrics: {
              contributions: 312,
              repositories: 18,
              stars: 94,
              forks: 1
            },
            overallScore: 85
          },
          {
            id: '0x5eD1B2c3D4E5F67890A1B2C3D4E5F67890A1B2C3',
            name: 'Charlie Davis',
            resumeHash: '0x9c87d654...',
            techSkillRatings: {
              'C++': 96,
              'Rust': 93,
              'Blockchain': 91,
              'Cryptography': 89,
              'System Design': 87
            },
            githubMetrics: {
              contributions: 756,
              repositories: 31,
              stars: 342,
              forks: 87
            },
            overallScore: 88
          },
          {
            id: '0x1A2B3C4D5E6F7890A1B2C3D4E5F67890A1B2C3D4',
            name: 'Diana Wilson',
            resumeHash: '0x2d34e5f6...',
            techSkillRatings: {
              'React': 84,
              'Swift': 87,
              'UI/UX': 95,
              'Product Management': 92,
              'Agile': 91
            },
            githubMetrics: {
              contributions: 417,
              repositories: 22,
              stars: 153,
              forks: 37
            },
            overallScore: 83
          }
        ]);
      }, 1000);
    });
  },
  
  getCandidateReport: async (candidateId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const candidates = {
          '0x7dF9a1a3C9AA275B58B23e4Bd48E38C0a5ccC89A': {
            id: '0x7dF9a1a3C9AA275B58B23e4Bd48E38C0a5ccC89A',
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            resumeHash: '0x4f32a78b...',
            technicalSkills: ['React', 'Node.js', 'Sui', 'Python', 'AWS'],
            techSkillRatings: {
              'React': 92,
              'Node.js': 88,
              'Sui': 94,
              'Python': 85,
              'AWS': 79
            },
            githubMetrics: {
              contributions: 542,
              repositories: 24,
              stars: 187,
              forks: 46,
              topLanguages: ['JavaScript', 'Solidity', 'Python', 'TypeScript'],
              codeQuality: 'High',
              consistencyScore: 88
            },
            overallScore: 92,
            evaluationNotes: "Strong technical background with blockchain experience. GitHub activity shows consistent contributions to open-source projects. Resume highlights excellent problem-solving capabilities and prior experience with decentralized applications."
          },
          '0x3aB9A2a5C9BB275B58B23e4Bd48E38C0a5ccC76B': {
            id: '0x3aB9A2a5C9BB275B58B23e4Bd48E38C0a5ccC76B',
            name: 'Bob Smith',
            email: 'bob.smith@example.com',
            resumeHash: '0x7a45b23c...',
            technicalSkills: ['Java', 'Spring', 'MySQL', 'Docker', 'Kubernetes'],
            techSkillRatings: {
              'Java': 85,
              'Spring': 78,
              'MySQL': 90,
              'Docker': 88,
              'Kubernetes': 75
            },
            githubMetrics: {
              contributions: 312,
              repositories: 18,
              stars: 94,
              forks: 21,
              topLanguages: ['Java', 'JavaScript', 'SQL', 'Shell'],
              codeQuality: 'Medium',
              consistencyScore: 76
            },
            overallScore: 85,
            evaluationNotes: "Excellent backend development experience. GitHub activity shows good project structure and documentation. Resume emphasizes distributed systems knowledge and database optimization."
          },
          '0x5eD1B2c3D4E5F67890A1B2C3D4E5F67890A1B2C3': {
            id: '0x5eD1B2c3D4E5F67890A1B2C3D4E5F67890A1B2C3',
            name: 'Charlie Davis',
            email: 'charlie.davis@example.com',
            resumeHash: '0x9c87d654...',
            technicalSkills: ['C++', 'Rust', 'Blockchain', 'Cryptography', 'System Design'],
            techSkillRatings: {
              'C++': 96,
              'Rust': 93,
              'Blockchain': 91,
              'Cryptography': 89,
              'System Design': 87
            },
            githubMetrics: {
              contributions: 756,
              repositories: 31,
              stars: 342,
              forks: 87,
              topLanguages: ['C++', 'Rust', 'Go', 'Python'],
              codeQuality: 'Very High',
              consistencyScore: 94
            },
            overallScore: 88,
            evaluationNotes: "Exceptional technical skills with deep understanding of blockchain architecture. GitHub projects show innovation in consensus mechanisms and smart contract security. Resume indicates strong academic background in distributed systems."
          },
          '0x1A2B3C4D5E6F7890A1B2C3D4E5F67890A1B2C3D4': {
            id: '0x1A2B3C4D5E6F7890A1B2C3D4E5F67890A1B2C3D4',
            name: 'Diana Wilson',
            email: 'diana.wilson@example.com',
            resumeHash: '0x2d34e5f6...',
            technicalSkills: ['React', 'Swift', 'UI/UX', 'Product Management', 'Agile'],
            techSkillRatings: {
              'React': 84,
              'Swift': 87,
              'UI/UX': 95,
              'Product Management': 92,
              'Agile': 91
            },
            githubMetrics: {
              contributions: 417,
              repositories: 22,
              stars: 153,
              forks: 37,
              topLanguages: ['JavaScript', 'TypeScript', 'Swift', 'CSS'],
              codeQuality: 'Good',
              consistencyScore: 81
            },
            overallScore: 83,
            evaluationNotes: "Strong frontend development focus with solid design awareness. GitHub activity shows UI component libraries and design systems. Resume highlights cross-functional teamwork and consistent delivery."
          }
        };
        
        resolve(candidates[candidateId] || null);
      }, 800);
    });
  }
};

const formatDate = (dateString) => {
  const date = new Date();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Main Dashboard component
const HRDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const candidateData = await BlockchainService.getCandidates();
        // Sort candidates by overall score in descending order
        const sortedCandidates = candidateData.sort((a, b) => b.overallScore - a.overallScore);
        setCandidates(sortedCandidates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setLoading(false);
      }
    }
    
    fetchCandidates();
  }, []);

  const viewCandidateReport = async (candidateId) => {
    setSelectedCandidate(candidateId);
    setReportLoading(true);
    
    try {
      const report = await BlockchainService.getCandidateReport(candidateId);
      setReportData(report);
      setReportLoading(false);
    } catch (error) {
      console.error("Error fetching candidate report:", error);
      setReportLoading(false);
    }
  };

  // Prepare chart data using technology skills
  const prepareTechSkillChartData = (techSkillRatings) => {
    if (!techSkillRatings) return [];
    
    return Object.entries(techSkillRatings).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Function to calculate score color based on value
  const getScoreColor = (score) => {
    if (score >= 90) return "text-blue-400";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-blue-600";
    return "text-blue-700";
  };

  // Function to determine bar color based on skill proficiency
  const getBarColor = (value) => {
    if (value >= 90) return "#4c9fff";  // Bright blue
    if (value >= 80) return "#3b82f6";  // Medium blue
    if (value >= 70) return "#2563eb";  // Dark blue
    return "#1e40af";  // Very dark blue
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-black border-b border-blue-900/30 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-blue-400">Blockchain Recruitment Dashboard</h1>
          <p className="text-sm text-blue-300/70">Talent Assessment and Verification System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 flex-1 flex flex-col md:flex-row gap-6">
        {/* Candidate List */}
        <div className="w-full md:w-1/3 bg-gray-800 rounded-lg shadow-lg p-4 border border-blue-900/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-300">
            <User className="mr-2 text-blue-400" size={20} />
            Candidate Rankings
          </h2>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-2 text-blue-300">Loading candidates from blockchain...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCandidate === candidate.id 
                      ? 'bg-blue-900/30 border-blue-500' 
                      : 'hover:bg-gray-700 border-gray-700'
                  }`}
                  onClick={() => viewCandidateReport(candidate.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-blue-100">{candidate.name}</h3>
                      <p className="text-xs text-blue-300/60 truncate">{candidate.id}</p>
                    </div>
                    <div className="bg-blue-900/30 text-blue-300 font-semibold rounded-full h-10 w-10 flex items-center justify-center border border-blue-700/50">
                      {candidate.overallScore}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-400 gap-3">
                    <div className="flex items-center">
                      <Github size={16} className="mr-1 text-blue-400" />
                      <span>{candidate.githubMetrics.repositories}</span>
                    </div>
                    <div className="flex items-center">
                      <Award size={16} className="mr-1 text-blue-400" />
                      <span>{candidate.githubMetrics.stars}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText size={16} className="mr-1 text-blue-400" />
                      <span>{candidate.resumeHash.substring(0, 10)}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Candidate Details */}
        <div className="w-full md:w-2/3 bg-gray-800 rounded-lg shadow-lg border border-blue-900/20">
          {!selectedCandidate ? (
            <div className="h-full flex flex-col items-center justify-center text-blue-300/50 p-8">
              <FileText size={64} className="mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Select a candidate to view details</h3>
              <p className="text-center mt-2">
                Click on a candidate from the list to view their detailed assessment report
              </p>
            </div>
          ) : reportLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-2 text-blue-300">Loading candidate report...</p>
            </div>
          ) : reportData ? (
            <div className="p-6">
              {/* Report Header */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-900/30 p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-400">{reportData.name}</h2>
                    <p className="text-sm text-blue-300/70">{reportData.email}</p>
                    <p className="text-xs text-blue-300/50 mt-1">Report Generated: {formatDate()}</p>
                  </div>
                  <div className="bg-blue-900/30 text-blue-300 text-xl font-bold rounded-full h-16 w-16 flex items-center justify-center border border-blue-700/50">
                    {reportData.overallScore}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-900/20">
                    <p className="text-blue-300/70 text-sm mb-1">ID</p>
                    <div className="flex items-center">
                      <p className="text-sm font-mono text-gray-300 truncate">{reportData.id.substring(0, 16)}...</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-900/20">
                    <p className="text-blue-300/70 text-sm mb-1">GitHub Activity</p>
                    <div className="flex items-center">
                      <Github className="w-4 h-4 mr-2 text-blue-400" />
                      <p className="font-medium text-gray-300">{reportData.githubMetrics.contributions} commits</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-900/20">
                    <p className="text-blue-300/70 text-sm mb-1">Resume Hash</p>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-400" />
                      <p className="font-mono text-gray-300">{reportData.resumeHash}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Technology Skills Assessment Chart */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-900/30 p-6 mb-6">
                <h3 className="font-semibold mb-4 text-blue-300">Technology Skills Assessment</h3>
                <div className="bg-gray-800/40 p-4 rounded-xl border border-blue-900/10 mb-4">
                  <p className="text-blue-300/80 text-sm mb-2">Technical skills proficiency based on GitHub analysis and resume verification with Required skill</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                <BarChart 
  data={prepareTechSkillChartData(reportData.techSkillRatings)}
  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
>
  <defs>
    {/* Add gradient definitions for bars */}
    <linearGradient id="techSkillGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.8}/>
    </linearGradient>
    <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
      <feGaussianBlur stdDeviation="5" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" vertical={false} />
  <XAxis 
    dataKey="name" 
    tick={{ fill: '#90cdf4' }} 
    angle={0}
    textAnchor="middle"
    tickMargin={8}
    axisLine={{ stroke: '#2d3748' }}
    height={50}
  />
  <YAxis 
    domain={[0, 100]} 
    tick={{ fill: '#90cdf4' }} 
    axisLine={{ stroke: '#2d3748' }}
    tickLine={{ stroke: '#2d3748' }}
  />
  <Tooltip 
    contentStyle={{ 
      backgroundColor: '#111827', 
      borderColor: '#1e40af', 
      borderRadius: '8px',
      boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
      fontSize: '14px'
    }} 
    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
    formatter={(value) => [`${value}/100`, 'Proficiency']}
  />
  <Bar 
    dataKey="value" 
    fill="url(#techSkillGradient)"
    radius={[4, 4, 0, 0]}
    animationDuration={1500}
    filter="url(#glow)"
  />
</BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* GitHub Metrics */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-900/30 p-6 mb-6">
                <h3 className="font-semibold mb-4 text-blue-300">GitHub Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-800/70 p-3 rounded-lg border border-blue-900/20">
                        <p className="text-sm text-blue-300/70">Contributions</p>
                        <p className="text-xl font-medium text-blue-200">{reportData.githubMetrics.contributions}</p>
                      </div>
                      <div className="bg-gray-800/70 p-3 rounded-lg border border-blue-900/20">
                        <p className="text-sm text-blue-300/70">Repositories</p>
                        <p className="text-xl font-medium text-blue-200">{reportData.githubMetrics.repositories}</p>
                      </div>
                      <div className="bg-gray-800/70 p-3 rounded-lg border border-blue-900/20">
                        <p className="text-sm text-blue-300/70">Stars</p>
                        <p className="text-xl font-medium text-blue-200">{reportData.githubMetrics.stars}</p>
                      </div>
                      <div className="bg-gray-800/70 p-3 rounded-lg border border-blue-900/20">
                        <p className="text-sm text-blue-300/70">Forks</p>
                        <p className="text-xl font-medium text-blue-200">{reportData.githubMetrics.forks}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <div className="bg-gray-800/70 p-3 rounded-lg h-full border border-blue-900/20">
                      <p className="text-sm text-blue-300/70 mb-2">Top Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {reportData.githubMetrics.topLanguages?.map((lang, index) => (
                          <span 
                            key={index} 
                            className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded border border-blue-700/30"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-300/70">Code Quality:</span>
                          <span className="text-blue-200">{reportData.githubMetrics.codeQuality}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-blue-300/70">Consistency:</span>
                          <span className="text-blue-200">{reportData.githubMetrics.consistencyScore}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Technical Skills & Evaluation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-900/30 p-6">
                  <h3 className="font-semibold mb-4 text-blue-300">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {reportData.technicalSkills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-900/30 text-blue-300 text-sm px-2 py-1 rounded border border-blue-700/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-900/30 p-6">
                  <h3 className="font-semibold mb-4 text-blue-300">Evaluation Notes</h3>
                  <p className="text-blue-100/90">{reportData.evaluationNotes}</p>
                </div>
              </div>
              
              {/* Verification Info */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-900/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center mr-3 border border-blue-700/30">
                      <AlertCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-300/70">Report ID</p>
                      <p className="text-sm font-mono text-blue-200 truncate">{reportData.id}</p>
                    </div>
                  </div>
                  <button className="text-blue-300 hover:text-blue-100 bg-blue-900/30 hover:bg-blue-800/50 p-2 rounded-lg transition-colors text-xs border border-blue-700/30">
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-red-400">
              <p>Error loading candidate data</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;