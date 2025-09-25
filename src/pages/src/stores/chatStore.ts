import { create } from 'zustand'
import { ChatMessage, APIResponse } from '@shared/types'

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  sessionId: string | null
  sendMessage: (message: string, userId: string) => Promise<void>
  clearMessages: () => void
  setSessionId: (sessionId: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  sessionId: null,

  sendMessage: async (message: string, userId: string) => {
    const { sessionId } = get()
    
    if (!sessionId) {
      // Create new session if none exists
      const newSessionId = crypto.randomUUID()
      set({ sessionId: newSessionId })
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId: get().sessionId || crypto.randomUUID(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    // Add user message immediately
    set(state => ({
      messages: [...state.messages, userMessage],
      isLoading: true
    }))

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: get().sessionId,
          message,
          context: { userId }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json() as APIResponse<any>
      
      if (result.success && result.data) {
        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sessionId: get().sessionId || crypto.randomUUID(),
          type: 'ai',
          content: result.data.message,
          timestamp: new Date(),
          metadata: {
            confidence: result.data.confidence,
            intent: result.data.type
          }
        }

        set(state => ({
          messages: [...state.messages, aiMessage],
          isLoading: false
        }))
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId: get().sessionId || crypto.randomUUID(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }

      set(state => ({
        messages: [...state.messages, errorMessage],
        isLoading: false
      }))
    }
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  setSessionId: (sessionId: string) => {
    set({ sessionId })
  }
}))
