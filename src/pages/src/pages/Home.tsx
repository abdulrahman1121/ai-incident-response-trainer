import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  Zap, 
  Brain, 
  Users, 
  ArrowRight,
  Play,
  BookOpen,
  BarChart3
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Guidance',
      description: 'Get real-time assistance from Llama 3.3 during incident response training scenarios.',
      color: 'text-primary-600'
    },
    {
      icon: Zap,
      title: 'Edge Computing',
      description: 'Ultra-low latency responses powered by Cloudflare\'s global network.',
      color: 'text-warning-600'
    },
    {
      icon: Users,
      title: 'Collaborative Training',
      description: 'Work with teams in realistic incident response scenarios.',
      color: 'text-success-600'
    },
    {
      icon: Shield,
      title: 'Real-World Scenarios',
      description: 'Practice with scenarios based on actual cybersecurity incidents.',
      color: 'text-danger-600'
    }
  ]

  const stats = [
    { label: 'Training Scenarios', value: '50+' },
    { label: 'Response Time', value: '<200ms' },
    { label: 'Global Coverage', value: '200+' },
    { label: 'Success Rate', value: '99.9%' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12 lg:py-20"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center justify-center p-3 bg-gradient-primary rounded-2xl mb-8"
          >
            <Shield className="h-12 w-12 text-white" />
          </motion.div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Master Incident Response with{' '}
            <span className="text-gradient">AI-Powered Training</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Train your cybersecurity team with realistic incident response scenarios, 
            powered by advanced AI and delivered at the edge for maximum performance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/training"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Training</span>
            </Link>
            
            <Link
              to="/scenarios"
              className="btn-secondary text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <BookOpen className="h-5 w-5" />
              <span>Browse Scenarios</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
            className="card text-center"
          >
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose EdgeIncidentDrill?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with real-world 
            incident response expertise to deliver unparalleled training experiences.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                className="card text-center hover:shadow-medium transition-shadow"
              >
                <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-gray-50 mb-4 ${feature.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="card-elevated text-center bg-gradient-primary text-white"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Incident Response Training?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of security professionals who trust EdgeIncidentDrill 
            for their training needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/training"
              className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Your First Scenario</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <Link
              to="/dashboard"
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <BarChart3 className="h-5 w-5" />
              <span>View Progress</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Home
