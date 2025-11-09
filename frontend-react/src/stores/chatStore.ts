import { create } from 'zustand'

export interface Message {
  id: number
  sender_id: number
  receiver_id?: number
  group_id?: number
  content: string
  created_at: string
  sender_username?: string
  is_online?: boolean
}

export interface Chat {
  id: number
  name: string
  type: 'private' | 'group'
  email?: string  // For private chats
  description?: string  // For groups
  memberCount?: number  // For groups
  lastMessage?: Message
  lastMessageTime?: number  // Timestamp for sorting
  unreadCount: number
  isOnline?: boolean
}

interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Record<string, Message[]>
  onlineUsers: Record<number, boolean>
  
  setChats: (chats: Chat[]) => void
  setCurrentChat: (chat: Chat | null) => void
  addMessage: (chatId: string, message: Message) => void
  setMessages: (chatId: string, messages: Message[]) => void
  updateOnlineStatus: (userId: number, isOnline: boolean) => void
  setOnlineUsers: (users: Record<number, boolean>) => void
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  currentChat: null,
  messages: {},
  onlineUsers: {},
  
  setChats: (chats) => set({ chats }),
  setCurrentChat: (chat) => set({ currentChat: chat }),
  
  addMessage: (chatId, message) =>
    set((state) => {
      const existingMessages = state.messages[chatId] || []
      // Prevent duplicate messages by checking if message with same ID exists
      if (existingMessages.some(m => m.id === message.id)) {
        console.log('⚠️ Duplicate message detected, skipping:', message.id)
        return state
      }
      console.log('✅ Adding message to store:', chatId, message)
      console.log('📊 Current messages count:', existingMessages.length, '→', existingMessages.length + 1)
      return {
        messages: {
          ...state.messages,
          [chatId]: [...existingMessages, message],
        },
      }
    }),
  
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),
  
  updateOnlineStatus: (userId, isOnline) =>
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: isOnline,
      },
    })),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}))
