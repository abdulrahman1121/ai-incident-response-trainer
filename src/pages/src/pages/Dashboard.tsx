import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Users,
  Zap,
  BookOpen,
  Trophy
} from 'lucide-react'
import { useTrainingStore } from '../stores/trainingStore'
import { useAuthStore } from '../stores/authStore'

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const { sessionHistory, loadScenarios } = useTrainingStore()
  const { user } = useAuthStore()

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  // Calculate statistics
  const totalSessions = sessionHistory.length
  const completedSessions = sessionHistory.filter(s => s.status === 'completed').length
  const averageScore = sessionHistory.length > 0 
    ? Math.round(sessionHistory.reduce((sum, s) => sum + (s.score || 0), 0) / sessionHistory.length)
    : 0
  const totalTimeSpent = sessionHistory.reduce((sum, s) => sum + s.progress.timeSpent, 0)

  const recentSessions = sessionHistory.slice(0, 5)
  const topCategories = getTopCategories()
  const progressData = getProgressData()

  function getTopCategories() {
    const categoryCount: Record<string, number> = {}
    sessionHistory.forEach(session => {
      // This would normally come from the scenario data
      const category = 'General' // Placeholder
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
    
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  function getProgressData() {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map(date => {
      const sessionsOnDate = sessionHistory.filter(session => 
        session.startTime.toISOString().split('T')[0] === date
      )
      return {
        date,
        sessions: sessionsOnDate.length,
        score: sessionsOnDate.length > 0 
          ? Math.round(sessionsOnDate.reduce((sum, s) => sum + (s.score || 0), 0) / sessionsOnDate.length)
          : 0
      }
    })
  }

  const stats = [
    {
      title: 'Total Sessions',
      value: totalSessions,
      icon: BookOpen,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Completion Rate',
      value: `${Math.round((completedSessions / Math.max(totalSessions, 1)) * 100)}%`,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Average Score',
      value: averageScore,
      icon: Award,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Time Spent',
      value: `${Math.round(totalTimeSpent / 60)}h`,
      icon: Clock,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100',
      change: '+15%',
      changeType: 'positive' as const
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Training Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Track your progress and performance in incident response training.
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs last {timeRange}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Training Progress
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                <span>Sessions</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-success-600 rounded-full"></div>
                <span>Score</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 flex items-end space-x-2">
            {progressData.map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center space-y-1 mb-2">
                  <div 
                    className="w-full bg-primary-200 rounded-t"
                    style={{ height: `${Math.max(data.sessions * 20, 4)}px` }}
                  ></div>
                  <div 
                    className="w-full bg-success-200 rounded-b"
                    style={{ height: `${Math.max(data.score * 2, 4)}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 transform -rotate-45 origin-left">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top Categories
          </h3>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {category.category}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {category.count} sessions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Training Sessions
          </h3>
          <button className="btn-ghost text-sm">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {recentSessions.length > 0 ? (
            recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    session.status === 'completed' 
                      ? 'bg-success-100 text-success-600'
                      : session.status === 'active'
                      ? 'bg-warning-100 text-warning-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {session.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : session.status === 'active' ? (
                      <Zap className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {session.scenarioId}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Started {new Date(session.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {session.score ? `${session.score}%` : 'In Progress'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.progress.completedSteps}/{session.progress.totalSteps} steps
                    </div>
                  </div>
                  
                  <div className={`badge ${
                    session.status === 'completed' 
                      ? 'badge-success'
                      : session.status === 'active'
                      ? 'badge-warning'
                      : 'badge-secondary'
                  }`}>
                    {session.status}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No training sessions yet
              </h4>
              <p className="text-gray-500 mb-4">
                Start your first training session to see your progress here.
              </p>
              <button className="btn-primary">
                Start Training
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Achievements
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'First Steps', description: 'Complete your first training session', earned: totalSessions > 0 },
            { title: 'Consistent Learner', description: 'Complete 5 training sessions', earned: totalSessions >= 5 },
            { title: 'High Performer', description: 'Achieve 90% average score', earned: averageScore >= 90 },
            { title: 'Time Master', description: 'Spend 10 hours in training', earned: totalTimeSpent >= 600 },
            { title: 'Category Expert', description: 'Complete all scenario categories', earned: false },
            { title: 'Speed Runner', description: 'Complete a session in under 15 minutes', earned: false }
          ].map((achievement, index) => (
            <div
              key={achievement.title}
              className={`p-4 rounded-lg border-2 transition-colors ${
                achievement.earned
                  ? 'border-success-200 bg-success-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  achievement.earned
                    ? 'bg-success-100 text-success-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`font-medium ${
                    achievement.earned ? 'text-success-900' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-success-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
