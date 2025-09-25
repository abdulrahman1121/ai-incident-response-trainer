// Core application types for EdgeIncidentDrill

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'analyst' | 'manager' | 'admin';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferences: UserPreferences;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserPreferences {
  voiceEnabled: boolean;
  preferredLanguage: string;
  trainingFocus: string[];
  notificationSettings: NotificationSettings;
  uiTheme: 'light' | 'dark' | 'auto';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  voice: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface IncidentScenario {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: IncidentCategory;
  steps: IncidentStep[];
  expectedOutcomes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  tags: string[];
}

export interface IncidentCategory {
  id: string;
  name: string;
  description: string;
  commonIndicators: string[];
  responseProcedures: string[];
}

export interface IncidentStep {
  id: string;
  title: string;
  description: string;
  type: 'analysis' | 'action' | 'decision' | 'communication';
  required: boolean;
  hints: string[];
  validationCriteria: string[];
  nextSteps: string[];
}

export interface TrainingSession {
  id: string;
  userId: string;
  scenarioId: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  currentStep: number;
  startTime: Date;
  endTime?: Date;
  score?: number;
  feedback: SessionFeedback[];
  progress: SessionProgress;
}

export interface SessionFeedback {
  stepId: string;
  timestamp: Date;
  userAction: string;
  aiResponse: string;
  score: number;
  suggestions: string[];
}

export interface SessionProgress {
  completedSteps: number;
  totalSteps: number;
  timeSpent: number;
  accuracy: number;
  learningPoints: string[];
}

export interface AIResponse {
  id: string;
  sessionId: string;
  message: string;
  type: 'guidance' | 'question' | 'feedback' | 'escalation';
  confidence: number;
  suggestedActions: string[];
  references: string[];
  timestamp: Date;
}

export interface VoiceCommand {
  id: string;
  sessionId: string;
  transcript: string;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
  timestamp: Date;
}

export interface WorkflowState {
  id: string;
  sessionId: string;
  currentPhase: WorkflowPhase;
  completedPhases: WorkflowPhase[];
  nextActions: string[];
  context: Record<string, any>;
  lastUpdated: Date;
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  required: boolean;
  completed: boolean;
  completionTime?: Date;
  outcomes: string[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    voiceGenerated?: boolean;
    confidence?: number;
    intent?: string;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Environment variables type
export interface Env {
  // KV Namespaces
  USER_PREFERENCES: KVNamespace;
  TRAINING_DATA: KVNamespace;
  
  // R2 Buckets
  TRAINING_MATERIALS: R2Bucket;
  
  // AI Binding
  AI: Ai;
  
  // Durable Objects
  STATE_MANAGER: DurableObjectNamespace;
  
  // Environment Variables
  ENVIRONMENT: string;
  MAX_CONCURRENT_SESSIONS: string;
  AI_MODEL_PRIMARY: string;
  AI_MODEL_FAST: string;
}
