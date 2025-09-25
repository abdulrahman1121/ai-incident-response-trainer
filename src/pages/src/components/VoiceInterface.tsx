import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings,
  Languages,
  Zap,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { voiceService, VoiceResult, TTSConfig } from '../services/voiceService'

interface VoiceInterfaceProps {
  onTranscript: (transcript: string, confidence: number) => void
  onCommand: (command: string, parameters: Record<string, any>) => void
  isEnabled?: boolean
  language?: string
  showSettings?: boolean
  className?: string
}

const VoiceInterface = ({
  onTranscript,
  onCommand,
  isEnabled = true,
  language = 'en-US',
  showSettings = false,
  className = ''
}: VoiceInterfaceProps) => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [isFinal, setIsFinal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showVoiceMenu, setShowVoiceMenu] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [voiceRate, setVoiceRate] = useState(1)
  const [voicePitch, setVoicePitch] = useState(1)
  const [voiceVolume, setVoiceVolume] = useState(1)
  
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (language) {
      voiceService.setLanguage(language)
    }
  }, [language])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      voiceService.stopListening()
      voiceService.stopSpeaking()
    }
  }, [])

  const handleStartListening = async () => {
    if (!isEnabled) return

    setError(null)
    setCurrentTranscript('')
    setConfidence(0)
    setIsFinal(false)

    try {
      await voiceService.startListening(
        (result: VoiceResult) => {
          setCurrentTranscript(result.transcript)
          setConfidence(result.confidence)
          setIsFinal(result.isFinal)

          if (result.isFinal) {
            // Process the final transcript
            onTranscript(result.transcript, result.confidence)
            
            // Process voice commands
            const commandResult = voiceService.processVoiceCommand(result.transcript)
            if (commandResult.command !== 'general_message') {
              onCommand(commandResult.command, commandResult.parameters)
            }

            // Clear transcript after processing
            setTimeout(() => {
              setCurrentTranscript('')
              setConfidence(0)
            }, 2000)
          }
        },
        (error: string) => {
          setError(error)
          setIsListening(false)
        },
        () => {
          setIsListening(false)
        }
      )
      setIsListening(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start listening')
    }
  }

  const handleStopListening = () => {
    voiceService.stopListening()
    setIsListening(false)
  }

  const handleSpeak = async (text: string) => {
    if (!isEnabled) return

    const config: TTSConfig = {
      voice: selectedVoice || undefined,
      rate: voiceRate,
      pitch: voicePitch,
      volume: voiceVolume
    }

    try {
      await voiceService.speak(
        text,
        config,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        (error: string) => setError(error)
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to speak')
    }
  }

  const handleStopSpeaking = () => {
    voiceService.stopSpeaking()
    setIsSpeaking(false)
  }

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-success-600'
    if (conf >= 0.6) return 'text-warning-600'
    return 'text-danger-600'
  }

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return 'High'
    if (conf >= 0.6) return 'Medium'
    return 'Low'
  }

  const availableVoices = voiceService.getAvailableVoices()
  const supportedLanguages = voiceService.getSupportedLanguages()

  if (!voiceService.isSupported()) {
    return (
      <div className={`p-4 bg-warning-50 border border-warning-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-warning-600" />
          <span className="text-warning-800">
            Voice features are not supported in this browser
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Voice Controls */}
      <div className="flex items-center space-x-4">
        {/* Microphone Button */}
        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={!isEnabled || isSpeaking}
          className={`p-3 rounded-lg transition-all duration-200 ${
            isListening
              ? 'bg-danger-100 text-danger-600 hover:bg-danger-200 animate-pulse'
              : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>

        {/* Voice Output Button */}
        <button
          onClick={isSpeaking ? handleStopSpeaking : () => handleSpeak('Hello, I am ready to help with your incident response training.')}
          disabled={!isEnabled || isListening}
          className={`p-3 rounded-lg transition-all duration-200 ${
            isSpeaking
              ? 'bg-warning-100 text-warning-600 hover:bg-warning-200'
              : 'bg-success-100 text-success-600 hover:bg-success-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSpeaking ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </button>

        {/* Settings Button */}
        {showSettings && (
          <button
            onClick={() => setShowVoiceMenu(!showVoiceMenu)}
            className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Settings className="h-6 w-6" />
          </button>
        )}

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Languages className="h-6 w-6" />
          </button>

          <AnimatePresence>
            {showLanguageMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-gray-200 py-2 z-50"
              >
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Select Language
                </div>
                {supportedLanguages.slice(0, 10).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      voiceService.setLanguage(lang)
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      language === lang ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Voice Settings Menu */}
      <AnimatePresence>
        {showVoiceMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 space-y-4"
          >
            <h4 className="font-medium text-gray-900">Voice Settings</h4>
            
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="input"
              >
                <option value="">Default Voice</option>
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speech Rate: {voiceRate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Voice Pitch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Pitch: {voicePitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Voice Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume: {Math.round(voiceVolume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Transcript */}
      <AnimatePresence>
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">
                  {isFinal ? 'Final Transcript' : 'Listening...'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${getConfidenceColor(confidence)}`}>
                  {getConfidenceLabel(confidence)} Confidence
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>
            <p className="text-gray-900">{currentTranscript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-danger-50 border border-danger-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-danger-600" />
              <span className="text-danger-800">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicators */}
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            isListening ? 'bg-danger-500 animate-pulse' : 'bg-gray-300'
          }`}></div>
          <span>{isListening ? 'Listening' : 'Not listening'}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            isSpeaking ? 'bg-warning-500' : 'bg-gray-300'
          }`}></div>
          <span>{isSpeaking ? 'Speaking' : 'Not speaking'}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            isEnabled ? 'bg-success-500' : 'bg-gray-300'
          }`}></div>
          <span>{isEnabled ? 'Voice enabled' : 'Voice disabled'}</span>
        </div>
      </div>
    </div>
  )
}

export default VoiceInterface
