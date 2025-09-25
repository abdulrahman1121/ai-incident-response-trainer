import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Clock, 
  Target, 
  Shield, 
  AlertTriangle,
  BookOpen,
  Play,
  Star,
  Tag,
  Users,
  Zap
} from 'lucide-react'
import { useTrainingStore } from '../stores/trainingStore'

const Scenarios = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'duration' | 'popularity'>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const { scenarios, loadScenarios, isLoading } = useTrainingStore()

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  const categories = ['all', 'malware', 'phishing', 'ddos', 'data-breach']
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']
  const severities = ['all', 'low', 'medium', 'high', 'critical']

  const filteredScenarios = scenarios
    .filter(scenario => {
      const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || scenario.category.id === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty
      const matchesSeverity = selectedSeverity === 'all' || scenario.severity === selectedSeverity
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesSeverity
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title)
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
          return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        case 'duration':
          return a.estimatedDuration - b.estimatedDuration
        case 'popularity':
          return b.tags.length - a.tags.length // Simple popularity metric
        default:
          return 0
      }
    })

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

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'malware': return Shield
      case 'phishing': return Users
      case 'ddos': return Zap
      case 'data-breach': return AlertTriangle
      default: return BookOpen
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Training Scenarios
        </h1>
        <p className="text-lg text-gray-600">
          Explore our comprehensive library of incident response training scenarios.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="card mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="all">All Categories</option>
              <option value="malware">Malware</option>
              <option value="phishing">Phishing</option>
              <option value="ddos">DDoS</option>
              <option value="data-breach">Data Breach</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input min-w-[120px]"
            >
              <option value="name">Sort by Name</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="duration">Sort by Duration</option>
              <option value="popularity">Sort by Popularity</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''} found
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-4 h-4 space-y-0.5">
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Scenarios Grid/List */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredScenarios.map((scenario, index) => {
            const CategoryIcon = getCategoryIcon(scenario.category.id)
            
            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card hover:shadow-medium transition-all duration-300 group ${
                  viewMode === 'list' ? 'flex items-center space-x-6' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <CategoryIcon className="h-5 w-5 text-primary-600" />
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
                      <button className="btn-ghost flex-1 text-sm">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Details
                      </button>
                      
                      <button className="btn-primary flex-1 text-sm">
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <CategoryIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {scenario.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {scenario.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{scenario.estimatedDuration} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{scenario.steps.length} steps</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{scenario.tags.length} tags</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1">
                        <span className={`badge ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </span>
                        <span className={`badge ${getSeverityColor(scenario.severity)}`}>
                          {scenario.severity}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="btn-ghost text-sm">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Details
                        </button>
                        
                        <button className="btn-primary text-sm">
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredScenarios.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No scenarios found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
              setSelectedSeverity('all')
            }}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default Scenarios
