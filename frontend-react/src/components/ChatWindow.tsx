import { useState, useEffect, useRef, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useChatStore, Message } from '../stores/chatStore'
import { api } from '../services/api'
import { wsClient } from '../services/websocket'

interface GroupMember {
  id: string
  username: string
  email: string
  role: string
}

interface FriendStatus {
  [userId: string]: 'loading' | 'accepted' | 'pending_sent' | 'pending_received' | 'none'
}

export default function ChatWindow() {
  const { t } = useTranslation()
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [friendStatus, setFriendStatus] = useState<FriendStatus>({})
  const [showMembers, setShowMembers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAuthStore()
  const { currentChat, messages, setMessages, onlineUsers } = useChatStore()

  const chatId = currentChat 
    ? `${currentChat.type}-${currentChat.id}`
    : null

  // Get current chat messages - this will cause re-render when messages change
  const currentMessages = chatId ? messages[chatId] || [] : []
  
  // Get online status from onlineUsers store
  const isOnline = currentChat?.type === 'private' && currentChat?.id ? onlineUsers[currentChat.id] : false

  useEffect(() => {
    if (currentChat) {
      console.log('🔄 Loading messages for chat:', chatId)
      loadMessages()
      
      // Load group members if it's a group chat
      if (currentChat.type === 'group') {
        loadGroupMembers()
      } else {
        setGroupMembers([])
        setFriendStatus({})
      }
    }
  }, [currentChat])

  // Load friend statuses only when sidebar is shown
  useEffect(() => {
    if (showMembers && groupMembers.length > 0 && user) {
      loadFriendStatuses(groupMembers)
    }
  }, [showMembers, groupMembers.length])
  
  const loadGroupMembers = async () => {
    if (!currentChat || currentChat.type !== 'group') return
    
    try {
      const response = await api.getStudyGroupMembers(String(currentChat.id))
      if (response.data) {
        setGroupMembers(response.data)
        // Don't load friend statuses here - wait until sidebar is shown
      }
    } catch (error) {
      console.error('Failed to load group members:', error)
    }
  }

  const loadFriendStatuses = async (members: GroupMember[]) => {
    if (!user) {
      console.log('No user logged in, skipping friend status check')
      return
    }
    
    try {
      // First, get all friends and requests in bulk (more efficient)
      const [friendsResponse, requestsResponse] = await Promise.all([
        api.getFriends().catch(() => ({ data: [] })),
        api.getFriendRequests().catch(() => ({ data: { received: [], sent: [] } }))
      ])

      const friends = friendsResponse.data || []
      const requests = requestsResponse.data || { received: [], sent: [] }

      // Build status map
      const statuses: FriendStatus = {}
      for (const member of members) {
        if (member.id === String(user.id)) continue // Skip self

        const memberId = parseInt(member.id)
        
        // Check if friend
        if (friends.some((f: any) => f.id === memberId)) {
          statuses[member.id] = 'accepted'
          continue
        }

        // Check sent requests
        if (requests.sent.some((r: any) => r.friend_id === memberId)) {
          statuses[member.id] = 'pending_sent'
          continue
        }

        // Check received requests
        if (requests.received.some((r: any) => r.user_id === memberId)) {
          statuses[member.id] = 'pending_received'
          continue
        }

        // Not friend
        statuses[member.id] = 'none'
      }

      setFriendStatus(statuses)
    } catch (error) {
      console.error('Failed to load friend statuses:', error)
      // Set all to 'none' on error
      const statuses: FriendStatus = {}
      for (const member of members) {
        if (member.id !== String(user.id)) {
          statuses[member.id] = 'none'
        }
      }
      setFriendStatus(statuses)
    }
  }

  const handleAddFriend = async (memberId: string) => {
    try {
      await api.sendFriendRequest(parseInt(memberId))
      setFriendStatus(prev => ({
        ...prev,
        [memberId]: 'pending_sent'
      }))
      alert('好友请求已发送')
    } catch (error) {
      console.error('Failed to send friend request:', error)
      alert('发送好友请求失败')
    }
  }

  const handleStartPrivateChat = (member: GroupMember) => {
    const memberId = parseInt(member.id)
    const { chats, setChats, setCurrentChat } = useChatStore.getState()
    
    // Check if chat already exists
    const existingChat = chats.find(c => c.type === 'private' && c.id === memberId)
    
    if (!existingChat) {
      // Add new chat to the list
      const newChat = {
        type: 'private' as const,
        id: memberId,
        name: member.username,
        unreadCount: 0
      }
      setChats([newChat, ...chats])
      setCurrentChat(newChat)
    } else {
      // Switch to existing chat
      setCurrentChat(existingChat)
    }
  }

  useEffect(() => {
    console.log('📊 Messages updated for chat:', chatId, 'Count:', currentMessages.length)
    scrollToBottom()
  }, [currentMessages, chatId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!currentChat) return
    setLoading(true)

    try {
      let response
      if (currentChat.type === 'private') {
        response = await api.getPrivateMessages(currentChat.id)
      } else {
        response = await api.getGroupMessages(currentChat.id)
      }

      if (response.success && response.result) {
        const chatId = `${currentChat.type}-${currentChat.id}`
        setMessages(chatId, response.result.messages.reverse())
        // Scroll to bottom after messages are loaded
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
        }, 100)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentChat) return

    const content = newMessage.trim()
    setNewMessage('')

    try {
      // Only send via WebSocket, don't call API to avoid duplicate messages
      // WebSocket will handle the message delivery and the server will broadcast it back
      if (currentChat.type === 'private') {
        wsClient.sendPrivateMessage(currentChat.id, content)
      } else {
        wsClient.sendGroupMessage(currentChat.id, content)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('chat.startConversation')}
          </h3>
          <p className="text-gray-500">
            {t('chat.selectChat')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex h-full">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                currentChat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
              }`}>
                {currentChat.type === 'group' ? '👥' : currentChat.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{currentChat.name}</h3>
                <p className="text-sm text-gray-500">
                  {currentChat.type === 'group' 
                    ? `👥 ${currentChat.memberCount || 0} ${t('chat.members')}`
                    : isOnline ? t('chat.online') : t('chat.offline')
                  }
                </p>
              </div>
            </div>
            {currentChat.type === 'group' && (
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {showMembers ? '隐藏成员' : '显示成员'}
              </button>
            )}
          </div>
        </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar min-h-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {currentMessages.map((message: Message) => {
              const isMine = message.sender_id === user?.id
              return (
                <div
                  key={message.id}
                  className={`flex mb-4 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isMine ? 'order-2' : 'order-1'}`}>
                    {!isMine && currentChat.type === 'group' && (
                      <p className="text-xs text-gray-500 mb-1 px-3">
                        {message.sender_username}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isMine
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isMine ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('chat.typeMessage')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('chat.send')}
            </button>
          </div>
        </form>
      </div>

      {/* Group Members Sidebar */}
      {currentChat.type === 'group' && showMembers && (
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">
              群成员 ({groupMembers.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {groupMembers.map((member) => {
              const isMe = member.id === String(user?.id)
              const status = friendStatus[member.id]
              
              return (
                <div
                  key={member.id}
                  className="p-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {member.username}
                        {isMe && <span className="ml-1 text-xs text-gray-500">(我)</span>}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.role === 'owner' ? '👑 群主' : 
                         member.role === 'admin' ? '⭐ 管理员' : '👤 成员'}
                      </p>
                    </div>
                  </div>
                  
                  {!isMe && (
                    <div className="flex gap-2 mt-2">
                      {status === 'accepted' ? (
                        <button
                          onClick={() => handleStartPrivateChat(member)}
                          className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          💬 私聊
                        </button>
                      ) : status === 'pending_sent' ? (
                        <button
                          disabled
                          className="flex-1 px-2 py-1 text-xs bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                        >
                          ⏳ 已发送
                        </button>
                      ) : status === 'pending_received' ? (
                        <button
                          disabled
                          className="flex-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded cursor-not-allowed"
                        >
                          待接受
                        </button>
                      ) : status === 'loading' ? (
                        <button
                          disabled
                          className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-400 rounded cursor-not-allowed"
                        >
                          加载中...
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAddFriend(member.id)}
                            className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            ➕ 加好友
                          </button>
                          <button
                            onClick={() => handleStartPrivateChat(member)}
                            className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            💬 私聊
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
