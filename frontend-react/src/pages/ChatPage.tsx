import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { wsClient } from '../services/websocket'
import { api } from '../services/api'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'

export default function ChatPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuthStore()
  const { setChats, setOnlineUsers, setMessages } = useChatStore()

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      console.error('❌ No user in ChatPage, redirecting to login')
      logout()
      return
    }

    console.log('👤 Current user:', user)
    console.log('🔑 Auth state:', useAuthStore.getState())

    // Connect WebSocket
    wsClient.connect()

    // Load initial data
    loadInitialData()

    // Auto refresh token every 23 hours (before 24h expiration)
    const tokenRefreshInterval = setInterval(async () => {
      const { refreshToken, setAuth } = useAuthStore.getState()
      if (refreshToken) {
        try {
          console.log('🔄 Refreshing access token...')
          const response = await api.refreshToken(refreshToken)
          if (response.success && response.result) {
            setAuth(
              response.result.tokens.accessToken,
              response.result.tokens.refreshToken,
              response.result.user
            )
            console.log('✅ Token refreshed successfully')
          }
        } catch (error) {
          console.error('❌ Failed to refresh token:', error)
          logout()
        }
      }
    }, 23 * 60 * 60 * 1000) // 23 hours

    // Poll online status every 30 seconds
    const intervalId = setInterval(async () => {
      const userIds = Array.from(new Set(
        Object.keys(useChatStore.getState().messages).map(key => {
          const match = key.match(/^private-(\d+)$/)
          return match ? parseInt(match[1]) : null
        }).filter(Boolean) as number[]
      ))
      
      if (userIds.length > 0) {
        try {
          const statusResponse = await api.getOnlineStatus(userIds)
          if (statusResponse.success && statusResponse.result) {
            setOnlineUsers(statusResponse.result.online_users)
          }
        } catch (error) {
          console.error('Failed to poll online status:', error)
        }
      }
    }, 30000)

    return () => {
      wsClient.disconnect()
      clearInterval(intervalId)
      clearInterval(tokenRefreshInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadInitialData = async () => {
    try {
      console.log('📱 Loading chat data...')
      const chats: any[] = []

      // Load user's friends and joined groups in parallel
      const [profileResponse, friendsResponse] = await Promise.all([
        api.getUserProfile(),
        api.getFriends().catch(() => ({ data: [] })) // Don't fail if friends API errors
      ])
      
      const userGroups = profileResponse.data?.groups || []
      const userFriends = friendsResponse.data || []

      // Add friends to chat list
      if (userFriends.length > 0) {
        console.log(`👥 Loading ${userFriends.length} friends...`)
        userFriends.forEach((friend: any) => {
          chats.push({
            id: friend.id,
            name: friend.username,
            type: 'private',
            unreadCount: 0,
            lastMessage: null,
            lastMessageTime: 0,
          })
        })
      }

      // Load all group details in parallel (much faster)
      if (userGroups.length > 0) {
        console.log(`📦 Loading ${userGroups.length} groups...`)
        const groupPromises = userGroups.map(async (g: any) => {
          try {
            // Only load group details, skip messages for now
            const groupDetail = await api.getStudyGroup(g.group_id)
            if (groupDetail.data) {
              return {
                id: g.group_id,
                name: groupDetail.data.name,
                description: groupDetail.data.description,
                memberCount: groupDetail.data.member_count,
                type: 'group',
                unreadCount: 0,
                lastMessage: null,
                lastMessageTime: 0,
              }
            }
          } catch (error) {
            console.error('Failed to load group:', error)
          }
          return null
        })

        const groupResults = await Promise.all(groupPromises)
        chats.push(...groupResults.filter(Boolean))
      }

      // Load messages in background (lazy load - don't block UI)
      console.log('💬 Loading recent messages in background...')
      setTimeout(async () => {
        // Load group messages
        for (const chat of chats.filter(c => c.type === 'group')) {
          try {
            const groupMessages = await api.getGroupMessages(chat.id)
            const messages = groupMessages.result?.messages || []
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1]
              chat.lastMessage = lastMessage
              chat.lastMessageTime = new Date(lastMessage.created_at).getTime()
              setMessages(`group-${chat.id}`, messages)
              
              // Re-sort and update chats
              const currentChats = useChatStore.getState().chats
              currentChats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
              setChats([...currentChats])
            }
          } catch (error) {
            console.log(`No messages in group ${chat.id}`)
          }
        }

        // Load private messages with friends
        for (const chat of chats.filter(c => c.type === 'private')) {
          try {
            const privateMessages = await api.getPrivateMessages(chat.id)
            const messages = privateMessages.result?.messages || []
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1]
              chat.lastMessage = lastMessage
              chat.lastMessageTime = new Date(lastMessage.created_at).getTime()
              setMessages(`private-${chat.id}`, messages)
              
              // Re-sort and update chats
              const currentChats = useChatStore.getState().chats
              currentChats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
              setChats([...currentChats])
            }
          } catch (error) {
            console.log(`No messages with friend ${chat.id}`)
          }
        }
      }, 100)

      // Initial sort (by join time for now, will update when messages load)
      chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
      
      console.log(`✅ Loaded ${chats.length} chats (groups + friends)`)
      setChats(chats)

      // Load online status for friends
      const friendIds = chats
        .filter(c => c.type === 'private')
        .map(c => c.id)
      
      if (friendIds.length > 0) {
        const statusResponse = await api.getOnlineStatus(friendIds)
        if (statusResponse.success && statusResponse.result) {
          setOnlineUsers(statusResponse.result.online_users)
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      {/* Sidebar */}
      <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-gray-800">{t('chat.title')}</h2>
            <p className="text-sm text-gray-600">{user?.username}</p>
          </div>
        </div>

        {/* Chat List - scrollable */}
        <div className="flex-1 overflow-hidden">
          <ChatList />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  )
}
