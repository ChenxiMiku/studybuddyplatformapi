import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface ProfileForm {
  username: string
  email: string
  bio: string
  avatar_url: string
}

const EditProfilePage = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  
  const [formData, setFormData] = useState<ProfileForm>({
    username: '',
    email: '',
    bio: '',
    avatar_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await api.getUserProfile()
      const profile = response.data
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      })
    } catch (error) {
      console.error('加载用户资料失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.username.trim()) {
      setError('用户名不能为空')
      return
    }

    if (!formData.email.trim()) {
      setError('邮箱不能为空')
      return
    }

    try {
      setSaving(true)
      const updateData: any = {}
      
      if (formData.username !== user?.username) {
        updateData.username = formData.username.trim()
      }
      if (formData.email !== user?.email) {
        updateData.email = formData.email.trim()
      }
      if (formData.bio.trim()) {
        updateData.bio = formData.bio.trim()
      }
      if (formData.avatar_url.trim()) {
        updateData.avatar_url = formData.avatar_url.trim()
      }

      const response = await api.updateUserProfile(updateData)
      
      // Update user in auth store
      if (user && response.data) {
        setUser({
          ...user,
          username: response.data.username || user.username,
          email: response.data.email || user.email
        })
      }
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
    } catch (error: any) {
      setError(error.message || '更新资料失败')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordError('请填写所有密码字段')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('新密码与确认密码不一致')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('新密码长度至少为6个字符')
      return
    }

    try {
      await api.changePassword(passwordData.oldPassword, passwordData.newPassword)
      setPasswordSuccess(true)
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => {
        setShowPasswordSection(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (error: any) {
      setPasswordError(error.message || '修改密码失败')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Edit Profile Form */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">编辑资料</h1>
        <p className="text-gray-600 mb-6">更新你的个人信息</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">✓ 资料更新成功,正在跳转...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              个人简介
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="介绍一下自己..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-2">
              头像链接
            </label>
            <input
              type="url"
              id="avatar_url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {formData.avatar_url && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">头像预览:</p>
                <img 
                  src={formData.avatar_url} 
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存更改'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              disabled={saving}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">修改密码</h2>
          {!showPasswordSection && (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
            >
              修改
            </button>
          )}
        </div>

        {showPasswordSection ? (
          <>
            {passwordError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">✓ 密码修改成功!</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  当前密码
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  新密码
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  确认新密码
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  确认修改
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false)
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                    setPasswordError('')
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
              </div>
            </form>
          </>
        ) : (
          <p className="text-gray-600">点击修改按钮来更改你的密码</p>
        )}
      </div>
    </div>
  )
}

export default EditProfilePage
