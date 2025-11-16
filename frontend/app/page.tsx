'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BeamsBackground } from '@/components/ui/beams-background'
import { GradientButton } from '@/components/ui/gradient-button'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Инициализация Telegram WebApp (если доступен)
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#5833b6')
    }
  }, [])

  const menuItems = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Записаться',
      description: 'Расписание занятий',
      path: '/schedule',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'О направлениях',
      description: 'Pole Dance, Растяжка',
      path: '/directions',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Цены',
      description: 'Абонементы',
      path: '/prices',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Личный кабинет',
      description: 'Мои занятия',
      path: '/profile',
    }
  ]

  const handleNavigate = (path: string) => {
    // Вибрация при клике (если доступна)
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
    router.push(path)
  }

  return (
    <BeamsBackground intensity="medium" className="min-h-screen">
      <main className="min-h-screen relative flex flex-col">
        
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-4xl w-full">
            
            {/* Декоративные треугольники */}
            <div className="hidden md:block absolute top-20 left-10 w-20 h-20 border-2 border-purple-400/20 rotate-45"></div>
            <div className="hidden md:block absolute bottom-20 right-10 w-16 h-16 border-2 border-purple-300/20 rotate-12"></div>
            <div className="hidden md:block absolute top-1/2 right-20 w-12 h-12 border-2 border-purple-500/10 -rotate-12"></div>
            
            {/* Main Content */}
            <div className="text-center space-y-8 sm:space-y-12 animate-fade-in">
              
              {/* Logo Area */}
              <div className="relative w-full flex flex-col items-center space-y-6">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                
                {/* Ваш логотип */}
                <div className="relative flex items-center justify-center">
                  {/* Свечение за логотипом */}
                  <div className="absolute inset-0 bg-purple-400/30 blur-3xl scale-110"></div>
                  
                  {/* Слой логотипа с эффектом */}
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
                    {/* Базовый белый логотип */}
                    <img 
                      src="/logo.svg" 
                      alt="Геометрия" 
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{
                        filter: 'brightness(0) invert(1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                      }}
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl md:text-2xl text-purple-200 font-light tracking-wide px-4">
                  Студия танцев и растяжки
                </p>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-8 sm:mt-12 max-w-3xl mx-auto px-2">
                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <GradientButton
                      onClick={() => handleNavigate(item.path)}
                      className="w-full group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 min-h-[120px] sm:min-h-[140px] rounded-2xl"
                    >
                      <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-5">
                        {/* Icon */}
                        <div className="text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                          {item.icon}
                        </div>
                        
                        {/* Content */}
                        <div className="text-center">
                          <h3 className="text-base sm:text-lg font-bold mb-1 text-white">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-white/80 hidden sm:block">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </GradientButton>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 sm:py-8 px-4 sm:px-6 backdrop-blur-xl bg-white/5 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-purple-200/80">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                <a 
                  href="tel:+7XXXXXXXXXX" 
                  className="hover:text-purple-300 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+7 (XXX) XXX-XX-XX</span>
                </a>
                <a 
                  href="https://instagram.com/geometriya_dance" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-purple-300 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>@geometriya_dance</span>
                </a>
              </div>
              <div className="text-xs text-purple-300/40 hidden sm:block">
                v1.0.0
              </div>
            </div>
          </div>
        </div>

      </main>
    </BeamsBackground>
  )
}
