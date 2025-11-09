import { useTranslation } from 'react-i18next'
import { useChatStore } from '../stores/chatStore'

export default function ChatList() {
  const { t } = useTranslation()
  const { chats, currentChat, setCurrentChat, onlineUsers, messages } = useChatStore()

  // Sort chats by last message time
  const sortedChats = [...chats].sort((a, b) => {
    const aKey = `${a.type}-${a.id}`
    const bKey = `${b.type}-${b.id}`
    const aMessages = messages[aKey] || []
    const bMessages = messages[bKey] || []
    const aLastTime = aMessages.length > 0 ? new Date(aMessages[aMessages.length - 1].created_at).getTime() : 0
    const bLastTime = bMessages.length > 0 ? new Date(bMessages[bMessages.length - 1].created_at).getTime() : 0
    return bLastTime - aLastTime
  })

  const renderChatItem = (chat: any) => {
    const isOnline = chat.type === 'private' && onlineUsers[chat.id]
    const isActive = currentChat?.id === chat.id && currentChat?.type === chat.type
    
    // Get last message
    const chatKey = `${chat.type}-${chat.id}`
    const chatMessages = messages[chatKey] || []
    const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null
    
    return (
      <button
        key={`${chat.type}-${chat.id}`}
        onClick={() => setCurrentChat(chat)}
        className={`w-full p-3 rounded-lg mb-2 text-left transition-colors ${
          isActive
            ? 'bg-blue-50 border border-blue-200'
            : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
              chat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
            }`}>
              {chat.type === 'group' ? '👥' : chat.name[0].toUpperCase()}
            </div>
            {chat.type === 'private' && isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-800 truncate">
                {chat.name}
              </h3>
              {lastMessage && (
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                  {new Date(lastMessage.created_at).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 truncate flex-1">
                {lastMessage ? (
                  <>
                    {chat.type === 'group' && lastMessage.sender_username && (
                      <span className="font-medium">{lastMessage.sender_username}: </span>
                    )}
                    {lastMessage.content}
                  </>
                ) : (
                  chat.type === 'group' 
                    ? `👥 ${chat.memberCount || 0} ${t('chat.members')}`
                    : (isOnline ? t('chat.online') : t('chat.offline'))
                )}
              </p>
              {chat.unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full flex-shrink-0">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-2">
        {sortedChats.map(renderChatItem)}

        {chats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>{t('chat.noMessages')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
