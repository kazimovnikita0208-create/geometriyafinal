'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'

// Иконки
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const TicketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// Моковые данные для демонстрации
const mockUpcomingLessons = [
  {
    id: 1,
    title: 'Pole Dance',
    date: 'Понедельник, 18 ноября',
    time: '18:00 - 19:30',
    instructor: 'Анна Иванова',
    hall: 'Волгина, 117А'
  },
  {
    id: 2,
    title: 'Растяжка',
    date: 'Среда, 20 ноября',
    time: '19:00 - 20:00',
    instructor: 'Мария Петрова',
    hall: 'Московское шоссе, 43'
  }
]

export default function ProfilePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('Пользователь')
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    // Получаем данные пользователя из Telegram
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      const user = tg.initDataUnsafe?.user
      if (user) {
        setUserName(user.first_name || 'Пользователь')
      }
    }
  }, [])

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ChevronLeftIcon />
                <span>Назад</span>
              </Button>
              <div className="flex-1 flex items-center gap-3">
                {/* Аватар */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-xl sm:text-2xl font-bold border-2 border-purple-400/30">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">
                    {userName}
                  </h1>
                  <p className="text-xs sm:text-sm text-purple-200/70">
                    Личный кабинет
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          
          {/* Абонемент */}
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TicketIcon />
              Мой абонемент
            </h2>
            
            {/* Пустое состояние - нет абонемента */}
            <div className="text-center py-8">
              <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <TicketIcon />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                Абонемент не активен
              </h3>
              <p className="text-sm sm:text-base text-purple-200/70 mb-6 max-w-md mx-auto">
                Купите абонемент, чтобы начать заниматься в нашей студии
              </p>
              <Button
                variant="default"
                onClick={() => router.push('/prices')}
              >
                Посмотреть цены
              </Button>
            </div>

            {/* Активный абонемент (закомментировано для примера) */}
            {/* 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">8</div>
                <div className="text-sm text-purple-200/70">Занятий осталось</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300 mb-1">23</div>
                <div className="text-sm text-purple-200/70">Дня до окончания</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-1">8 занятий</div>
                <div className="text-sm text-purple-200/70">Тип абонемента</div>
              </div>
            </div>
            <div className="text-center text-sm text-purple-200/70">
              Активен до 10 декабря 2024
            </div>
            */}
          </div>

          {/* Мои занятия */}
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <CalendarIcon />
                Мои занятия
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/schedule')}
              >
                Записаться
              </Button>
            </div>
            
            {/* Список занятий */}
            {mockUpcomingLessons.length > 0 ? (
              <div className="space-y-3">
                {mockUpcomingLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-black/30 rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-purple-200/70">
                          <ClockIcon />
                          <span>{lesson.date}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-300 hover:text-white"
                      >
                        <XIcon />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="text-purple-200">
                        <span className="text-purple-200/70">Время:</span> {lesson.time}
                      </div>
                      <div className="text-purple-200">
                        <span className="text-purple-200/70">Зал:</span> {lesson.hall}
                      </div>
                      <div className="text-purple-200 sm:col-span-2">
                        <span className="text-purple-200/70">Инструктор:</span> {lesson.instructor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
                  📝
                </div>
                <p className="text-purple-200/70 mb-4">
                  У вас пока нет записей на занятия
                </p>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/schedule')}
                >
                  Записаться на занятие
                </Button>
              </div>
            )}
          </div>

          {/* Статистика */}
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartIcon />
              Статистика
            </h2>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">12</div>
                <div className="text-sm text-purple-200/70">Посещено</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-300 mb-2">2</div>
                <div className="text-sm text-purple-200/70">Запланировано</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">8</div>
                <div className="text-sm text-purple-200/70">Осталось</div>
              </div>
            </div>
          </div>

          {/* Настройки */}
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6">
              Настройки
            </h2>
            
            <div className="space-y-4">
              {/* Уведомления */}
              <div className="flex items-center justify-between py-3 border-b border-purple-500/20">
                <div>
                  <div className="text-white font-medium mb-1">Уведомления</div>
                  <div className="text-sm text-purple-200/70">
                    Напоминания о занятиях и новости студии
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Контактные данные */}
              <div className="pt-3">
                <Button variant="outline" className="w-full sm:w-auto">
                  Изменить контактные данные
                </Button>
              </div>
            </div>
          </div>

          {/* Контакты */}
          <div className="text-center">
            <div className="inline-block bg-purple-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 px-8 py-6">
              <p className="text-purple-200 mb-3">
                Есть вопросы? Свяжитесь с нами
              </p>
              <div className="space-y-2">
                <a
                  href="tel:+7XXXXXXXXXX"
                  className="block text-lg font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  📞 +7 (XXX) XXX-XX-XX
                </a>
                <a
                  href="https://instagram.com/geometriya_dance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  📸 @geometriya_dance
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </BeamsBackground>
  )
}

