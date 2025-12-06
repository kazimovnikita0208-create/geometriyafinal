import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    // Проверяем, что переменные окружения установлены
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Если Supabase не настроен, просто пропускаем middleware
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase не настроен, пропускаем middleware')
      return NextResponse.next({
        request,
      })
    }

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Обновление пользовательской сессии (не критично, если не работает)
    try {
      await supabase.auth.getUser()
    } catch (error) {
      // Игнорируем ошибки аутентификации в middleware
      console.warn('Supabase auth check failed in middleware:', error)
    }

    return supabaseResponse
  } catch (error) {
    // В случае любой ошибки просто пропускаем запрос
    console.error('Middleware error:', error)
    return NextResponse.next({
      request,
    })
  }
}

