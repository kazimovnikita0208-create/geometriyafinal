import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Упрощенный middleware без Supabase (так как у нас своя аутентификация через Telegram)
export async function middleware(request: NextRequest) {
  // Просто пропускаем запрос без обработки Supabase
  // Supabase используется только на клиенте, не в middleware
  return NextResponse.next()
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

