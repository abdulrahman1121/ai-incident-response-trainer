import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingStore } from '../stores/trainingStore';
import { useAuthStore } from '../stores/authStore';
import { ScenarioStep } from '../services/mockAIService';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Add error handling for store access
  let storeData;
  try {
    storeData = useTrainingStore();
  } catch (error) {
    console.error('Error accessing training store:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Training</h2>
          <p className="text-gray-600 mb-6">There was an error loading the training system.</p>
          <button
            onClick={() => navigate('/training')}
            className="btn-primary"
          >
            Go to Training
          </button>
        </div>
      </div>
    );
  }
  
  const { 
    currentScenario, 
    currentStep, 
    isTrainingActive, 
    progress, 
    chatMessages, 
    submitAnswer, 
    getHint, 
    endTraining,
    addChatMessage,
    clearChat
  } = storeData;
  
  const { user } = useAuthStore();

  // Debug logging
  console.log('Chat component state:', { 
    isTrainingActive, 
    currentScenario: currentScenario?.title, 
    progress,
    chatMessagesCount: chatMessages.length 
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);


  const handleSendMessage = () => {
    if (!message.trim()) return;

    addChatMessage(message, 'user');
    setMessage('');
  };

  const handleSubmitAnswer = (answer: string) => {
    const response = submitAnswer(answer);
    setSelectedOption('');
  };

  const handleGetHint = () => {
    getHint();
  };

  const handleEndTraining = () => {
    const finalScore = endTraining();
    addChatMessage(
      `Training completed! Final score: ${finalScore.score}/${finalScore.total} (${finalScore.percentage}%)`,
      'ai'
    );
  };

  const formatMessage = (text: string) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  if (!isTrainingActive || !currentScenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Training</h2>
          <p className="text-gray-600 mb-6">Start a training scenario to begin your incident response practice.</p>
          <button
            onClick={() => navigate('/training')}
            className="btn-primary"
          >
            Go to Training
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Training Header */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentScenario.title}</h1>
              <p className="text-gray-600">{currentScenario.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-2xl font-bold text-primary-600">
                {progress.current}/{progress.total}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`badge ${
                currentScenario.difficulty === 'beginner' ? 'bg-success-100 text-success-800' :
                currentScenario.difficulty === 'intermediate' ? 'bg-warning-100 text-warning-800' :
                'bg-danger-100 text-danger-800'
              }`}>
                {currentScenario.difficulty}
              </span>
              <span className="badge bg-secondary-100 text-secondary-800">
                {currentScenario.category}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Score: {progress.score}/{progress.total} ({progress.percentage}%)
              </div>
              <button
                onClick={handleEndTraining}
                className="btn-secondary text-sm"
              >
                End Training
              </button>
            </div>
          </div>
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step {progress.current} of {progress.total}
            </h3>
            <p className="text-gray-700 mb-4">{currentStep.description}</p>
            
            {currentStep.options && (
              <div className="space-y-2">
                {currentStep.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedOption === option
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex space-x-3 mt-4">
              {currentStep.options && (
                <button
                  onClick={() => handleSubmitAnswer(selectedOption)}
                  disabled={!selectedOption}
                  className="btn-primary"
                >
                  Submit Answer
                </button>
              )}
              <button
                onClick={handleGetHint}
                className="btn-secondary"
              >
                Get Hint
              </button>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        <div className="mb-6 bg-white rounded-lg shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Training Progress</h3>
            <div className="text-sm text-gray-500">
              {progress.current} of {progress.total} steps
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{progress.score}</div>
                <div className="text-xs text-gray-500">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{progress.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-success-600">{progress.percentage}%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(msg.message)
                    }}
                  />
                  <div className={`text-xs mt-1 ${
                    msg.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="input flex-1"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="btn-primary"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;