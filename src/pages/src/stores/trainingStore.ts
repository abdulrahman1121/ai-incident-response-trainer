import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAIService, TrainingScenario, ScenarioStep, AIResponse } from '../services/mockAIService';

interface TrainingSession {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  completedAt: Date;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number; // in minutes
}

interface TrainingStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalTimeSpent: number;
  bestScore: number;
  scenariosCompleted: string[];
}

interface TrainingState {
  scenarios: TrainingScenario[];
  currentScenario: TrainingScenario | null;
  currentStep: ScenarioStep | null;
  isTrainingActive: boolean;
  progress: { current: number; total: number; score: number; percentage: number };
  chatMessages: Array<{ id: string; message: string; type: 'user' | 'ai'; timestamp: Date }>;
  isLoading: boolean;
  trainingHistory: TrainingSession[];
  trainingStats: TrainingStats;
  currentSessionStartTime: Date | null;
  sessionTimeoutId: NodeJS.Timeout | null;
  sessionDuration: number; // in minutes
  
  // Actions
  loadScenarios: () => void;
  startTraining: (scenarioId: string) => boolean;
  endTraining: () => { score: number; total: number; percentage: number };
  submitAnswer: (answer: string) => AIResponse;
  getHint: () => AIResponse;
  addChatMessage: (message: string, type: 'user' | 'ai') => void;
  clearChat: () => void;
  getScenariosByDifficulty: (difficulty: string) => TrainingScenario[];
  getScenariosByCategory: (category: string) => TrainingScenario[];
  getTrainingStats: () => TrainingStats;
  getRecentSessions: (limit?: number) => TrainingSession[];
  startSessionTimeout: () => void;
  clearSessionTimeout: () => void;
  extendSession: () => void;
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      scenarios: [],
      currentScenario: null,
      currentStep: null,
      isTrainingActive: false,
      progress: { current: 0, total: 0, score: 0, percentage: 0 },
      chatMessages: [],
      isLoading: false,
      trainingHistory: [],
      trainingStats: {
        totalSessions: 0,
        completedSessions: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        bestScore: 0,
        scenariosCompleted: []
      },
      currentSessionStartTime: null,
      sessionTimeoutId: null,
      sessionDuration: 5, // 5 minutes

      loadScenarios: () => {
        set({ isLoading: true });
        try {
          const scenarios = mockAIService.getAvailableScenarios();
          set({ scenarios, isLoading: false });
        } catch (error) {
          console.error('Error loading scenarios:', error);
          set({ isLoading: false });
        }
      },

      startTraining: (scenarioId: string) => {
        set({ isLoading: true });
        try {
          const scenario = mockAIService.startTraining(scenarioId);
          
          if (scenario) {
            const currentStep = mockAIService.getCurrentStep();
            const progress = mockAIService.getProgress();
            const sessionStartTime = new Date();
            
            set({
              currentScenario: scenario,
              currentStep,
              isTrainingActive: true,
              progress,
              currentSessionStartTime: sessionStartTime,
              chatMessages: [{
                id: Date.now().toString(),
                message: `🎯 **Starting Training: ${scenario.title}**\n\n${scenario.description}\n\n**Difficulty:** ${scenario.difficulty}\n**Category:** ${scenario.category}\n\n⏰ **Session Time:** 5 minutes\n\nLet's begin! What would you like to do first?`,
                type: 'ai' as const,
                timestamp: new Date()
              }],
              isLoading: false
            });
            
            // Start session timeout
            get().startSessionTimeout();
            
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Error starting training:', error);
          set({ isLoading: false });
          return false;
        }
      },

      endTraining: () => {
        const finalScore = mockAIService.endTraining();
        const state = get();
        
        // Clear session timeout
        get().clearSessionTimeout();
        
        if (state.currentScenario && state.currentSessionStartTime) {
          const sessionEndTime = new Date();
          const timeSpent = Math.round((sessionEndTime.getTime() - state.currentSessionStartTime.getTime()) / (1000 * 60)); // minutes
          
          const newSession: TrainingSession = {
            id: Date.now().toString(),
            scenarioId: state.currentScenario.id,
            scenarioTitle: state.currentScenario.title,
            completedAt: sessionEndTime,
            score: finalScore.score,
            totalQuestions: finalScore.total,
            percentage: finalScore.percentage,
            timeSpent: timeSpent
          };
          
          // Update training history
          const updatedHistory = [...state.trainingHistory, newSession];
          
          // Update statistics
          const updatedStats = {
            totalSessions: state.trainingStats.totalSessions + 1,
            completedSessions: state.trainingStats.completedSessions + 1,
            averageScore: Math.round(
              (state.trainingStats.averageScore * state.trainingStats.completedSessions + finalScore.percentage) / 
              (state.trainingStats.completedSessions + 1)
            ),
            totalTimeSpent: state.trainingStats.totalTimeSpent + timeSpent,
            bestScore: Math.max(state.trainingStats.bestScore, finalScore.percentage),
            scenariosCompleted: state.trainingStats.scenariosCompleted.includes(state.currentScenario.id) 
              ? state.trainingStats.scenariosCompleted 
              : [...state.trainingStats.scenariosCompleted, state.currentScenario.id]
          };
          
          set({
            currentScenario: null,
            currentStep: null,
            isTrainingActive: false,
            progress: { current: 0, total: 0, score: 0, percentage: 0 },
            trainingHistory: updatedHistory,
            trainingStats: updatedStats,
            currentSessionStartTime: null,
            sessionTimeoutId: null
          });
        } else {
          set({
            currentScenario: null,
            currentStep: null,
            isTrainingActive: false,
            progress: { current: 0, total: 0, score: 0, percentage: 0 },
            currentSessionStartTime: null,
            sessionTimeoutId: null
          });
        }
        
        return finalScore;
      },

      submitAnswer: (answer: string) => {
        const response = mockAIService.submitAnswer(answer);
        const currentStep = mockAIService.getCurrentStep();
        const progress = mockAIService.getProgress();
        
        // Add user message
        const userMessage = {
          id: Date.now().toString(),
          message: answer,
          type: 'user' as const,
          timestamp: new Date()
        };
        
        // Add AI response
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          message: response.message,
          type: 'ai' as const,
          timestamp: new Date()
        };

        // Add next step message if available
        let nextStepMessage = null;
        if (response.nextStep === 'next' && currentStep) {
          nextStepMessage = {
            id: (Date.now() + 2).toString(),
            message: `**Next Step:** ${currentStep.description}`,
            type: 'ai' as const,
            timestamp: new Date()
          };
        } else if (response.nextStep === 'complete') {
          nextStepMessage = {
            id: (Date.now() + 2).toString(),
            message: `🎉 **Training Complete!**\n\n**Final Score:** ${progress.score}/${progress.total} (${progress.percentage}%)\n\nGreat job! You've successfully completed this training scenario.`,
            type: 'ai' as const,
            timestamp: new Date()
          };
        }

        set(state => ({
          currentStep,
          progress,
          chatMessages: [...state.chatMessages, userMessage, aiMessage, ...(nextStepMessage ? [nextStepMessage] : [])]
        }));

        return response;
      },

      getHint: () => {
        const response = mockAIService.getHint();
        
        const hintMessage = {
          id: Date.now().toString(),
          message: response.message,
          type: 'ai' as const,
          timestamp: new Date()
        };

        set(state => ({
          chatMessages: [...state.chatMessages, hintMessage]
        }));

        return response;
      },

      addChatMessage: (message: string, type: 'user' | 'ai') => {
        const newMessage = {
          id: Date.now().toString(),
          message,
          type,
          timestamp: new Date()
        };

        set(state => ({
          chatMessages: [...state.chatMessages, newMessage]
        }));
      },

      clearChat: () => {
        set({ chatMessages: [] });
      },

      getScenariosByDifficulty: (difficulty: string) => {
        return mockAIService.getScenariosByDifficulty(difficulty);
      },

      getScenariosByCategory: (category: string) => {
        return mockAIService.getScenariosByCategory(category);
      },

      getTrainingStats: () => {
        return get().trainingStats;
      },

      getRecentSessions: (limit: number = 10) => {
        const history = get().trainingHistory;
        return history
          .sort((a, b) => {
            const dateA = a.completedAt instanceof Date ? a.completedAt : new Date(a.completedAt);
            const dateB = b.completedAt instanceof Date ? b.completedAt : new Date(b.completedAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, limit);
      },

      startSessionTimeout: () => {
        const state = get();
        if (state.sessionTimeoutId) {
          clearTimeout(state.sessionTimeoutId);
        }
        
        const timeoutId = setTimeout(() => {
          const currentState = get();
          if (currentState.isTrainingActive) {
            // Add timeout message to chat
            const timeoutMessage = {
              id: Date.now().toString(),
              message: `⏰ **Session Timeout**\n\nYour 5-minute training session has expired. The session will now end automatically.`,
              type: 'ai' as const,
              timestamp: new Date()
            };
            
            set(state => ({
              chatMessages: [...state.chatMessages, timeoutMessage]
            }));
            
            // End the training session
            setTimeout(() => {
              get().endTraining();
            }, 2000); // Give user 2 seconds to read the message
          }
        }, state.sessionDuration * 60 * 1000); // Convert minutes to milliseconds
        
        set({ sessionTimeoutId: timeoutId });
      },

      clearSessionTimeout: () => {
        const state = get();
        if (state.sessionTimeoutId) {
          clearTimeout(state.sessionTimeoutId);
          set({ sessionTimeoutId: null });
        }
      },

      extendSession: () => {
        const state = get();
        if (state.isTrainingActive) {
          // Add extension message
          const extensionMessage = {
            id: Date.now().toString(),
            message: `⏰ **Session Extended**\n\nYour session has been extended by 2 minutes. Continue your training!`,
            type: 'ai' as const,
            timestamp: new Date()
          };
          
          set(state => ({
            chatMessages: [...state.chatMessages, extensionMessage]
          }));
          
          // Restart timeout with additional 2 minutes
          get().clearSessionTimeout();
          const newTimeoutId = setTimeout(() => {
            const currentState = get();
            if (currentState.isTrainingActive) {
              const timeoutMessage = {
                id: Date.now().toString(),
                message: `⏰ **Session Timeout**\n\nYour extended training session has expired. The session will now end automatically.`,
                type: 'ai' as const,
                timestamp: new Date()
              };
              
              set(state => ({
                chatMessages: [...state.chatMessages, timeoutMessage]
              }));
              
              setTimeout(() => {
                get().endTraining();
              }, 2000);
            }
          }, 2 * 60 * 1000); // 2 additional minutes
          
          set({ sessionTimeoutId: newTimeoutId });
        }
      }
    }),
    {
      name: 'training-storage',
      partialize: (state) => ({
        scenarios: state.scenarios,
        currentScenario: state.currentScenario,
        currentStep: state.currentStep,
        isTrainingActive: state.isTrainingActive,
        progress: state.progress,
        chatMessages: state.chatMessages,
        trainingHistory: state.trainingHistory,
        trainingStats: state.trainingStats,
        currentSessionStartTime: state.currentSessionStartTime,
        sessionDuration: state.sessionDuration
        // Note: sessionTimeoutId is not persisted as it's a browser-specific timer
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert string dates back to Date objects after rehydration
          if (state.trainingHistory) {
            state.trainingHistory = state.trainingHistory.map(session => ({
              ...session,
              completedAt: new Date(session.completedAt)
            }));
          }
          
          if (state.chatMessages) {
            state.chatMessages = state.chatMessages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
          }
          
          if (state.currentSessionStartTime) {
            state.currentSessionStartTime = new Date(state.currentSessionStartTime);
          }
        }
      }
    }
  )
);