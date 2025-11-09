import { useAuthStore } from '../stores/authStore'
import { useChatStore, Message } from '../stores/chatStore'

// Automatically detect WebSocket URL based on current location
const getWsUrl = () => {
  if (import.meta.env.DEV) {
    return 'ws://localhost:8787/ws'
  }
  // In production, use same host with wss protocol
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

const WS_URL = getWsUrl()

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageHandlers: ((message: any) => void)[] = []

  connect() {
    const { token } = useAuthStore.getState()
    if (!token) {
      console.error('❌ No token available for WebSocket connection')
      console.log('Auth state:', useAuthStore.getState())
      return
    }

    console.log('🔐 Connecting WebSocket with token:', token.substring(0, 20) + '...')
    this.ws = new WebSocket(WS_URL)

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected')
      this.reconnectAttempts = 0

      // Send authentication
      console.log('🔑 Sending auth with token:', token.substring(0, 20) + '...')
      this.send({ type: 'auth', token })
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📩 WebSocket message received:', data.type, data)
        
        if (data.type === 'authenticated') {
          console.log('✅ WebSocket authenticated, User ID:', data.userId)
          this.startHeartbeat()
        } else if (data.type === 'new_message' || data.type === 'new_group_message') {
          console.log('💬 New message received, calling handleNewMessage...')
          this.handleNewMessage(data.message)
        } else if (data.type === 'heartbeat_ack') {
          console.log('💓 Heartbeat acknowledged')
        } else if (data.type === 'error') {
          console.error('❌ WebSocket error:', data.message)
          // If error is about invalid token, logout and redirect
          if (data.message && (data.message.includes('Invalid token') || data.message.includes('Token required'))) {
            console.error('🔐 WebSocket token invalid, logging out...')
            const { logout } = useAuthStore.getState()
            logout()
            window.location.href = '/login'
          }
        } else {
          console.warn('⚠️ Unknown message type:', data.type)
        }

        // Call registered handlers
        this.messageHandlers.forEach(handler => handler(data))
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = () => {
      console.log('❌ WebSocket disconnected')
      this.stopHeartbeat()
      this.attemptReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  sendPrivateMessage(receiverId: number, content: string) {
    this.send({
      type: 'private',
      to: receiverId,
      content,
    })
  }

  sendGroupMessage(groupId: number, content: string) {
    this.send({
      type: 'group',
      to: groupId,
      content,
    })
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'heartbeat' })
    }, 60000) // Every 60 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect()
      }, 2000)
    } else {
      console.error('Max reconnect attempts reached')
    }
  }

  private handleNewMessage(message: Message) {
    const { addMessage, updateOnlineStatus } = useChatStore.getState()
    
    // Add message to the appropriate chat - don't check currentChat to ensure all messages are received
    if (message.receiver_id) {
      // For private messages, determine the chat ID based on who sent it
      const { user } = useAuthStore.getState()
      const chatId = message.sender_id === user?.id 
        ? `private-${message.receiver_id}` 
        : `private-${message.sender_id}`
      console.log('📨 Received private message:', {
        messageId: message.id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        currentUserId: user?.id,
        calculatedChatId: chatId,
        content: message.content
      })
      addMessage(chatId, message)
      
      // Update online status for the sender
      if (message.sender_id !== user?.id) {
        updateOnlineStatus(message.sender_id, true)
      }
    } else if (message.group_id) {
      const chatId = `group-${message.group_id}`
      addMessage(chatId, message)
      
      // Update online status for group message sender
      const { user } = useAuthStore.getState()
      if (message.sender_id !== user?.id) {
        updateOnlineStatus(message.sender_id, true)
      }
    }
  }
}

export const wsClient = new WebSocketClient()
