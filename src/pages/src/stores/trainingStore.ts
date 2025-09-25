import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TrainingSession, IncidentScenario, WorkflowState, APIResponse } from '@shared/types'

interface TrainingState {
  scenarios: IncidentScenario[]
  currentSession: TrainingSession | null
  sessionHistory: TrainingSession[]
  isLoading: boolean
  loadScenarios: () => Promise<void>
  startTraining: (scenarioId: string, userId: string) => Promise<void>
  updateSession: (sessionId: string, updates: Partial<TrainingSession>) => Promise<void>
  completeSession: (sessionId: string, score?: number) => Promise<void>
  getSessionProgress: (sessionId: string) => Promise<WorkflowState | null>
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      scenarios: [],
      currentSession: null,
      sessionHistory: [],
      isLoading: false,

      loadScenarios: async () => {
        set({ isLoading: true })
        try {
          // In a real app, this would fetch from your API
          // For now, we'll use mock data
          const mockScenarios: IncidentScenario[] = [
            {
              id: 'malware-detection-001',
              title: 'Ransomware Attack Simulation',
              description: 'A simulated ransomware attack targeting critical infrastructure. Practice detection, containment, and recovery procedures.',
              severity: 'critical',
              category: {
                id: 'malware',
                name: 'Malware Infection',
                description: 'Detection and response to malicious software',
                commonIndicators: ['Unusual network traffic', 'File encryption', 'Ransom notes'],
                responseProcedures: ['Isolate systems', 'Assess damage', 'Restore from backups']
              },
              steps: [
                {
                  id: 'detect',
                  title: 'Initial Detection',
                  description: 'Identify signs of ransomware activity',
                  type: 'analysis',
                  required: true,
                  hints: ['Check for encrypted files', 'Look for ransom notes'],
                  validationCriteria: ['Ransomware identified', 'Affected systems documented'],
                  nextSteps: ['containment']
                },
                {
                  id: 'contain',
                  title: 'Containment',
                  description: 'Isolate affected systems to prevent spread',
                  type: 'action',
                  required: true,
                  hints: ['Disconnect from network', 'Power down if necessary'],
                  validationCriteria: ['Systems isolated', 'Network access blocked'],
                  nextSteps: ['assessment']
                }
              ],
              expectedOutcomes: [
                'Understand ransomware attack patterns',
                'Practice rapid containment procedures',
                'Learn recovery best practices'
              ],
              difficulty: 'intermediate',
              estimatedDuration: 45,
              tags: ['ransomware', 'containment', 'recovery', 'critical-infrastructure']
            },
            {
              id: 'phishing-response-001',
              title: 'Spear Phishing Campaign',
              description: 'Respond to a sophisticated spear phishing campaign targeting executive staff.',
              severity: 'high',
              category: {
                id: 'phishing',
                name: 'Phishing Attack',
                description: 'Social engineering attacks via email',
                commonIndicators: ['Suspicious emails', 'Credential compromise', 'Unusual logins'],
                responseProcedures: ['Block domains', 'Reset credentials', 'Scan systems']
              },
              steps: [
                {
                  id: 'analyze',
                  title: 'Email Analysis',
                  description: 'Analyze the phishing email for indicators',
                  type: 'analysis',
                  required: true,
                  hints: ['Check sender reputation', 'Examine URLs', 'Look for urgency tactics'],
                  validationCriteria: ['Phishing indicators identified', 'Attack vector determined'],
                  nextSteps: ['containment']
                }
              ],
              expectedOutcomes: [
                'Identify phishing indicators',
                'Practice email analysis techniques',
                'Understand credential protection'
              ],
              difficulty: 'beginner',
              estimatedDuration: 30,
              tags: ['phishing', 'email-analysis', 'credential-protection']
            },
            {
              id: 'ddos-mitigation-001',
              title: 'DDoS Attack Response',
              description: 'Handle a large-scale DDoS attack affecting multiple services.',
              severity: 'high',
              category: {
                id: 'ddos',
                name: 'DDoS Attack',
                description: 'Distributed denial of service attacks',
                commonIndicators: ['Traffic spikes', 'Service unavailability', 'Resource exhaustion'],
                responseProcedures: ['Activate mitigation', 'Scale resources', 'Monitor patterns']
              },
              steps: [
                {
                  id: 'detect',
                  title: 'Traffic Analysis',
                  description: 'Analyze traffic patterns to confirm DDoS',
                  type: 'analysis',
                  required: true,
                  hints: ['Check traffic volume', 'Look for attack patterns', 'Monitor resource usage'],
                  validationCriteria: ['DDoS confirmed', 'Attack type identified'],
                  nextSteps: ['mitigation']
                }
              ],
              expectedOutcomes: [
                'Recognize DDoS attack patterns',
                'Practice traffic analysis',
                'Learn mitigation strategies'
              ],
              difficulty: 'intermediate',
              estimatedDuration: 40,
              tags: ['ddos', 'traffic-analysis', 'mitigation', 'availability']
            }
          ]

          set({ scenarios: mockScenarios })
        } catch (error) {
          console.error('Error loading scenarios:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      startTraining: async (scenarioId: string, userId: string) => {
        set({ isLoading: true })
        try {
          const sessionId = crypto.randomUUID()
          
          const response = await fetch('/api/workflow/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              scenarioId,
              userId
            })
          })

          if (!response.ok) {
            throw new Error('Failed to start training session')
          }

          const result = await response.json() as APIResponse<{
            workflow: WorkflowState
            session: TrainingSession
          }>

          if (result.success && result.data) {
            set({
              currentSession: result.data.session,
              isLoading: false
            })
          } else {
            throw new Error(result.error || 'Unknown error')
          }
        } catch (error) {
          console.error('Error starting training:', error)
          set({ isLoading: false })
          throw error
        }
      },

      updateSession: async (sessionId: string, updates: Partial<TrainingSession>) => {
        try {
          const response = await fetch('/api/session/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              ...updates
            })
          })

          if (!response.ok) {
            throw new Error('Failed to update session')
          }

          const result = await response.json() as APIResponse<TrainingSession>

          if (result.success && result.data) {
            set(state => ({
              currentSession: state.currentSession?.id === sessionId ? result.data : state.currentSession
            }))
          }
        } catch (error) {
          console.error('Error updating session:', error)
          throw error
        }
      },

      completeSession: async (sessionId: string, score?: number) => {
        try {
          const response = await fetch('/api/workflow/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              finalScore: score
            })
          })

          if (!response.ok) {
            throw new Error('Failed to complete session')
          }

          const result = await response.json() as APIResponse<{
            workflow: WorkflowState
            session: TrainingSession
          }>

          if (result.success && result.data) {
            set(state => ({
              currentSession: null,
              sessionHistory: [result.data.session, ...state.sessionHistory]
            }))
          }
        } catch (error) {
          console.error('Error completing session:', error)
          throw error
        }
      },

      getSessionProgress: async (sessionId: string): Promise<WorkflowState | null> => {
        try {
          const response = await fetch(`/api/workflow/status?sessionId=${sessionId}`)

          if (!response.ok) {
            return null
          }

          const result = await response.json() as APIResponse<{
            workflow: WorkflowState
            session: TrainingSession
            progress: number
            nextActions: string[]
            estimatedTimeRemaining: number
          }>

          return result.success ? result.data.workflow : null
        } catch (error) {
          console.error('Error getting session progress:', error)
          return null
        }
      }
    }),
    {
      name: 'training-storage',
      partialize: (state) => ({
        scenarios: state.scenarios,
        sessionHistory: state.sessionHistory
      })
    }
  )
)
