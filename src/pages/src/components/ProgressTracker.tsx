import React from 'react';

interface ProgressTrackerProps {
  current: number;
  total: number;
  score: number;
  percentage: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ current, total, score, percentage }) => {
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Training Progress</h3>
        <div className="text-sm text-gray-500">
          {current} of {total} steps
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Score Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{score}</div>
            <div className="text-xs text-gray-500">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-success-600">{percentage}%</div>
          <div className="text-xs text-gray-500">Accuracy</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
