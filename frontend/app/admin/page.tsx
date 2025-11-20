'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'

// Иконки
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const TicketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
)

// Моковые данные
const mockBookings = [
  { id: 1, client: 'Анна Иванова', direction: 'Pole Fit', date: '2024-11-22', time: '18:00', status: 'pending', phone: '+79001234567' },
  { id: 2, client: 'Мария Петрова', direction: 'Растяжка', date: '2024-11-22', time: '19:00', status: 'confirmed', phone: '+79001234568' },
  { id: 3, client: 'Ольга Смирнова', direction: 'Pole Exotic', date: '2024-11-23', time: '17:00', status: 'pending', phone: '+79001234569' },
]

const mockSubscriptions = [
  { id: 1, client: 'Екатерина Новикова', type: 'КЛАССИЧЕСКИЙ', lessons: '8 занятий', price: '3800', date: '2024-11-20', status: 'pending', bookingType: 'flexible' },
  { id: 2, client: 'Дарья Соколова', type: 'ТОЛЬКО ФИТНЕС', lessons: '4 занятия', price: '2200', date: '2024-11-21', status: 'pending', bookingType: 'automatic', direction: 'Растяжка', weekdays: ['Пн', 'Ср', 'Пт'] },
  { id: 3, client: 'Алина Морозова', type: 'КОМБО-АБОНЕМЕНТ', lessons: '4+4 занятия', price: '3500', date: '2024-11-21', status: 'confirmed', bookingType: 'flexible' },
]

const mockStaff = [
  { id: 1, name: 'Анна Иванова', role: 'Тренер', directions: ['Pole Fit', 'Сила & Гибкость'], phone: '+79001234567', email: 'anna@geometria.ru' },
  { id: 2, name: 'Мария Петрова', role: 'Тренер', directions: ['Растяжка', 'Сила & Гибкость'], phone: '+79001234568', email: 'maria@geometria.ru' },
  { id: 3, name: 'Ольга Смирнова', role: 'Тренер', directions: ['Pole Exotic', 'Strip'], phone: '+79001234569', email: 'olga@geometria.ru' },
]

const mockStats = {
  totalRevenue: 125000,
  totalClients: 45,
  totalLessons: 156,
  activeSubscriptions: 32
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'bookings' | 'subscriptions' | 'schedule' | 'staff' | 'notifications' | 'stats'>('bookings')
  const [bookings, setBookings] = useState(mockBookings)
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions)
  const [staff, setStaff] = useState(mockStaff)

  const tabs = [
    { id: 'bookings' as const, label: 'Записи', icon: CalendarIcon, badge: bookings.filter(b => b.status === 'pending').length },
    { id: 'subscriptions' as const, label: 'Абонементы', icon: TicketIcon, badge: subscriptions.filter(s => s.status === 'pending').length },
    { id: 'schedule' as const, label: 'Расписание', icon: ClockIcon },
    { id: 'staff' as const, label: 'Персонал', icon: UsersIcon },
    { id: 'notifications' as const, label: 'Уведомления', icon: BellIcon },
    { id: 'stats' as const, label: 'Статистика', icon: ChartIcon },
  ]

  const handleConfirmBooking = (id: number) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'confirmed' } : b))
    alert('Запись подтверждена! Клиент получит уведомление в Telegram.')
  }

  const handleCancelBooking = (id: number) => {
    if (confirm('Вы уверены, что хотите отменить эту запись?')) {
      setBookings(bookings.filter(b => b.id !== id))
      alert('Запись отменена. Клиент получит уведомление.')
    }
  }

  const handleConfirmSubscription = (id: number) => {
    setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status: 'confirmed' } : s))
    alert('Абонемент подтвержден! Клиент получит уведомление в Telegram.')
  }

  const handleCancelSubscription = (id: number) => {
    if (confirm('Вы уверены, что хотите отклонить этот абонемент?')) {
      setSubscriptions(subscriptions.filter(s => s.id !== id))
      alert('Абонемент отклонен. Клиент получит уведомление.')
    }
  }

  const handleDeleteStaff = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      setStaff(staff.filter(s => s.id !== id))
      alert('Сотрудник удален')
    }
  }

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <ChevronLeftIcon />
                <span className="hidden sm:inline">Назад</span>
              </Button>
              <div className="flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white">
                  Админ-панель
                </h1>
                <p className="text-xs text-purple-200/70 mt-0.5 sm:mt-1 hidden sm:block">
                  Управление студией
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20 sticky top-[60px] sm:top-[72px] z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const hasBadge = tab.badge && tab.badge > 0
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg transition-all whitespace-nowrap text-xs sm:text-sm font-medium relative ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-b from-purple-600/60 to-purple-600/40 text-white border-b-2 border-purple-400 shadow-lg'
                        : 'text-purple-200/70 hover:text-white hover:bg-purple-800/30'
                    }`}
                  >
                    <Icon />
                    <span>{tab.label}</span>
                    {hasBadge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
          
          {/* Управление записями */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Управление записями
                  </h2>
                  <p className="text-sm text-purple-200/60">Подтверждайте и управляйте записями клиентов</p>
                </div>
                <Button variant="default" size="sm" className="gap-2 shadow-lg hover:shadow-purple-500/50 transition-shadow">
                  <PlusIcon />
                  <span className="hidden sm:inline">Добавить запись</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`group relative bg-gradient-to-br backdrop-blur-xl rounded-xl border p-3 sm:p-5 transition-all hover:scale-[1.01] hover:shadow-2xl ${
                      booking.status === 'pending'
                        ? 'from-purple-900/50 to-purple-800/30 border-purple-500/30 hover:border-purple-400/60'
                        : 'from-purple-900/30 to-purple-800/20 border-purple-500/20 hover:border-purple-400/40'
                    }`}
                  >
                    {booking.status === 'pending' && (
                      <div className="absolute top-3 right-3">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                            {booking.client.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              {booking.client}
                            </h3>
                            <p className="text-xs text-purple-300/70">{booking.phone}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 text-purple-200/80">
                            <span className="text-purple-400">🎯</span>
                            <span>{booking.direction}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-purple-200/80">
                            <span className="text-purple-400">📅</span>
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-purple-200/80">
                            <span className="text-purple-400">🕐</span>
                            <span>{booking.time}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 font-semibold ${
                            booking.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {booking.status === 'confirmed' ? '✓ Подтверждена' : '⏳ Ожидает'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-1 text-xs sm:text-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg"
                            onClick={() => handleConfirmBooking(booking.id)}
                          >
                            <CheckIcon />
                            <span className="hidden sm:inline">Подтвердить</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs sm:text-sm hover:bg-purple-600/30"
                        >
                          <EditIcon />
                          <span className="hidden sm:inline">Изменить</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs sm:text-sm text-red-400 border-red-400/30 hover:bg-red-500/20"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <XIcon />
                          <span className="hidden sm:inline">Отменить</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Управление абонементами */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Подтверждение абонементов
                  </h2>
                  <p className="text-sm text-purple-200/60">Подтверждайте покупку абонементов клиентами</p>
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className={`group relative bg-gradient-to-br backdrop-blur-xl rounded-xl border p-3 sm:p-5 transition-all hover:scale-[1.01] hover:shadow-2xl ${
                      subscription.status === 'pending'
                        ? 'from-indigo-900/50 to-purple-800/30 border-indigo-500/30 hover:border-indigo-400/60'
                        : 'from-indigo-900/30 to-purple-800/20 border-indigo-500/20 hover:border-indigo-400/40'
                    }`}
                  >
                    {subscription.status === 'pending' && (
                      <div className="absolute top-3 right-3">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {subscription.client.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              {subscription.client}
                            </h3>
                            <p className="text-sm text-purple-300/90 font-semibold">{subscription.type}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          subscription.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {subscription.status === 'confirmed' ? '✓ Подтвержден' : '⏳ Ожидает'}
                        </div>
                      </div>

                      <div className="bg-purple-800/30 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-purple-300/70 text-xs">Занятия</span>
                            <p className="text-white font-semibold">{subscription.lessons}</p>
                          </div>
                          <div>
                            <span className="text-purple-300/70 text-xs">Стоимость</span>
                            <p className="text-white font-semibold">{subscription.price} ₽</p>
                          </div>
                          <div>
                            <span className="text-purple-300/70 text-xs">Дата заявки</span>
                            <p className="text-white font-semibold">{subscription.date}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-purple-500/20">
                          <div className="text-xs text-purple-300/70 mb-1">Тип записи:</div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              subscription.bookingType === 'flexible' 
                                ? 'bg-blue-500/20 text-blue-300' 
                                : 'bg-orange-500/20 text-orange-300'
                            }`}>
                              {subscription.bookingType === 'flexible' ? '📅 Гибкая' : '🤖 Автомат'}
                            </span>
                            {subscription.bookingType === 'automatic' && (
                              <>
                                <span className="text-purple-200 text-xs">→</span>
                                <span className="text-purple-200 text-xs font-medium">{subscription.direction}</span>
                                <span className="text-purple-200 text-xs">({subscription.weekdays?.join(', ')})</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {subscription.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 gap-1 text-xs sm:text-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg"
                            onClick={() => handleConfirmSubscription(subscription.id)}
                          >
                            <CheckIcon />
                            Подтвердить абонемент
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs sm:text-sm text-red-400 border-red-400/30 hover:bg-red-500/20"
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            <XIcon />
                            <span className="hidden sm:inline">Отклонить</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Управление расписанием */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-2xl font-bold text-white">Управление расписанием</h2>
                <Button variant="default" size="sm" className="gap-2">
                  <PlusIcon />
                  <span className="hidden sm:inline">Добавить занятие</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
              </div>

              <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 sm:p-6">
                <p className="text-purple-200/70 text-center py-8">
                  Здесь будет календарь с расписанием занятий
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-500/20">
                    <h3 className="text-white font-semibold mb-2">Понедельник</h3>
                    <div className="space-y-2 text-sm text-purple-200/80">
                      <div>10:00 - Pole Fit (Анна Иванова)</div>
                      <div>18:00 - Растяжка (Мария Петрова)</div>
                      <div>19:30 - Pole Exotic (Ольга Смирнова)</div>
                    </div>
                  </div>
                  <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-500/20">
                    <h3 className="text-white font-semibold mb-2">Вторник</h3>
                    <div className="space-y-2 text-sm text-purple-200/80">
                      <div>10:00 - Сила & Гибкость (Анна Иванова)</div>
                      <div>18:00 - Pole Fit (Мария Петрова)</div>
                      <div>19:30 - Strip (Ольга Смирнова)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Управление персоналом */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Управление персоналом
                  </h2>
                  <p className="text-sm text-purple-200/60">Добавляйте и редактируйте информацию о тренерах</p>
                </div>
                <Button variant="default" size="sm" className="gap-2 shadow-lg hover:shadow-purple-500/50 transition-shadow">
                  <PlusIcon />
                  <span className="hidden sm:inline">Добавить сотрудника</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {staff.map((person) => (
                  <div
                    key={person.id}
                    className="group relative bg-gradient-to-br from-purple-900/40 to-blue-900/30 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4 sm:p-5 hover:scale-[1.01] transition-all hover:shadow-2xl hover:border-purple-400/50"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base sm:text-xl font-bold text-white mb-1">
                            {person.name}
                          </h3>
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
                            <span>👤</span>
                            {person.role}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200/80">
                              <span className="text-purple-400">📱</span>
                              <a href={`tel:${person.phone}`} className="hover:text-purple-300">{person.phone}</a>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200/80">
                              <span className="text-purple-400">📧</span>
                              <a href={`mailto:${person.email}`} className="hover:text-purple-300">{person.email}</a>
                            </div>
                            <div className="flex items-start gap-2 text-xs sm:text-sm">
                              <span className="text-purple-400 mt-0.5">🎯</span>
                              <div className="flex flex-wrap gap-1.5">
                                {person.directions.map((dir, idx) => (
                                  <span key={idx} className="px-2 py-1 rounded bg-purple-600/30 text-purple-200 text-xs font-medium">
                                    {dir}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs sm:text-sm hover:bg-purple-600/30 flex-1 sm:flex-none"
                        >
                          <EditIcon />
                          <span className="hidden sm:inline">Редактировать</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs sm:text-sm text-red-400 border-red-400/30 hover:bg-red-500/20 flex-1 sm:flex-none"
                          onClick={() => handleDeleteStaff(person.id)}
                        >
                          <TrashIcon />
                          <span className="hidden sm:inline">Удалить</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Управление уведомлениями */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-4">Управление уведомлениями</h2>

              <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-purple-500/20">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Напоминание о занятии</h3>
                      <p className="text-xs sm:text-sm text-purple-200/70">За 2 часа до начала</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-purple-500/20">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Подтверждение записи</h3>
                      <p className="text-xs sm:text-sm text-purple-200/70">Сразу после записи</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-purple-500/20">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Окончание абонемента</h3>
                      <p className="text-xs sm:text-sm text-purple-200/70">За 3 дня до окончания</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Новости и акции</h3>
                      <p className="text-xs sm:text-sm text-purple-200/70">Рассылка новостей</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="default" className="w-full sm:w-auto">
                    Отправить тестовое уведомление
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Статистика */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Статистика и аналитика
                </h2>
                <p className="text-sm text-purple-200/60">Отслеживайте показатели вашей студии</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="group relative bg-gradient-to-br from-green-900/40 to-emerald-800/30 backdrop-blur-xl rounded-xl border border-green-500/30 p-4 sm:p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-green-500/20">
                  <div className="absolute top-3 right-3 text-3xl opacity-20 group-hover:opacity-30 transition-opacity">💰</div>
                  <div className="text-green-300 mb-2 text-sm font-semibold">Заработано</div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-1 bg-gradient-to-br from-green-400 to-emerald-300 bg-clip-text text-transparent">
                    {mockStats.totalRevenue.toLocaleString()} ₽
                  </div>
                  <div className="text-xs text-green-200/70 flex items-center gap-1">
                    <span className="text-green-400">↗</span>
                    За текущий месяц
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-blue-900/40 to-cyan-800/30 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4 sm:p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-blue-500/20">
                  <div className="absolute top-3 right-3 text-3xl opacity-20 group-hover:opacity-30 transition-opacity">👥</div>
                  <div className="text-blue-300 mb-2 text-sm font-semibold">Клиенты</div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-1 bg-gradient-to-br from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    {mockStats.totalClients}
                  </div>
                  <div className="text-xs text-blue-200/70 flex items-center gap-1">
                    <span className="text-blue-400">✓</span>
                    Всего клиентов
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-purple-900/40 to-pink-800/30 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4 sm:p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-purple-500/20">
                  <div className="absolute top-3 right-3 text-3xl opacity-20 group-hover:opacity-30 transition-opacity">📅</div>
                  <div className="text-purple-300 mb-2 text-sm font-semibold">Занятия</div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-1 bg-gradient-to-br from-purple-400 to-pink-300 bg-clip-text text-transparent">
                    {mockStats.totalLessons}
                  </div>
                  <div className="text-xs text-purple-200/70 flex items-center gap-1">
                    <span className="text-purple-400">✓</span>
                    Проведено занятий
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-orange-900/40 to-yellow-800/30 backdrop-blur-xl rounded-xl border border-orange-500/30 p-4 sm:p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-orange-500/20">
                  <div className="absolute top-3 right-3 text-3xl opacity-20 group-hover:opacity-30 transition-opacity">🎫</div>
                  <div className="text-orange-300 mb-2 text-sm font-semibold">Абонементы</div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-1 bg-gradient-to-br from-orange-400 to-yellow-300 bg-clip-text text-transparent">
                    {mockStats.activeSubscriptions}
                  </div>
                  <div className="text-xs text-orange-200/70 flex items-center gap-1">
                    <span className="text-orange-400">⚡</span>
                    Активных абонементов
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4 sm:p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Популярные направления</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Pole Fit', percent: 45, color: 'from-purple-500 to-pink-500' },
                    { name: 'Растяжка', percent: 30, color: 'from-blue-500 to-cyan-500' },
                    { name: 'Pole Exotic', percent: 15, color: 'from-pink-500 to-rose-500' },
                    { name: 'Сила & Гибкость', percent: 10, color: 'from-green-500 to-emerald-500' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-purple-100 font-semibold">{item.name}</span>
                        <span className="text-white font-bold bg-purple-600/30 px-2 py-0.5 rounded">{item.percent}%</span>
                      </div>
                      <div className="w-full bg-purple-800/30 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 shadow-lg`}
                          style={{ width: `${item.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </BeamsBackground>
  )
}

