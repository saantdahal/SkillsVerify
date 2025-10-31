import React from "react";
import { Link } from "react-router-dom";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <Link to="/">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
              D
            </div>
          </div>
        </Link>
        <div className="text-sm">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
      <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full">
        <div
          className="bg-primary h-1 rounded-full transition-all"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
