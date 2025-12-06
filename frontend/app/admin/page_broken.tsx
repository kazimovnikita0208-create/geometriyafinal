'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'
import { subscriptionsAPI, Subscription } from '@/lib/api'

// Иконки с поддержкой className
const ChevronLeftIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UsersIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const BellIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const ChartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const PlusIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const EditIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const TrashIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const TicketIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
)

const InfoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MailIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const SettingsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const TrendingUpIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UserPlusIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
)

const DollarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UsersGroupIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const ActivityIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
  const [activeTab, setActiveTab] = useState<'bookings' | 'subscriptions' | 'schedule' | 'staff' | 'notifications' | 'stats'>('subscriptions')
  const [bookings, setBookings] = useState(mockBookings)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [staff, setStaff] = useState(mockStaff)
  const [loading, setLoading] = useState(false)
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; subscriptionId: number | null }>({ isOpen: false, subscriptionId: null })
  const [rejectionReason, setRejectionReason] = useState('')
  
  // Модальные окна
  const [showAddLessonModal, setShowAddLessonModal] = useState(false)
  const [showAddBookingModal, setShowAddBookingModal] = useState(false)
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] = useState(false)
  
  // Данные формы добавления занятия
  const [lessonForm, setLessonForm] = useState({
    direction: '',
    trainer: '',
    hall: '',
    dayOfWeek: '',
    time: '',
    capacity: 6
  })
  
  // Данные формы записи клиента
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    clientPhone: '',
    direction: '',
    date: '',
    time: ''
  })
  
  // Данные формы абонемента
  const [subscriptionForm, setSubscriptionForm] = useState({
    firstName: '',
    lastName: '',
    clientPhone: '',
    hall: '',
    subscriptionType: '',
    lessons: '',
    price: '',
    bookingType: 'flexible' as 'flexible' | 'automatic',
    direction: '',
    weekdays: [] as string[],
    trainer: ''
  })

  // Загрузка заявок на абонементы
  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await subscriptionsAPI.getRequests()
      setSubscriptions(data.requests || [])
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleConfirmSubscription = async (id: number) => {
    try {
      setLoading(true)
      await subscriptionsAPI.approve(id)
      await loadSubscriptions()
      alert('✅ Абонемент подтвержден! Клиент получит уведомление.')
    } catch (error) {
      console.error('Ошибка подтверждения:', error)
      alert('❌ Ошибка при подтверждении абонемента')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectSubscription = async (id: number) => {
    setRejectionModal({ isOpen: true, subscriptionId: id })
  }

  const confirmRejection = async () => {
    if (!rejectionModal.subscriptionId) return
    
    if (!rejectionReason.trim()) {
      alert('⚠️ Укажите причину отказа')
      return
    }

    try {
      setLoading(true)
      await subscriptionsAPI.reject(rejectionModal.subscriptionId, rejectionReason)
      await loadSubscriptions()
      setRejectionModal({ isOpen: false, subscriptionId: null })
      setRejectionReason('')
      alert('✅ Абонемент отклонен. Клиент получит уведомление с причиной.')
    } catch (error) {
      console.error('Ошибка отклонения:', error)
      alert('❌ Ошибка при отклонении абонемента')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = (id: number) => {
    if (confirm('Вы уверены, что хотите отменить этот абонемент?')) {
      setSubscriptions(subscriptions.filter(s => s.id !== id))
      alert('Абонемент отменен. Клиент получит уведомление.')
    }
  }

  const handleDeleteStaff = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      setStaff(staff.filter(s => s.id !== id))
      alert('Сотрудник удален')
    }
  }
  
  // Обработчик добавления занятия в расписание
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Добавление занятия:', lessonForm)
    alert('Занятие успешно добавлено в расписание!')
    setShowAddLessonModal(false)
    setLessonForm({
      direction: '',
      trainer: '',
      hall: '',
      dayOfWeek: '',
      time: '',
      capacity: 6
    })
  }
  
  // Обработчик добавления записи клиента
  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault()
    const newBooking = {
      id: bookings.length + 1,
      client: bookingForm.clientName,
      direction: bookingForm.direction,
      date: bookingForm.date,
      time: bookingForm.time,
      status: 'confirmed' as const,
      phone: bookingForm.clientPhone
    }
    setBookings([...bookings, newBooking])
    alert('Клиент успешно записан на занятие!')
    setShowAddBookingModal(false)
    setBookingForm({
      clientName: '',
      clientPhone: '',
      direction: '',
      date: '',
      time: ''
    })
  }
  
  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Абонемент для ${subscriptionForm.firstName} ${subscriptionForm.lastName} успешно добавлен! Клиент получит уведомление.`)
    setShowAddSubscriptionModal(false)
    setSubscriptionForm({
      firstName: '',
      lastName: '',
      clientPhone: '',
      hall: '',
      subscriptionType: '',
      lessons: '',
      price: '',
      bookingType: 'flexible',
      direction: '',
      weekdays: [],
      trainer: ''
    })
  }

  return (
    <div className="min-h-screen relative bg-black">
      <BeamsBackground intensity="medium" />
      <div className="relative z-10 min-h-screen">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2 hover:bg-purple-600/20 transition-all"
              >
                <ChevronLeftIcon />
                <span className="hidden sm:inline">Назад</span>
              </Button>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Админ-панель
                </h1>
                <p className="text-sm text-purple-200/60 mt-1 hidden sm:block">
                  Управление студией Геометрия
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black/20 backdrop-blur-md border-b border-purple-500/10 sticky top-[72px] sm:top-[88px] z-10 overflow-x-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-1 sm:gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const hasBadge = tab.badge && tab.badge > 0
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 rounded-t-xl transition-all duration-300 whitespace-nowrap text-xs sm:text-sm font-semibold relative flex-shrink-0 group ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-b from-purple-600/40 to-purple-600/20 text-white border-b-2 border-purple-400 shadow-lg'
                        : 'text-purple-200/60 hover:text-white hover:bg-purple-600/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {hasBadge && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-500 text-white text-[9px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg border-2 border-black/20">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          
          {/* Управление записями */}
          {activeTab === 'bookings' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent break-words">
                    Управление записями
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200/60 hidden sm:block">Подтверждайте и управляйте записями клиентов</p>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-1 sm:gap-2 shadow-lg hover:shadow-purple-500/50 transition-shadow text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4 flex-shrink-0"
                  onClick={() => setShowAddBookingModal(true)}
                >
                  <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Добавить</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="group relative bg-gradient-to-br from-purple-900/40 to-purple-800/30 backdrop-blur-xl rounded-xl border border-purple-500/30 hover:border-purple-400/60 p-3 sm:p-5 transition-all hover:scale-[1.01] hover:shadow-2xl"
                  >
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
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
                        </div>
                      </div>
                      <div className="flex gap-2">
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
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent break-words">
                    Подтверждение абонементов
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200/60 hidden sm:block">Подтверждайте покупку абонементов клиентами</p>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-1 sm:gap-2 shadow-lg hover:shadow-purple-500/50 transition-shadow text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4 flex-shrink-0"
                  onClick={() => setShowAddSubscriptionModal(true)}
                >
                  <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Добавить</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-purple-200/70 mt-4">Загрузка заявок...</p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-4xl mx-auto mb-4">
                    📋
                  </div>
                  <p className="text-purple-200/70 text-lg">Нет заявок на абонементы</p>
                </div>
              ) : (
                <div className="grid gap-2 sm:gap-4">
                  {subscriptions.map((subscription) => {
                    const clientName = `${subscription.first_name || ''} ${subscription.last_name || ''}`.trim() || 'Клиент'
                    const initials = clientName.split(' ').map(n => n[0]).join('').toUpperCase()
                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString)
                      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    }

                    return (
                      <div
                        key={subscription.id}
                        className={`group relative bg-gradient-to-br backdrop-blur-xl rounded-lg sm:rounded-xl border p-2.5 sm:p-5 transition-all hover:shadow-2xl ${
                          subscription.status === 'pending'
                            ? 'from-indigo-900/50 to-purple-800/30 border-indigo-500/30 hover:border-indigo-400/60'
                            : subscription.status === 'confirmed'
                            ? 'from-green-900/30 to-purple-800/20 border-green-500/20 hover:border-green-400/40'
                            : 'from-red-900/30 to-purple-800/20 border-red-500/20 hover:border-red-400/40'
                        }`}
                      >
                        {subscription.status === 'pending' && (
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-yellow-500"></span>
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col gap-2 sm:gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg text-xs sm:text-base flex-shrink-0">
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-lg font-bold text-white truncate">
                                  {clientName}
                                </h3>
                                <p className="text-xs sm:text-sm text-purple-300/90 font-semibold truncate">{subscription.subscription_type_name}</p>
                                {subscription.phone && (
                                  <p className="text-xs text-purple-300/70">{subscription.phone}</p>
                                )}
                              </div>
                            </div>
                            <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap flex-shrink-0 ${
                              subscription.status === 'confirmed' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : subscription.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {subscription.status === 'confirmed' ? '✓' : subscription.status === 'rejected' ? '✗' : '⏳'}
                              <span className="hidden sm:inline ml-1">
                                {subscription.status === 'confirmed' ? 'Подтвержден' : subscription.status === 'rejected' ? 'Отклонен' : 'Ожидает'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-purple-800/30 rounded-lg p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                              <div>
                                <span className="text-purple-300/70 text-[10px] sm:text-xs block">Занятий</span>
                                <p className="text-white font-semibold text-xs sm:text-sm truncate">{subscription.lesson_count}</p>
                              </div>
                              <div>
                                <span className="text-purple-300/70 text-[10px] sm:text-xs block">Адрес</span>
                                <p className="text-white font-semibold text-xs sm:text-sm truncate">{(subscription as any).address || 'Не указан'}</p>
                              </div>
                              <div>
                                <span className="text-purple-300/70 text-[10px] sm:text-xs block">Дата заявки</span>
                                <p className="text-white font-semibold text-xs sm:text-sm truncate">{formatDate(subscription.created_at)}</p>
                              </div>
                            </div>

                            <div className="pt-1.5 sm:pt-2 border-t border-purple-500/20">
                              <div className="text-[10px] sm:text-xs text-purple-300/70 mb-1">Тип записи:</div>
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                                  subscription.booking_type === 'flexible' 
                                    ? 'bg-blue-500/20 text-blue-300' 
                                    : 'bg-orange-500/20 text-orange-300'
                                }`}>
                                  {subscription.booking_type === 'flexible' ? '📅 Гибкая' : '🤖 Автомат'}
                                </span>
                                {subscription.booking_type === 'automatic' && subscription.auto_direction && (
                                  <>
                                    <span className="text-purple-200 text-[10px] sm:text-xs">→</span>
                                    <span className="text-purple-200 text-[10px] sm:text-xs font-medium truncate">{subscription.auto_direction}</span>
                                    {subscription.auto_weekdays && (
                                      <span className="text-purple-200 text-[10px] sm:text-xs truncate">
                                        ({Array.isArray(subscription.auto_weekdays) ? subscription.auto_weekdays.join(', ') : (typeof subscription.auto_weekdays === 'string' ? JSON.parse(subscription.auto_weekdays).join(', ') : '')})
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {subscription.status === 'rejected' && (subscription as any).rejection_reason && (
                              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <div className="text-[10px] sm:text-xs text-red-300/70 mb-1">Причина отказа:</div>
                                <p className="text-red-300 text-xs">{(subscription as any).rejection_reason}</p>
                              </div>
                            )}
                          </div>

                          {subscription.status === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1 gap-1 text-xs sm:text-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg"
                                onClick={() => handleConfirmSubscription(subscription.id)}
                                disabled={loading}
                              >
                                <CheckIcon />
                                Подтвердить
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs sm:text-sm text-red-400 border-red-400/30 hover:bg-red-500/20"
                                onClick={() => handleRejectSubscription(subscription.id)}
                                disabled={loading}
                              >
                                <XIcon />
                                <span className="hidden sm:inline">Отклонить</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Управление расписанием */}
          {activeTab === 'schedule' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent break-words">
                    Управление расписанием
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200/60 hidden sm:block">Создавайте и редактируйте расписание занятий</p>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-1 sm:gap-2 shadow-lg hover:shadow-green-500/50 transition-shadow bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-500 hover:to-blue-400 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4 flex-shrink-0"
                  onClick={() => setShowAddLessonModal(true)}
                >
                  <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Добавить</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { 
                    day: 'Понедельник', 
                    lessons: [
                      { time: '10:00', direction: 'Pole Fit', trainer: 'Анна Иванова', booked: 5, capacity: 6, color: 'from-purple-500 to-pink-500' },
                      { time: '18:00', direction: 'Растяжка', trainer: 'Мария Петрова', booked: 4, capacity: 6, color: 'from-blue-500 to-cyan-500' },
                      { time: '19:30', direction: 'Pole Exotic', trainer: 'Ольга Смирнова', booked: 4, capacity: 6, color: 'from-pink-500 to-rose-500' },
                    ]
                  },
                  { 
                    day: 'Вторник', 
                    lessons: [
                      { time: '10:00', direction: 'Сила & Гибкость', trainer: 'Анна Иванова', booked: 5, capacity: 6, color: 'from-green-500 to-emerald-500' },
                      { time: '18:00', direction: 'Pole Fit', trainer: 'Мария Петрова', booked: 6, capacity: 6, color: 'from-purple-500 to-pink-500' },
                      { time: '19:30', direction: 'Strip', trainer: 'Ольга Смирнова', booked: 3, capacity: 6, color: 'from-red-500 to-pink-500' },
                    ]
                  },
                  { 
                    day: 'Среда', 
                    lessons: [
                      { time: '10:00', direction: 'Растяжка', trainer: 'Мария Петрова', booked: 5, capacity: 6, color: 'from-blue-500 to-cyan-500' },
                      { time: '18:00', direction: 'Pole Exotic', trainer: 'Ольга Смирнова', booked: 5, capacity: 6, color: 'from-pink-500 to-rose-500' },
                      { time: '19:30', direction: 'Pole Fit', trainer: 'Анна Иванова', booked: 4, capacity: 6, color: 'from-purple-500 to-pink-500' },
                    ]
                  },
                  { 
                    day: 'Четверг', 
                    lessons: [
                      { time: '10:00', direction: 'Pole Fit', trainer: 'Анна Иванова', booked: 4, capacity: 6, color: 'from-purple-500 to-pink-500' },
                      { time: '18:00', direction: 'Сила & Гибкость', trainer: 'Мария Петрова', booked: 5, capacity: 6, color: 'from-green-500 to-emerald-500' },
                      { time: '19:30', direction: 'Choreo', trainer: 'Ольга Смирнова', booked: 5, capacity: 6, color: 'from-yellow-500 to-orange-500' },
                    ]
                  },
                ].map((daySchedule, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-purple-900/40 to-blue-900/30 backdrop-blur-xl rounded-xl border border-green-500/20 p-4 sm:p-5 hover:shadow-2xl transition-all hover:border-green-400/40">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-purple-500/20">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
                        <CalendarIcon />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">{daySchedule.day}</h3>
                    </div>
                    <div className="space-y-3">
                      {daySchedule.lessons.map((lesson, lessonIdx) => {
                        const percentage = (lesson.booked / lesson.capacity) * 100
                        const isAlmostFull = percentage >= 80
                        return (
                          <div key={lessonIdx} className="group bg-purple-800/30 rounded-lg p-3 border border-purple-500/20 hover:bg-purple-800/50 hover:border-purple-400/40 transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center gap-1.5 text-white font-semibold">
                                    <ClockIcon className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm">{lesson.time}</span>
                                  </div>
                                  <div className={`h-1 w-1 rounded-full bg-gradient-to-r ${lesson.color}`}></div>
                                  <span className="text-sm font-semibold text-white">{lesson.direction}</span>
                                </div>
                                <div className="text-xs text-purple-300/70 flex items-center gap-1.5 ml-5">
                                  <UsersIcon className="w-3 h-3" />
                                  {lesson.trainer}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 transition-colors">
                                  <EditIcon className="w-4 h-4 text-purple-200" />
                                </button>
                                <button className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors">
                                  <TrashIcon className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-purple-900/50 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full bg-gradient-to-r ${lesson.color} transition-all duration-500`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className={`text-xs font-bold ${isAlmostFull ? 'text-orange-400' : 'text-purple-200'}`}>
                                {lesson.booked}/{lesson.capacity}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Управление персоналом */}
          {activeTab === 'staff' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent break-words">
                    Управление персоналом
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200/60 hidden sm:block">Добавляйте и редактируйте информацию о тренерах</p>
                </div>
                <Button variant="default" size="sm" className="gap-1 sm:gap-2 shadow-lg hover:shadow-purple-500/50 transition-shadow text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4 flex-shrink-0">
                  <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Добавить</span>
                  <span className="sm:hidden">+</span>
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
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent break-words">
                    Управление уведомлениями
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200/60 hidden sm:block">Настройте автоматические уведомления для клиентов</p>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-1 sm:gap-2 shadow-lg hover:shadow-orange-500/50 transition-shadow bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4 flex-shrink-0"
                  onClick={() => alert('Тестовое уведомление отправлено!')}
                >
                  <MailIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Тест</span>
                  <span className="sm:hidden">📧</span>
                </Button>
              </div>

              <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-yellow-500/20 p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-purple-800/30 hover:bg-purple-800/50 transition-all border border-purple-500/20 hover:border-purple-400/40">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <BellIcon />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                          Напоминание о занятии
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">Важное</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-purple-200/70 flex items-center gap-1.5">
                          <ClockIcon className="w-4 h-4" />
                          За 2 часа до начала занятия
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-14 h-7 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 shadow-inner"></div>
                    </label>
                  </div>

                  <div className="group flex items-center justify-between p-4 rounded-xl bg-purple-800/30 hover:bg-purple-800/50 transition-all border border-purple-500/20 hover:border-purple-400/40">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                        <CheckCircleIcon />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                          Подтверждение записи
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-medium">Важное</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-purple-200/70 flex items-center gap-1.5">
                          <CheckCircleIcon className="w-4 h-4" />
                          Сразу после подтверждения администратором
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-14 h-7 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 shadow-inner"></div>
                    </label>
                  </div>

                  <div className="group flex items-center justify-between p-4 rounded-xl bg-purple-800/30 hover:bg-purple-800/50 transition-all border border-purple-500/20 hover:border-purple-400/40">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                        <TicketIcon />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                          Окончание абонемента
                        </h3>
                        <p className="text-xs sm:text-sm text-purple-200/70 flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4" />
                          За 3 дня до окончания срока действия
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-14 h-7 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 shadow-inner"></div>
                    </label>
                  </div>

                  <div className="group flex items-center justify-between p-4 rounded-xl bg-purple-800/30 hover:bg-purple-800/50 transition-all border border-purple-500/20 hover:border-purple-400/40">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <InfoIcon />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                          Новости и акции
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">Опционально</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-purple-200/70 flex items-center gap-1.5">
                          <MailIcon className="w-4 h-4" />
                          Общая рассылка о новостях и специальных предложениях
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-14 h-7 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Статистика */}
          {activeTab === 'stats' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent break-words">
                  Статистика и аналитика
                </h2>
                <p className="text-xs sm:text-sm text-purple-200/60">Отслеживайте показатели вашей студии</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="group relative bg-gradient-to-br from-green-900/40 to-emerald-800/30 backdrop-blur-xl rounded-xl border border-green-500/30 p-4 sm:p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-green-500/20">
                  <div className="absolute top-3 right-3 text-green-400 opacity-20 group-hover:opacity-40 transition-opacity">
                    <DollarIcon className="w-8 h-8" />
                  </div>
                  <div className="text-green-300 mb-2 text-sm font-semibold flex items-center gap-2">
                    <DollarIcon />
                    Заработано
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-1 bg-gradient-to-br from-green-400 to-emerald-300 bg-clip-text text-transparent">
                    {mockStats.totalRevenue.toLocaleString()} ₽
                  </div>
                  <div className="text-xs text-green-200/70 flex items-center gap-1">
                    <TrendingUpIcon />
                    За текущий месяц
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-blue-900/40 to-cyan-800/30 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4 sm:p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-blue-500/20">
                  <div className="absolute top-3 right-3 text-blue-400 opacity-20 group-hover:opacity-40 transition-opacity">
                    <UsersGroupIcon className="w-8 h-8" />
                  </div>
                  <div className="text-blue-300 mb-2 text-sm font-semibold flex items-center gap-2">
                    <UsersGroupIcon />
                    Клиенты
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-1 bg-gradient-to-br from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    {mockStats.totalClients}
                  </div>
                  <div className="text-xs text-blue-200/70 flex items-center gap-1">
                    <CheckCircleIcon />
                    Всего клиентов
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-purple-900/40 to-pink-800/30 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4 sm:p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-purple-500/20">
                  <div className="absolute top-3 right-3 text-purple-400 opacity-20 group-hover:opacity-40 transition-opacity">
                    <ActivityIcon className="w-8 h-8" />
                  </div>
                  <div className="text-purple-300 mb-2 text-sm font-semibold flex items-center gap-2">
                    <ActivityIcon />
                    Занятия
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-1 bg-gradient-to-br from-purple-400 to-pink-300 bg-clip-text text-transparent">
                    {mockStats.totalLessons}
                  </div>
                  <div className="text-xs text-purple-200/70 flex items-center gap-1">
                    <CheckCircleIcon />
                    Проведено занятий
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-orange-900/40 to-yellow-800/30 backdrop-blur-xl rounded-xl border border-orange-500/30 p-4 sm:p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-orange-500/20">
                  <div className="absolute top-3 right-3 text-orange-400 opacity-20 group-hover:opacity-40 transition-opacity">
                    <TicketIcon className="w-8 h-8" />
                  </div>
                  <div className="text-orange-300 mb-2 text-sm font-semibold flex items-center gap-2">
                    <TicketIcon />
                    Абонементы
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-1 bg-gradient-to-br from-orange-400 to-yellow-300 bg-clip-text text-transparent">
                    {mockStats.activeSubscriptions}
                  </div>
                  <div className="text-xs text-orange-200/70 flex items-center gap-1">
                    <ActivityIcon />
                    Активных абонементов
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4 sm:p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <ChartIcon />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Популярные направления</h3>
                    <p className="text-xs text-purple-300/70">Распределение по направлениям</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Pole Fit', percent: 45, color: 'from-purple-500 to-pink-500', emoji: '🏋️' },
                    { name: 'Растяжка', percent: 30, color: 'from-blue-500 to-cyan-500', emoji: '🤸' },
                    { name: 'Pole Exotic', percent: 15, color: 'from-pink-500 to-rose-500', emoji: '💃' },
                    { name: 'Сила & Гибкость', percent: 10, color: 'from-green-500 to-emerald-500', emoji: '💪' }
                  ].map((item, idx) => (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji}</span>
                          <span className="text-purple-100 font-semibold">{item.name}</span>
                        </div>
                        <span className="text-white font-bold bg-purple-600/30 px-3 py-1 rounded-full text-xs group-hover:bg-purple-600/50 transition-colors">
                          {item.percent}%
                        </span>
                      </div>
                      <div className="w-full bg-purple-800/30 rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                          className={`h-3 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 shadow-lg group-hover:shadow-xl`}
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

        {/* Модальное окно добавления занятия в расписание */}
        {showAddLessonModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-indigo-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-b from-purple-900/98 to-purple-900/95 backdrop-blur-xl border-b border-purple-400/20 p-5 sm:p-6 flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">Добавить занятие в расписание</h3>
                <button onClick={() => setShowAddLessonModal(false)} className="text-purple-300 hover:text-white hover:bg-purple-600/30 rounded-lg p-2 transition-all">
                  <XIcon />
                </button>
              </div>
              
              <form onSubmit={handleAddLesson} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Направление <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={lessonForm.direction}
                    onChange={(e) => setLessonForm({ ...lessonForm, direction: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Выберите направление</option>
                    <option value="Pole Fit">Pole Fit</option>
                    <option value="Pole Exotic">Pole Exotic</option>
                    <option value="Сила & Гибкость">Сила & Гибкость</option>
                    <option value="Растяжка">Растяжка</option>
                    <option value="Choreo">Choreo</option>
                    <option value="Strip">Strip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Тренер <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={lessonForm.trainer}
                    onChange={(e) => setLessonForm({ ...lessonForm, trainer: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Выберите тренера</option>
                    {mockStaff.map(trainer => (
                      <option key={trainer.id} value={trainer.name}>{trainer.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Зал <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={lessonForm.hall}
                    onChange={(e) => setLessonForm({ ...lessonForm, hall: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Выберите зал</option>
                    <option value="Волгина, 117А">Волгина, 117А</option>
                    <option value="Московское шоссе, 43">Московское шоссе, 43</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    День недели <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={lessonForm.dayOfWeek}
                    onChange={(e) => setLessonForm({ ...lessonForm, dayOfWeek: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Выберите день недели</option>
                    <option value="Понедельник">Понедельник</option>
                    <option value="Вторник">Вторник</option>
                    <option value="Среда">Среда</option>
                    <option value="Четверг">Четверг</option>
                    <option value="Пятница">Пятница</option>
                    <option value="Суббота">Суббота</option>
                    <option value="Воскресенье">Воскресенье</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Время <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={lessonForm.time}
                    onChange={(e) => setLessonForm({ ...lessonForm, time: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Добавить занятие
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddLessonModal(false)}>
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно добавления записи клиента */}
        {showAddBookingModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-indigo-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-b from-purple-900/98 to-purple-900/95 backdrop-blur-xl border-b border-purple-400/20 p-5 sm:p-6 flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">Записать клиента на занятие</h3>
                <button onClick={() => setShowAddBookingModal(false)} className="text-purple-300 hover:text-white hover:bg-purple-600/30 rounded-lg p-2 transition-all">
                  <XIcon />
                </button>
              </div>
              
              <form onSubmit={handleAddBooking} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Имя клиента <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                    placeholder="Введите имя клиента"
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Телефон <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.clientPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Направление <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={bookingForm.direction}
                    onChange={(e) => setBookingForm({ ...bookingForm, direction: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Выберите направление</option>
                    <option value="Pole Fit">Pole Fit</option>
                    <option value="Pole Exotic">Pole Exotic</option>
                    <option value="Сила & Гибкость">Сила & Гибкость</option>
                    <option value="Растяжка">Растяжка</option>
                    <option value="Choreo">Choreo</option>
                    <option value="Strip">Strip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Дата <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Время <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Записать клиента
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddBookingModal(false)}>
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно добавления абонемента */}
        {showAddSubscriptionModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-indigo-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-b from-purple-900/98 to-purple-900/95 backdrop-blur-xl border-b border-purple-400/20 p-5 sm:p-6 flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">Добавить абонемент</h3>
                <button onClick={() => setShowAddSubscriptionModal(false)} className="text-purple-300 hover:text-white hover:bg-purple-600/30 rounded-lg p-2 transition-all">
                  <XIcon />
                </button>
              </div>
              
              <form onSubmit={handleAddSubscription} className="p-4 sm:p-6 space-y-4">
                {/* Имя */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Имя <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subscriptionForm.firstName}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, firstName: e.target.value })}
                    placeholder="Введите имя"
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Фамилия */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Фамилия <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subscriptionForm.lastName}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, lastName: e.target.value })}
                    placeholder="Введите фамилию"
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Телефон */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Телефон <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={subscriptionForm.clientPhone}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, clientPhone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Адрес студии */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Адрес студии <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={subscriptionForm.hall}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, hall: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Выберите студию</option>
                    <option value="Волгина, 117А">Волгина, 117А</option>
                    <option value="ТОЦ Охотный ряд">ТОЦ "Охотный ряд"</option>
                  </select>
                </div>

                {/* Тип абонемента */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Тип абонемента <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={subscriptionForm.subscriptionType}
                    onChange={(e) => {
                      const type = e.target.value
                      let lessons = '', price = ''
                      if (type === 'КЛАССИЧЕСКИЙ') { lessons = '8 занятий'; price = '3800' }
                      else if (type === 'ТОЛЬКО ФИТНЕС') { lessons = '12 занятий'; price = '3700' }
                      else if (type === 'КОМБО-АБОНЕМЕНТ') { lessons = '4+4 занятия'; price = '3500' }
                      setSubscriptionForm({ ...subscriptionForm, subscriptionType: type, lessons, price })
                    }}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Выберите тип абонемента</option>
                    <option value="КЛАССИЧЕСКИЙ">КЛАССИЧЕСКИЙ</option>
                    <option value="ТОЛЬКО ФИТНЕС">ТОЛЬКО ФИТНЕС</option>
                    <option value="КОМБО-АБОНЕМЕНТ">КОМБО-АБОНЕМЕНТ</option>
                  </select>
                </div>

                {/* Количество занятий */}
                {subscriptionForm.subscriptionType && (
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Количество занятий <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={subscriptionForm.lessons}
                      onChange={(e) => {
                        const lessons = e.target.value
                        setSubscriptionForm({ ...subscriptionForm, lessons })
                      }}
                      className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">Выберите количество занятий</option>
                      {subscriptionForm.subscriptionType === 'КЛАССИЧЕСКИЙ' && (
                        <>
                          <option value="4 занятия">4 занятия</option>
                          <option value="8 занятий">8 занятий</option>
                        </>
                      )}
                      {subscriptionForm.subscriptionType === 'ТОЛЬКО ФИТНЕС' && (
                        <>
                          <option value="4 занятия">4 занятия</option>
                          <option value="8 занятий">8 занятий</option>
                          <option value="12 занятий">12 занятий</option>
                        </>
                      )}
                      {subscriptionForm.subscriptionType === 'КОМБО-АБОНЕМЕНТ' && (
                        <>
                          <option value="4+4 занятия">4+4 занятия</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* Информация о выбранном абонементе */}
                {subscriptionForm.subscriptionType && subscriptionForm.lessons && (
                  <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-500/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-purple-300/70">Тип абонемента:</span>
                        <p className="text-white font-semibold mt-1">{subscriptionForm.subscriptionType}</p>
                      </div>
                      <div>
                        <span className="text-purple-300/70">Количество:</span>
                        <p className="text-white font-semibold mt-1">{subscriptionForm.lessons}</p>
                      </div>
                      <div>
                        <span className="text-purple-300/70">Стоимость:</span>
                        <p className="text-white font-semibold mt-1">{subscriptionForm.price} ₽</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Тип записи <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSubscriptionForm({ ...subscriptionForm, bookingType: 'flexible' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        subscriptionForm.bookingType === 'flexible'
                          ? 'border-purple-400 bg-purple-600/30'
                          : 'border-purple-500/20 bg-purple-800/20'
                      }`}
                    >
                      <h4 className="text-white font-semibold mb-1">Гибкая</h4>
                      <p className="text-xs text-purple-200/70">Запись каждый раз по-разному</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubscriptionForm({ ...subscriptionForm, bookingType: 'automatic' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        subscriptionForm.bookingType === 'automatic'
                          ? 'border-purple-400 bg-purple-600/30'
                          : 'border-purple-500/20 bg-purple-800/20'
                      }`}
                    >
                      <h4 className="text-white font-semibold mb-1">Автомат</h4>
                      <p className="text-xs text-purple-200/70">Закрепление за направлением и днями</p>
                    </button>
                  </div>
                </div>

                {subscriptionForm.bookingType === 'automatic' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Направление <span className="text-red-400">*</span>
                      </label>
                      <select
                        required={subscriptionForm.bookingType === 'automatic'}
                        value={subscriptionForm.direction}
                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, direction: e.target.value })}
                        className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="">Выберите направление</option>
                        <option value="Pole Fit">Pole Fit</option>
                        <option value="Pole Exotic">Pole Exotic</option>
                        <option value="Сила & Гибкость">Сила & Гибкость</option>
                        <option value="Растяжка">Растяжка</option>
                        <option value="Choreo">Choreo</option>
                        <option value="Strip">Strip</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Дни недели <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const weekdays = subscriptionForm.weekdays || []
                              if (weekdays.includes(day)) {
                                setSubscriptionForm({
                                  ...subscriptionForm,
                                  weekdays: weekdays.filter(d => d !== day)
                                })
                              } else {
                                setSubscriptionForm({
                                  ...subscriptionForm,
                                  weekdays: [...weekdays, day]
                                })
                              }
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              (subscriptionForm.weekdays || []).includes(day)
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-800/30 text-purple-200'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-purple-200/60 mt-2">
                        Выберите дни, в которые клиент будет посещать занятия
                      </p>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Добавить абонемент
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddSubscriptionModal(false)}>
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно для причины отказа */}
        {rejectionModal.isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-purple-900 to-black rounded-3xl max-w-md w-full border border-red-500/30 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-400/50 flex items-center justify-center text-red-400 text-2xl">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Отклонить заявку</h2>
                  <p className="text-sm text-purple-200/70">Укажите причину отказа</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Причина отказа <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Например: К сожалению, на выбранное время нет свободных мест..."
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                  rows={4}
                  disabled={loading}
                />
                <p className="text-xs text-purple-200/60 mt-2">
                  Клиент получит уведомление с указанной причиной
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={confirmRejection}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
                >
                  {loading ? 'Отправка...' : 'Отклонить заявку'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectionModal({ isOpen: false, subscriptionId: null })
                    setRejectionReason('')
                  }}
                  disabled={loading}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

