'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'

// Вынесли иконки наружу - создаются один раз
const CalendarIcon = () => (
  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const BoltIcon = () => (
  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const DollarIcon = () => (
  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const HomeIcon = () => (
  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

// Вынесли menuItems наружу - создаются один раз
const MENU_ITEMS = [
  {
    Icon: CalendarIcon,
    title: 'Записаться',
    description: 'Расписание занятий',
    path: '/schedule',
  },
  {
    Icon: BoltIcon,
    title: 'О направлениях',
    description: 'Наши программы',
    path: '/directions',
  },
  {
    Icon: HomeIcon,
    title: 'Аренда',
    description: 'Залы и пилоны',
    path: '/rental',
  },
  {
    Icon: DollarIcon,
    title: 'Абонемент',
    description: 'Выбрать тариф',
    path: '/prices',
  },
]

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Инициализация Telegram WebApp (если доступен)
    // Авторизация теперь происходит автоматически через AuthProvider
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#5833b6')
      tg.setBackgroundColor('#000000')
    }
  }, [])

  // Мемоизируем handleNavigate
  const handleNavigate = useCallback((path: string) => {
    // Вибрация при клике (если доступна)
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
    router.push(path)
  }, [router])

  return (
    <BeamsBackground intensity="medium">
      <main className="min-h-screen relative flex flex-col z-10">
        
        {/* Hero Section - Responsive для всех устройств */}
        <div className="flex-1 flex items-center justify-center px-3 sm:px-6 py-4 sm:py-12">
          <div className="max-w-4xl w-full">
            
            {/* Main Content */}
            <div className="text-center space-y-4 sm:space-y-6">
              
              {/* Logo Area */}
              <div className="relative w-full flex flex-col items-center space-y-3 sm:space-y-6">
                {/* Сам логотип - адаптивный размер */}
                <img 
                  src="/logo.svg" 
                  alt="Геометрия" 
                  className="w-20 h-20 sm:w-32 sm:h-32 object-contain cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    filter: 'brightness(0) invert(1)'
                  }}
                  onClick={() => router.push('/admin')}
                  title="Админ-панель"
                />

                {/* Subtitle - адаптивный размер */}
                <p className="text-sm sm:text-lg text-purple-200 font-light tracking-wide">
                  Студия танцев и фитнеса на пилоне
                </p>
              </div>

              {/* Menu Grid - Responsive: 1 колонка на мобильных, 2 на больших экранах */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mt-6 sm:mt-8 pb-20 sm:pb-24">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.Icon
                  return (
                    <Button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      variant="secondary"
                      className="h-auto min-h-[90px] sm:min-h-[140px] rounded-lg sm:rounded-xl w-full"
                    >
                      <div className="flex flex-col items-center justify-center text-center p-3 sm:p-6 w-full">
                        {/* Icon - сверху */}
                        <div className="text-white mb-2 sm:mb-3">
                          <Icon />
                        </div>
                        
                        {/* Content - снизу */}
                        <div>
                          <h3 className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-white/70">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>

            </div>
          </div>
        </div>

        {/* Footer - адаптивный */}
        <div className="py-4 sm:py-6 px-4 sm:px-6 bg-black/40 border-t border-purple-500/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-2 sm:gap-3 text-xs sm:text-sm text-purple-200/80">
              <a 
                href="tel:+7XXXXXXXXXX" 
                className="hover:text-purple-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+7 (XXX) XXX-XX-XX</span>
              </a>
              <a 
                href="https://vk.com/geometria163" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-purple-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.441 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.711 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.78 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                </svg>
                <span>geometria163</span>
              </a>
            </div>
          </div>
        </div>

      </main>
    </BeamsBackground>
  )
}
