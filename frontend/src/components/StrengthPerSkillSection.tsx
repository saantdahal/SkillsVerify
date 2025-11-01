import React from "react";
import { BarChart2, Star } from "lucide-react";

interface StrengthPerSkillProps {
  strengthData: Record<string, number>;
}

const StrengthPerSkillSection: React.FC<StrengthPerSkillProps> = ({ strengthData }) => {
  // Helper function to determine color based on skill strength
  const getStrengthColor = (strength: number) => {
    if (strength >= 8) return "text-green-500";
    if (strength >= 6) return "text-blue-500";
    if (strength >= 4) return "text-yellow-500";
    return "text-red-500";
  };

  // Helper function to determine background gradient based on strength
  const getStrengthGradient = (strength: number) => {
    if (strength >= 8) return "from-green-900/30 to-green-800/5";
    if (strength >= 6) return "from-blue-900/30 to-blue-800/5";
    if (strength >= 4) return "from-yellow-900/30 to-yellow-800/5";
    return "from-red-900/30 to-red-800/5";
  };

  // Get sorted skills by strength (highest first)
  const sortedSkills = Object.entries(strengthData).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6 mb-8">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
          <BarChart2 className="w-4 h-4 text-purple-400" />
        </div>
        Skill Strength Analysis
      </h2>
      
      <div className="grid gap-6">
        {sortedSkills.map(([skill, strength], index) => (
          <div 
            key={index} 
            className={`border border-gray-700 rounded-xl overflow-hidden bg-gradient-to-r ${getStrengthGradient(strength)}`}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-lg">{skill}</h3>
                <div className="flex items-center">
                  <span className={`font-bold mr-2 ${getStrengthColor(strength)}`}>{strength}/10</span>
                  <Star 
                    className={`w-5 h-5 ${getStrengthColor(strength)} ${strength >= 7 ? 'fill-current' : ''}`} 
                  />
                </div>
              </div>
              
              <div className="w-full bg-gray-800/50 h-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColorBar(strength)}`}
                  style={{ width: `${strength * 10}%` }}
                />
              </div>
              
              <div className="mt-2 text-sm text-gray-400">
                {getStrengthDescription(skill, strength)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Star className="w-3 h-3 text-blue-400" />
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-300 mb-1">How We Calculate Skill Strength</h4>
            <p className="text-sm text-gray-400">
              Skill strength is measured on a scale of 1-10 based on repository activity, 
              code quality, recency of work, and complexity of implementations found in the candidate's GitHub profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for progress bar colors
const getStrengthColorBar = (strength: number) => {
  if (strength >= 8) return "bg-gradient-to-r from-green-500 to-green-400";
  if (strength >= 6) return "bg-gradient-to-r from-blue-500 to-blue-400";
  if (strength >= 4) return "bg-gradient-to-r from-yellow-500 to-yellow-400";
  return "bg-gradient-to-r from-red-500 to-red-400";
};

// Generate descriptions based on skill and strength
const getStrengthDescription = (skill: string, strength: number) => {
  if (strength >= 8) {
    return `Exceptional proficiency in ${skill} with significant GitHub contributions.`;
  } else if (strength >= 6) {
    return `Strong ${skill} skills demonstrated across multiple repositories.`;
  } else if (strength >= 4) {
    return `Moderate ${skill} experience shown in GitHub activity.`;
  } else {
    return `Basic ${skill} usage found in limited repositories.`;
  }
};

export default StrengthPerSkillSection;