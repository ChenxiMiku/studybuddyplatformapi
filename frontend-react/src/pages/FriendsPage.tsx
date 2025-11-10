import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../services/api'
import { useChatStore } from '../stores/chatStore'

interface Friend {
  id: number
  username: string
  email: string
  bio?: string
  friends_since?: string
}

interface FriendRequest {
  id: number
  user_id?: number
  friend_id?: number
  username: string
  email: string
  bio?: string
  requested_at: string
}

const FriendsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [friends, setFriends] = useState<Friend[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const { chats, setChats, setCurrentChat } = useChatStore()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [friendsRes, requestsRes] = await Promise.all([
        api.getFriends(),
        api.getFriendRequests()
      ])

      setFriends(friendsRes.data || [])
      setReceivedRequests(requestsRes.data.received || [])
      setSentRequests(requestsRes.data.sent || [])
    } catch (error) {
      console.error('Failed to load friends data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await api.acceptFriendRequest(requestId)
      alert(t('friends.requestAccepted'))
      loadData()
    } catch (error) {
      console.error('Failed to accept request:', error)
      alert(t('friends.requestAcceptFailed'))
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    try {
      await api.rejectFriendRequest(requestId)
      alert(t('friends.requestRejected'))
      loadData()
    } catch (error) {
      console.error('Failed to reject request:', error)
      alert(t('friends.requestRejectFailed'))
    }
  }

  const handleRemoveFriend = async (friendId: number) => {
    if (!confirm(t('friends.confirmRemove'))) return

    try {
      await api.removeFriend(friendId)
      alert(t('friends.friendRemoved'))
      loadData()
    } catch (error) {
      console.error('Failed to remove friend:', error)
      alert(t('friends.friendRemoveFailed'))
    }
  }

  const handleStartChat = (friend: Friend) => {
    const existingChat = chats.find(c => c.type === 'private' && c.id === friend.id)
    
    if (!existingChat) {
      const newChat = {
        type: 'private' as const,
        id: friend.id,
        name: friend.username,
        unreadCount: 0
      }
      setChats([newChat, ...chats])
      setCurrentChat(newChat)
    } else {
      setCurrentChat(existingChat)
    }

    navigate('/chat')
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('friends.title')}</h1>

        {receivedRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('friends.receivedRequests')} ({receivedRequests.length})
            </h2>
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {request.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{request.username}</h3>
                      <p className="text-sm text-gray-500">{request.email}</p>
                      {request.bio && (
                        <p className="text-sm text-gray-600 mt-1">{request.bio}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(request.requested_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {t('friends.acceptRequest')}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      {t('friends.rejectRequest')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sentRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('friends.sentRequests')} ({sentRequests.length})
            </h2>
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {request.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{request.username}</h3>
                      <p className="text-sm text-gray-500">{request.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(request.requested_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <span className="text-yellow-600 font-medium">{t('friends.waitingAccept')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('friends.myFriends')} ({friends.length})
          </h2>
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t('friends.findStudyPartners')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{friend.username}</h3>
                      <p className="text-sm text-gray-500 truncate">{friend.email}</p>
                      {friend.bio && (
                        <p className="text-xs text-gray-600 truncate">{friend.bio}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleStartChat(friend)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      💬 {t('friends.privateChat')}
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendsPage