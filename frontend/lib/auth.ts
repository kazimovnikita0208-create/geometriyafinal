import { authAPI, User } from './api'
import { syncUserWithSupabase } from './supabase'

/**
 * Получить initData из Telegram WebApp
 * Поддерживает разные форматы данных от Telegram
 */
export function getTelegramInitData(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const tg = (window as any).Telegram?.WebApp
    if (!tg) {
      console.warn('⚠️ Telegram WebApp не доступен')
      return null
    }

    // Приоритет 1: initData как строка (основной способ)
    if (tg.initData && typeof tg.initData === 'string' && tg.initData.length > 0) {
      console.log('✅ Используем initData как строку')
      return tg.initData
    }

    // Приоритет 2: initDataUnsafe с полными данными
    if (tg.initDataUnsafe) {
      const unsafe = tg.initDataUnsafe
      
      // Если есть user и hash, формируем строку
      if (unsafe.user && unsafe.hash) {
        console.log('✅ Формируем initData из initDataUnsafe')
        const params = new URLSearchParams()
        
        // Обязательные поля
        params.set('user', JSON.stringify(unsafe.user))
        params.set('hash', unsafe.hash)
        
        // Опциональные поля
        if (unsafe.auth_date) {
          params.set('auth_date', String(unsafe.auth_date))
        } else {
          // Если нет auth_date, используем текущее время
          params.set('auth_date', String(Math.floor(Date.now() / 1000)))
        }
        
        if (unsafe.query_id) params.set('query_id', unsafe.query_id)
        if (unsafe.chat_instance) params.set('chat_instance', unsafe.chat_instance)
        if (unsafe.chat_type) params.set('chat_type', unsafe.chat_type)
        if (unsafe.start_param) params.set('start_param', unsafe.start_param)
        
        return params.toString()
      }
    }

    console.warn('⚠️ Telegram initData пустой или неполный')
    return null
  } catch (error) {
    console.error('❌ Ошибка получения initData:', error)
    return null
  }
}

/**
 * Инициализация Telegram WebApp и авторизация
 */
export async function initTelegramAuth(): Promise<{ success: boolean; user?: User; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not in browser environment' }
  }

  try {
    // Инициализируем Telegram WebApp
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#5833b6')
      tg.setBackgroundColor('#000000')
    }

    // Проверяем, есть ли уже валидный токен
    const existingToken = localStorage.getItem('token')
    if (existingToken) {
      // Проверяем, не истек ли токен, пытаясь получить данные пользователя
      try {
        const userResponse = await authAPI.getMe()
        if (userResponse.user) {
          localStorage.setItem('user', JSON.stringify(userResponse.user))
          console.log('✅ Токен валиден, пользователь:', userResponse.user.firstName)
          return { success: true, user: userResponse.user }
        }
      } catch (error) {
        // Токен невалиден, удаляем его
        console.warn('⚠️ Токен невалиден, требуется повторная авторизация')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    // Получаем initData
    const initData = getTelegramInitData()
    if (!initData) {
      // В режиме разработки (без Telegram) можно пропустить авторизацию
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Telegram WebApp не доступен (режим разработки)')
        return { success: false, error: 'Telegram WebApp not available (dev mode)' }
      }
      return { success: false, error: 'Telegram initData not available' }
    }

    console.log('🔐 Выполняю авторизацию через Telegram...')
    
    // Отправляем данные на backend для авторизации
    const response = await authAPI.login(initData)
    
    if (response.token && response.user) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      console.log('✅ Авторизация успешна:', {
        id: response.user.id,
        name: response.user.firstName,
        isAdmin: response.user.isAdmin
      })
      
      // Синхронизируем пользователя с Supabase (если настроен)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const tg = (window as any).Telegram?.WebApp
          if (tg?.initDataUnsafe?.user) {
            await syncUserWithSupabase(tg.initDataUnsafe.user)
            console.log('✅ Пользователь синхронизирован с Supabase')
          }
        } catch (error) {
          console.warn('⚠️ Ошибка синхронизации с Supabase:', error)
          // Не прерываем процесс авторизации, если Supabase недоступен
        }
      }
      
      return { success: true, user: response.user }
    }

    return { success: false, error: 'No token received' }
  } catch (error: any) {
    console.error('❌ Ошибка авторизации:', error)
    return { 
      success: false, 
      error: error.message || 'Authentication failed' 
    }
  }
}

/**
 * Получить сохраненного пользователя
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

/**
 * Получить токен авторизации
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

/**
 * Проверить, авторизован ли пользователь
 */
export function isAuthenticated(): boolean {
  return getToken() !== null && getStoredUser() !== null
}

/**
 * Выход из системы
 */
export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    // Пытаемся вызвать logout на сервере (опционально)
    const token = getToken()
    if (token) {
      try {
        await authAPI.logout?.()
      } catch (error) {
        // Игнорируем ошибки при выходе
        console.warn('⚠️ Ошибка при выходе на сервере:', error)
      }
    }
  } finally {
    // Всегда очищаем локальное хранилище
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('✅ Выход выполнен')
  }
}

/**
 * Обновить данные пользователя
 */
export async function refreshUser(): Promise<User | null> {
  try {
    const response = await authAPI.getMe()
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user))
      return response.user
    }
    return null
  } catch (error) {
    console.error('❌ Ошибка обновления данных пользователя:', error)
    return null
  }
}

