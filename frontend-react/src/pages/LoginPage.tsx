import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { api } from '../services/api'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.login(username, password)
      if (response.success && response.result) {
        setAuth(
          response.result.tokens.accessToken,
          response.result.tokens.refreshToken,
          response.result.user
        )
        navigate('/chat')
      } else {
        setError(t('errors.authError'))
      }
    } catch (err: any) {
      setError(err.message || t('errors.authError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('app.title')}</h1>
              <p className="text-gray-600">{t('app.slogan')}</p>
            </div>
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')}
              className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              {i18n.language === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.usernameOrEmail')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('auth.usernameOrEmail')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('auth.password')}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('common.loading') : t('auth.loginButton')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              {t('auth.registerHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
