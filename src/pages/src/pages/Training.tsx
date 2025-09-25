import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingStore } from '../stores/trainingStore';
import { TrainingScenario } from '../services/mockAIService';

const Training: React.FC = () => {
  const { 
    scenarios, 
    loadScenarios, 
    startTraining, 
    isLoading
  } = useTrainingStore();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const filteredScenarios = scenarios.filter(scenario => {
    const difficultyMatch = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;
    const categoryMatch = selectedCategory === 'all' || scenario.category === selectedCategory;
    return difficultyMatch && categoryMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success-100 text-success-800';
      case 'intermediate': return 'bg-warning-100 text-warning-800';
      case 'advanced': return 'bg-danger-100 text-danger-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  const handleStartTraining = (scenario: TrainingScenario) => {
    const success = startTraining(scenario.id);
    if (success) {
      // Redirect to chat page for training
      navigate('/chat');
    } else {
      alert('Failed to start training. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Scenarios</h1>
          <p className="text-gray-600">Practice incident response with realistic scenarios</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">All Categories</option>
                <option value="Email Security">Email Security</option>
                <option value="Malware Analysis">Malware Analysis</option>
                <option value="Data Protection">Data Protection</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scenarios Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario) => (
              <div key={scenario.id} className="card hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{scenario.title}</h3>
                  <span className={`badge ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{scenario.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{scenario.category}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Steps:</span>
                    <span className="ml-2">{scenario.steps.length} questions</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Outcome:</h4>
                  <p className="text-sm text-gray-600">{scenario.expectedOutcome}</p>
                </div>

                <button
                  onClick={() => handleStartTraining(scenario)}
                  className="btn-primary w-full"
                >
                  Start Training
                </button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredScenarios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scenarios found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more training scenarios.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Training;