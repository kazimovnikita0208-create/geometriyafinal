'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'
import { lessonsAPI, Lesson, subscriptionsAPI, Subscription, bookingsAPI, Booking } from '@/lib/api'
import { PoleIcon, FitnessIcon, SparklesIcon, RobotIcon, UserIcon, MapPinIcon, CalendarIcon, LockIcon } from '@/components/ui/icons'

// Иконки
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

export default function SchedulePage() {
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextWeekStr = nextWeek.toISOString().split('T')[0]

      const [lessonsRes, subsRes, bookingsRes] = await Promise.all([
        lessonsAPI.getAll({ from_date: today, to_date: nextWeekStr }),
        subscriptionsAPI.getMy(),
        bookingsAPI.getMy()
      ])

      setLessons(lessonsRes.lessons || [])
      // Показываем только подтверждённые и активные абонементы с доступными занятиями
      setSubscriptions(subsRes.subscriptions.filter((s: Subscription) => 
        s.status === 'confirmed' && s.is_active && s.lessons_remaining > 0
      ))
      setBookings(bookingsRes.bookings || [])
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  // Проверка доступа к занятию
  const canAccessLesson = (lesson: Lesson, subscription: Subscription): { canAccess: boolean; reason?: string } => {
    const requiresPole = lesson.direction_name === 'Pole Fit' || lesson.direction_name === 'Pole Exotic'
    
    // Фитнес-абонемент не может записываться на занятия с пилоном
    if (subscription.category === 'fitness' && requiresPole) {
      return {
        canAccess: false,
        reason: `Ваш абонемент "Только фитнес" не распространяется на ${lesson.direction_name}. Доступны: Сила&Гибкость, Choreo, Strip, Растяжка.`
      }
    }
    
    // Для комбо-абонемента проверяем лимиты
    if (subscription.category === 'combo') {
      if (requiresPole && (subscription.pole_lessons_remaining || 0) <= 0) {
        return {
          canAccess: false,
          reason: `У вас закончились занятия с пилоном. Осталось ${subscription.fitness_lessons_remaining || 0} фитнес-занятий.`
        }
      }
      if (!requiresPole && (subscription.fitness_lessons_remaining || 0) <= 0) {
        return {
          canAccess: false,
          reason: `У вас закончились фитнес-занятия. Осталось ${subscription.pole_lessons_remaining || 0} занятий с пилоном.`
        }
      }
    }
    
    return { canAccess: true }
  }

  const handleBookLesson = (lesson: Lesson) => {
    if (subscriptions.length === 0) {
      alert('У вас нет активных абонементов! Приобретите абонемент.')
      router.push('/prices')
      return
    }
    
    // Проверяем, что абонемент подтверждён
    if (subscriptions[0].status !== 'confirmed') {
      alert('❌ Ваш абонемент ещё не подтверждён администратором. Дождитесь подтверждения для записи на занятия.')
      return
    }
    
    // Проверяем, не является ли это абонементом с автоматической записью
    if (subscriptions[0].booking_type === 'automatic' && (subscriptions[0] as any).auto_lessons) {
      alert('❌ У вас абонемент с автоматической записью. Вы уже записаны на выбранные занятия автоматически. Ручная запись недоступна.')
      return
    }
    
    // Проверяем доступ к занятию
    const accessCheck = canAccessLesson(lesson, subscriptions[0])
    if (!accessCheck.canAccess) {
      alert(`❌ ${accessCheck.reason}`)
      return
    }
    
    setSelectedLesson(lesson)
    setShowModal(true)
  }

  const confirmBooking = async () => {
    if (!selectedLesson || subscriptions.length === 0) return

    try {
      await bookingsAPI.create({
        lesson_id: selectedLesson.id,
        subscription_id: subscriptions[0].id
      })
      
      alert('✅ Вы успешно записаны на занятие!')
      setShowModal(false)
      setSelectedLesson(null)
      
      // Перезагружаем данные
      await loadData()
      
      // Переходим в профиль
      router.push('/profile')
    } catch (error: any) {
      alert(`❌ ${error.message || 'Ошибка записи'}`)
    }
  }

  // Группируем занятия по датам (фильтруем прошедшие)
  const lessonsByDate = lessons.reduce((acc, lesson) => {
    // Дополнительная проверка на клиенте: пропускаем прошедшие занятия
    // Используем локальное время, чтобы избежать смещения дня недели
    const now = new Date()
    const [year, month, day] = lesson.lesson_date.split('-').map(Number)
    const [endHour, endMinute] = lesson.end_time.split(':').map(Number)
    const lessonEndDateTime = new Date(year, month - 1, day, endHour, endMinute)
    
    // Пропускаем, если занятие уже завершилось
    if (lessonEndDateTime < now) {
      return acc
    }
    
    const date = lesson.lesson_date
    if (!acc[date]) acc[date] = []
    acc[date].push(lesson)
    return acc
  }, {} as Record<string, Lesson[]>)

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen relative z-10 pb-20 sm:pb-24">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <ChevronLeftIcon />
                <span className="text-xs sm:text-sm">Назад</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Расписание занятий
                </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          
          {/* Активные абонементы */}
          {subscriptions.length > 0 ? (
            <div className="bg-green-900/30 backdrop-blur-xl rounded-xl border border-green-500/30 p-4 mb-6">
              <p className="text-sm text-green-300 font-semibold mb-1">
                ✓ Ваш абонемент: {subscriptions[0].subscription_name}
              </p>
              {subscriptions[0].category === 'combo' ? (
                <div className="text-xs text-green-200 space-y-1">
                  <p className="flex items-center gap-2">
                    <PoleIcon className="w-4 h-4" />
                    <span>С пилоном: <strong>{subscriptions[0].pole_lessons_remaining || 0}</strong> занятий</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FitnessIcon className="w-4 h-4" />
                    <span>Фитнес: <strong>{subscriptions[0].fitness_lessons_remaining || 0}</strong> занятий</span>
                  </p>
                </div>
              ) : subscriptions[0].category === 'fitness' ? (
                <p className="text-xs text-green-200">
                  <span className="flex items-center gap-2">
                    <FitnessIcon className="w-4 h-4" />
                    <span>Доступно: <strong>{subscriptions[0].lessons_remaining}</strong> фитнес-занятий (Сила&Гибкость, Choreo, Strip, Растяжка)</span>
                  </span>
                </p>
              ) : (
                <p className="text-xs text-green-200">
                  <span className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    <span>Доступно: <strong>{subscriptions[0].lessons_remaining}</strong> занятий на любые направления</span>
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div className="bg-yellow-900/30 backdrop-blur-xl rounded-xl border border-yellow-500/30 p-4 mb-6">
              <p className="text-sm text-yellow-300 font-semibold mb-1">
                ⏳ Нет активных абонементов
              </p>
              <p className="text-xs text-yellow-200">
                Приобретите абонемент или дождитесь подтверждения от администратора
                  </p>
                </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-purple-200 mt-4">Загрузка расписания...</p>
            </div>
          ) : Object.keys(lessonsByDate).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-4xl mx-auto mb-4">
                <CalendarIcon className="w-12 h-12 text-purple-400" />
              </div>
              <p className="text-purple-200 text-lg">Нет доступных занятий</p>
                      </div>
          ) : (
             <div className="space-y-6">
               {Object.entries(lessonsByDate).map(([date, dayLessons]) => {
                 // Создаем дату в локальном времени, чтобы избежать смещения дня недели
                 const [year, month, day] = date.split('-').map(Number)
                 const lessonDate = new Date(year, month - 1, day)
                 const dateStr = lessonDate.toLocaleDateString('ru-RU', { 
                   day: 'numeric', 
                   month: 'long',
                   weekday: 'long'
                 })

                return (
                  <div key={date}>
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                      {dateStr}
                    </h2>
                    
                    <div className="grid gap-3">
                      {dayLessons.map((lesson) => {
                        const availableSpots = lesson.capacity - lesson.current_bookings
                        const isFull = availableSpots <= 0
                        const accessCheck = subscriptions.length > 0 ? canAccessLesson(lesson, subscriptions[0]) : { canAccess: true }
                        const isAccessible = accessCheck.canAccess
                        
                        // Проверяем, записан ли пользователь на это занятие
                        const isBooked = bookings.some(b => b.lesson_id === lesson.id)
                        const isAutoSubscription = subscriptions.length > 0 && subscriptions[0].booking_type === 'automatic' && (subscriptions[0] as any).auto_lessons
                        const isAutoBooked = isBooked && isAutoSubscription
                        // Для автоматических абонементов блокируем ручную запись
                        const isManualBookingDisabled = isAutoSubscription

                        return (
                          <div
                            key={lesson.id}
                            className={`relative backdrop-blur-xl rounded-xl border p-3 sm:p-4 transition-colors ${
                              isAccessible 
                                ? 'bg-purple-900/40 border-purple-500/20 hover:border-purple-400/40' 
                                : 'bg-gray-900/40 border-gray-500/20 opacity-60'
                            } ${isBooked ? 'ring-2 ring-green-500/30' : ''}`}
                          >
                            {/* Индикатор записи */}
                            {isBooked && (
                              <div className="absolute top-2 right-2 z-10">
                                {isAutoBooked ? (
                                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30 font-semibold flex items-center gap-1">
                                  <RobotIcon className="w-4 h-4" />
                                  <span>Авто-запись</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 font-semibold flex items-center gap-1">
                                    <span>✓</span>
                                    <span>Записан</span>
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Индикатор автоматического абонемента */}
                            {isAutoSubscription && !isBooked && (
                              <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30 font-semibold flex items-center gap-1">
                                  <RobotIcon className="w-4 h-4" />
                                  <span>Автомат</span>
                                </span>
                              </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <div className="px-2.5 sm:px-3 py-1 bg-purple-600/30 rounded-full">
                                    <span className="text-xs sm:text-sm font-bold text-white">
                                      {lesson.start_time} - {lesson.end_time}
                                    </span>
                                  </div>
                                  <div className={`px-2.5 sm:px-3 py-1 rounded-full ${
                                    isFull 
                                      ? 'bg-red-500/20 text-red-300' 
                                      : 'bg-green-500/20 text-green-300'
                                  }`}>
                                    <span className="text-xs font-bold">
                                      {availableSpots} мест
                                    </span>
                                  </div>
                  </div>

                                <h3 className="text-base sm:text-lg font-bold text-white mb-2 break-words">
                                  {lesson.direction_name}
                                </h3>

                                <div className="space-y-1 text-xs sm:text-sm text-purple-200/70">
                                  <p className="flex items-center gap-2">
                                    <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{lesson.trainer_name}</span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <MapPinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{lesson.hall_name}</span>
                                  </p>
                                  {lesson.description && (
                                    <p className="text-xs mt-2 line-clamp-2">{lesson.description}</p>
                                  )}
                  </div>
                </div>

                <Button
                                onClick={() => !isBooked && !isManualBookingDisabled && handleBookLesson(lesson)}
                                disabled={isBooked || isFull || subscriptions.length === 0 || !isAccessible || isManualBookingDisabled}
                                className={`w-full sm:w-auto min-h-[44px] text-sm sm:text-base ${
                                  isBooked 
                                    ? 'bg-green-600/50 cursor-default' 
                                    : isManualBookingDisabled
                                    ? 'bg-gray-600/50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={
                                  !isAccessible ? accessCheck.reason 
                                  : isBooked ? 'Вы уже записаны' 
                                  : isManualBookingDisabled ? 'У вас абонемент с автоматической записью. Ручная запись недоступна.'
                                  : ''
                                }
                              >
                                {isBooked ? '✓ Вы записаны' 
                                 : isManualBookingDisabled ? (
                                   <span className="flex items-center gap-1">
                                     <RobotIcon className="w-4 h-4" />
                                     <span>Автомат</span>
                                   </span>
                                 )
                                 : isFull ? 'Занято' 
                                 : !isAccessible ? (
                                   <span className="flex items-center gap-1">
                                     <LockIcon className="w-4 h-4" />
                                     <span>Недоступно</span>
                                   </span>
                                 ) 
                                 : 'Записаться'}
                </Button>
              </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          </div>

        {/* Модальное окно подтверждения */}
        {showModal && selectedLesson && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-gradient-to-br from-purple-900 to-black rounded-t-3xl md:rounded-3xl max-w-md w-full border border-purple-500/30 p-4 sm:p-6 max-h-[90vh] md:max-h-[85vh] flex flex-col">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Подтверждение записи</h2>
              
              <div className="space-y-3 mb-6">
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-sm text-purple-200/70">Занятие</p>
                  <p className="text-lg font-bold text-white">{selectedLesson.direction_name}</p>
        </div>
                
                 <div className="bg-black/30 rounded-lg p-3">
                   <p className="text-sm text-purple-200/70">Дата и время</p>
                   <p className="text-white">
                     {(() => {
                       const [year, month, day] = selectedLesson.lesson_date.split('-').map(Number)
                       return new Date(year, month - 1, day).toLocaleDateString('ru-RU')
                     })()}
                   </p>
                  <p className="text-white">
                    {selectedLesson.start_time} - {selectedLesson.end_time}
                  </p>
      </div>

                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-sm text-purple-200/70">Зал и тренер</p>
                  <p className="text-white">{selectedLesson.hall_name}</p>
                  <p className="text-white">{selectedLesson.trainer_name}</p>
            </div>

                {subscriptions.length > 0 && (
                  <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                    <p className="text-sm text-green-300">
                      После записи останется: <strong>{subscriptions[0].lessons_remaining - 1}</strong> занятий
                    </p>
                  </div>
                )}
            </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={confirmBooking}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 min-h-[44px] text-sm sm:text-base"
                >
                  Подтвердить
                </Button>
              <Button
                variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedLesson(null)
                  }}
                  className="flex-1 min-h-[44px] text-sm sm:text-base"
                >
                  Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </BeamsBackground>
  )
}
