import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingStore } from '../stores/trainingStore';
import { useAuthStore } from '../stores/authStore';

const Dashboard: React.FC = () => {
  const { 
    scenarios, 
    loadScenarios, 
    progress, 
    trainingStats, 
    getRecentSessions 
  } = useTrainingStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const getDifficultyStats = () => {
    const difficultyCount = scenarios.reduce((acc, scenario) => {
      acc[scenario.difficulty] = (acc[scenario.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(difficultyCount).map(([difficulty, count]) => ({
      difficulty,
      count,
      percentage: Math.round((count / scenarios.length) * 100)
    }));
  };

  const getCategoryStats = () => {
    const categoryCount = scenarios.reduce((acc, scenario) => {
      acc[scenario.category] = (acc[scenario.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / scenarios.length) * 100)
    }));
  };

  const difficultyStats = getDifficultyStats();
  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'User'}! Here's your training overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scenarios</p>
                <p className="text-2xl font-semibold text-gray-900">{scenarios.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg">
                <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{trainingStats.completedSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-lg">
                <svg className="h-6 w-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{trainingStats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 bg-danger-100 rounded-lg">
                <svg className="h-6 w-6 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-2xl font-semibold text-gray-900">{trainingStats.totalTimeSpent}m</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Difficulty Distribution */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Distribution</h3>
            <div className="space-y-4">
              {difficultyStats.map((stat) => (
                <div key={stat.difficulty} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`badge ${
                      stat.difficulty === 'beginner' ? 'bg-success-100 text-success-800' :
                      stat.difficulty === 'intermediate' ? 'bg-warning-100 text-warning-800' :
                      'bg-danger-100 text-danger-800'
                    }`}>
                      {stat.difficulty}
                    </span>
                    <span className="ml-3 text-sm text-gray-600">{stat.count} scenarios</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{stat.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
            <div className="space-y-4">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="badge bg-secondary-100 text-secondary-800">
                      {stat.category}
                    </span>
                    <span className="ml-3 text-sm text-gray-600">{stat.count} scenarios</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{stat.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Training Sessions */}
        {trainingStats.completedSessions > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Training Sessions</h3>
            <div className="space-y-3">
              {getRecentSessions(5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{session.scenarioTitle}</p>
                      <p className="text-sm text-gray-500">
                        {(session.completedAt instanceof Date ? session.completedAt : new Date(session.completedAt)).toLocaleDateString()} • {session.timeSpent}m
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{session.percentage}%</p>
                    <p className="text-sm text-gray-500">{session.score}/{session.totalQuestions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/training')}
              className="btn-primary"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Training
            </button>
            
            <button
              onClick={() => navigate('/scenarios')}
              className="btn-secondary"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Browse Scenarios
            </button>
            
            <button
              onClick={() => navigate('/chat')}
              className="btn-ghost"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Open Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;