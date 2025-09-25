import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Clock, 
  Target, 
  Users, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Zap
} from 'lucide-react'
import { useTrainingStore } from '../stores/trainingStore'
import { useAuthStore } from '../stores/authStore'

const Training = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  
  const { scenarios, currentSession, startTraining, isLoading } = useTrainingStore()
  const { user } = useAuthStore()

  const handleStartScenario = async (scenarioId: string) => {
    setIsStarting(true)
    try {
      await startTraining(scenarioId, user?.id || 'guest')
    } catch (error) {
      console.error('Error starting training:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'badge-success'
      case 'intermediate': return 'badge-warning'
      case 'advanced': return 'badge-danger'
      default: return 'badge-secondary'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'badge-success'
      case 'medium': return 'badge-warning'
      case 'high': return 'badge-danger'
      case 'critical': return 'badge-danger'
      default: return 'badge-secondary'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Incident Response Training
        </h1>
        <p className="text-lg text-gray-600">
          Choose a scenario to practice your incident response skills with AI guidance.
        </p>
      </div>

      {/* Current Session */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated mb-8 bg-gradient-primary text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Play className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Active Training Session</h3>
                <p className="text-white/80">
                  {currentSession.scenarioId} • Started {new Date(currentSession.startTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {Math.round(currentSession.progress.completedSteps / currentSession.progress.totalSteps * 100)}%
              </div>
              <div className="text-sm text-white/80">Complete</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scenarios Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-medium transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Shield className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {scenario.category.name}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className={`badge ${getDifficultyColor(scenario.difficulty)}`}>
                  {scenario.difficulty}
                </span>
                <span className={`badge ${getSeverityColor(scenario.severity)}`}>
                  {scenario.severity}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {scenario.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{scenario.estimatedDuration} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{scenario.steps.length} steps</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {scenario.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge badge-secondary text-xs">
                  {tag}
                </span>
              ))}
              {scenario.tags.length > 3 && (
                <span className="badge badge-secondary text-xs">
                  +{scenario.tags.length - 3} more
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedScenario(scenario.id)}
                className="btn-ghost flex-1 text-sm"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Details
              </button>
              
              <button
                onClick={() => handleStartScenario(scenario.id)}
                disabled={isStarting || isLoading}
                className="btn-primary flex-1 text-sm"
              >
                {isStarting ? (
                  <Zap className="h-4 w-4 mr-1 animate-pulse" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                Start
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scenario Details Modal */}
      <AnimatePresence>
        {selectedScenario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedScenario(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const scenario = scenarios.find(s => s.id === selectedScenario)
                if (!scenario) return null

                return (
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {scenario.title}
                        </h2>
                        <p className="text-gray-600">
                          {scenario.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedScenario(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Scenario Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">{scenario.category.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Difficulty:</span>
                            <span className={`badge ${getDifficultyColor(scenario.difficulty)}`}>
                              {scenario.difficulty}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Severity:</span>
                            <span className={`badge ${getSeverityColor(scenario.severity)}`}>
                              {scenario.severity}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{scenario.estimatedDuration} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Steps:</span>
                            <span className="font-medium">{scenario.steps.length} steps</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Learning Objectives</h3>
                        <ul className="space-y-2 text-sm">
                          {scenario.expectedOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-success-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {scenario.tags.map((tag) => (
                          <span key={tag} className="badge badge-secondary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedScenario(null)}
                        className="btn-secondary flex-1"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setSelectedScenario(null)
                          handleStartScenario(scenario.id)
                        }}
                        className="btn-primary flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Training
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Training
