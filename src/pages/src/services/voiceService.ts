// Voice service for handling speech-to-text and text-to-speech functionality

export interface VoiceConfig {
  language: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
}

export interface VoiceResult {
  transcript: string
  confidence: number
  isFinal: boolean
  alternatives?: string[]
}

export interface TTSConfig {
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
}

class VoiceService {
  private recognition: any = null
  private synthesis: SpeechSynthesis | null = null
  private listening = false
  private speaking = false
  private config: VoiceConfig = {
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3
  }

  constructor() {
    this.initializeSpeechRecognition()
    this.initializeSpeechSynthesis()
  }

  private initializeSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.setupRecognition()
      } else {
        console.warn('Speech recognition not supported in this browser')
      }
    }
  }

  private initializeSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    } else {
      console.warn('Speech synthesis not supported in this browser')
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = this.config.continuous
    this.recognition.interimResults = this.config.interimResults
    this.recognition.lang = this.config.language
    this.recognition.maxAlternatives = this.config.maxAlternatives
  }

  // Speech-to-Text methods
  startListening(
    onResult: (result: VoiceResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'))
        return
      }

      if (this.listening) {
        reject(new Error('Already listening'))
        return
      }

      this.recognition.onstart = () => {
        this.listening = true
        resolve()
      }

      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1]
        const transcript = result[0].transcript
        const confidence = result[0].confidence
        const isFinal = result.isFinal

        const alternatives = Array.from(result).map((alt: any) => alt.transcript)

        onResult({
          transcript,
          confidence,
          isFinal,
          alternatives: alternatives.length > 1 ? alternatives : undefined
        })
      }

      this.recognition.onerror = (event: any) => {
        this.listening = false
        const errorMessage = this.getErrorMessage(event.error)
        onError?.(errorMessage)
        reject(new Error(errorMessage))
      }

      this.recognition.onend = () => {
        this.listening = false
        onEnd?.()
      }

      try {
        this.recognition.start()
      } catch (error) {
        reject(error)
      }
    })
  }

  stopListening(): void {
    if (this.recognition && this.listening) {
      this.recognition.stop()
      this.listening = false
    }
  }

  abortListening(): void {
    if (this.recognition && this.listening) {
      this.recognition.abort()
      this.listening = false
    }
  }

  // Text-to-Speech methods
  speak(
    text: string,
    config: TTSConfig = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'))
        return
      }

      if (this.speaking) {
        this.stopSpeaking()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Apply configuration
      if (config.voice) {
        const voices = this.synthesis.getVoices()
        const selectedVoice = voices.find(voice => voice.name === config.voice)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }
      
      utterance.rate = config.rate || 1
      utterance.pitch = config.pitch || 1
      utterance.volume = config.volume || 1
      utterance.lang = this.config.language

      utterance.onstart = () => {
        this.speaking = true
        onStart?.()
      }

      utterance.onend = () => {
        this.speaking = false
        onEnd?.()
        resolve()
      }

      utterance.onerror = (event: any) => {
        this.speaking = false
        const errorMessage = `Speech synthesis error: ${event.error}`
        onError?.(errorMessage)
        reject(new Error(errorMessage))
      }

      try {
        this.synthesis.speak(utterance)
      } catch (error) {
        reject(error)
      }
    })
  }

  stopSpeaking(): void {
    if (this.synthesis && this.speaking) {
      this.synthesis.cancel()
      this.speaking = false
    }
  }

  pauseSpeaking(): void {
    if (this.synthesis && this.speaking) {
      this.synthesis.pause()
    }
  }

  resumeSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.resume()
    }
  }

  // Configuration methods
  updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.setupRecognition()
  }

  setLanguage(language: string): void {
    this.config.language = language
    this.setupRecognition()
  }

  // Utility methods
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return []
    return this.synthesis.getVoices()
  }

  getSupportedLanguages(): string[] {
    // Common languages supported by most browsers
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA',
      'es-ES', 'es-MX', 'es-AR',
      'fr-FR', 'fr-CA',
      'de-DE', 'de-AT',
      'it-IT', 'pt-BR', 'pt-PT',
      'ru-RU', 'ja-JP', 'ko-KR',
      'zh-CN', 'zh-TW', 'ar-SA',
      'hi-IN', 'nl-NL', 'sv-SE',
      'no-NO', 'da-DK', 'fi-FI'
    ]
  }

  isSupported(): boolean {
    return !!(this.recognition && this.synthesis)
  }

  getListeningStatus(): boolean {
    return this.listening
  }

  getSpeakingStatus(): boolean {
    return this.speaking
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'No speech was detected. Please try again.'
      case 'audio-capture':
        return 'No microphone was found. Please check your microphone.'
      case 'not-allowed':
        return 'Microphone access was denied. Please allow microphone access.'
      case 'network':
        return 'Network error occurred. Please check your connection.'
      case 'aborted':
        return 'Speech recognition was aborted.'
      case 'language-not-supported':
        return 'The selected language is not supported.'
      default:
        return `Speech recognition error: ${error}`
    }
  }

  // Voice command processing
  processVoiceCommand(transcript: string): {
    command: string
    confidence: number
    parameters: Record<string, any>
  } {
    const lowerTranscript = transcript.toLowerCase().trim()
    
    // Define voice commands
    const commands = [
      {
        pattern: /start (?:training|scenario|session)/i,
        command: 'start_training',
        parameters: {}
      },
      {
        pattern: /next (?:step|action)/i,
        command: 'next_step',
        parameters: {}
      },
      {
        pattern: /repeat (?:instructions?|that)/i,
        command: 'repeat_instructions',
        parameters: {}
      },
      {
        pattern: /(?:get|give me) (?:a )?hint/i,
        command: 'get_hint',
        parameters: {}
      },
      {
        pattern: /escalate/i,
        command: 'escalate',
        parameters: {}
      },
      {
        pattern: /pause (?:session|training)/i,
        command: 'pause_session',
        parameters: {}
      },
      {
        pattern: /(?:end|stop) (?:session|training)/i,
        command: 'end_session',
        parameters: {}
      },
      {
        pattern: /help/i,
        command: 'help',
        parameters: {}
      },
      {
        pattern: /(?:what|how) (?:is|are) (?:the )?(?:status|progress)/i,
        command: 'check_status',
        parameters: {}
      }
    ]

    // Find matching command
    for (const cmd of commands) {
      if (cmd.pattern.test(lowerTranscript)) {
        return {
          command: cmd.command,
          confidence: 0.9, // High confidence for pattern matches
          parameters: cmd.parameters
        }
      }
    }

    // If no specific command found, treat as general message
    return {
      command: 'general_message',
      confidence: 0.7,
      parameters: { message: transcript }
    }
  }

  // Voice feedback for training scenarios
  generateVoiceFeedback(
    action: string,
    result: 'success' | 'error' | 'warning' | 'info'
  ): string {
    const feedbackMessages = {
      success: [
        'Excellent work!',
        'Great job!',
        'Perfect!',
        'Well done!',
        'That\'s correct!'
      ],
      error: [
        'That\'s not quite right. Try again.',
        'Not quite. Let me give you a hint.',
        'Incorrect. Consider the security implications.',
        'That approach won\'t work here.'
      ],
      warning: [
        'Be careful with that approach.',
        'Consider the risks involved.',
        'That might cause issues.',
        'Think about the consequences.'
      ],
      info: [
        'Good thinking.',
        'You\'re on the right track.',
        'Consider this approach.',
        'That\'s a valid option.'
      ]
    }

    const messages = feedbackMessages[result]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    
    return `${randomMessage} ${action}`
  }
}

// Create singleton instance
export const voiceService = new VoiceService()
