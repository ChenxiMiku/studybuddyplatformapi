import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import LanguageSwitcher from './LanguageSwitcher'

const Navbar = () => {
  const { t } = useTranslation()
  const { token, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-800">StudyBuddy</span>
          </Link>

          {/* Navigation Links */}
          {token ? (
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {t('common.home') || '首页'}
              </Link>
              <Link 
                to="/groups" 
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {t('groups.title')}
              </Link>
              <Link 
                to="/discover" 
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                🔍 {t('friends.discover')}
              </Link>
              <Link 
                to="/friends" 
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                👥 {t('friends.title')}
              </Link>
              <Link 
                to="/chat" 
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {t('chat.title')}
              </Link>
              
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span>{user?.username}</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link 
                to="/login"
                className="px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {t('auth.login')}
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {t('auth.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
