'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'
import api, { subscriptionsAPI, Subscription, lessonsAPI, Lesson, trainersAPI, Trainer, directionsAPI, Direction, hallsAPI, Hall, bookingsAPI, Booking, recurringLessonsAPI, statsAPI, RentalBooking, PricesData, notificationsAPI } from '@/lib/api'
import NotificationsSection from '@/components/NotificationsSection'
import { CalendarIcon, ClipboardIcon, UserIcon, MapPinIcon, RobotIcon, SnowflakeIcon, FireIcon, SunIcon, MoonIcon, UsersIcon, TicketIcon, MoneyIcon, TrashIcon, CheckIcon, XIcon, RefreshIcon, LightningIcon, BroomIcon, CheckCircleIcon, XCircleIcon, BookIcon, ChartIcon, CrystalBallIcon, SearchIcon, HourglassIcon } from '@/components/ui/icons'

// Иконки с поддержкой className
const ChevronLeftIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const BellIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const DollarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)


const HomeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'bookings' | 'subscriptions' | 'schedule' | 'staff' | 'notifications' | 'stats' | 'rentals' | 'prices'>('subscriptions')
  const [subscriptionTab, setSubscriptionTab] = useState<'pending' | 'confirmed' | 'frozen'>('pending')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [directions, setDirections] = useState<Direction[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLessons, setBookingsLessons] = useState<Lesson[]>([])
  const [selectedLessonBookings, setSelectedLessonBookings] = useState<{
    lesson: Lesson | null;
    bookings: Booking[];
  }>({
    lesson: null,
    bookings: []
  })
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{
    confirmedSubscriptions: number;
    confirmedSubscriptionsSum: number;
    totalLessons: number;
    activeUsers: number;
    totalSubscriptions: number;
    totalBookings: number;
    upcomingLessons: number;
    period: string;
  } | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsPeriod, setStatsPeriod] = useState<'day' | 'week' | 'month' | 'all'>('all')
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    type: 'subscriptions' | 'lessons' | 'users' | 'bookings' | null;
    data: any[];
    title: string;
  }>({
    isOpen: false,
    type: null,
    data: [],
    title: ''
  })
  const [detailLoading, setDetailLoading] = useState(false)
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; subscriptionId: number | null }>({ 
    isOpen: false, 
    subscriptionId: null 
  })
  const [rejectionReason, setRejectionReason] = useState('')
  const [showAddLessonModal, setShowAddLessonModal] = useState(false)
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false)
  const [showTemplatesList, setShowTemplatesList] = useState(false)
  const [newLesson, setNewLesson] = useState({
    hall_id: '',
    direction_id: '',
    trainer_id: '',
    lesson_date: '',
    start_time: '',
    end_time: '',
    capacity: '6',
    description: ''
  })
  // Новая структура: один шаблон для тренера с несколькими занятиями
  const [newTemplate, setNewTemplate] = useState({
    trainer_id: '',
    schedule_items: [] as Array<{
      day_of_week: number;
      direction_id: string;
      hall_id: string;
      start_time: string;
      end_time: string;
      capacity: string;
      description: string;
    }>
  })
  const [recurringTemplates, setRecurringTemplates] = useState<any[]>([])
  const [scheduleFilters, setScheduleFilters] = useState({
    hall_id: '',
    trainer_id: '',
    direction_id: '',
    time_period: '' // 'morning', 'evening', ''
  })
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null)
  
  // Notifications state
  const [notificationSubTab, setNotificationSubTab] = useState<'create' | 'templates' | 'schedules' | 'history'>('create')
  const [notificationTemplates, setNotificationTemplates] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationSchedules, setNotificationSchedules] = useState<any[]>([])
  const [notificationUsers, setNotificationUsers] = useState<any[]>([])
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [newNotification, setNewNotification] = useState({
    templateId: '',
    userId: '',
    title: '',
    message: '',
    type: 'personal',
    targetAudience: 'single',
    targetConfig: {},
    scheduledAt: ''
  })
  const [newNotificationTemplate, setNewNotificationTemplate] = useState({
    name: '',
    type: 'personal',
    title: '',
    message: '',
    variables: {}
  })
  const [newSchedule, setNewSchedule] = useState({
    templateId: '',
    name: '',
    scheduleType: 'daily',
    scheduleConfig: {},
    targetAudience: 'all',
    targetConfig: {}
  })
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    last_name: '',
    directions: [] as number[],
    bio: '',
    is_active: true
  })
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([])
  const [rentalStatusFilter, setRentalStatusFilter] = useState<'pending' | 'confirmed' | 'cancelled' | 'all'>('pending')
  const [rentalLoading, setRentalLoading] = useState(false)
  const [prices, setPrices] = useState<PricesData | null>(null)
  const [pricesLoading, setPricesLoading] = useState(false)
  const [editingPrice, setEditingPrice] = useState<{ type: 'subscription' | 'hall' | 'pole'; id?: number; value: number } | null>(null)

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      loadSubscriptions()
    } else if (activeTab === 'schedule') {
      loadScheduleData()
      loadRecurringTemplates()
    } else if (activeTab === 'bookings') {
      loadBookings()
    } else if (activeTab === 'rentals') {
      loadRentalBookings()
    } else if (activeTab === 'staff') {
      loadStaff()
    } else if (activeTab === 'prices') {
      loadPrices()
    } else if (activeTab === 'stats') {
      loadStats(statsPeriod)
    }
  }, [activeTab, subscriptionTab])

  // Отдельный эффект для загрузки аренды при изменении фильтра
  useEffect(() => {
    if (activeTab === 'rentals') {
      loadRentalBookings()
    }
  }, [rentalStatusFilter])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await subscriptionsAPI.getRequests(subscriptionTab)
      const data = response.requests || response
      setSubscriptions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
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

  const handleFreezeSubscription = async (id: number) => {
    if (!confirm('Заморозить этот абонемент?')) return
    try {
      setLoading(true)
      await subscriptionsAPI.freeze(id)
      await loadSubscriptions()
      alert('✅ Абонемент заморожен')
    } catch (error: any) {
      console.error('Ошибка заморозки:', error)
      alert(`❌ ${error.message || 'Ошибка при заморозке абонемента'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUnfreezeSubscription = async (id: number) => {
    if (!confirm('Разморозить этот абонемент?')) return
    try {
      setLoading(true)
      await subscriptionsAPI.unfreeze(id)
      await loadSubscriptions()
      alert('✅ Абонемент разморожен')
    } catch (error: any) {
      console.error('Ошибка разморозки:', error)
      alert(`❌ ${error.message || 'Ошибка при разморозке абонемента'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubscription = async (id: number) => {
    if (!confirm('Удалить этот абонемент? Это действие нельзя отменить!')) return
    try {
      setLoading(true)
      await subscriptionsAPI.remove(id)
      await loadSubscriptions()
      alert('✅ Абонемент удалён')
    } catch (error: any) {
      console.error('Ошибка удаления:', error)
      alert(`❌ ${error.message || 'Ошибка при удалении абонемента'}`)
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

  const loadScheduleData = async () => {
    try {
      setLoading(true)
      
      // Загружаем данные параллельно (для админа показываем все занятия, включая прошедшие)
      const [lessonsRes, trainersRes, directionsRes, hallsRes] = await Promise.all([
        lessonsAPI.getAll({ 
          from_date: new Date().toISOString().split('T')[0], 
          to_date: getDatePlusDays(30),
          include_past: 'true' // Админ видит все занятия
        }),
        trainersAPI.getAll(),
        directionsAPI.getAll(),
        hallsAPI.getAll()
      ])
      
      setLessons(lessonsRes.lessons || [])
      setTrainers(trainersRes.trainers || [])
      setDirections(directionsRes.directions || [])
      setHalls(hallsRes.halls || [])
    } catch (error) {
      console.error('Ошибка загрузки данных расписания:', error)
      setLessons([])
      setTrainers([])
      setDirections([])
      setHalls([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newLesson.hall_id || !newLesson.direction_id || !newLesson.trainer_id || 
        !newLesson.lesson_date || !newLesson.start_time || !newLesson.end_time) {
      alert('⚠️ Заполните все обязательные поля')
      return
    }

    try {
      setLoading(true)
      await lessonsAPI.create({
        hall_id: parseInt(newLesson.hall_id),
        direction_id: parseInt(newLesson.direction_id),
        trainer_id: parseInt(newLesson.trainer_id),
        lesson_date: newLesson.lesson_date,
        start_time: newLesson.start_time,
        end_time: newLesson.end_time,
        capacity: parseInt(newLesson.capacity),
        description: newLesson.description || undefined
      })
      
      alert('✅ Занятие создано!')
      setShowAddLessonModal(false)
      setNewLesson({
        hall_id: '',
        direction_id: '',
        trainer_id: '',
        lesson_date: '',
        start_time: '',
        end_time: '',
        capacity: '6',
        description: ''
      })
      await loadScheduleData()
    } catch (error: any) {
      console.error('Ошибка создания занятия:', error)
      alert(`❌ ${error.message || 'Ошибка создания занятия'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLesson = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это занятие?')) return
    
    try {
      setLoading(true)
      await lessonsAPI.delete(id)
      alert('✅ Занятие удалено')
      await loadScheduleData()
    } catch (error) {
      console.error('Ошибка удаления занятия:', error)
      alert('❌ Ошибка удаления занятия')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupPastLessons = async () => {
    if (!confirm('Удалить все прошедшие занятия и связанные бронирования?')) return

    try {
      setLoading(true)
      const response = await lessonsAPI.cleanupPast()
      alert(`✅ ${response.message}`)
      await loadScheduleData()
    } catch (error: any) {
      console.error('Ошибка очистки прошедших занятий:', error)
      alert(`❌ ${error.message || 'Ошибка очистки прошедших занятий'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClearSchedule = async () => {
    if (!confirm('⚠️ ВНИМАНИЕ! Вы уверены, что хотите очистить всё расписание?\n\nЭто действие удалит:\n• Все созданные занятия\n• Все бронирования\n\nШаблоны останутся нетронутыми и вы сможете сгенерировать новое расписание.\n\nЭто действие нельзя отменить!')) return
    
    try {
      setLoading(true)
      
      // Принудительно очищаем состояние перед запросом
      setLessons([])
      setBookings([])
      
      const response = await lessonsAPI.clear()
      console.log('Очистка расписания:', response)
      
      // Проверяем, что очистка прошла успешно
      if (response.deleted_lessons > 0 || response.deleted_bookings > 0) {
        console.log(`✅ Очищено: ${response.deleted_lessons} занятий, ${response.deleted_bookings} бронирований`)
      }
      
      // Принудительно очищаем состояние
      setLessons([])
      setBookings([])
      
      // Небольшая задержка для гарантии, что backend завершил транзакцию
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Принудительно очищаем состояние перед загрузкой
      setLessons([])
      setBookings([])
      
      // Перезагружаем данные
      await loadScheduleData()
      
      // Дополнительная проверка - если после загрузки все еще есть занятия, принудительно очищаем
      const verifyResponse = await lessonsAPI.getAll({ 
        from_date: new Date().toISOString().split('T')[0], 
        to_date: getDatePlusDays(365),
        include_past: 'true'
      })
      
      if (verifyResponse.lessons && verifyResponse.lessons.length > 0) {
        console.warn('⚠️ После очистки все еще есть занятия:', verifyResponse.lessons.length)
        console.warn('Занятия:', verifyResponse.lessons)
        // Принудительно очищаем состояние
        setLessons([])
        setBookings([])
        alert(`⚠️ Очистка выполнена, но обнаружены оставшиеся занятия. Пожалуйста, обновите страницу (F5).`)
      } else {
        console.log('✅ Расписание успешно очищено')
        // Принудительно очищаем состояние для гарантии
        setLessons([])
        setBookings([])
        alert(`✅ Расписание очищено!\n\nУдалено:\n• ${response.deleted_lessons} занятий\n• ${response.deleted_bookings} бронирований`)
      }
    } catch (error: any) {
      console.error('Ошибка очистки расписания:', error)
      alert(`❌ ${error.message || 'Ошибка очистки расписания'}`)
    } finally {
      setLoading(false)
    }
  }

  const getDatePlusDays = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  // Фильтрация занятий
  const getFilteredLessons = () => {
    return lessons.filter(lesson => {
      // Фильтр по залу
      if (scheduleFilters.hall_id && lesson.hall_id !== parseInt(scheduleFilters.hall_id)) {
        return false
      }

      // Фильтр по тренеру
      if (scheduleFilters.trainer_id && lesson.trainer_id !== parseInt(scheduleFilters.trainer_id)) {
        return false
      }

      // Фильтр по направлению
      if (scheduleFilters.direction_id && lesson.direction_id !== parseInt(scheduleFilters.direction_id)) {
        return false
      }

      // Фильтр по времени (утро/вечер)
      if (scheduleFilters.time_period) {
        const startHour = parseInt(lesson.start_time.split(':')[0])
        if (scheduleFilters.time_period === 'morning' && startHour >= 15) {
          return false
        }
        if (scheduleFilters.time_period === 'evening' && startHour < 15) {
          return false
        }
      }

      return true
    })
  }

  const loadRecurringTemplates = async () => {
    try {
      const response = await recurringLessonsAPI.getAll()
      setRecurringTemplates(response.templates || [])
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error)
      setRecurringTemplates([])
    }
  }

  // Добавить новый элемент расписания
  const addScheduleItem = () => {
    setNewTemplate({
      ...newTemplate,
      schedule_items: [
        ...newTemplate.schedule_items,
        {
          day_of_week: 1, // Понедельник по умолчанию
          direction_id: '',
          hall_id: '',
          start_time: '',
          end_time: '',
          capacity: '6',
          description: ''
        }
      ]
    })
  }

  // Удалить элемент расписания
  const removeScheduleItem = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      schedule_items: newTemplate.schedule_items.filter((_, i) => i !== index)
    })
  }

  // Обновить элемент расписания
  const updateScheduleItem = (index: number, field: string, value: any) => {
    const updated = [...newTemplate.schedule_items]
    updated[index] = { ...updated[index], [field]: value }
    setNewTemplate({ ...newTemplate, schedule_items: updated })
  }

  const handleAddTemplate = async () => {
    if (!newTemplate.trainer_id) {
      alert('⚠️ Выберите тренера')
      return
    }

    if (newTemplate.schedule_items.length === 0) {
      alert('⚠️ Добавьте хотя бы одно занятие в расписание')
      return
    }

    // Проверяем, что все элементы заполнены
    for (let i = 0; i < newTemplate.schedule_items.length; i++) {
      const item = newTemplate.schedule_items[i]
      if (!item.day_of_week || !item.direction_id || !item.hall_id || !item.start_time || !item.end_time) {
        const missingFields = []
        if (!item.day_of_week) missingFields.push('день недели')
        if (!item.direction_id) missingFields.push('направление')
        if (!item.hall_id) missingFields.push('зал')
        if (!item.start_time) missingFields.push('время начала')
        if (!item.end_time) missingFields.push('время окончания')
        alert(`⚠️ Заполните все поля для занятия ${i + 1}. Отсутствуют: ${missingFields.join(', ')}`)
        return
      }
      
      // Проверяем, что day_of_week в диапазоне 1-7
      if (item.day_of_week < 1 || item.day_of_week > 7) {
        alert(`⚠️ Некорректный день недели для занятия ${i + 1}. Должно быть от 1 до 7.`)
        return
      }
    }

    try {
      setLoading(true)
      // Подготавливаем данные для отправки
      const scheduleItems = newTemplate.schedule_items.map(item => ({
        day_of_week: typeof item.day_of_week === 'string' ? parseInt(item.day_of_week) || 1 : item.day_of_week || 1,
        direction_id: typeof item.direction_id === 'string' ? parseInt(item.direction_id) : parseInt(String(item.direction_id)),
        hall_id: typeof item.hall_id === 'string' ? parseInt(item.hall_id) : parseInt(String(item.hall_id)),
        start_time: item.start_time,
        end_time: item.end_time,
        capacity: typeof item.capacity === 'string' ? parseInt(item.capacity) || 6 : parseInt(String(item.capacity)) || 6,
        description: item.description || undefined
      }))
      
      console.log('📤 Отправка шаблона:', {
        trainer_id: parseInt(newTemplate.trainer_id),
        schedule_items: scheduleItems
      })
      
      await recurringLessonsAPI.createBatch({
        trainer_id: parseInt(newTemplate.trainer_id),
        schedule_items: scheduleItems
      })

      alert(`✅ Создано ${newTemplate.schedule_items.length} шаблонов расписания для тренера!`)
      setShowAddTemplateModal(false)
      setNewTemplate({
        trainer_id: '',
        schedule_items: []
      })
      await loadRecurringTemplates()
    } catch (error: any) {
      console.error('Ошибка создания шаблона:', error)
      alert(`❌ ${error.message || 'Ошибка создания шаблона'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Удалить этот шаблон? Существующие занятия не будут удалены.')) return

    try {
      setLoading(true)
      await recurringLessonsAPI.remove(id)
      alert('✅ Шаблон удалён')
      await loadRecurringTemplates()
    } catch (error) {
      console.error('Ошибка удаления шаблона:', error)
      alert('❌ Ошибка удаления шаблона')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateLessons = async () => {
    // Вычисляем количество недель до конца года
    const today = new Date()
    const endOfYear = new Date(today.getFullYear(), 11, 31) // 31 декабря текущего года
    const daysUntilEndOfYear = Math.ceil((endOfYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const weeksUntilEndOfYear = Math.ceil(daysUntilEndOfYear / 7)
    
    if (!confirm(`Сгенерировать занятия до конца ${today.getFullYear()} года (примерно ${weeksUntilEndOfYear} недель) на основе шаблонов?\n\nЭто может занять некоторое время...`)) return

    try {
      setLoading(true)
      console.log('🔄 Начало генерации занятий...')
      
      // Не передаем weeks, чтобы backend генерировал до конца года
      // Таймаут увеличен до 2 минут для длительных операций
      const response = await recurringLessonsAPI.generate()
      
      console.log('✅ Генерация завершена:', response)
      alert(`✅ ${response.message}`)
      await loadScheduleData()
    } catch (error: any) {
      console.error('Ошибка генерации занятий:', error)
      
      // Проверяем, является ли ошибка таймаутом
      if (error.name === 'TimeoutError' || error.message?.includes('timeout') || error.message?.includes('timed out')) {
        alert(`⏱️ Генерация занятий занимает больше времени, чем ожидалось.\n\nПопробуйте:\n1. Обновить страницу (F5)\n2. Проверить, что занятия сгенерировались\n3. Если занятия не появились, попробуйте снова`)
      } else {
        alert(`❌ ${error.message || 'Ошибка генерации занятий'}`)
      }
    } finally {
      setLoading(false)
    }
  }


  const loadBookings = async () => {
    try {
      setLoading(true)
      // Загружаем занятия с будущими датами
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const nextMonthStr = nextMonth.toISOString().split('T')[0]
      
      const lessonsResponse = await lessonsAPI.getAll({ 
        from_date: today, 
        to_date: nextMonthStr 
      })
      setBookingsLessons(lessonsResponse.lessons || [])
    } catch (error) {
      console.error('Ошибка загрузки занятий:', error)
      setBookingsLessons([])
    } finally {
      setLoading(false)
    }
  }

  const loadLessonBookings = async (lessonId: number) => {
    try {
      const response = await bookingsAPI.getAll()
      const lessonBookings = response.bookings?.filter((b: Booking) => b.lesson_id === lessonId) || []
      const lesson = bookingsLessons.find(l => l.id === lessonId)
      
      setSelectedLessonBookings({
        lesson: lesson || null,
        bookings: lessonBookings
      })
      setBookingsModalOpen(true)
    } catch (error) {
      console.error('Ошибка загрузки записей на занятие:', error)
      alert('Ошибка загрузки записей на занятие')
    }
  }

  const loadStaff = async () => {
    try {
      setLoading(true)
      const response = await trainersAPI.getAll()
      setTrainers(response.trainers || [])
      // Также загружаем направления для выбора в форме
      const directionsRes = await directionsAPI.getAll()
      setDirections(directionsRes.directions || [])
    } catch (error) {
      console.error('Ошибка загрузки персонала:', error)
      setTrainers([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenStaffModal = (trainer?: Trainer) => {
    if (trainer) {
      setEditingTrainer(trainer)
      setStaffFormData({
        name: trainer.name,
        last_name: trainer.last_name || '',
        directions: trainer.directions || [],
        bio: trainer.bio || '',
        is_active: trainer.is_active
      })
    } else {
      setEditingTrainer(null)
      setStaffFormData({
        name: '',
        last_name: '',
        directions: [],
        bio: '',
        is_active: true
      })
    }
    setShowStaffModal(true)
  }

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!staffFormData.name.trim()) {
      alert('⚠️ Заполните имя')
      return
    }

    try {
      setLoading(true)
      
      if (editingTrainer) {
        // Обновление
        await trainersAPI.update(editingTrainer.id, staffFormData)
        alert('✅ Тренер обновлен')
      } else {
        // Создание
        await trainersAPI.create(staffFormData)
        alert('✅ Тренер добавлен')
      }
      
      setShowStaffModal(false)
      await loadStaff()
    } catch (error: any) {
      console.error('Ошибка сохранения тренера:', error)
      alert(`❌ ${error.message || 'Ошибка при сохранении тренера'}`)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (period: 'day' | 'week' | 'month' | 'all' = statsPeriod) => {
    try {
      setStatsLoading(true)
      const data = await statsAPI.get(period)
      setStats(data)
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadRentalBookings = async () => {
    try {
      setRentalLoading(true)
      const status = rentalStatusFilter === 'all' ? undefined : rentalStatusFilter
      const data = await (api as any).getAllRentalBookings(status)
      setRentalBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Ошибка загрузки заявок на аренду:', error)
      setRentalBookings([])
    } finally {
      setRentalLoading(false)
    }
  }

  const loadPrices = async () => {
    try {
      setPricesLoading(true)
      const data = await (api as any).getPrices()
      setPrices(data)
    } catch (error) {
      console.error('Ошибка загрузки цен:', error)
      alert('Ошибка при загрузке цен')
    } finally {
      setPricesLoading(false)
    }
  }

  const handleUpdatePrice = async (type: 'subscription' | 'hall' | 'pole', id: number | undefined, newPrice: number) => {
    if (!newPrice || newPrice < 0) {
      alert('Введите корректную цену')
      return
    }

    try {
      setLoading(true)
      if (type === 'subscription' && id) {
        await (api as any).updateSubscriptionTypePrice(id, newPrice)
      } else if (type === 'hall' && id) {
        await (api as any).updateHallPrice(id, newPrice)
      } else if (type === 'pole') {
        await (api as any).updatePoleRentalPrice(newPrice)
      }
      
      await loadPrices()
      setEditingPrice(null)
      alert('✅ Цена успешно обновлена')
    } catch (error: any) {
      console.error('Ошибка обновления цены:', error)
      alert(`❌ ${error.message || 'Ошибка при обновлении цены'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRentalStatus = async (id: number, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      setRentalLoading(true)
      await (api as any).updateRentalBookingStatus(id, status)
      await loadRentalBookings()
      alert(`✅ Статус заявки обновлен на "${status === 'confirmed' ? 'Подтверждено' : status === 'cancelled' ? 'Отменено' : 'Ожидание'}"`)
    } catch (error: any) {
      console.error('Ошибка обновления статуса:', error)
      alert(`❌ ${error.message || 'Ошибка при обновлении статуса'}`)
    } finally {
      setRentalLoading(false)
    }
  }

  const loadDetailStats = async (type: 'subscriptions' | 'lessons' | 'users' | 'bookings') => {
    try {
      setDetailLoading(true)
      let data;
      let title = '';
      
      switch (type) {
        case 'subscriptions':
          data = await statsAPI.getSubscriptions(statsPeriod)
          title = 'Подтвержденные абонементы'
          break
        case 'lessons':
          data = await statsAPI.getLessons(statsPeriod)
          title = 'Все занятия'
          break
        case 'users':
          data = await statsAPI.getUsers()
          title = 'Активные пользователи'
          break
        case 'bookings':
          data = await statsAPI.getBookings(statsPeriod)
          title = 'Все записи'
          break
      }
      
      setDetailModal({
        isOpen: true,
        type,
        data: type === 'subscriptions' ? (data as any).subscriptions :
              type === 'lessons' ? (data as any).lessons :
              type === 'users' ? (data as any).users :
              (data as any).bookings,
        title
      })
    } catch (error) {
      console.error('Ошибка загрузки детальной статистики:', error)
      alert('Ошибка загрузки детальной статистики')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDeleteStaff = async (id: number) => {
    if (!confirm('Удалить этого тренера? Это действие нельзя отменить!')) return
    
    try {
      setLoading(true)
      await trainersAPI.delete(id)
      alert('✅ Тренер удален')
      await loadStaff()
    } catch (error: any) {
      console.error('Ошибка удаления тренера:', error)
      alert(`❌ ${error.message || 'Ошибка при удалении тренера'}`)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'bookings' as const, label: 'Записи', icon: CalendarIcon, badge: 0 },
    { id: 'subscriptions' as const, label: 'Абонементы', icon: TicketIcon, badge: subscriptions.filter(s => s.status === 'pending').length },
    { id: 'rentals' as const, label: 'Аренда', icon: HomeIcon, badge: rentalBookings.filter(r => r.status === 'pending').length },
    { id: 'schedule' as const, label: 'Расписание', icon: ClockIcon },
    { id: 'staff' as const, label: 'Персонал', icon: UsersIcon },
    { id: 'prices' as const, label: 'Цены', icon: DollarIcon },
    { id: 'notifications' as const, label: 'Уведомления', icon: BellIcon },
    { id: 'stats' as const, label: 'Статистика', icon: ChartIcon },
  ]

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen relative flex flex-col z-10">
        
        {/* Header */}
        <div className="relative z-20 bg-purple-900/40 backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2 hover:bg-purple-600/20 transition-all"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Назад</span>
              </Button>
              <div className="flex-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Панель администратора
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative z-20 bg-purple-900/30 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex overflow-x-auto hide-scrollbar gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all relative whitespace-nowrap text-xs ${
                    activeTab === tab.id
                      ? 'bg-purple-600/30 text-white border-t-2 border-purple-400'
                      : 'text-purple-200/70 hover:bg-purple-600/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold">
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
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-6 flex-1">
          {/* Управление записями */}
          {activeTab === 'bookings' && (
            <div className="space-y-5">
              <div className="mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Статистика по занятиям
                </h2>
                <p className="text-sm text-purple-200/70">
                  Просматривайте расписание и записи клиентов в живом режиме
                </p>
              </div>

              {loading && bookingsLessons.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-top-purple-500 rounded-full animate-spin"></div>
                  <p className="text-purple-200 mt-4 text-sm sm:text-base">Загрузка занятий...</p>
                </div>
              ) : bookingsLessons.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-10 h-10 text-purple-400" />
                  </div>
                  <p className="text-purple-200 text-lg font-semibold">Нет занятий</p>
                  <p className="text-purple-200/70 text-sm mt-2">
                    Создайте занятия в разделе&nbsp;
                    <span className="font-semibold">«Расписание»</span>
                  </p>
                </div>
              ) : (() => {
                // Группируем занятия по датам
                const lessonsByDate = bookingsLessons.reduce((acc, lesson) => {
                  const date = lesson.lesson_date || ''
                  if (!acc[date]) {
                    acc[date] = []
                  }
                  acc[date].push(lesson)
                  return acc
                }, {} as Record<string, Lesson[]>)

                // Сортируем даты
                const sortedDates = Object.keys(lessonsByDate).sort()

                return (
                  <div className="space-y-6">
                    {sortedDates.map((date) => {
                      const dateLessons = lessonsByDate[date].sort((a, b) => 
                        (a.start_time || '').localeCompare(b.start_time || '')
                      )
                      const lessonDate = new Date(date)
                      const dateStr = lessonDate.toLocaleDateString('ru-RU', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        weekday: 'long'
                      })

                      return (
                        <div key={date} className="space-y-3">
                          <h3
                            className="text-sm sm:text-base font-semibold text-white sticky top-16 sm:top-20 z-10
                                       bg-gradient-to-r from-purple-700/90 via-purple-800/95 to-purple-900/95
                                       backdrop-blur-xl px-4 py-2 rounded-xl border border-purple-500/30 shadow-[0_0_25px_rgba(147,51,234,0.45)]"
                          >
                            {dateStr}
                          </h3>
                          <div className="grid gap-3">
                            {dateLessons.map((lesson) => {
                              const availableSpots = lesson.capacity - lesson.current_bookings
                              const isFull = availableSpots <= 0
                              
                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => loadLessonBookings(lesson.id)}
                                  className="group relative rounded-xl border border-purple-500/30 
                                             bg-gradient-to-br from-purple-800/80 via-purple-900/90 to-black/80
                                             p-4 sm:p-5 shadow-[0_0_25px_rgba(147,51,234,0.3)]
                                             hover:border-purple-400/70 hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]
                                             transition-all cursor-pointer"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className="px-3 py-1 rounded-full bg-purple-600/40 border border-purple-300/40 shadow-inner">
                                          <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                                            {lesson.start_time} - {lesson.end_time}
                                          </span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full ${
                                          isFull 
                                            ? 'bg-red-500/20 text-red-200 border border-red-400/50' 
                                            : 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/60'
                                        }`}>
                                          <UsersIcon className="w-3 h-3 inline mr-1" />
                                          <span className="text-xs font-bold">
                                            {lesson.current_bookings}/{lesson.capacity}
                                          </span>
                                        </div>
                                      </div>

                                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">
                                        {lesson.direction_name}
                                      </h3>

                                      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-purple-200/80">
                                        <div className="flex items-center gap-1.5">
                                          <UserIcon className="w-4 h-4" />
                                          <span>{lesson.trainer_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <MapPinIcon className="w-4 h-4" />
                                          <span>{lesson.hall_name}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className="text-right">
                                        <p className="text-xs sm:text-sm text-purple-200/70">Записано</p>
                                        <p className="text-lg sm:text-xl font-bold text-white leading-none">
                                          {lesson.current_bookings}
                                        </p>
                                      </div>
                                      <div
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-600/40 border border-purple-300/60 
                                                   flex items-center justify-center text-purple-50 text-base sm:text-lg
                                                   group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                                      >
                                        →
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Управление абонементами */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Управление абонементами
                </h2>
                <p className="text-sm text-purple-200/70">Подтверждайте, замораживайте и управляйте абонементами</p>
              </div>

              {/* Подвкладки для статусов */}
              <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setSubscriptionTab('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    subscriptionTab === 'pending'
                      ? 'bg-yellow-600/30 text-yellow-300 border-2 border-yellow-500/50'
                      : 'bg-purple-900/30 text-purple-300 border border-purple-500/30 hover:bg-purple-800/40'
                  }`}
                >
                  ⏳ Ожидают подтверждения
                </button>
                <button
                  onClick={() => setSubscriptionTab('confirmed')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    subscriptionTab === 'confirmed'
                      ? 'bg-green-600/30 text-purple-300 border-2 border-green-500/50'
                      : 'bg-purple-900/30 text-purple-300 border border-purple-500/30 hover:bg-purple-800/40'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    <span>Активны</span>
                  </span>
                </button>
                <button
                  onClick={() => setSubscriptionTab('frozen')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    subscriptionTab === 'frozen'
                      ? 'bg-blue-600/30 text-blue-300 border-2 border-blue-500/50'
                      : 'bg-purple-900/30 text-purple-300 border border-purple-500/30 hover:bg-purple-800/40'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <SnowflakeIcon className="w-4 h-4" />
                    <span>Заморожены</span>
                  </span>
                </button>
              </div>

              {loading && subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-purple-200 mt-4">Загрузка заявок...</p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-4xl mx-auto mb-4">
                    <ClipboardIcon className="w-12 h-12 text-purple-400" />
                  </div>
                  <p className="text-purple-200 text-lg">Нет заявок на абонементы</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {Array.isArray(subscriptions) && subscriptions.map((subscription) => {
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
                                ? 'bg-green-500/20 text-purple-400 border border-green-500/30' 
                                : subscription.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {subscription.status === 'confirmed' ? (
                                <CheckIcon className="w-4 h-4" />
                              ) : subscription.status === 'rejected' ? (
                                <XIcon className="w-4 h-4" />
                              ) : (
                                <HourglassIcon className="w-4 h-4" />
                              )}
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
                                  {subscription.booking_type === 'flexible' ? (
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      <span>Гибкая</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <RobotIcon className="w-4 h-4" />
                                      <span>Автомат</span>
                                    </span>
                                  )}
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

                          {/* Кнопки действий в зависимости от статуса */}
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

                          {subscription.status === 'confirmed' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-1 text-xs sm:text-sm text-blue-400 border-blue-400/30 hover:bg-blue-500/20"
                                onClick={() => handleFreezeSubscription(subscription.id)}
                                disabled={loading}
                              >
                                <span className="flex items-center gap-2">
                                  <SnowflakeIcon className="w-4 h-4" />
                                  <span>Заморозить</span>
                                </span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs sm:text-sm text-red-400 border-red-400/30 hover:bg-red-500/20"
                                onClick={() => handleDeleteSubscription(subscription.id)}
                                disabled={loading}
                              >
                                <XIcon />
                                <span className="hidden sm:inline">Удалить</span>
                              </Button>
                            </div>
                          )}

                          {subscription.status === 'frozen' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1 gap-1 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg"
                                onClick={() => handleUnfreezeSubscription(subscription.id)}
                                disabled={loading}
                              >
                                <span className="flex items-center gap-2">
                                  <FireIcon className="w-4 h-4" />
                                  <span>Разморозить</span>
                                </span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs sm:text-sm text-red-400 border-red-400/30 hover:bg-red-500/20"
                                onClick={() => handleDeleteSubscription(subscription.id)}
                                disabled={loading}
                              >
                                <XIcon />
                                <span className="hidden sm:inline">Удалить</span>
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

          {/* Расписание */}
          {activeTab === 'schedule' && (
            <div className="space-y-3">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Управление расписанием
                  </h2>
                  <p className="text-sm text-purple-200/70">Создавайте шаблоны и редактируйте занятия</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewTemplate({
                        trainer_id: '',
                        schedule_items: []
                      })
                      setShowAddTemplateModal(true)
                    }}
                    className="gap-1 text-xs sm:text-sm border-green-500/30 text-purple-300 hover:bg-green-500/20"
                  >
                    <span className="text-lg">🔄</span>
                    <span className="hidden sm:inline">Шаблон</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowAddLessonModal(true)}
                    className="gap-1 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <span className="text-lg">+</span>
                    <span className="hidden sm:inline">Добавить занятие</span>
                    <span className="sm:hidden">Добавить</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCleanupPastLessons}
                    disabled={loading}
                    className="gap-1 text-xs sm:text-sm border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                    title="Удалить все прошедшие занятия"
                  >
                    <span className="text-lg">🧹</span>
                    <span className="hidden sm:inline">Очистить прошедшие</span>
                    <span className="sm:hidden">Прошедшие</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSchedule}
                    disabled={loading || lessons.length === 0}
                    className="gap-1 text-xs sm:text-sm border-red-500/30 text-red-300 hover:bg-red-500/20"
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Очистить расписание</span>
                    <span className="sm:hidden">Очистить</span>
                  </Button>
                </div>
              </div>

              {/* Кнопка "Шаблоны" с выпадающим списком */}
              <div className="mb-4">
                <button
                  onClick={() => setShowTemplatesList(!showTemplatesList)}
                  className="w-full bg-purple-900/20 backdrop-blur-xl rounded-lg border border-purple-500/20 p-4 flex items-center justify-between hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔄</span>
                    <span className="text-sm font-semibold text-white">Шаблоны повторяющихся занятий</span>
                    {recurringTemplates.length > 0 && (
                      <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                        {recurringTemplates.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {recurringTemplates.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGenerateLessons()
                        }}
                        className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                        disabled={loading}
                      >
                        <LightningIcon className="w-4 h-4" />
                        <span>Сгенерировать до конца года</span>
                      </Button>
                    )}
                    <svg
                      className={`w-5 h-5 text-purple-300 transition-transform ${showTemplatesList ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Выпадающий список шаблонов */}
                {showTemplatesList && (
                  <div className="mt-2 bg-purple-900/20 backdrop-blur-xl rounded-lg border border-purple-500/20 p-4">
                    {loading && recurringTemplates.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        <p className="text-purple-200 mt-4 text-sm">Загрузка шаблонов...</p>
                      </div>
                    ) : recurringTemplates.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-3xl mx-auto mb-3">
                          🔄
                        </div>
                        <p className="text-purple-200 text-sm">Нет шаблонов расписания</p>
                        <p className="text-purple-200/60 text-xs mt-1">Создайте первый шаблон для автоматической генерации занятий</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewTemplate({
                              trainer_id: '',
                              schedule_items: []
                            })
                            setShowAddTemplateModal(true)
                          }}
                          className="mt-4 gap-1 text-xs border-green-500/30 text-purple-300 hover:bg-green-500/20"
                        >
                          <span>🔄</span>
                          <span>Создать шаблон</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid gap-2">
                          {recurringTemplates.map((template) => {
                            // Маппинг: 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб, 7=Вс
                            const dayNames = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' }
                            return (
                              <div
                                key={template.id}
                                className="bg-purple-800/20 backdrop-blur-xl rounded-lg border border-purple-500/20 p-3 flex items-center justify-between hover:border-purple-500/40 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                                      {dayNames[template.day_of_week as keyof typeof dayNames] || '?'}
                                    </span>
                                    <span className="text-xs text-white font-semibold">
                                      {template.start_time} - {template.end_time}
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-white">{template.direction_name}</p>
                                  <p className="text-xs text-purple-200/70">
                                    <span className="flex items-center gap-2">
                                      <UserIcon className="w-4 h-4" />
                                      <span>{template.trainer_name}</span>
                                      <span>•</span>
                                      <MapPinIcon className="w-4 h-4" />
                                      <span>{template.hall_name}</span>
                                    </span>
                                  </p>
                                  {template.capacity && (
                                    <p className="text-xs text-purple-300/60 mt-1">
                                      Вместимость: {template.capacity} мест
                                    </p>
                                  )}
                                  {template.description && (
                                    <p className="text-xs text-purple-200/50 mt-1 italic">
                                      {template.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="text-red-400 hover:bg-red-500/20 ml-4"
                                  disabled={loading}
                                >
                                  <XIcon />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Фильтры расписания */}
              <div className="bg-purple-900/20 backdrop-blur-xl rounded-lg border border-purple-500/20 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-purple-200">🔍 Фильтры</span>
                  {(scheduleFilters.hall_id || scheduleFilters.trainer_id || scheduleFilters.direction_id || scheduleFilters.time_period) && (
                    <button
                      onClick={() => setScheduleFilters({ hall_id: '', trainer_id: '', direction_id: '', time_period: '' })}
                      className="text-xs text-purple-300 hover:text-purple-100 underline"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Фильтр по залу */}
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">Зал</label>
                    <select
                      value={scheduleFilters.hall_id}
                      onChange={(e) => setScheduleFilters({ ...scheduleFilters, hall_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      style={{ color: '#ffffff' }}
                    >
                      <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Все залы</option>
                      {Array.from(new Map(halls.map(hall => [hall.name + hall.address, hall])).values()).map(hall => (
                        <option key={hall.id} value={hall.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                          {hall.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Фильтр по тренеру */}
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">Тренер</label>
                    <select
                      value={scheduleFilters.trainer_id}
                      onChange={(e) => setScheduleFilters({ ...scheduleFilters, trainer_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      style={{ color: '#ffffff' }}
                    >
                      <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Все тренеры</option>
                      {trainers.map(trainer => (
                        <option key={trainer.id} value={trainer.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                          {trainer.name} {trainer.last_name || ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Фильтр по направлению */}
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">Направление</label>
                    <select
                      value={scheduleFilters.direction_id}
                      onChange={(e) => setScheduleFilters({ ...scheduleFilters, direction_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      style={{ color: '#ffffff' }}
                    >
                      <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Все направления</option>
                      {directions.map(dir => (
                        <option key={dir.id} value={dir.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                          {dir.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Фильтр по времени */}
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">Время</label>
                    <select
                      value={scheduleFilters.time_period}
                      onChange={(e) => setScheduleFilters({ ...scheduleFilters, time_period: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      style={{ color: '#ffffff' }}
                    >
                      <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Все время</option>
                      <option value="morning" style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Утро (до 15:00)</option>
                      <option value="evening" style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Вечер (после 15:00)</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading && lessons.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-purple-200 mt-4">Загрузка расписания...</p>
                </div>
              ) : getFilteredLessons().length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-10 h-10 text-purple-400" />
                  </div>
                  {lessons.length === 0 ? (
                    <>
                      <p className="text-purple-200 text-lg">Нет занятий в расписании</p>
                      <p className="text-purple-200/60 text-sm mt-2">Создайте первое занятие</p>
                    </>
                  ) : (
                    <>
                      <p className="text-purple-200 text-lg">Нет занятий по выбранным фильтрам</p>
                      <p className="text-purple-200/60 text-sm mt-2">Попробуйте изменить параметры фильтрации</p>
                      <button
                        onClick={() => setScheduleFilters({ hall_id: '', trainer_id: '', direction_id: '', time_period: '' })}
                        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Сбросить фильтры
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <p className="text-xs text-purple-300/70">
                      Показано: <span className="font-semibold text-purple-200">{getFilteredLessons().length}</span> из <span className="font-semibold text-purple-200">{lessons.length}</span> занятий
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {getFilteredLessons().map((lesson) => {
                    // Создаем дату в локальном времени, чтобы избежать смещения дня недели
                    const [year, month, day] = lesson.lesson_date.split('-').map(Number)
                    const lessonDate = new Date(year, month - 1, day)
                    const dateStr = lessonDate.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
                    const dayOfWeek = lessonDate.toLocaleDateString('ru-RU', { weekday: 'long' })
                    
                    // Проверяем, прошло ли занятие (используем локальное время)
                    const now = new Date()
                    const [endHour, endMinute] = lesson.end_time.split(':').map(Number)
                    const lessonDateTime = new Date(year, month - 1, day, endHour, endMinute)
                    const isPast = lessonDateTime < now
                    
                    return (
                      <div
                        key={lesson.id}
                        className={`group relative bg-gradient-to-br backdrop-blur-xl rounded-lg border p-3 sm:p-4 transition-all hover:shadow-2xl ${
                          isPast 
                            ? 'from-gray-900/30 to-purple-800/20 border-gray-500/20 opacity-60' 
                            : 'from-blue-900/50 to-purple-800/30 border-blue-500/30 hover:border-blue-400/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          {/* Дата и время */}
                          <div className={`flex-shrink-0 rounded-lg p-3 text-center min-w-[80px] ${
                            isPast 
                              ? 'bg-gradient-to-br from-gray-600 to-gray-700' 
                              : 'bg-gradient-to-br from-blue-600 to-purple-600'
                          }`}>
                            {isPast && (
                              <div className="text-[10px] text-gray-200 uppercase mb-1 flex items-center gap-1 justify-center">
                                <CheckIcon className="w-3 h-3" />
                                <span>Завершено</span>
                              </div>
                            )}
                            <div className={`text-xs uppercase ${isPast ? 'text-gray-200' : 'text-blue-100'}`}>{dayOfWeek.slice(0, 3)}</div>
                            <div className="text-2xl font-bold text-white">{lessonDate.getDate()}</div>
                            <div className={`text-xs ${isPast ? 'text-gray-200' : 'text-blue-100'}`}>{lessonDate.toLocaleDateString('ru-RU', { month: 'short' })}</div>
                            <div className="mt-2 pt-2 border-t border-white/20">
                              <div className="text-xs font-bold text-white">{lesson.start_time}</div>
                              <div className={`text-[10px] ${isPast ? 'text-gray-200' : 'text-blue-100'}`}>-</div>
                              <div className="text-xs font-bold text-white">{lesson.end_time}</div>
                            </div>
                          </div>

                          {/* Информация о занятии */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                                  {lesson.direction_name}
                                </h3>
                                <p className="text-xs sm:text-sm text-purple-300/90 flex items-center gap-1">
                                  <UserIcon className="w-4 h-4" />
                                  <span>{lesson.trainer_name}</span>
                                </p>
                              </div>
                              <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full">
                                <UsersIcon className="w-4 h-4 text-blue-300" />
                                <span className="text-xs font-bold text-blue-300">
                                  {lesson.current_bookings}/{lesson.capacity}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-purple-200/70">
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                <span>{lesson.hall_name}</span>
                              </div>
                              {lesson.description && (
                                <div className="w-full text-purple-200/60 text-xs mt-1">
                                  {lesson.description}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Действия */}
                          <div className="flex sm:flex-col gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              disabled={loading}
                              className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/20"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                </>
              )}
            </div>
          )}

          {/* Шаблоны */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              {/* Заголовок и кнопка добавления */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Персонал</h2>
                <button
                  onClick={() => handleOpenStaffModal()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <span>+</span>
                  Добавить тренера
                </button>
              </div>

              {/* Список тренеров */}
              {loading ? (
                <div className="text-center py-12 text-purple-200">Загрузка...</div>
              ) : trainers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-purple-200">Нет тренеров</p>
                  <button
                    onClick={() => handleOpenStaffModal()}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                  >
                    Добавить первого тренера
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trainers.map(trainer => (
                    <div
                      key={trainer.id}
                      className={`p-6 rounded-xl border ${
                        trainer.is_active
                          ? 'bg-white/5 border-white/10'
                          : 'bg-gray-800/50 border-gray-700/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {trainer.name} {trainer.last_name || ''}
                          </h3>
                          {!trainer.is_active && (
                            <span className="text-xs text-gray-400">Неактивен</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenStaffModal(trainer)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(trainer.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                            title="Удалить"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {trainer.directions && trainer.directions.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-1">Направления:</div>
                          <div className="flex flex-wrap gap-1">
                            {trainer.directions.map((dirId, idx) => {
                              const direction = directions.find(d => d.id === dirId)
                              return direction ? (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                                >
                                  {direction.name}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                      {trainer.bio && (
                        <div className="mt-3 text-sm text-gray-300 line-clamp-2">
                          {trainer.bio}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rentals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Заявки на аренду</h2>
                  <p className="text-purple-200/60 text-sm">Управление заявками на аренду залов и пилонов</p>
                </div>
                
                {/* Фильтры по статусу */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setRentalStatusFilter('pending')}
                    variant={rentalStatusFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    className={rentalStatusFilter === 'pending' ? 'bg-purple-600' : ''}
                  >
                    Ожидание ({rentalBookings.filter(r => r.status === 'pending').length})
                  </Button>
                  <Button
                    onClick={() => setRentalStatusFilter('confirmed')}
                    variant={rentalStatusFilter === 'confirmed' ? 'default' : 'outline'}
                    size="sm"
                    className={rentalStatusFilter === 'confirmed' ? 'bg-purple-600' : ''}
                  >
                    Подтверждено
                  </Button>
                  <Button
                    onClick={() => setRentalStatusFilter('cancelled')}
                    variant={rentalStatusFilter === 'cancelled' ? 'default' : 'outline'}
                    size="sm"
                    className={rentalStatusFilter === 'cancelled' ? 'bg-purple-600' : ''}
                  >
                    Отменено
                  </Button>
                  <Button
                    onClick={() => setRentalStatusFilter('all')}
                    variant={rentalStatusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className={rentalStatusFilter === 'all' ? 'bg-purple-600' : ''}
                  >
                    Все
                  </Button>
                </div>
              </div>

              {rentalLoading ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-4xl mx-auto mb-4 animate-spin">
                    ⏳
                  </div>
                  <p className="text-purple-200 text-lg">Загрузка заявок...</p>
                </div>
              ) : rentalBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-purple-200">Нет заявок на аренду</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rentalBookings.map((rental) => {
                    const startTime = new Date(rental.start_time)
                    const endTime = new Date(rental.end_time)
                    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))
                    const userName = `${rental.first_name || ''} ${rental.last_name || ''}`.trim() || 'Клиент'
                    
                    return (
                      <div
                        key={rental.id}
                        className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                rental.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                rental.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {rental.status === 'confirmed' ? 'Подтверждено' :
                                 rental.status === 'cancelled' ? 'Отменено' : 'Ожидание'}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                                {rental.rental_type === 'hall' ? 'Аренда зала' : `Аренда ${rental.pole_count} ${rental.pole_count === 1 ? 'пилона' : 'пилонов'}`}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{rental.hall_name}</h3>
                            <p className="text-sm text-purple-200/60 mb-2">{rental.hall_address}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-purple-200/80">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{startTime.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                <span>{startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>⏱️</span>
                                <span>{duration} {duration === 1 ? 'час' : duration < 5 ? 'часа' : 'часов'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MoneyIcon className="w-4 h-4" />
                                <span className="font-semibold text-white">{rental.total_price.toLocaleString('ru-RU')} ₽</span>
                              </div>
                            </div>
                            {rental.participants && (
                              <div className="mt-2 text-sm text-purple-200/80">
                                <UsersIcon className="w-4 h-4 inline mr-2" />
                                Участников: {rental.participants}
                              </div>
                            )}
                            {rental.comment && (
                              <div className="mt-2 p-3 bg-purple-800/30 rounded-lg">
                                <p className="text-sm text-purple-200/80">{rental.comment}</p>
                              </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-purple-500/20">
                              <p className="text-sm text-purple-200/60 mb-1">Клиент:</p>
                              <p className="text-sm font-semibold text-white">{userName}</p>
                              {rental.phone && (
                                <p className="text-sm text-purple-200/80 mt-1">{rental.phone}</p>
                              )}
                            </div>
                          </div>
                          {rental.status === 'pending' && (
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                onClick={() => handleUpdateRentalStatus(rental.id, 'confirmed')}
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckIcon className="w-4 h-4 mr-1" />
                                Подтвердить
                              </Button>
                              <Button
                                onClick={() => handleUpdateRentalStatus(rental.id, 'cancelled')}
                                variant="outline"
                                size="sm"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              >
                                <XIcon className="w-4 h-4 mr-1" />
                                Отклонить
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

          {activeTab === 'prices' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Управление ценами
                </h2>
                <p className="text-sm text-purple-200/70">Настройте цены на абонементы и аренду</p>
              </div>

              {pricesLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-purple-200 mt-4">Загрузка цен...</p>
                </div>
              ) : prices ? (
                <div className="space-y-6">
                  {/* Цены на абонементы - группируем по категориям */}
                  {(() => {
                    // Группируем абонементы по категориям
                    const groupedByCategory = prices.subscriptionTypes.reduce((acc, subType) => {
                      const category = subType.category || 'other'
                      if (!acc[category]) {
                        acc[category] = []
                      }
                      acc[category].push(subType)
                      return acc
                    }, {} as Record<string, typeof prices.subscriptionTypes>)

                    // Маппинг категорий для отображения
                    const categoryNames: Record<string, string> = {
                      'classic': 'КЛАССИЧЕСКИЙ',
                      'fitness': 'ТОЛЬКО ФИТНЕС',
                      'combo': 'КОМБО-АБОНЕМЕНТ',
                      'other': 'ДРУГИЕ'
                    }

                    return Object.entries(groupedByCategory).map(([category, subscriptions]) => {
                      const categoryName = categoryNames[category] || category.toUpperCase()
                      return (
                        <div key={category} className="space-y-4">
                          {/* Заголовок категории */}
                          <div className="flex items-center gap-3">
                            <TicketIcon className="w-5 h-5 text-purple-400" />
                            <div>
                              <h3 className="text-lg font-bold text-white">{categoryName}</h3>
                              {category === 'classic' && (
                                <p className="text-xs text-purple-200/70">Распространяется на все направления студии</p>
                              )}
                              {category === 'fitness' && (
                                <p className="text-xs text-purple-200/70">Действует на занятия без пилона: растяжку, силу и гибкость, choreo, strip</p>
                              )}
                              {category === 'combo' && (
                                <p className="text-xs text-purple-200/70">Лимитированное количество занятий с пилоном и без</p>
                              )}
                            </div>
                          </div>

                          {/* Карточка с абонементами категории */}
                          <div className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6">
                            {category === 'combo' && (
                              <div className="mb-4 text-center">
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/30 border border-purple-400/50 rounded-full text-sm">
                                  <TicketIcon className="w-4 h-4" />
                                  Выгодно
                                </span>
                              </div>
                            )}

                            <div className="space-y-3">
                              {subscriptions.map((subType) => {
                                const isEditing = editingPrice?.type === 'subscription' && editingPrice.id === subType.id
                                return (
                                  <div
                                    key={subType.id}
                                    className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/20 hover:border-purple-400/40 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <div className="text-white font-semibold">{subType.name}</div>
                                      <div className="text-purple-200/70 text-sm">{subType.lessonCount} занятий</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {isEditing ? (
                                        <>
                                          <input
                                            type="number"
                                            value={editingPrice.value}
                                            onChange={(e) => setEditingPrice({ ...editingPrice, value: parseFloat(e.target.value) || 0 })}
                                            className="w-32 px-3 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white text-right"
                                            min="0"
                                            step="100"
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => handleUpdatePrice('subscription', subType.id, editingPrice.value)}
                                            disabled={loading}
                                          >
                                            <CheckIcon className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingPrice(null)}
                                          >
                                            <XIcon className="w-4 h-4" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <div className="text-right">
                                            <div className="text-xl font-bold text-white">{subType.price.toLocaleString('ru-RU')} ₽</div>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingPrice({ type: 'subscription', id: subType.id, value: subType.price })}
                                          >
                                            Изменить
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            <div className="text-center text-sm text-purple-200/60 mt-4 pt-4 border-t border-purple-500/20">
                              Срок действия абонемента — 1 месяц
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}

                  {/* Цены на аренду залов */}
                  <div className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <HomeIcon className="w-5 h-5" />
                      Аренда залов
                    </h3>
                    <div className="space-y-3">
                      {prices.halls.map((hall) => {
                        const isEditing = editingPrice?.type === 'hall' && editingPrice.id === hall.id
                        return (
                          <div
                            key={hall.id}
                            className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/20"
                          >
                            <div className="flex-1">
                              <div className="text-white font-semibold">{hall.name}</div>
                              <div className="text-purple-200/70 text-sm">{hall.poleCount} пилонов</div>
                            </div>
                            <div className="flex items-center gap-3">
                              {isEditing ? (
                                <>
                                  <input
                                    type="number"
                                    value={editingPrice.value}
                                    onChange={(e) => setEditingPrice({ ...editingPrice, value: parseFloat(e.target.value) || 0 })}
                                    className="w-32 px-3 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white text-right"
                                    min="0"
                                    step="100"
                                  />
                                  <span className="text-purple-200/70 text-sm">₽/час</span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdatePrice('hall', hall.id, editingPrice.value)}
                                    disabled={loading}
                                  >
                                    <CheckIcon className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingPrice(null)}
                                  >
                                    <XIcon className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <div className="text-right">
                                    <div className="text-xl font-bold text-white">{hall.pricePerHour.toLocaleString('ru-RU')} ₽/час</div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingPrice({ type: 'hall', id: hall.id, value: hall.pricePerHour })}
                                  >
                                    Изменить
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Цена на аренду пилона */}
                  <div className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <HomeIcon className="w-5 h-5" />
                      Аренда пилона
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/20">
                      <div className="flex-1">
                        <div className="text-white font-semibold">Аренда одного пилона</div>
                        <div className="text-purple-200/70 text-sm">Цена за час аренды одного пилона</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {editingPrice?.type === 'pole' ? (
                          <>
                            <input
                              type="number"
                              value={editingPrice.value}
                              onChange={(e) => setEditingPrice({ ...editingPrice, value: parseFloat(e.target.value) || 0 })}
                              className="w-32 px-3 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white text-right"
                              min="0"
                              step="50"
                            />
                            <span className="text-purple-200/70 text-sm">₽/час</span>
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePrice('pole', undefined, editingPrice.value)}
                              disabled={loading}
                            >
                              <CheckIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPrice(null)}
                            >
                              <XIcon className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="text-right">
                              <div className="text-xl font-bold text-white">{prices.polePricePerHour.toLocaleString('ru-RU')} ₽/час</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPrice({ type: 'pole', value: prices.polePricePerHour })}
                            >
                              Изменить
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-purple-200">Не удалось загрузить цены</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsSection
              subTab={notificationSubTab}
              setSubTab={setNotificationSubTab}
              templates={notificationTemplates}
              notifications={notifications}
              schedules={notificationSchedules}
              users={notificationUsers}
              showNotificationModal={showNotificationModal}
              setShowNotificationModal={setShowNotificationModal}
              showTemplateModal={showTemplateModal}
              setShowTemplateModal={setShowTemplateModal}
              showScheduleModal={showScheduleModal}
              setShowScheduleModal={setShowScheduleModal}
              newNotification={newNotification}
              setNewNotification={setNewNotification}
              newTemplate={newNotificationTemplate}
              setNewTemplate={setNewNotificationTemplate}
              newSchedule={newSchedule}
              setNewSchedule={setNewSchedule}
              loading={loading}
              setLoading={setLoading}
              loadTemplates={async () => {
                try {
                  const res = await notificationsAPI.getTemplates()
                  setNotificationTemplates(res.templates || [])
                } catch (error) {
                  console.error('Ошибка загрузки шаблонов:', error)
                }
              }}
              loadNotifications={async () => {
                try {
                  const res = await notificationsAPI.getNotifications()
                  setNotifications(res.notifications || [])
                } catch (error) {
                  console.error('Ошибка загрузки уведомлений:', error)
                }
              }}
              loadSchedules={async () => {
                try {
                  const res = await notificationsAPI.getSchedules()
                  setNotificationSchedules(res.schedules || [])
                } catch (error) {
                  console.error('Ошибка загрузки расписаний:', error)
                }
              }}
              loadUsers={async (search?: string) => {
                try {
                  const res = await notificationsAPI.getUsers(search)
                  setNotificationUsers(res.users || [])
                } catch (error) {
                  console.error('Ошибка загрузки пользователей:', error)
                }
              }}
            />
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Статистика</h2>
                  <p className="text-purple-200/60 text-sm">Общая информация о системе</p>
                </div>
                
                {/* Фильтры по периодам */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setStatsPeriod('day')
                      loadStats('day')
                    }}
                    variant={statsPeriod === 'day' ? 'default' : 'outline'}
                    size="sm"
                    className={statsPeriod === 'day' ? 'bg-purple-600' : ''}
                  >
                    День
                  </Button>
                  <Button
                    onClick={() => {
                      setStatsPeriod('week')
                      loadStats('week')
                    }}
                    variant={statsPeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    className={statsPeriod === 'week' ? 'bg-purple-600' : ''}
                  >
                    Неделя
                  </Button>
                  <Button
                    onClick={() => {
                      setStatsPeriod('month')
                      loadStats('month')
                    }}
                    variant={statsPeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    className={statsPeriod === 'month' ? 'bg-purple-600' : ''}
                  >
                    Месяц
                  </Button>
                  <Button
                    onClick={() => {
                      setStatsPeriod('all')
                      loadStats('all')
                    }}
                    variant={statsPeriod === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className={statsPeriod === 'all' ? 'bg-purple-600' : ''}
                  >
                    Все время
                  </Button>
                </div>
              </div>

              {statsLoading ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-4xl mx-auto mb-4 animate-spin">
                    ⏳
                  </div>
                  <p className="text-purple-200 text-lg">Загрузка статистики...</p>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Подтвержденные абонементы */}
                  <div 
                    onClick={() => loadDetailStats('subscriptions')}
                    className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6 hover:border-purple-400/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-purple-200/60 text-sm font-medium mb-1">Подтвержденные абонементы</h3>
                    <p className="text-3xl font-bold text-white">{stats.confirmedSubscriptions}</p>
                    <p className="text-xs text-purple-200/40 mt-2">из {stats.totalSubscriptions} всего</p>
                    {stats.confirmedSubscriptionsSum > 0 && (
                      <p className="text-sm text-green-400 font-semibold mt-2">
                        {stats.confirmedSubscriptionsSum.toLocaleString('ru-RU')} ₽
                      </p>
                    )}
                  </div>

                  {/* Всего занятий */}
                  <div 
                    onClick={() => loadDetailStats('lessons')}
                    className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6 hover:border-purple-400/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-2xl">📚</span>
                      </div>
                    </div>
                    <h3 className="text-purple-200/60 text-sm font-medium mb-1">Всего занятий</h3>
                    <p className="text-3xl font-bold text-white">{stats.totalLessons}</p>
                    <p className="text-xs text-purple-200/40 mt-2">{stats.upcomingLessons} будущих</p>
                  </div>

                  {/* Активные пользователи */}
                  <div 
                    onClick={() => loadDetailStats('users')}
                    className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6 hover:border-purple-400/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-pink-400" />
                      </div>
                    </div>
                    <h3 className="text-purple-200/60 text-sm font-medium mb-1">Активные пользователи</h3>
                    <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
                    <p className="text-xs text-purple-200/40 mt-2">с действующими абонементами</p>
                  </div>

                  {/* Всего записей */}
                  <div 
                    onClick={() => loadDetailStats('bookings')}
                    className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6 hover:border-purple-400/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-purple-200/60 text-sm font-medium mb-1">Всего записей</h3>
                    <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
                    <p className="text-xs text-purple-200/40 mt-2">подтвержденных записей</p>
                  </div>

                  {/* Всего абонементов */}
                  <div className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6 hover:border-purple-400/40 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <TicketIcon className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-purple-200/60 text-sm font-medium mb-1">Всего абонементов</h3>
                    <p className="text-3xl font-bold text-white">{stats.totalSubscriptions}</p>
                    <p className="text-xs text-purple-200/40 mt-2">всех статусов</p>
                  </div>

                  {/* Будущие занятия */}
                  <div className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-6 hover:border-purple-400/40 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-2xl">🔮</span>
                      </div>
                    </div>
                    <h3 className="text-purple-200/60 text-sm font-medium mb-1">Будущие занятия</h3>
                    <p className="text-3xl font-bold text-white">{stats.upcomingLessons}</p>
                    <p className="text-xs text-purple-200/40 mt-2">запланированных</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                    <XCircleIcon className="w-10 h-10 text-red-400" />
                  </div>
                  <p className="text-purple-200 text-lg">Ошибка загрузки статистики</p>
                  <Button
                    onClick={() => loadStats(statsPeriod)}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  >
                    Попробовать снова
                  </Button>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Модальные окна */}
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

      {/* Модальное окно для создания занятия */}
      {showAddLessonModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-purple-900 to-black rounded-3xl max-w-2xl w-full border border-purple-500/30 p-6 sm:p-8 my-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-400/50 flex items-center justify-center text-purple-400 text-2xl">
                  <CalendarIcon className="w-12 h-12 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Создать занятие</h2>
                  <p className="text-sm text-purple-200/70">Заполните информацию о занятии</p>
                </div>
              </div>

              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Направление */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Направление <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newLesson.direction_id}
                      onChange={(e) => setNewLesson({ ...newLesson, direction_id: e.target.value })}
                      className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                      disabled={loading}
                      style={{ color: '#ffffff' }}
                    >
                      <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Выберите направление</option>
                      {directions.map(dir => (
                        <option key={dir.id} value={dir.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>{dir.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Тренер */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Тренер <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newLesson.trainer_id}
                      onChange={(e) => setNewLesson({ ...newLesson, trainer_id: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      required
                      disabled={loading}
                      style={{ color: '#ffffff' }}
                    >
                      <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Выберите тренера</option>
                      {trainers.map(trainer => (
                        <option key={trainer.id} value={trainer.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                          {trainer.name} {trainer.last_name || ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Зал */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Зал <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newLesson.hall_id}
                      onChange={(e) => setNewLesson({ ...newLesson, hall_id: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      required
                      disabled={loading}
                      style={{ color: '#ffffff' }}
                    >
                      <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Выберите зал</option>
                      {Array.from(new Map(halls.map(hall => [hall.name + hall.address, hall])).values()).map(hall => (
                        <option key={hall.id} value={hall.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                          {hall.name} - {hall.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Дата */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Дата <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={newLesson.lesson_date}
                      onChange={(e) => setNewLesson({ ...newLesson, lesson_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Время начала */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Время начала <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={newLesson.start_time}
                      onChange={(e) => setNewLesson({ ...newLesson, start_time: e.target.value })}
                      className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Время окончания */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Время окончания <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={newLesson.end_time}
                      onChange={(e) => setNewLesson({ ...newLesson, end_time: e.target.value })}
                      className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Вместимость */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Вместимость
                    </label>
                    <input
                      type="number"
                      value={newLesson.capacity}
                      onChange={(e) => setNewLesson({ ...newLesson, capacity: e.target.value })}
                      min="1"
                      max="20"
                      className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Описание */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Описание (необязательно)
                  </label>
                  <textarea
                    value={newLesson.description}
                    onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                    placeholder="Дополнительная информация о занятии..."
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                  >
                    {loading ? 'Создание...' : 'Создать занятие'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddLessonModal(false)
                      setNewLesson({
                        hall_id: '',
                        direction_id: '',
                        trainer_id: '',
                        lesson_date: '',
                        start_time: '',
                        end_time: '',
                        capacity: '6',
                        description: ''
                      })
                    }}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания шаблона расписания */}
      {showAddTemplateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-purple-900 to-black rounded-3xl max-w-2xl w-full border border-purple-500/30 p-6 sm:p-8 my-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-400/50 flex items-center justify-center text-purple-400 text-2xl">
                  🔄
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Создать шаблон расписания</h3>
                  <p className="text-sm text-purple-200/70">Занятия будут повторяться каждую неделю</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddTemplate(); }} className="space-y-6">
                {/* Выбор тренера */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Тренер <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newTemplate.trainer_id}
                    onChange={(e) => setNewTemplate({ ...newTemplate, trainer_id: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                    required
                    disabled={loading}
                    style={{ color: '#ffffff' }}
                  >
                    <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Выберите тренера</option>
                    {trainers.map(trainer => (
                      <option key={trainer.id} value={trainer.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                        {trainer.name} {trainer.last_name || ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-purple-300/70 mt-1">Выберите тренера, для которого создается расписание</p>
                </div>

                {/* Список занятий */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-purple-200">
                      Расписание занятий <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addScheduleItem}
                      disabled={loading || !newTemplate.trainer_id}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Добавить занятие
                    </button>
                  </div>

                  {newTemplate.schedule_items.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-purple-500/30 rounded-lg">
                      <p className="text-purple-300/70">Добавьте занятия в расписание</p>
                      <p className="text-xs text-purple-400/50 mt-1">Нажмите "Добавить занятие" чтобы начать</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {newTemplate.schedule_items.map((item, index) => (
                        <div key={index} className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-purple-200">Занятие {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeScheduleItem(index)}
                              className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                              disabled={loading}
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* День недели */}
                            <div>
                              <label className="block text-xs font-medium text-purple-300 mb-1">
                                День недели <span className="text-red-400">*</span>
                              </label>
                              <select
                                value={item.day_of_week}
                                onChange={(e) => updateScheduleItem(index, 'day_of_week', parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                                disabled={loading}
                                style={{ color: '#ffffff' }}
                              >
                                <option value={1} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Понедельник</option>
                                <option value={2} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Вторник</option>
                                <option value={3} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Среда</option>
                                <option value={4} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Четверг</option>
                                <option value={5} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Пятница</option>
                                <option value={6} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Суббота</option>
                                <option value={7} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Воскресенье</option>
                              </select>
                            </div>

                            {/* Направление */}
                            <div>
                              <label className="block text-xs font-medium text-purple-300 mb-1">
                                Направление <span className="text-red-400">*</span>
                              </label>
                              <select
                                value={item.direction_id}
                                onChange={(e) => updateScheduleItem(index, 'direction_id', e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                                disabled={loading}
                                style={{ color: '#ffffff' }}
                              >
                                <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Выберите</option>
                                {directions.map(dir => (
                                  <option key={dir.id} value={dir.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                                    {dir.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Зал */}
                            <div>
                              <label className="block text-xs font-medium text-purple-300 mb-1">
                                Зал <span className="text-red-400">*</span>
                              </label>
                              <select
                                value={item.hall_id}
                                onChange={(e) => updateScheduleItem(index, 'hall_id', e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                                disabled={loading}
                                style={{ color: '#ffffff' }}
                              >
                                <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Выберите</option>
                                {Array.from(new Map(halls.map(hall => [hall.name + hall.address, hall])).values()).map(hall => (
                                  <option key={hall.id} value={hall.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                                    {hall.name} - {hall.address}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Время начала */}
                            <div>
                              <label className="block text-xs font-medium text-purple-300 mb-1">
                                Начало <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="time"
                                value={item.start_time}
                                onChange={(e) => updateScheduleItem(index, 'start_time', e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                                disabled={loading}
                              />
                            </div>

                            {/* Время окончания */}
                            <div>
                              <label className="block text-xs font-medium text-purple-300 mb-1">
                                Окончание <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="time"
                                value={item.end_time}
                                onChange={(e) => updateScheduleItem(index, 'end_time', e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                                disabled={loading}
                              />
                            </div>

                            {/* Вместимость */}
                            <div>
                              <label className="block text-xs font-medium text-purple-300 mb-1">
                                Вместимость
                              </label>
                              <input
                                type="number"
                                value={item.capacity}
                                onChange={(e) => updateScheduleItem(index, 'capacity', e.target.value)}
                                min="1"
                                max="20"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                disabled={loading}
                              />
                            </div>
                          </div>

                          {/* Описание */}
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-purple-300 mb-1">
                              Описание (необязательно)
                            </label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updateScheduleItem(index, 'description', e.target.value)}
                              placeholder="Дополнительная информация..."
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                              rows={2}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Кнопки */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                    disabled={loading}
                  >
                    {loading ? 'Создание...' : `Создать ${newTemplate.schedule_items.length > 0 ? `${newTemplate.schedule_items.length} ` : ''}шаблон${newTemplate.schedule_items.length !== 1 ? 'ов' : ''}`}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddTemplateModal(false)
                      setNewTemplate({
                        trainer_id: '',
                        schedule_items: []
                      })
                    }}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для тренера */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black rounded-3xl max-w-2xl w-full border border-purple-500/30 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-400/50 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {editingTrainer ? 'Редактировать тренера' : 'Добавить тренера'}
                </h2>
                <p className="text-sm text-purple-200/70">Заполните информацию о тренере</p>
              </div>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Имя */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Имя <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={staffFormData.name}
                    onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Фамилия */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    value={staffFormData.last_name}
                    onChange={(e) => setStaffFormData({ ...staffFormData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Направления */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Направления
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {directions.map(dir => (
                    <label key={dir.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={staffFormData.directions?.includes(dir.id) || false}
                        onChange={(e) => {
                          const current = staffFormData.directions || []
                          if (e.target.checked) {
                            setStaffFormData({ ...staffFormData, directions: [...current, dir.id] })
                          } else {
                            setStaffFormData({ ...staffFormData, directions: current.filter(id => id !== dir.id) })
                          }
                        }}
                        className="w-4 h-4 rounded border-purple-500/30 bg-purple-800/30 text-purple-600 focus:ring-purple-500/50"
                        disabled={loading}
                      />
                      <span className="text-purple-200">{dir.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Краткая информация */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Краткая информация
                </label>
                <textarea
                  value={staffFormData.bio}
                  onChange={(e) => setStaffFormData({ ...staffFormData, bio: e.target.value })}
                  placeholder="О тренере..."
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                >
                  {loading ? 'Сохранение...' : editingTrainer ? 'Сохранить изменения' : 'Добавить тренера'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowStaffModal(false)}
                  disabled={loading}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно для детальной статистики */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black rounded-3xl max-w-4xl w-full border border-purple-500/30 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-400/50 flex items-center justify-center text-purple-400 text-2xl">
                  📊
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{detailModal.title}</h2>
                  <p className="text-sm text-purple-200/70">
                    {statsPeriod === 'day' ? 'За день' : 
                     statsPeriod === 'week' ? 'За неделю' :
                     statsPeriod === 'month' ? 'За месяц' : 'За все время'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailModal({ isOpen: false, type: null, data: [], title: '' })}
                className="text-purple-200 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {detailLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-4xl mx-auto mb-4 animate-spin">
                  ⏳
                </div>
                <p className="text-purple-200">Загрузка...</p>
              </div>
            ) : detailModal.data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-purple-200">Нет данных</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {detailModal.type === 'subscriptions' && detailModal.data.map((sub: any) => (
                  <div key={sub.id} className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{sub.first_name} {sub.last_name}</p>
                        <p className="text-purple-200/60 text-sm">{sub.phone}</p>
                        <p className="text-purple-200/60 text-sm mt-1">{sub.subscription_name} ({sub.category})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">{sub.price.toLocaleString('ru-RU')} ₽</p>
                        <p className="text-purple-200/60 text-xs mt-1">
                          {new Date(sub.created_at).toLocaleDateString('ru-RU')}
                        </p>
                        <p className="text-purple-200/60 text-xs">
                          Осталось: {sub.lessons_remaining}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {detailModal.type === 'lessons' && detailModal.data.map((lesson: any) => (
                  <div key={lesson.id} className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{lesson.direction_name}</p>
                        <p className="text-purple-200/60 text-sm">
                          {new Date(lesson.lesson_date).toLocaleDateString('ru-RU')} {lesson.start_time} - {lesson.end_time}
                        </p>
                        <p className="text-purple-200/60 text-sm mt-1">
                          {lesson.trainer_name} • {lesson.hall_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-200/60 text-sm">
                          {lesson.current_bookings}/{lesson.capacity}
                        </p>
                        <p className="text-purple-200/60 text-xs mt-1">записано</p>
                      </div>
                    </div>
                  </div>
                ))}

                {detailModal.type === 'users' && detailModal.data.map((user: any) => (
                  <div key={user.id} className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{user.first_name} {user.last_name}</p>
                        <p className="text-purple-200/60 text-sm">{user.phone}</p>
                        {user.username && (
                          <p className="text-purple-200/60 text-sm mt-1">
                            Telegram: @{user.username}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-purple-200/60 text-sm">
                          Абонементов: {user.subscriptions_count}
                        </p>
                        <p className="text-purple-200/60 text-sm">
                          Занятий осталось: {user.total_lessons_remaining}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {detailModal.type === 'bookings' && detailModal.data.map((booking: any) => (
                  <div key={booking.id} className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{booking.direction_name}</p>
                        <p className="text-purple-200/60 text-sm">
                          {new Date(booking.lesson_date).toLocaleDateString('ru-RU')} {booking.start_time} - {booking.end_time}
                        </p>
                        <p className="text-purple-200/60 text-sm mt-1">
                          {booking.trainer_name} • {booking.hall_name}
                        </p>
                        <p className="text-purple-200/60 text-xs mt-1">
                          {booking.first_name} {booking.last_name} • {booking.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm">
                          {new Date(booking.booking_date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно для записей на занятие */}
      {bookingsModalOpen && selectedLessonBookings.lesson && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black rounded-3xl max-w-2xl w-full border border-purple-500/30 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-400/50 flex items-center justify-center text-purple-400 text-2xl">
                  <ClipboardIcon className="w-12 h-12 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Записи на занятие
                  </h2>
                  <p className="text-sm text-purple-200/70">
                    {selectedLessonBookings.lesson.direction_name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBookingsModalOpen(false)
                  setSelectedLessonBookings({ lesson: null, bookings: [] })
                }}
                className="text-purple-200 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {/* Информация о занятии */}
            <div className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-200/60 text-xs mb-1">Дата и время</p>
                  <p className="text-white font-semibold">
                    {new Date(selectedLessonBookings.lesson.lesson_date).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                  <p className="text-purple-200/80">
                    {selectedLessonBookings.lesson.start_time} - {selectedLessonBookings.lesson.end_time}
                  </p>
                </div>
                <div>
                  <p className="text-purple-200/60 text-xs mb-1">Тренер и зал</p>
                  <p className="text-white font-semibold">{selectedLessonBookings.lesson.trainer_name}</p>
                  <p className="text-purple-200/80">{selectedLessonBookings.lesson.hall_name}</p>
                </div>
                <div>
                  <p className="text-purple-200/60 text-xs mb-1">Записано</p>
                  <p className="text-white font-bold text-lg">
                    {selectedLessonBookings.lesson.current_bookings} / {selectedLessonBookings.lesson.capacity}
                  </p>
                </div>
                <div>
                  <p className="text-purple-200/60 text-xs mb-1">Свободно</p>
                  <p className="text-white font-bold text-lg">
                    {selectedLessonBookings.lesson.capacity - selectedLessonBookings.lesson.current_bookings}
                  </p>
                </div>
              </div>
            </div>

            {/* Список записей */}
            {selectedLessonBookings.bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-4xl mx-auto mb-4">
                  <UsersIcon className="w-12 h-12 text-purple-400" />
                </div>
                <p className="text-purple-200">Нет записей на это занятие</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white mb-3">
                  Записанные клиенты ({selectedLessonBookings.bookings.length})
                </h3>
                {selectedLessonBookings.bookings.map((booking: Booking) => {
                  const clientName = `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Клиент'
                  const initials = clientName.split(' ').map(n => n[0]).join('').toUpperCase()
                  
                  return (
                    <div
                      key={booking.id}
                      className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{clientName}</p>
                            <p className="text-purple-200/60 text-sm">{booking.phone}</p>
                            {booking.telegram_id && (
                              <p className="text-purple-200/60 text-xs mt-1">
                                Telegram ID: {booking.telegram_id}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {booking.status === 'confirmed' ? (
                            <span className="flex items-center gap-1">
                              <CheckIcon className="w-4 h-4" />
                              <span>Подтверждена</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XIcon className="w-4 h-4" />
                              <span>Отменена</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {booking.booking_date && (
                        <p className="text-purple-200/60 text-xs mt-2 ml-[52px]">
                          Запись создана: {new Date(booking.booking_date).toLocaleString('ru-RU')}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </BeamsBackground>
  )
}
