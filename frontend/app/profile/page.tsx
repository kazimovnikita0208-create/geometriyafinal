'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'
import api, { subscriptionsAPI, Subscription, bookingsAPI, Booking, RentalBooking, rentalAPI } from '@/lib/api'
import { SubscriptionCard } from '@/components/SubscriptionCard'
import { initTelegramAuth } from '@/lib/auth'

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

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

// Убраны моковые данные - используем только реальные из API

export default function ProfilePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('Пользователь')
  const [notifications, setNotifications] = useState(true)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [allBookingsLoading, setAllBookingsLoading] = useState(false)
  const [rentalBookingsLoading, setRentalBookingsLoading] = useState(false)
  const [showAllBookingsModal, setShowAllBookingsModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')

  useEffect(() => {
    // Получаем данные пользователя из Telegram
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      const user = tg.initDataUnsafe?.user
      if (user) {
        setUserName(user.first_name || 'Пользователь')
      }
    }

    // Загружаем абонементы, записи и аренду пользователя
    loadSubscriptions()
    loadBookings()
    loadRentalBookings()
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      
      // В режиме разработки просто загружаем абонементы без проверки авторизации
      const response = await subscriptionsAPI.getMy()
      setSubscriptions(response.subscriptions)
      console.log('✅ Загружено абонементов:', response.subscriptions.length)
    } catch (error) {
      console.error('❌ Ошибка загрузки абонементов:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      setBookingsLoading(true)
      const response = await bookingsAPI.getMy()
      setBookings(response.bookings)
      console.log('✅ Загружено записей:', response.bookings.length)
    } catch (error) {
      console.error('❌ Ошибка загрузки записей:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const loadRentalBookings = async () => {
    try {
      setRentalBookingsLoading(true)
      console.log('🔍 Загрузка заявок на аренду...')
      const response = await rentalAPI.getMyBookings()
      console.log('📦 Получены данные:', response)
      
      // Проверяем разные форматы ответа
      let bookingsArray: RentalBooking[] = []
      if (Array.isArray(response)) {
        bookingsArray = response
      } else if (response && typeof response === 'object' && 'bookings' in response) {
        bookingsArray = Array.isArray((response as any).bookings) ? (response as any).bookings : []
      } else if (response && typeof response === 'object' && 'rentals' in response) {
        bookingsArray = Array.isArray((response as any).rentals) ? (response as any).rentals : []
      }
      
      console.log('✅ Загружено заявок на аренду:', bookingsArray.length)
      console.log('📊 Состояние rentalBookings перед обновлением:', rentalBookings.length, 'заявок')
      bookingsArray.forEach((rental, idx) => {
        console.log(`   Заявка ${idx + 1}: ID=${rental.id}, статус=${rental.status}, зал=${rental.hall_name || 'неизвестно'}, дата=${rental.start_time}, user_id=${rental.user_id}`)
      })
      setRentalBookings(bookingsArray)
      console.log('📊 Состояние rentalBookings после обновления:', bookingsArray.length, 'заявок')
    } catch (error) {
      console.error('❌ Ошибка загрузки заявок на аренду:', error)
      setRentalBookings([])
    } finally {
      setRentalBookingsLoading(false)
    }
  }

  const canCancelBooking = (booking: Booking): { canCancel: boolean; reason?: string } => {
    if (!booking.lesson_date || !booking.start_time) {
      return { canCancel: false, reason: 'Недостаточно данных о занятии' }
    }

    const lessonDate = new Date(booking.lesson_date)
    const [startHour, startMinute] = booking.start_time.split(':').map(Number)
    
    // Создаем дату и время начала занятия
    const lessonDateTime = new Date(lessonDate)
    lessonDateTime.setHours(startHour, startMinute, 0, 0)
    
    const now = new Date()
    const isMorningLesson = startHour < 17 // Занятие до 17:00 считается утренним
    
    if (isMorningLesson) {
      // Утреннее занятие: можно отменить до 21:00 предыдущего дня
      const previousDay = new Date(lessonDate)
      previousDay.setDate(previousDay.getDate() - 1)
      previousDay.setHours(21, 0, 0, 0) // 21:00 предыдущего дня
      
      if (now >= previousDay) {
        return { 
          canCancel: false, 
          reason: 'Отменить утреннее занятие можно только до 21:00 предыдущего дня' 
        }
      }
    } else {
      // Вечернее занятие: можно отменить не позднее чем за 4 часа до начала
      const cancelDeadline = new Date(lessonDateTime)
      cancelDeadline.setHours(cancelDeadline.getHours() - 4)
      
      if (now >= cancelDeadline) {
        return { 
          canCancel: false, 
          reason: 'Отменить вечернее занятие можно не позднее чем за 4 часа до начала' 
        }
      }
    }
    
    return { canCancel: true }
  }

  const loadAllBookings = async () => {
    try {
      setAllBookingsLoading(true)
      const response = await bookingsAPI.getAllMy()
      setAllBookings(response.bookings)
      console.log('✅ Загружено всех записей:', response.bookings.length)
    } catch (error) {
      console.error('❌ Ошибка загрузки всех записей:', error)
    } finally {
      setAllBookingsLoading(false)
    }
  }

  const handleShowAllBookings = () => {
    setActiveTab('active') // Сбрасываем на вкладку "Активные" при открытии
    setShowAllBookingsModal(true)
    if (allBookings.length === 0) {
      loadAllBookings()
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    const booking = bookings.find(b => b.id === bookingId) || allBookings.find(b => b.id === bookingId)
    if (!booking) return
    
    const cancelCheck = canCancelBooking(booking)
    if (!cancelCheck.canCancel) {
      alert(`❌ ${cancelCheck.reason || 'Невозможно отменить запись'}`)
      return
    }
    
    if (!confirm('Вы уверены, что хотите отменить запись?')) return
    
    try {
      await bookingsAPI.cancel(bookingId)
      alert('✅ Запись отменена!')
      // Перезагружаем данные
      loadBookings()
      loadSubscriptions()
      if (showAllBookingsModal) {
        loadAllBookings()
      }
    } catch (error: any) {
      alert(`❌ ${error.message || 'Ошибка отмены записи'}`)
    }
  }

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen pb-20 sm:pb-24 relative z-10">
        
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
                <span className="hidden sm:inline">Назад</span>
              </Button>
              <div className="flex-1 flex items-center gap-2 sm:gap-3">
                {/* Аватар */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-lg sm:text-2xl font-bold border-2 border-purple-400/30 flex-shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-xl font-bold text-white truncate">
                    {userName}
                  </h1>
                  <p className="text-xs text-purple-200/70">
                    Личный кабинет
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
          
          {/* Абонементы */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TicketIcon />
              Мои абонементы
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-purple-200/70 mt-4">Загрузка...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-8">
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <TicketIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    У вас пока нет абонементов
                  </h3>
                  <p className="text-purple-200/70 mb-6 max-w-md mx-auto">
                    Купите абонемент, чтобы начать заниматься в нашей студии
                  </p>
                  <Button
                    variant="default"
                    onClick={() => router.push('/prices')}
                  >
                    Посмотреть абонементы
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <SubscriptionCard key={subscription.id} subscription={subscription} />
                ))}
              </div>
            )}

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
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                <CalendarIcon />
                Мои занятия
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                  onClick={handleShowAllBookings}
                >
                  Все записи
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                  onClick={() => router.push('/schedule')}
                >
                  Записаться
                </Button>
              </div>
            </div>
            
            {/* Список занятий - загружаем реальные данные */}
            {bookingsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {bookings.map((booking) => {
                  const lessonDate = booking.lesson_date ? new Date(booking.lesson_date) : new Date()
                  const dateStr = lessonDate.toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long',
                    weekday: 'short'
                  })
                  
                  return (
                    <div
                      key={booking.id}
                      className="bg-black/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-500/20 hover:border-purple-400/40 transition-colors"
                    >
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 truncate">
                          {booking.direction_name}
                        </h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-purple-200/70 mb-2">
                          <ClockIcon />
                          <span>{dateStr}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm mb-3 sm:mb-4">
                        <div className="text-purple-200 truncate">
                          <span className="text-purple-200/70">Время:</span> {booking.start_time} - {booking.end_time}
                        </div>
                        <div className="text-purple-200 truncate">
                          <span className="text-purple-200/70">Зал:</span> {booking.hall_name}
                        </div>
                        <div className="text-purple-200 sm:col-span-2 truncate">
                          <span className="text-purple-200/70">Инструктор:</span> {booking.trainer_name}
                        </div>
                      </div>

                      {(() => {
                        const cancelCheck = canCancelBooking(booking)
                        return cancelCheck.canCancel ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-colors"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Отменить запись
                          </Button>
                        ) : (
                          <div className="w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="w-full sm:w-auto text-xs sm:text-sm border-gray-500/20 text-gray-500 cursor-not-allowed opacity-50"
                              title={cancelCheck.reason || 'Невозможно отменить запись'}
                            >
                              Отменить запись
                            </Button>
                            {cancelCheck.reason && (
                              <p className="text-xs text-gray-500/70 mt-1.5 text-center sm:text-left">
                                {cancelCheck.reason}
                              </p>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-14 sm:w-16 h-14 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-purple-500/20 flex items-center justify-center text-xl sm:text-2xl">
                  📝
                </div>
                <p className="text-xs sm:text-base text-purple-200/70 mb-3 sm:mb-4 px-4">
                  У вас пока нет записей на занятия
                </p>
                <Button
                  variant="secondary"
                  className="text-sm sm:text-base py-2.5 sm:py-3"
                  onClick={() => router.push('/schedule')}
                >
                  Записаться на занятие
                </Button>
              </div>
            )}
          </div>

          {/* Мои аренды */}
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                <HomeIcon />
                Мои аренды
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                onClick={() => router.push('/rental')}
              >
                Забронировать
              </Button>
            </div>
            
            {rentalBookingsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : rentalBookings.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {rentalBookings.map((rental) => {
                  const startTime = new Date(rental.start_time)
                  const endTime = new Date(rental.end_time)
                  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))
                  const dateStr = startTime.toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long',
                    weekday: 'short'
                  })
                  
                  return (
                    <div
                      key={rental.id}
                      className="bg-black/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-500/20 hover:border-purple-400/40 transition-colors"
                    >
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm sm:text-lg font-semibold text-white truncate">
                            {rental.hall_name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            rental.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            rental.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {rental.status === 'confirmed' ? 'Подтверждено' :
                             rental.status === 'cancelled' ? 'Отменено' : 'Ожидание'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-purple-200/70 mb-2">
                          <CalendarIcon />
                          <span>{dateStr}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm mb-3 sm:mb-4">
                        <div className="text-purple-200 truncate">
                          <span className="text-purple-200/70">Тип:</span> {rental.rental_type === 'hall' ? 'Аренда зала' : `Аренда ${rental.pole_count} ${rental.pole_count === 1 ? 'пилона' : 'пилонов'}`}
                        </div>
                        <div className="text-purple-200 truncate">
                          <span className="text-purple-200/70">Время:</span> {startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-purple-200 truncate">
                          <span className="text-purple-200/70">Длительность:</span> {duration} {duration === 1 ? 'час' : duration < 5 ? 'часа' : 'часов'}
                        </div>
                        <div className="text-purple-200 truncate">
                          <span className="text-purple-200/70">Стоимость:</span> {typeof rental.total_price === 'number' ? rental.total_price.toLocaleString('ru-RU') : rental.total_price} ₽
                        </div>
                        {rental.participants && (
                          <div className="text-purple-200 sm:col-span-2 truncate">
                            <span className="text-purple-200/70">Участников:</span> {rental.participants}
                          </div>
                        )}
                      </div>
                      
                      {rental.comment && (
                        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-purple-800/20 rounded-lg">
                          <p className="text-xs sm:text-sm text-purple-200/80">{rental.comment}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-14 sm:w-16 h-14 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-purple-500/20 flex items-center justify-center text-xl sm:text-2xl">
                  🏠
                </div>
                <p className="text-xs sm:text-base text-purple-200/70 mb-3 sm:mb-4 px-4">
                  У вас пока нет заявок на аренду
                </p>
                <Button
                  variant="secondary"
                  className="text-sm sm:text-base py-2.5 sm:py-3"
                  onClick={() => router.push('/rental')}
                >
                  Забронировать зал или пилон
                </Button>
              </div>
            )}
          </div>

          {/* Статистика - рассчитывается на основе реальных абонементов */}
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <ChartIcon />
              Статистика
            </h2>
            
            {subscriptions.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                    {subscriptions.reduce((sum, sub) => sum + ((sub.lesson_count || 0) - sub.lessons_remaining), 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-200/70">Использовано</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-4xl font-bold text-purple-300 mb-1 sm:mb-2">
                    {subscriptions.filter(sub => sub.status === 'confirmed' && sub.is_active).reduce((sum, sub) => sum + sub.lessons_remaining, 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-200/70">Доступно</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-4xl font-bold text-purple-400 mb-1 sm:mb-2">
                    {subscriptions.reduce((sum, sub) => sum + (sub.lesson_count || 0), 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-200/70">Всего куплено</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-purple-200/70">
                Статистика появится после покупки абонемента
              </div>
            )}
          </div>

          {/* Настройки */}
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6">
              Настройки
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Уведомления */}
              <div className="flex items-center justify-between py-2 sm:py-3 border-b border-purple-500/20 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-base text-white font-medium mb-0.5 sm:mb-1">Уведомления</div>
                  <div className="text-xs sm:text-sm text-purple-200/70">
                    Напоминания о занятиях и новости студии
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Контактные данные */}
              <div className="pt-2 sm:pt-3">
                <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-3">
                  Изменить контактные данные
                </Button>
              </div>
            </div>
          </div>

          {/* Контакты */}
          <div className="text-center pb-4">
            <div className="inline-block bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 px-4 sm:px-8 py-4 sm:py-6 w-full sm:w-auto">
              <p className="text-xs sm:text-base text-purple-200 mb-2 sm:mb-3">
                Есть вопросы? Свяжитесь с нами
              </p>
              <div className="space-y-1.5 sm:space-y-2">
                <a
                  href="tel:+7XXXXXXXXXX"
                  className="block text-sm sm:text-lg font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  📞 +7 (XXX) XXX-XX-XX
                </a>
                <a
                  href="https://instagram.com/geometriya_dance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm sm:text-lg font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  📸 @geometriya_dance
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Модальное окно со всеми записями */}
      {showAllBookingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-purple-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/30 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Заголовок модального окна */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-500/20">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <CalendarIcon />
                Все мои записи
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-300 hover:text-white"
                onClick={() => setShowAllBookingsModal(false)}
              >
                <XIcon />
              </Button>
            </div>

            {/* Вкладки */}
            <div className="flex border-b border-purple-500/20">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 px-4 py-3 text-sm sm:text-base font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'text-white border-b-2 border-purple-400 bg-purple-500/10'
                    : 'text-purple-300/70 hover:text-purple-200'
                }`}
              >
                Активные
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 px-4 py-3 text-sm sm:text-base font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'text-white border-b-2 border-purple-400 bg-purple-500/10'
                    : 'text-purple-300/70 hover:text-purple-200'
                }`}
              >
                Прошедшие
              </button>
            </div>

            {/* Содержимое модального окна */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {allBookingsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
              ) : (() => {
                // Фильтруем записи по статусу (только confirmed) и по дате
                const now = new Date()
                now.setHours(0, 0, 0, 0)
                
                const filteredBookings = allBookings.filter(booking => {
                  if (booking.status !== 'confirmed') return false // Не показываем отмененные
                  
                  const lessonDate = booking.lesson_date ? new Date(booking.lesson_date) : new Date()
                  lessonDate.setHours(0, 0, 0, 0)
                  
                  if (activeTab === 'active') {
                    return lessonDate >= now
                  } else {
                    return lessonDate < now
                  }
                })

                if (filteredBookings.length > 0) {
                  return (
                    <div className="space-y-3 sm:space-y-4">
                      {filteredBookings.map((booking) => {
                        const lessonDate = booking.lesson_date ? new Date(booking.lesson_date) : new Date()
                        const dateStr = lessonDate.toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric',
                          weekday: 'short'
                        })
                        const isPast = activeTab === 'past'
                        
                        return (
                          <div
                            key={booking.id}
                            className={`bg-black/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border transition-colors ${
                              isPast 
                                ? 'border-gray-500/20 opacity-70' 
                                : 'border-purple-500/20 hover:border-purple-400/40'
                            }`}
                          >
                            <div className="mb-3 sm:mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm sm:text-lg font-semibold text-white truncate">
                                  {booking.direction_name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-purple-200/70">
                                <ClockIcon />
                                <span>{dateStr}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm mb-3 sm:mb-4">
                              <div className="text-purple-200 truncate">
                                <span className="text-purple-200/70">Время:</span> {booking.start_time} - {booking.end_time}
                              </div>
                              <div className="text-purple-200 truncate">
                                <span className="text-purple-200/70">Зал:</span> {booking.hall_name}
                              </div>
                              <div className="text-purple-200 sm:col-span-2 truncate">
                                <span className="text-purple-200/70">Инструктор:</span> {booking.trainer_name}
                              </div>
                            </div>

                            {!isPast && (() => {
                              const cancelCheck = canCancelBooking(booking)
                              return cancelCheck.canCancel ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto text-xs sm:text-sm border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-colors"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  Отменить запись
                                </Button>
                              ) : (
                                <div className="w-full sm:w-auto">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="w-full sm:w-auto text-xs sm:text-sm border-gray-500/20 text-gray-500 cursor-not-allowed opacity-50"
                                    title={cancelCheck.reason || 'Невозможно отменить запись'}
                                  >
                                    Отменить запись
                                  </Button>
                                  {cancelCheck.reason && (
                                    <p className="text-xs text-gray-500/70 mt-1.5 text-center sm:text-left">
                                      {cancelCheck.reason}
                                    </p>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        )
                      })}
                    </div>
                  )
                } else {
                  return (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-14 sm:w-16 h-14 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-purple-500/20 flex items-center justify-center text-xl sm:text-2xl">
                        📝
                      </div>
                      <p className="text-xs sm:text-base text-purple-200/70 px-4">
                        {activeTab === 'active' 
                          ? 'У вас нет активных записей на занятия'
                          : 'У вас нет прошедших записей'}
                      </p>
                    </div>
                  )
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </BeamsBackground>
  )
}

