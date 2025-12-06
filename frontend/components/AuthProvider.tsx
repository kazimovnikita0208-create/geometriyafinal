'use client'

import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { initTelegramAuth, getStoredUser } from '@/lib/auth'
import { User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshAuth: async () => {}
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAuth = async () => {
    try {
      setIsLoading(true)
      const result = await initTelegramAuth()
      
      if (result.success && result.user) {
        setUser(result.user)
      } else {
        // Если авторизация не удалась, проверяем сохраненного пользователя
        const storedUser = getStoredUser()
        setUser(storedUser)
      }
    } catch (error) {
      console.error('❌ Ошибка обновления авторизации:', error)
      const storedUser = getStoredUser()
      setUser(storedUser)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Инициализация при монтировании компонента
    refreshAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

