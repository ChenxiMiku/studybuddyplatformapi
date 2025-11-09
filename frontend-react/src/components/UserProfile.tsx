import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '../stores/chatStore'
import { api } from '../services/api'

export default function UserProfile() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { currentChat, onlineUsers } = useChatStore()

  useEffect(() => {
    if (currentChat && currentChat.type === 'private') {
      loadProfile(currentChat.id)
    } else if (currentChat && currentChat.type === 'group') {
      loadGroupInfo(currentChat.id)
    } else {
      setProfile(null)
    }
  }, [currentChat])

  const loadProfile = async (userId: number) => {
    setLoading(true)
    try {
      const response = await api.getUserProfile(userId)
      if (response.success && response.result) {
        setProfile({
          type: 'user',
          ...response.result,
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGroupInfo = async (groupId: number) => {
    setLoading(true)
    try {
      const response = await api.getGroup(groupId)
      if (response.success && response.result) {
        setProfile({
          type: 'group',
          ...response.result,
        })
      }
    } catch (error) {
      console.error('Failed to load group info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!currentChat) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>{t('chat.selectChat')}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">{t('common.loading')}</p>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const isOnline = profile.type === 'user' && onlineUsers[currentChat.id]

  return (
    <div className="p-6">
      {/* Avatar */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto ${
            profile.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
          }`}>
            {currentChat.name[0].toUpperCase()}
          </div>
          {profile.type === 'user' && isOnline && (
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">
          {currentChat.name}
        </h2>
        {profile.type === 'user' && (
          <p className="text-gray-500">
            {isOnline ? `🟢 ${t('chat.online')}` : `⚪ ${t('chat.offline')}`}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="space-y-4">
        {profile.type === 'user' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <p className="text-gray-800">{profile.email}</p>
            </div>
            
            {profile.goals && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.goals')}
                </label>
                <p className="text-gray-800">{profile.goals}</p>
              </div>
            )}

            {profile.study_preference && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.preferences')}
                </label>
                <p className="text-gray-800">
                  {profile.study_preference}
                </p>
              </div>
            )}

            {profile.courses && profile.courses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.courses')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.courses.map((course: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {course.course_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.skills')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {skill.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {profile.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('groups.description')}
                </label>
                <p className="text-gray-800">{profile.description}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('groups.privacy')}
              </label>
              <p className="text-gray-800">
                {profile.is_private ? `🔒 ${t('groups.private')}` : `🌐 ${t('groups.public')}`}
              </p>
            </div>

            {profile.member_count !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('groups.members')}
                </label>
                <p className="text-gray-800">{profile.member_count}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
