import { updateSession } from './utils/supabase/middleware'
import type { NextRequest } from 'next/server'

// Указываем, что middleware должен работать в Edge Runtime
export const runtime = 'edge'

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    // В случае ошибки просто пропускаем запрос
    console.error('Middleware error:', error)
    return new Response(null, {
      status: 200,
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

