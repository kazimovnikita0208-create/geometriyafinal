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

// Моковые данные
const mockBookings = [
  { id: 1, client: 'Анна Иванова', direction: 'Pole Fit', date: '2024-11-22', time: '18:00', status: 'pending' },
  { id: 2, client: 'Мария Петрова', direction: 'Растяжка', date: '2024-11-22', time: '19:00', status: 'confirmed' },
  { id: 3, client: 'Ольга Смирнова', direction: 'Pole Exotic', date: '2024-11-23', time: '17:00', status: 'pending' },
]

const mockStaff = [
  { id: 1, name: 'Анна Иванова', role: 'Тренер', directions: ['Pole Fit', 'Сила & Гибкость'], phone: '+79001234567' },
  { id: 2, name: 'Мария Петрова', role: 'Тренер', directions: ['Растяжка', 'Сила & Гибкость'], phone: '+79001234568' },
  { id: 3, name: 'Ольга Смирнова', role: 'Тренер', directions: ['Pole Exotic', 'Strip'], phone: '+79001234569' },
]

const mockStats = {
  totalRevenue: 125000,
  totalClients: 45,
  totalLessons: 156,
  activeSubscriptions: 32
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedule' | 'staff' | 'notifications' | 'stats'>('bookings')
  const [bookings, setBookings] = useState(mockBookings)
  const [staff, setStaff] = useState(mockStaff)

  const tabs = [
    { id: 'bookings' as const, label: 'Записи', icon: CalendarIcon },
    { id: 'schedule' as const, label: 'Расписание', icon: ClockIcon },
    { id: 'staff' as const, label: 'Персонал', icon: UsersIcon },
    { id: 'notifications' as const, label: 'Уведомления', icon: BellIcon },
    { id: 'stats' as const, label: 'Статистика', icon: ChartIcon },
  ]

  const handleConfirmBooking = (id: number) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'confirmed' } : b))
    alert('Запись подтверждена')
  }

  const handleCancelBooking = (id: number) => {
    if (confirm('Вы уверены, что хотите отменить эту запись?')) {
      setBookings(bookings.filter(b => b.id !== id))
      alert('Запись отменена')
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
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg transition-all whitespace-nowrap text-xs sm:text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-purple-600/50 text-white border-b-2 border-purple-400'
                        : 'text-purple-200/70 hover:text-white hover:bg-purple-800/30'
                    }`}
                  >
                    <Icon />
                    <span>{tab.label}</span>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-2xl font-bold text-white">Управление записями</h2>
                <Button variant="default" size="sm" className="gap-2">
                  <PlusIcon />
                  <span className="hidden sm:inline">Добавить запись</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-white mb-1">
                          {booking.client}
                        </h3>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs sm:text-sm text-purple-200/70">
                          <span>📍 {booking.direction}</span>
                          <span>📅 {booking.date}</span>
                          <span>🕐 {booking.time}</span>
                          <span className={`inline-flex items-center gap-1 ${
                            booking.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {booking.status === 'confirmed' ? '✓ Подтверждена' : '⏳ Ожидает'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-1 text-xs sm:text-sm"
                            onClick={() => handleConfirmBooking(booking.id)}
                          >
                            <CheckIcon />
                            <span className="hidden sm:inline">Подтвердить</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs sm:text-sm"
                        >
                          <EditIcon />
                          <span className="hidden sm:inline">Изменить</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs sm:text-sm text-red-400 border-red-400/20 hover:bg-red-500/20"
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-2xl font-bold text-white">Управление персоналом</h2>
                <Button variant="default" size="sm" className="gap-2">
                  <PlusIcon />
                  <span className="hidden sm:inline">Добавить сотрудника</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {staff.map((person) => (
                  <div
                    key={person.id}
                    className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-white mb-1">
                          {person.name}
                        </h3>
                        <div className="space-y-1 text-xs sm:text-sm text-purple-200/70">
                          <div>👤 {person.role}</div>
                          <div>📱 {person.phone}</div>
                          <div>🎯 {person.directions.join(', ')}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs sm:text-sm"
                        >
                          <EditIcon />
                          <span className="hidden sm:inline">Редактировать</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs sm:text-sm text-red-400 border-red-400/20 hover:bg-red-500/20"
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
            <div className="space-y-4">
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-4">Статистика</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 sm:p-6">
                  <div className="text-purple-300 mb-2 text-sm">Заработано</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {mockStats.totalRevenue.toLocaleString()} ₽
                  </div>
                  <div className="text-xs text-purple-200/70">За текущий месяц</div>
                </div>

                <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 sm:p-6">
                  <div className="text-purple-300 mb-2 text-sm">Клиенты</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {mockStats.totalClients}
                  </div>
                  <div className="text-xs text-purple-200/70">Всего клиентов</div>
                </div>

                <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 sm:p-6">
                  <div className="text-purple-300 mb-2 text-sm">Занятия</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {mockStats.totalLessons}
                  </div>
                  <div className="text-xs text-purple-200/70">Проведено занятий</div>
                </div>

                <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 sm:p-6">
                  <div className="text-purple-300 mb-2 text-sm">Абонементы</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {mockStats.activeSubscriptions}
                  </div>
                  <div className="text-xs text-purple-200/70">Активных абонементов</div>
                </div>
              </div>

              <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 sm:p-6">
                <h3 className="text-lg font-bold text-white mb-4">Популярные направления</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-200">Pole Fit</span>
                      <span className="text-white font-semibold">45%</span>
                    </div>
                    <div className="w-full bg-purple-800/30 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-200">Растяжка</span>
                      <span className="text-white font-semibold">30%</span>
                    </div>
                    <div className="w-full bg-purple-800/30 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-200">Pole Exotic</span>
                      <span className="text-white font-semibold">15%</span>
                    </div>
                    <div className="w-full bg-purple-800/30 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-200">Сила & Гибкость</span>
                      <span className="text-white font-semibold">10%</span>
                    </div>
                    <div className="w-full bg-purple-800/30 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </BeamsBackground>
  )
}

