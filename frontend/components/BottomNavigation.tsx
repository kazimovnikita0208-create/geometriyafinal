'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

// Иконки для навигации
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
    />
  </svg>
)

const CalendarIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
    />
  </svg>
)

const UserIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
    />
  </svg>
)

const NAV_ITEMS = [
  {
    Icon: HomeIcon,
    label: 'Главный',
    path: '/',
  },
  {
    Icon: CalendarIcon,
    label: 'Записаться',
    path: '/schedule',
  },
  {
    Icon: UserIcon,
    label: 'Кабинет',
    path: '/profile',
  },
]

export default function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigate = useCallback((path: string) => {
    // Вибрация при клике (если доступна)
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
    router.push(path)
  }, [router])

  // Определяем активный путь
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path)
  }

  // Скрываем панель на странице админки
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t border-purple-500/30 shadow-lg safe-area-inset-bottom" style={{ 
      background: 'linear-gradient(to top, rgba(26, 11, 46, 0.98), rgba(45, 27, 78, 0.98), rgba(26, 11, 46, 0.98))',
      backdropFilter: 'blur(12px)'
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-around px-2 py-2 sm:py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.Icon
            const active = isActive(item.path)
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`
                  flex flex-col items-center justify-center gap-0.5 sm:gap-1 
                  px-2 sm:px-4 py-2 rounded-lg transition-all duration-200
                  min-w-[60px] sm:min-w-[80px] md:min-w-[100px]
                  min-h-[44px] sm:min-h-[50px]
                  touch-manipulation
                  ${active 
                    ? 'text-white bg-purple-500/30 scale-105' 
                    : 'text-purple-300/70 hover:text-purple-200 hover:bg-purple-500/10 active:bg-purple-500/20'
                  }
                `}
              >
                <Icon active={active} />
                <span className={`text-[10px] sm:text-xs md:text-sm font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

