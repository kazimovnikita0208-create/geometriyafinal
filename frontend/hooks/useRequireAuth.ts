'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

/**
 * Хук для защиты страниц, требующих авторизации
 * Перенаправляет на главную, если пользователь не авторизован
 */
export function useRequireAuth(redirectTo: string = '/') {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.warn('⚠️ Пользователь не авторизован, перенаправление...')
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, router, redirectTo])

  return { user, isLoading, isAuthenticated }
}

/**
 * Хук для защиты админских страниц
 * Перенаправляет, если пользователь не админ
 */
export function useRequireAdmin(redirectTo: string = '/') {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.warn('⚠️ Пользователь не авторизован, перенаправление...')
        router.push(redirectTo)
      } else if (!user?.isAdmin) {
        console.warn('⚠️ Доступ запрещен: требуется права администратора')
        router.push(redirectTo)
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router, redirectTo])

  return { user, isLoading, isAuthenticated: isAuthenticated && user?.isAdmin }
}

