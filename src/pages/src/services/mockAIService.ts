// Mock AI Service for MVP functionality
export interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  steps: ScenarioStep[];
  expectedOutcome: string;
}

export interface ScenarioStep {
  id: string;
  description: string;
  type: 'question' | 'action' | 'decision';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface AIResponse {
  message: string;
  type: 'question' | 'feedback' | 'hint' | 'explanation';
  isCorrect?: boolean;
  nextStep?: string;
}

// Mock training scenarios
export const trainingScenarios: TrainingScenario[] = [
  {
    id: 'phishing-email-1',
    title: 'Suspicious Email Investigation',
    description: 'A user reports receiving a suspicious email. Investigate and determine if it\'s a phishing attempt.',
    difficulty: 'beginner',
    category: 'Email Security',
    steps: [
      {
        id: 'step-1',
        description: 'You receive a report about a suspicious email. What should be your first action?',
        type: 'question',
        options: [
          'Delete the email immediately',
          'Forward it to the security team',
          'Click on links to investigate',
          'Ask the user to forward the email to you'
        ],
        correctAnswer: 'Ask the user to forward the email to you',
        explanation: 'You should ask the user to forward the email to you so you can analyze it safely without clicking any potentially malicious links.'
      },
      {
        id: 'step-2',
        description: 'The user forwards the email. You notice it has a suspicious sender address and urgent language. What do you check next?',
        type: 'question',
        options: [
          'Check the sender\'s reputation',
          'Look for spelling errors',
          'Verify the links in the email',
          'All of the above'
        ],
        correctAnswer: 'All of the above',
        explanation: 'All these checks are important for identifying phishing attempts. Look for red flags in sender reputation, content quality, and link safety.'
      }
    ],
    expectedOutcome: 'Successfully identify and contain the phishing attempt'
  },
  {
    id: 'malware-detection-1',
    title: 'Suspicious File Analysis',
    description: 'A user downloaded a file that triggered antivirus alerts. Analyze the situation and respond appropriately.',
    difficulty: 'intermediate',
    category: 'Malware Analysis',
    steps: [
      {
        id: 'step-1',
        description: 'A user reports their antivirus flagged a file they downloaded. What\'s your immediate response?',
        type: 'question',
        options: [
          'Tell them to ignore the warning',
          'Isolate the system immediately',
          'Ask them to run a full scan',
          'Check the file hash against known threats'
        ],
        correctAnswer: 'Isolate the system immediately',
        explanation: 'When malware is detected, the first priority is to prevent it from spreading by isolating the affected system.'
      },
      {
        id: 'step-2',
        description: 'After isolating the system, what should you do next?',
        type: 'question',
        options: [
          'Run additional malware scans',
          'Check network logs for suspicious activity',
          'Document the incident',
          'All of the above'
        ],
        correctAnswer: 'All of the above',
        explanation: 'Comprehensive incident response requires scanning, monitoring, and proper documentation.'
      }
    ],
    expectedOutcome: 'Successfully contain and analyze the malware threat'
  },
  {
    id: 'data-breach-1',
    title: 'Potential Data Breach Response',
    description: 'You discover evidence of unauthorized access to sensitive data. Lead the incident response.',
    difficulty: 'advanced',
    category: 'Data Protection',
    steps: [
      {
        id: 'step-1',
        description: 'You discover evidence of unauthorized access to customer data. What\'s your first action?',
        type: 'question',
        options: [
          'Notify law enforcement immediately',
          'Assess the scope of the breach',
          'Shut down all systems',
          'Contact the media'
        ],
        correctAnswer: 'Assess the scope of the breach',
        explanation: 'Before taking any other actions, you need to understand the full scope and impact of the breach.'
      },
      {
        id: 'step-2',
        description: 'After assessing the breach, you need to notify stakeholders. Who should be notified first?',
        type: 'question',
        options: [
          'Customers',
          'Legal team',
          'Executive leadership',
          'IT team'
        ],
        correctAnswer: 'Executive leadership',
        explanation: 'Executive leadership needs to be informed first to make strategic decisions about the response.'
      }
    ],
    expectedOutcome: 'Successfully manage the data breach response process'
  }
];

// Mock AI responses based on user input
export class MockAIService {
  private currentScenario: TrainingScenario | null = null;
  private currentStepIndex = 0;
  private userScore = 0;
  private totalQuestions = 0;

  startTraining(scenarioId: string): TrainingScenario | null {
    this.currentScenario = trainingScenarios.find(s => s.id === scenarioId) || null;
    this.currentStepIndex = 0;
    this.userScore = 0;
    this.totalQuestions = 0;
    return this.currentScenario;
  }

  getCurrentStep(): ScenarioStep | null {
    if (!this.currentScenario) return null;
    return this.currentScenario.steps[this.currentStepIndex] || null;
  }

  submitAnswer(answer: string): AIResponse {
    if (!this.currentScenario) {
      return {
        message: 'No active training session. Please start a training scenario first.',
        type: 'feedback',
        isCorrect: false
      };
    }

    const currentStep = this.getCurrentStep();
    if (!currentStep) {
      return {
        message: 'Training completed! Great job!',
        type: 'feedback',
        isCorrect: true
      };
    }

    this.totalQuestions++;
    const isCorrect = answer === currentStep.correctAnswer;
    
    if (isCorrect) {
      this.userScore++;
    }

    const response: AIResponse = {
      message: isCorrect 
        ? `✅ Correct! ${currentStep.explanation}` 
        : `❌ Not quite right. ${currentStep.explanation}`,
      type: 'feedback',
      isCorrect,
      nextStep: this.currentStepIndex < this.currentScenario.steps.length - 1 ? 'next' : 'complete'
    };

    this.currentStepIndex++;

    return response;
  }

  getHint(): AIResponse {
    const currentStep = this.getCurrentStep();
    if (!currentStep) {
      return {
        message: 'No active step to provide a hint for.',
        type: 'hint'
      };
    }

    return {
      message: `💡 Hint: ${currentStep.explanation?.split('.')[0]}...`,
      type: 'hint'
    };
  }

  getProgress(): { current: number; total: number; score: number; percentage: number } {
    return {
      current: this.currentStepIndex,
      total: this.currentScenario?.steps.length || 0,
      score: this.userScore,
      percentage: this.totalQuestions > 0 ? Math.round((this.userScore / this.totalQuestions) * 100) : 0
    };
  }

  endTraining(): { score: number; total: number; percentage: number } {
    const progress = this.getProgress();
    this.currentScenario = null;
    this.currentStepIndex = 0;
    return progress;
  }

  getAvailableScenarios(): TrainingScenario[] {
    return trainingScenarios;
  }

  getScenariosByDifficulty(difficulty: string): TrainingScenario[] {
    return trainingScenarios.filter(s => s.difficulty === difficulty);
  }

  getScenariosByCategory(category: string): TrainingScenario[] {
    return trainingScenarios.filter(s => s.category === category);
  }
}

// Create singleton instance
export const mockAIService = new MockAIService();
