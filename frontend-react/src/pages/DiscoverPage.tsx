import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../services/api'

interface MatchedUser {
  user_id: number
  username: string
  email: string
  bio?: string
  goals: string | null
  study_preference: string | null
  compatibility_score: number
  match_reasons: string[]
  course_similarity: number
  time_overlap: number
  skill_similarity: number
  created_at: string
}

interface FriendStatus {
  [userId: number]: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
}

const DiscoverPage = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<MatchedUser[]>([])
  const [friendStatus, setFriendStatus] = useState<FriendStatus>({})
  const [sendingRequest, setSendingRequest] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const response = await api.getMatchedUsers(20)
      const matchedUsers = response.result?.matches || []
      setMatches(matchedUsers)

      // Load friend status for all matched users
      await loadFriendStatuses(matchedUsers.map((u: MatchedUser) => u.user_id))
    } catch (error) {
      console.error('Failed to load matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFriendStatuses = async (userIds: number[]) => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.getFriends().catch(() => ({ data: [] })),
        api.getFriendRequests().catch(() => ({ data: { sent: [], received: [] } }))
      ])

      const friends = friendsRes.data || []
      const sentRequests = requestsRes.data?.sent || []
      const receivedRequests = requestsRes.data?.received || []

      const statusMap: FriendStatus = {}
      
      userIds.forEach(userId => {
        if (friends.some((f: any) => f.id === userId)) {
          statusMap[userId] = 'accepted'
        } else if (sentRequests.some((r: any) => r.friend_id === userId)) {
          statusMap[userId] = 'pending_sent'
        } else if (receivedRequests.some((r: any) => r.user_id === userId)) {
          statusMap[userId] = 'pending_received'
        } else {
          statusMap[userId] = 'none'
        }
      })

      setFriendStatus(statusMap)
    } catch (error) {
      console.error('Failed to load friend statuses:', error)
    }
  }

  const handleSendRequest = async (userId: number) => {
    try {
      setSendingRequest(prev => ({ ...prev, [userId]: true }))
      await api.sendFriendRequest(userId)
      
      // Update friend status
      setFriendStatus(prev => ({
        ...prev,
        [userId]: 'pending_sent'
      }))
      
      alert(t('friends.requestSentSuccess'))
    } catch (error) {
      console.error('Failed to send friend request:', error)
      alert(t('friends.requestSentFailed'))
    } finally {
      setSendingRequest(prev => ({ ...prev, [userId]: false }))
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('friends.highMatch')
    if (score >= 60) return t('friends.goodMatch')
    if (score >= 40) return t('friends.mediumMatch')
    return t('friends.lowMatch')
  }

  const renderFriendButton = (user: MatchedUser) => {
    const status = friendStatus[user.user_id]
    const isSending = sendingRequest[user.user_id]

    if (status === 'accepted') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed"
        >
          ✓ {t('friends.alreadyFriends')}
        </button>
      )
    }

    if (status === 'pending_sent') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg cursor-not-allowed"
        >
          ⏳ {t('friends.waitingAccept')}
        </button>
      )
    }

    if (status === 'pending_received') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-not-allowed"
        >
          📥 {t('friends.requestReceived')}
        </button>
      )
    }

    return (
      <button
        onClick={() => handleSendRequest(user.user_id)}
        disabled={isSending}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSending ? t('friends.sending') : `➕ ${t('friends.addFriend')}`}
      </button>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('friends.discover')}</h1>
          <p className="text-gray-600">
            {t('matching.title')}
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('friends.noMatches')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('friends.improveProfile')}
            </p>
            <a
              href="/profile/edit"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('friends.improveProfileButton')}
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((user) => (
              <div
                key={user.user_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* User Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {user.username}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(user.compatibility_score)}`}>
                          {user.compatibility_score}% {getScoreLabel(user.compatibility_score)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">{user.email}</p>

                      {/* Match Details */}
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="text-2xl font-bold text-purple-600">
                            {user.course_similarity}%
                          </div>
                          <div className="text-xs text-gray-600">{t('friends.courseSimilarity')}</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-2xl font-bold text-blue-600">
                            {user.time_overlap}%
                          </div>
                          <div className="text-xs text-gray-600">{t('friends.timeOverlap')}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-2xl font-bold text-green-600">
                            {user.skill_similarity}%
                          </div>
                          <div className="text-xs text-gray-600">{t('friends.skillSimilarity')}</div>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          {t('friends.matchReasons')}:
                        </h4>
                        <ul className="space-y-1">
                          {user.match_reasons.map((reason, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 flex items-start"
                            >
                              <span className="text-green-500 mr-2">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* User Goals */}
                      {user.goals && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">
                            {t('friends.learningGoals')}:
                          </h4>
                          <p className="text-sm text-gray-600 italic">
                            "{user.goals}"
                          </p>
                        </div>
                      )}

                      {/* Study Preference */}
                      {user.study_preference && (
                        <div>
                          <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                            {user.study_preference}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-4 flex-shrink-0">
                    {renderFriendButton(user)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {matches.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMatches}
              disabled={loading}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50"
            >
              🔄 {t('friends.refreshRecommendations')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscoverPage
