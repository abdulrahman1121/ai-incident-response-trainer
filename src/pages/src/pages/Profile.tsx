import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Shield, 
  Settings, 
  Bell, 
  Mic, 
  MicOff,
  Moon,
  Sun,
  Monitor,
  Save,
  Edit,
  Check,
  X
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications'>('profile')
  const { user, updateUser } = useAuthStore()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'analyst',
    experienceLevel: user?.experienceLevel || 'intermediate'
  })

  const [preferences, setPreferences] = useState({
    voiceEnabled: user?.preferences?.voiceEnabled ?? true,
    preferredLanguage: user?.preferences?.preferredLanguage || 'en',
    trainingFocus: user?.preferences?.trainingFocus || [],
    uiTheme: user?.preferences?.uiTheme || 'auto'
  })

  const [notifications, setNotifications] = useState({
    email: user?.preferences?.notificationSettings?.email ?? true,
    push: user?.preferences?.notificationSettings?.push ?? true,
    voice: user?.preferences?.notificationSettings?.voice ?? false,
    frequency: user?.preferences?.notificationSettings?.frequency || 'immediate'
  })

  const handleSave = () => {
    updateUser({
      ...formData,
      preferences: {
        ...preferences,
        notificationSettings: notifications
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'analyst',
      experienceLevel: user?.experienceLevel || 'intermediate'
    })
    setIsEditing(false)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-lg text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="btn-ghost"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="h-20 w-20 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {user?.name || 'Guest User'}
                    </h3>
                    <p className="text-gray-500">
                      {user?.role || 'Analyst'} • {user?.experienceLevel || 'Intermediate'} Level
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                        {user?.name || 'Not set'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                        {user?.email || 'Not set'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="input"
                      >
                        <option value="analyst">Security Analyst</option>
                        <option value="manager">Security Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                        {user?.role || 'Not set'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.experienceLevel}
                        onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                        className="input"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                        {user?.experienceLevel || 'Not set'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Preferences
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Interface Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Voice Input</h4>
                        <p className="text-sm text-gray-500">
                          Enable voice commands and speech-to-text
                        </p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, voiceEnabled: !preferences.voiceEnabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.voiceEnabled ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Language
                      </label>
                      <select
                        value={preferences.preferredLanguage}
                        onChange={(e) => setPreferences({ ...preferences, preferredLanguage: e.target.value })}
                        className="input"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UI Theme
                      </label>
                      <div className="flex space-x-3">
                        {[
                          { value: 'light', label: 'Light', icon: Sun },
                          { value: 'dark', label: 'Dark', icon: Moon },
                          { value: 'auto', label: 'Auto', icon: Monitor }
                        ].map((theme) => {
                          const Icon = theme.icon
                          return (
                            <button
                              key={theme.value}
                              onClick={() => setPreferences({ ...preferences, uiTheme: theme.value as any })}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                preferences.uiTheme === theme.value
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{theme.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Training Focus
                  </h3>
                  
                  <div className="space-y-2">
                    {[
                      'Malware Analysis',
                      'Phishing Detection',
                      'Network Security',
                      'Incident Response',
                      'Forensics',
                      'Compliance'
                    ].map((focus) => (
                      <label key={focus} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={preferences.trainingFocus.includes(focus)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreferences({
                                ...preferences,
                                trainingFocus: [...preferences.trainingFocus, focus]
                              })
                            } else {
                              setPreferences({
                                ...preferences,
                                trainingFocus: preferences.trainingFocus.filter(f => f !== focus)
                              })
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{focus}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Notification Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Notification Methods
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.email ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.email ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-500">
                          Receive push notifications in browser
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.push ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.push ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Voice Notifications</h4>
                        <p className="text-sm text-gray-500">
                          Receive voice announcements
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, voice: !notifications.voice })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.voice ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.voice ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Notification Frequency
                  </h3>
                  
                  <div className="space-y-2">
                    {[
                      { value: 'immediate', label: 'Immediate' },
                      { value: 'daily', label: 'Daily Summary' },
                      { value: 'weekly', label: 'Weekly Summary' }
                    ].map((frequency) => (
                      <label key={frequency.value} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="frequency"
                          value={frequency.value}
                          checked={notifications.frequency === frequency.value}
                          onChange={(e) => setNotifications({ ...notifications, frequency: e.target.value as any })}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{frequency.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
