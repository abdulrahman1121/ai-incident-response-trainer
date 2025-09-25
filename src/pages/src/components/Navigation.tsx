import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  MessageSquare, 
  Target, 
  BarChart3, 
  BookOpen,
  User,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const Navigation = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      description: 'Dashboard overview'
    },
    {
      name: 'Training',
      href: '/training',
      icon: Target,
      description: 'Start new training'
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageSquare,
      description: 'AI assistant chat'
    },
    {
      name: 'Scenarios',
      href: '/scenarios',
      icon: BookOpen,
      description: 'Browse scenarios'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'Progress tracking'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      description: 'User settings'
    }
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon 
                    className={`mr-3 h-5 w-5 transition-colors ${
                      location.pathname === item.href 
                        ? 'text-primary-600' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`} 
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  {location.pathname === item.href && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-1 h-6 bg-primary-600 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <motion.nav
        initial={false}
        animate={{ x: isCollapsed ? -280 : 0 }}
        className="lg:hidden fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-gray-200 z-30 overflow-y-auto"
      >
        <div className="p-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsCollapsed(true)}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon 
                    className={`mr-3 h-5 w-5 transition-colors ${
                      location.pathname === item.href 
                        ? 'text-primary-600' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`} 
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </NavLink>
              )
            })}
          </div>
        </div>
      </motion.nav>
    </>
  )
}

export default Navigation
