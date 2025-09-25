import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAIService, TrainingScenario, ScenarioStep, AIResponse } from '../services/mockAIService';

interface TrainingState {
  scenarios: TrainingScenario[];
  currentScenario: TrainingScenario | null;
  currentStep: ScenarioStep | null;
  isTrainingActive: boolean;
  progress: { current: number; total: number; score: number; percentage: number };
  chatMessages: Array<{ id: string; message: string; type: 'user' | 'ai'; timestamp: Date }>;
  isLoading: boolean;
  
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
            
            set({
              currentScenario: scenario,
              currentStep,
              isTrainingActive: true,
              progress,
              chatMessages: [{
                id: Date.now().toString(),
                message: `🎯 **Starting Training: ${scenario.title}**\n\n${scenario.description}\n\n**Difficulty:** ${scenario.difficulty}\n**Category:** ${scenario.category}\n\nLet's begin! What would you like to do first?`,
                type: 'ai',
                timestamp: new Date()
              }],
              isLoading: false
            });
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
        set({
          currentScenario: null,
          currentStep: null,
          isTrainingActive: false,
          progress: { current: 0, total: 0, score: 0, percentage: 0 }
        });
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
      }
    }),
    {
      name: 'training-storage',
      partialize: (state) => ({
        scenarios: state.scenarios,
        chatMessages: state.chatMessages
      })
    }
  )
);