import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username: string
  email: string
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  setAuth: (token: string, refreshToken: string, user: User) => void
  setUser: (user: User) => void
  updateToken: (token: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user }),
      setUser: (user) => set({ user }),
      updateToken: (token, refreshToken) => set({ token, refreshToken }),
      logout: () => set({ token: null, refreshToken: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
