/**
 * Утилиты для работы с Supabase
 * Интеграция с существующей системой аутентификации через Telegram
 */

import { createClient } from '@/utils/supabase/client'

/**
 * Получить клиент Supabase для клиентских компонентов
 */
export function getSupabaseClient() {
  return createClient()
}

/**
 * Проверить, авторизован ли пользователь в Supabase
 * (используется как дополнительная проверка к Telegram auth)
 */
export async function checkSupabaseAuth() {
  try {
    const supabase = getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Supabase auth error:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error checking Supabase auth:', error)
    return null
  }
}

/**
 * Синхронизировать пользователя Telegram с Supabase
 * Создает или обновляет пользователя в Supabase на основе данных Telegram
 */
export async function syncUserWithSupabase(telegramUser: {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  phone?: string
}) {
  try {
    // Проверяем, настроен ли Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('ℹ️ Supabase не настроен, пропускаем синхронизацию')
      return null
    }

    const supabase = getSupabaseClient()
    
    // Проверяем, существует ли пользователь в Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id.toString())
      .maybeSingle()
    
    // Игнорируем ошибку "not found" - это нормально для нового пользователя
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user from Supabase:', fetchError)
      return null
    }
    
    const userData = {
      telegram_id: telegramUser.id.toString(),
      username: telegramUser.username || null,
      first_name: telegramUser.first_name || null,
      last_name: telegramUser.last_name || null,
      phone: telegramUser.phone || null,
      updated_at: new Date().toISOString(),
    }
    
    if (existingUser) {
      // Обновляем существующего пользователя
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('telegram_id', telegramUser.id.toString())
        .select()
        .single()
      
      if (error) {
        console.error('Error updating user in Supabase:', error)
        return null
      }
      
      return data
    } else {
      // Создаем нового пользователя
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating user in Supabase:', error)
        return null
      }
      
      return data
    }
  } catch (error) {
    console.error('Error syncing user with Supabase:', error)
    return null
  }
}

/**
 * Получить данные пользователя из Supabase по Telegram ID
 */
export async function getUserFromSupabase(telegramId: number) {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId.toString())
      .single()
    
    if (error) {
      console.error('Error fetching user from Supabase:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error getting user from Supabase:', error)
    return null
  }
}

