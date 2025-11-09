import { useAuthStore } from '../stores/authStore'

// In production, API is on same origin; in dev, use proxy
const API_BASE = import.meta.env.VITE_API_BASE || ''

class ApiClient {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (includeAuth) {
      const { token } = useAuthStore.getState()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('🔑 Using token for API request:', token.substring(0, 20) + '...')
      } else {
        console.warn('⚠️ No token available for authenticated request')
        console.log('Auth state:', useAuthStore.getState())
      }
    }
    
    return headers
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    silentAuth = false // If true, don't logout on 401
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(endpoint !== '/api/auth/login' && endpoint !== '/api/auth/register'),
        ...options.headers,
      },
    })

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // For optional/silent requests, just throw error without logout
        if (silentAuth) {
          console.warn('⚠️ Auth failed for optional request (silentAuth=true):', endpoint)
          console.log('👍 Not logging out user for optional request')
          throw new Error('Unauthorized')
        }
        
        // For critical requests, logout and redirect
        console.error('🔐 Token expired or invalid for CRITICAL request, logging out...')
        console.error('❌ Endpoint that triggered logout:', endpoint)
        const { logout } = useAuthStore.getState()
        logout()
        // Redirect to login page
        window.location.href = '/login'
        throw new Error('Session expired. Please login again.')
      }

      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async login(username: string, password: string) {
    return this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email: username, password }),
    })
  }

  async register(data: { username: string; email: string; password: string }) {
    return this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request<any>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  // Messages
  async getPrivateMessages(peerId: number, limit = 50, offset = 0) {
    return this.request<any>(`/api/messages/user/${peerId}?limit=${limit}&offset=${offset}`)
  }

  async getGroupMessages(groupId: number, limit = 50, offset = 0) {
    return this.request<any>(`/api/messages/group/${groupId}?limit=${limit}&offset=${offset}`)
  }

  async sendPrivateMessage(receiverId: number, content: string) {
    return this.request<any>('/api/messages/user', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content }),
    })
  }

  async sendGroupMessage(groupId: number, content: string) {
    return this.request<any>('/api/messages/group', {
      method: 'POST',
      body: JSON.stringify({ group_id: groupId, content }),
    })
  }

  async getOnlineStatus(userIds: number[]) {
    return this.request<any>(`/api/messages/online?user_ids=${userIds.join(',')}`)
  }

  // Groups (Old endpoints - kept for compatibility)
  async getGroups() {
    return this.request<any>('/api/groups')
  }

  async getGroup(groupId: number) {
    return this.request<any>(`/api/groups/${groupId}`)
  }

  // Study Groups (New endpoints)
  async getStudyGroups() {
    const response = await this.request<any>('/api/groups')
    const groups = response.result || response.data || []
    // Convert is_private to is_public for frontend
    return { 
      data: groups.map((g: any) => ({
        ...g,
        is_public: !g.is_private
      }))
    }
  }

  async getStudyGroup(groupId: string) {
    const response = await this.request<any>(`/api/groups/${groupId}`)
    const group = response.result || response.data
    // Convert is_private to is_public for frontend
    return { 
      data: {
        ...group,
        is_public: !group.is_private
      }
    }
  }

  async createStudyGroup(data: {
    name: string
    description?: string
    max_members?: number
    is_public?: boolean
  }) {
    const user = useAuthStore.getState().user
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const requestData = {
      name: data.name,
      description: data.description,
      is_private: !data.is_public,
      created_by_user_id: user.id
    }

    const response = await this.request<any>('/api/groups', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
    return { data: response.result || response.data }
  }

  async updateStudyGroup(groupId: string, data: {
    name?: string
    description?: string
    max_members?: number
    is_public?: boolean
  }) {
    const requestData: any = {}
    if (data.name) requestData.name = data.name
    if (data.description !== undefined) requestData.description = data.description
    if (data.is_public !== undefined) requestData.is_private = !data.is_public

    const response = await this.request<any>(`/api/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    })
    return { data: response.result || response.data }
  }

  async deleteStudyGroup(groupId: string) {
    const response = await this.request<any>(`/api/groups/${groupId}`, {
      method: 'DELETE',
    })
    return { data: response.result || response.data }
  }

  async joinStudyGroup(groupId: string) {
    const user = useAuthStore.getState().user
    if (!user) {
      throw new Error('User not authenticated')
    }

    const response = await this.request<any>(`/api/groups/${groupId}/join`, {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id }),
    })
    return { data: response.result || response.data }
  }

  async leaveStudyGroup(groupId: string) {
    const user = useAuthStore.getState().user
    if (!user) {
      throw new Error('User not authenticated')
    }

    const response = await this.request<any>(`/api/groups/${groupId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id }),
    })
    return { data: response.result || response.data }
  }

  async getStudyGroupMembers(groupId: string) {
    const group = await this.getStudyGroup(groupId)
    const members = group.data.members || []
    // Convert user_id to id for frontend compatibility
    return { 
      data: members.map((m: any) => ({
        ...m,
        id: m.user_id || m.id
      }))
    }
  }

  async manageStudyGroupMember(groupId: string, userId: string, action: 'promote' | 'demote' | 'remove') {
    return this.request<any>(`/api/groups/${groupId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    })
  }

  // Users
  async getUsers() {
    return this.request<any>('/api/users')
  }

  async getUserProfile(userId?: number) {
    const endpoint = userId ? `/api/users/${userId}/profile` : '/api/users/profile'
    const response = await this.request<any>(endpoint)
    return { data: response.result || response.data || response }
  }

  async updateUserProfile(data: {
    username?: string
    email?: string
    bio?: string
    avatar_url?: string
    goals?: string
    study_preference?: string
  }) {
    const response = await this.request<any>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return { data: response.result || response.data || response }
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request<any>('/api/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    })
  }

  // Friends
  async getFriends() {
    const response = await this.request<any>('/api/friends', {}, true) // silentAuth = true
    return { data: response.data || [] }
  }

  async getFriendRequests() {
    const response = await this.request<any>('/api/friends/requests', {}, true) // silentAuth = true
    return { data: response.data || { received: [], sent: [] } }
  }

  async sendFriendRequest(friendId: number) {
    const response = await this.request<any>('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ friend_id: friendId }),
    }, true) // silentAuth = true
    return { data: response.data }
  }

  async acceptFriendRequest(requestId: number) {
    const response = await this.request<any>(`/api/friends/${requestId}/accept`, {
      method: 'POST',
    }, true) // silentAuth = true
    return { data: response.data }
  }

  async rejectFriendRequest(requestId: number) {
    const response = await this.request<any>(`/api/friends/${requestId}/reject`, {
      method: 'POST',
    }, true) // silentAuth = true
    return { success: response.success }
  }

  async removeFriend(userId: number) {
    const response = await this.request<any>(`/api/friends/${userId}`, {
      method: 'DELETE',
    }, true) // silentAuth = true
    return { success: response.success }
  }

  async checkFriendStatus(userId: number) {
    // Check if user is friend by fetching friends list
    const friends = await this.getFriends()
    const isFriend = friends.data.some((f: any) => f.id === userId)
    
    if (isFriend) {
      return { status: 'accepted' }
    }

    // Check pending requests
    const requests = await this.getFriendRequests()
    const sentRequest = requests.data.sent.find((r: any) => r.friend_id === userId)
    if (sentRequest) {
      return { status: 'pending_sent', requestId: sentRequest.id }
    }

    const receivedRequest = requests.data.received.find((r: any) => r.user_id === userId)
    if (receivedRequest) {
      return { status: 'pending_received', requestId: receivedRequest.id }
    }

    return { status: 'none' }
  }

  // Get matched users (for discovery page)
  async getMatchedUsers(limit = 20): Promise<any> {
    // First get current user profile to get user ID
    const profile = await this.getUserProfile()
    const userId = profile.data?.id
    
    if (!userId) {
      throw new Error('User ID not found')
    }
    
    // Call smart match algorithm
    return this.request<any>(`/api/search/smart?user_id=${userId}&limit=${limit}&min_score=0`)
  }
}

export const api = new ApiClient()
