import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Loader2,
  Volume2,
  VolumeX,
  Settings,
  Download
} from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'
import VoiceInterface from '../components/VoiceInterface'
import { voiceService } from '../services/voiceService'

const Chat = () => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { messages, sendMessage, isLoading } = useChatStore()
  const { user } = useAuthStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage('')
    setIsTyping(true)

    try {
      await sendMessage(userMessage, user?.id || 'guest')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceTranscript = (transcript: string, confidence: number) => {
    setMessage(transcript)
    // Auto-send if confidence is high enough
    if (confidence > 0.8) {
      setTimeout(() => {
        handleSendMessage()
      }, 1000)
    }
  }

  const handleVoiceCommand = (command: string, parameters: Record<string, any>) => {
    switch (command) {
      case 'start_training':
        // Navigate to training page or start a scenario
        break
      case 'next_step':
        // Move to next step in current training
        break
      case 'repeat_instructions':
        // Repeat current instructions
        break
      case 'get_hint':
        // Get a hint for current step
        break
      case 'escalate':
        // Escalate current situation
        break
      case 'pause_session':
        // Pause current training session
        break
      case 'end_session':
        // End current training session
        break
      case 'help':
        // Show help information
        break
      case 'check_status':
        // Check current training status
        break
      default:
        // Handle general message
        break
    }
  }

  const handleVoiceToggle = () => {
    setIsVoiceEnabled(!isVoiceEnabled)
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Chat Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                AI Incident Response Assistant
              </h1>
              <p className="text-sm text-gray-500">
                Powered by Llama 3.3 • Real-time guidance
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleVoiceToggle}
              className={`p-2 rounded-lg transition-colors ${
                isVoiceEnabled 
                  ? 'bg-success-100 text-success-600 hover:bg-success-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isVoiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${
                  msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`p-2 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className={`rounded-lg p-4 ${
                    msg.type === 'user' 
                      ? 'chat-message-user' 
                      : msg.type === 'ai'
                      ? 'chat-message-ai'
                      : 'chat-message-system'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      
                      {msg.type === 'ai' && msg.metadata?.confidence && (
                        <span className="text-xs text-gray-500">
                          Confidence: {Math.round(msg.metadata.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="chat-message-ai">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">AI is thinking</span>
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Interface */}
        {isVoiceEnabled && (
          <div className="border-t border-gray-200 p-4">
            <VoiceInterface
              onTranscript={handleVoiceTranscript}
              onCommand={handleVoiceCommand}
              isEnabled={isVoiceEnabled}
              showSettings={true}
              className="mb-4"
            />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about incident response procedures, request guidance, or describe a scenario..."
                className="input resize-none min-h-[60px] max-h-32"
                rows={2}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleVoiceToggle}
                disabled={isLoading}
                className={`p-3 rounded-lg transition-colors ${
                  isVoiceEnabled
                    ? 'bg-success-100 text-success-600 hover:bg-success-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isVoiceEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {isVoiceEnabled && (
                <span className="flex items-center space-x-1">
                  <Volume2 className="h-3 w-3" />
                  <span>Voice enabled</span>
                </span>
              )}
            </div>
            
            <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
              <Download className="h-3 w-3" />
              <span>Export chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
