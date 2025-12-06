'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'
import { subscriptionTypesAPI, subscriptionsAPI, SubscriptionType, directionsAPI, trainersAPI, hallsAPI, lessonsAPI, Direction, Trainer, Hall, Lesson } from '@/lib/api'
import { mockSubscriptionTypes } from '@/lib/mockData'
import { initTelegramAuth } from '@/lib/auth'
import { UserIcon, MapPinIcon, TicketIcon } from '@/components/ui/icons'

// Иконки
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
)

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function PricesPage() {
  const router = useRouter()
  // Инициализируем сразу с mock данными для мгновенного отображения
  const [subscriptionTypes, setSubscriptionTypes] = useState<Record<string, SubscriptionType[]>>(mockSubscriptionTypes)
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionType | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    bookingType: 'flexible' as 'flexible' | 'automatic',
    // Для автоматической записи (старый способ - для простых абонементов)
    autoDirections: [] as number[], // Массив ID направлений
    autoTrainerId: '',
    autoHallId: '',
    autoStartTime: '',
    autoEndTime: '',
    autoWeekdays: [] as number[], // 0-6 (Sunday-Saturday)
    // Для автоматической записи (новый способ - конкретные занятия для комбо)
    autoLessons: [] as Array<{
      day_of_week: number; // 1-7 (1=Пн, 7=Вс)
      direction_id: number;
      start_time: string;
      end_time: string;
      trainer_id?: number;
      hall_id?: number;
    }>
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [directions, setDirections] = useState<Direction[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [scheduleLessons, setScheduleLessons] = useState<Lesson[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [selectedHallFilter, setSelectedHallFilter] = useState<string>('all') // 'all', 'volgina', 'ohotny'

  // Загружаем данные из backend в фоне и обновляем когда готовы
  useEffect(() => {
    // Прокручиваем к началу страницы при загрузке
    window.scrollTo(0, 0)
    
    // Инициализируем Telegram авторизацию
    initTelegramAuth().then(isAuth => {
      console.log('Авторизация:', isAuth ? 'успешна' : 'не выполнена')
    })
    
    const loadSubscriptionTypes = async () => {
      try {
        const response = await subscriptionTypesAPI.getAll()
        // Обновляем только если получили данные из backend
        if (response.subscriptionTypes && Object.keys(response.subscriptionTypes).length > 0) {
          setSubscriptionTypes(response.subscriptionTypes)
        }
      } catch (err) {
        // Если backend недоступен, остаемся на mock данных
        console.warn('Backend недоступен, используем mock данные:', err)
      }
    }
    
    const loadFormData = async () => {
      try {
        setLoadingData(true)
        const [directionsRes, trainersRes, hallsRes] = await Promise.all([
          directionsAPI.getAll(),
          trainersAPI.getAll(),
          hallsAPI.getAll()
        ])
        setDirections(directionsRes.directions || [])
        setTrainers(trainersRes.trainers || [])
        setHalls(hallsRes.halls || [])
      } catch (error) {
        console.error('Ошибка загрузки данных для формы:', error)
      } finally {
        setLoadingData(false)
      }
    }

    // Загружаем сразу без задержки
    loadSubscriptionTypes()
    loadFormData()
  }, [])

  // Загружаем расписание для автоматической записи
  useEffect(() => {
    if (formData.bookingType === 'automatic' && isBookingModalOpen && selectedSubscription) {
      loadSchedule()
    }
  }, [formData.bookingType, isBookingModalOpen, selectedSubscription?.id])

  const loadSchedule = async () => {
    try {
      setLoadingSchedule(true)
      // Загружаем занятия на ближайшие 7 дней
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const nextWeekStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`
      
      const lessonsRes = await lessonsAPI.getAll({ from_date: todayStr, to_date: nextWeekStr })
      setScheduleLessons(lessonsRes.lessons || [])
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error)
    } finally {
      setLoadingSchedule(false)
    }
  }

  // Группировка занятий по дням недели
  const getLessonsByDayOfWeek = () => {
    const filtered = scheduleLessons.filter(lesson => {
      // Фильтр по залам (проверяем по имени зала, а не по адресу)
      if (selectedHallFilter === 'volgina') {
        const hallName = lesson.hall_name || ''
        if (!hallName.toLowerCase().includes('волгина') && !hallName.toLowerCase().includes('volgina')) {
          return false
        }
      } else if (selectedHallFilter === 'ohotny') {
        const hallName = lesson.hall_name || ''
        if (!hallName.toLowerCase().includes('охотный') && !hallName.toLowerCase().includes('ohotny')) {
          return false
        }
      }
      
      // Фильтр по типу абонемента
      if (selectedSubscription?.category === 'fitness') {
        // Для фитнес-абонемента показываем только занятия без пилона
        const requiresPole = directions.find(d => d.id === lesson.direction_id)?.requires_pole
        if (requiresPole) return false
      }
      
      // Показываем только будущие занятия
      const now = new Date()
      const [year, month, day] = lesson.lesson_date.split('-').map(Number)
      const [startHour, startMinute] = lesson.start_time.split(':').map(Number)
      const lessonStartDateTime = new Date(year, month - 1, day, startHour, startMinute)
      if (lessonStartDateTime < now) return false
      
      return true
    })
    
    // Группируем по дням недели (1-7, где 1=Пн, 7=Вс)
    const grouped: Record<number, Lesson[]> = {}
    
    filtered.forEach(lesson => {
      const [year, month, day] = lesson.lesson_date.split('-').map(Number)
      const lessonDate = new Date(year, month - 1, day)
      let dayOfWeek = lessonDate.getDay() // 0-6 (0=Вс, 1=Пн, ..., 6=Сб)
      // Конвертируем в нашу систему (1-7, где 1=Пн, 7=Вс)
      dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
      
      if (!grouped[dayOfWeek]) {
        grouped[dayOfWeek] = []
      }
      grouped[dayOfWeek].push(lesson)
    })
    
    // Сортируем занятия по времени в каждом дне
    Object.keys(grouped).forEach(day => {
      grouped[parseInt(day)].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })
    
    return grouped
  }

  // Проверка, выбрано ли занятие
  const isLessonSelected = (lesson: Lesson): boolean => {
    return formData.autoLessons.some(selected => {
      const [year, month, day] = lesson.lesson_date.split('-').map(Number)
      const lessonDate = new Date(year, month - 1, day)
      let dayOfWeek = lessonDate.getDay()
      dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
      
      return selected.day_of_week === dayOfWeek &&
             selected.direction_id === lesson.direction_id &&
             selected.start_time === lesson.start_time &&
             selected.end_time === lesson.end_time &&
             selected.hall_id === lesson.hall_id
    })
  }

  // Переключение выбора занятия
  const toggleLessonSelection = (lesson: Lesson) => {
    const [year, month, day] = lesson.lesson_date.split('-').map(Number)
    const lessonDate = new Date(year, month - 1, day)
    let dayOfWeek = lessonDate.getDay()
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
    
    const lessonData = {
      day_of_week: dayOfWeek,
      direction_id: lesson.direction_id,
      start_time: lesson.start_time,
      end_time: lesson.end_time,
      hall_id: lesson.hall_id,
      trainer_id: lesson.trainer_id
    }
    
    if (isLessonSelected(lesson)) {
      // Удаляем из выбранных
      setFormData({
        ...formData,
        autoLessons: formData.autoLessons.filter(selected => 
          !(selected.day_of_week === lessonData.day_of_week &&
            selected.direction_id === lessonData.direction_id &&
            selected.start_time === lessonData.start_time &&
            selected.end_time === lessonData.end_time &&
            selected.hall_id === lessonData.hall_id)
        )
      })
    } else {
      // Добавляем в выбранные
      setFormData({
        ...formData,
        autoLessons: [...formData.autoLessons, lessonData]
      })
    }
  }

  // Фильтрация направлений в зависимости от типа абонемента
  const getFilteredDirections = () => {
    if (!selectedSubscription) return directions

    console.log('🔍 Фильтрация направлений:')
    console.log('  Тип абонемента:', selectedSubscription.category)
    console.log('  Всего направлений:', directions.length)
    console.log('  Направления:', directions.map(d => ({ id: d.id, name: d.name, requires_pole: d.requires_pole })))

    // Для классического абонемента - все направления
    if (selectedSubscription.category === 'classic') {
      console.log('  ✅ Классический: возвращаем все направления')
      return directions
    }

    // Для фитнес-абонемента - только направления без пилона
    if (selectedSubscription.category === 'fitness') {
      const filtered = directions.filter(dir => !dir.requires_pole)
      console.log('  ✅ Фитнес: отфильтровано', filtered.length, 'направлений')
      console.log('  Отфильтрованные:', filtered.map(d => d.name))
      return filtered
    }

    // Для комбо-абонемента - все направления (но с ограничениями по количеству)
    if (selectedSubscription.category === 'combo') {
      console.log('  ✅ Комбо: возвращаем все направления')
      return directions
    }

    console.log('  ⚠️ Неизвестная категория, возвращаем все направления')
    return directions
  }

  const handleBuyClick = (subscription: SubscriptionType) => {
    setSelectedSubscription(subscription)
    setIsBookingModalOpen(true)
    // Тактильная обратная связь только если доступен Telegram WebApp
    try {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium')
      }
    } catch (e) {
      // Игнорируем ошибки Telegram API в режиме разработки
    }
  }

  const handleFormSubmit = async (e: any) => {
    e.preventDefault()
    if (!selectedSubscription) return

    // Валидация для автоматической записи
    if (formData.bookingType === 'automatic') {
      if (formData.autoLessons.length === 0) {
        alert('❌ Выберите хотя бы одно занятие из расписания для автоматической записи')
        return
      }
      
      // Проверяем каждое выбранное занятие
      for (let i = 0; i < formData.autoLessons.length; i++) {
        const lesson = formData.autoLessons[i]
        if (!lesson.direction_id || lesson.direction_id === 0) {
          alert(`❌ Ошибка: некорректное направление для занятия ${i + 1}`)
          return
        }
        if (!lesson.start_time || !lesson.end_time) {
          alert(`❌ Ошибка: некорректное время для занятия ${i + 1}`)
          return
        }
        if (lesson.day_of_week < 1 || lesson.day_of_week > 7) {
          alert(`❌ Ошибка: некорректный день недели для занятия ${i + 1}`)
          return
        }
        if (!lesson.hall_id) {
          alert(`❌ Ошибка: некорректный зал для занятия ${i + 1}`)
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const subscriptionData: any = {
        subscriptionTypeId: selectedSubscription.id,
        bookingType: formData.bookingType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address
      }
      
      // Добавляем данные для автоматической записи
      if (formData.bookingType === 'automatic') {
        // Для всех абонементов: отправляем выбранные занятия из расписания
        subscriptionData.autoLessons = formData.autoLessons.map(lesson => ({
          day_of_week: lesson.day_of_week,
          direction_id: lesson.direction_id,
          start_time: lesson.start_time,
          end_time: lesson.end_time,
          trainer_id: lesson.trainer_id,
          hall_id: lesson.hall_id
        }))
      }
      
      await subscriptionsAPI.create(subscriptionData)

      // Показываем стильное модальное окно успеха
      setIsBookingModalOpen(false)
      setIsSuccessModalOpen(true)
      
      // Сброс формы
      setFormData({ 
        firstName: '', 
        lastName: '', 
        phone: '', 
        address: '', 
        bookingType: 'flexible',
        autoDirections: [],
        autoTrainerId: '',
        autoLessons: [],
        autoHallId: '',
        autoStartTime: '',
        autoEndTime: '',
        autoWeekdays: []
      })
    } catch (error) {
      console.error('Ошибка отправки заявки:', error)
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      alert(`❌ Ошибка: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BeamsBackground intensity="medium">
      <main className="min-h-screen relative flex flex-col text-white pb-20 sm:pb-24 z-10">
        <div className="relative z-20 px-4 pt-4 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Абонементы</h1>
          <div className="w-9" />
        </div>

        {/* Категории абонементов */}
        {Object.keys(subscriptionTypes).length > 0 ? (
          <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
            {Object.entries(subscriptionTypes).map(([category, subscriptions]) => {
              // Маппинг категорий на русские названия
              const categoryNames: Record<string, string> = {
                'classic': 'КЛАССИЧЕСКИЙ',
                'fitness': 'ТОЛЬКО ФИТНЕС',
                'combo': 'КОМБО-АБОНЕМЕНТ',
                'КЛАССИЧЕСКИЙ': 'КЛАССИЧЕСКИЙ',
                'ТОЛЬКО ФИТНЕС': 'ТОЛЬКО ФИТНЕС',
                'КОМБО-АБОНЕМЕНТ': 'КОМБО-АБОНЕМЕНТ'
              }
              const categoryName = categoryNames[category] || category
              
              return (
              <div key={category} className="space-y-3 sm:space-y-4">
              {/* Заголовок категории */}
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <SparklesIcon />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold break-words">{categoryName}</h2>
                  {(category === 'classic' || category === 'КЛАССИЧЕСКИЙ') && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Распространяется на все направления студии</p>
                  )}
                  {(category === 'fitness' || category === 'ТОЛЬКО ФИТНЕС') && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Действует на занятия без пилона: растяжку, силу и гибкость, choreo, strip</p>
                  )}
                  {(category === 'combo' || category === 'КОМБО-АБОНЕМЕНТ') && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Лимитированное количество занятий с пилоном и без</p>
                  )}
                </div>
              </div>

              {/* Карточки абонементов */}
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20">

                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-base sm:text-lg font-semibold mb-1 break-words">{subscription.name}</div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-400">
                          {subscription.price.toLocaleString()} ₽
                        </div>
                      </div>
                      <Button
                        onClick={() => handleBuyClick(subscription)}
                        variant="default"
                        className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base whitespace-nowrap"
                      >
                        Начать заниматься
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="text-center text-xs sm:text-sm text-gray-400">
                  Срок действия абонемента — 1 месяц
                </div>
              </div>
              </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-gray-400">Загрузка абонементов...</p>
          </div>
        )}

        {/* Условия использования */}
        <div className="mt-6 sm:mt-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <InfoIcon />
              Условия использования абонементов
            </h3>
            <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-300 list-decimal list-inside">
              <li>Абонемент действует 1 месяц с даты первого занятия по нему</li>
              <li>В случае отпуска или больничного можно воспользоваться «заморозкой» и продлить действие абонемента на срок до 2 недель</li>
              <li>Отмена или перенос вечернего занятия возможны не позднее, чем за 4 часа до его начала</li>
              <li>Отмена или перенос утреннего или дневного занятия осуществляются до 21:00 предшествующего дня</li>
            </ol>
          </div>

          <div className="mt-4 text-center">
            <button className="flex items-center justify-center gap-2 text-purple-300 hover:text-purple-200 transition-colors">
              <BookOpenIcon />
              Правила пользования абонементом
            </button>
          </div>
        </div>

        {/* Контакты */}
        <div className="mt-6 sm:mt-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <InfoIcon />
                  Остались вопросы? Свяжитесь с нами
            </h3>
              <a 
                href="tel:+79170379765"
              className="flex items-center justify-center gap-2 sm:gap-3 w-full py-3 sm:py-4 px-4 sm:px-6 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-colors min-h-[44px] text-sm sm:text-base"
              >
              <PhoneIcon />
                  8 917 037 97 65
            </a>
            <p className="text-center text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3">
              Звоните с 10:00 до 21:00 ежедневно
            </p>
          </div>
        </div>
      </div>

      {/* Модальное окно бронирования */}
      {isBookingModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-t-3xl md:rounded-3xl max-w-lg w-full border border-white/10 max-h-[90vh] md:max-h-[85vh] flex flex-col my-4">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
              <h2 className="text-lg sm:text-2xl font-bold">Начать заниматься</h2>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 scroll-smooth pb-4 sm:pb-8">
              <div className="p-3 sm:p-4 bg-purple-600/20 border border-purple-500/50 rounded-xl">
                <div className="text-xs sm:text-sm text-gray-400 mb-1">Выбранный абонемент:</div>
                <div className="text-base sm:text-lg font-bold break-words">{selectedSubscription.name}</div>
                <div className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">
                  {selectedSubscription.price.toLocaleString()} ₽
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">
                  Срок действия: {selectedSubscription.validityDays} дней
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Имя
                </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base min-h-[44px]"
                    placeholder="Введите ваше имя"
                  />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Фамилия
                </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base min-h-[44px]"
                    placeholder="Введите вашу фамилию"
                  />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                  <PhoneIcon />
                  Телефон
                </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base min-h-[44px]"
                  placeholder="+7 (900) 123-45-67"
                  />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Адрес зала
                </label>
                  <select
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none text-sm sm:text-base min-h-[44px]"
                    style={{ color: '#ffffff' }}
                  >
                    <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Выберите зал</option>
                    <option value="Волгина, 117А" style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>Волгина, 117А</option>
                    <option value="ТОЦ Охотный ряд" style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>ТОЦ &quot;Охотный ряд&quot;</option>
                  </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2">
                    <ListIcon />
                  Способ записи
                </label>
                <div className="space-y-2 sm:space-y-3">
                  <label className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors min-h-[44px]">
                    <input
                      type="radio"
                      name="bookingType"
                      value="flexible"
                      checked={formData.bookingType === 'flexible'}
                      onChange={(e) => setFormData({ ...formData, bookingType: e.target.value as 'flexible' })}
                      className="mt-1 w-5 h-5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold mb-1 text-sm sm:text-base">Гибкая запись</div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Записывайтесь на занятия самостоятельно в удобное время
                    </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors min-h-[44px]">
                    <input
                      type="radio"
                      name="bookingType"
                      value="automatic"
                      checked={formData.bookingType === 'automatic'}
                      onChange={(e) => setFormData({ ...formData, bookingType: e.target.value as 'automatic' })}
                      className="mt-1 w-5 h-5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold mb-1 text-sm sm:text-base">Автоматическая запись</div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Мы запишем вас на выбранные дни недели автоматически
                    </div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.bookingType === 'automatic' && (
                <div className="space-y-4 p-4 bg-purple-900/30 rounded-xl border border-purple-500/30">
                  <h3 className="font-semibold text-white">Настройки автоматической записи</h3>
                  
                  {/* Для всех абонементов: выбор занятий из расписания */}
                  <div className="space-y-4">
                    {/* Фильтр по залам */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Фильтр по залам
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedHallFilter('all')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedHallFilter === 'all'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          Все залы
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedHallFilter('volgina')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedHallFilter === 'volgina'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          Волгина
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedHallFilter('ohotny')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedHallFilter === 'ohotny'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          Охотный ряд
                        </button>
                      </div>
                    </div>

                    {/* Расписание по дням недели */}
                    {loadingSchedule ? (
                      <div className="text-center py-8">
                        <p className="text-purple-300/70">Загрузка расписания...</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {(() => {
                          const lessonsByDay = getLessonsByDayOfWeek()
                          const dayNames = { 1: 'Понедельник', 2: 'Вторник', 3: 'Среда', 4: 'Четверг', 5: 'Пятница', 6: 'Суббота', 7: 'Воскресенье' }
                          const days = [1, 2, 3, 4, 5, 6, 7] as const
                          
                          return days.map(day => {
                            const dayLessons = lessonsByDay[day] || []
                            if (dayLessons.length === 0) return null
                            
                            return (
                              <div key={day} className="bg-purple-800/20 border border-purple-500/30 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-purple-200 mb-3">{dayNames[day]}</h4>
                                <div className="space-y-2">
                                  {dayLessons.map(lesson => {
                                    const direction = directions.find(d => d.id === lesson.direction_id)
                                    const trainer = trainers.find(t => t.id === lesson.trainer_id)
                                    const hall = halls.find(h => h.id === lesson.hall_id)
                                    const isSelected = isLessonSelected(lesson)
                                    const availableSpots = (lesson.capacity || 0) - (lesson.current_bookings || 0)
                                    
                                    return (
                                      <label
                                        key={lesson.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                          isSelected
                                            ? 'bg-purple-600/30 border-purple-400'
                                            : 'bg-white/5 border-white/10 hover:border-purple-500/50'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => toggleLessonSelection(lesson)}
                                          className="mt-1"
                                        />
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-white">
                                              {direction?.name || 'Неизвестное направление'}
                                            </span>
                                            <span className="text-xs text-purple-300">
                                              {lesson.start_time} - {lesson.end_time}
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-400 space-y-0.5">
                                            {trainer && (
                                              <div className="flex items-center gap-2">
                                                <UserIcon className="w-4 h-4" />
                                                <span>{trainer.name} {trainer.last_name || ''}</span>
                                              </div>
                                            )}
                                            {hall && (
                                              <div className="flex items-center gap-2">
                                                <MapPinIcon className="w-4 h-4" />
                                                <span>{hall.name} - {hall.address}</span>
                                              </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                              <TicketIcon className="w-4 h-4" />
                                              <span>Свободно мест: {availableSpots} из {lesson.capacity || 0}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })
                        })()}
                        
                        {Object.keys(getLessonsByDayOfWeek()).length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed border-purple-500/30 rounded-lg">
                            <p className="text-purple-300/70 mb-2">Нет доступных занятий</p>
                            <p className="text-xs text-purple-400/50">Попробуйте изменить фильтр по залам</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Информация о выбранных занятиях */}
                    {formData.autoLessons.length > 0 && (
                      <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <p className="text-sm text-green-300 font-medium mb-1">
                          ✓ Выбрано занятий: {formData.autoLessons.length}
                        </p>
                        <p className="text-xs text-green-200/70">
                          Вы будете автоматически записаны на эти занятия каждую неделю в рамках вашего абонемента
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-purple-200/70">
                      💡 Выберите занятия из расписания, на которые хотите записаться автоматически
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  Отмена
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                После отправки заявка будет отправлена администратору на подтверждение.
                Вы получите уведомление когда абонемент станет активным.
              </div>
            </form>
          </div>
        </div>
        )}

        {/* Модальное окно успеха */}
        {isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-gradient-to-br from-purple-900/95 to-purple-800/95 backdrop-blur-xl rounded-t-3xl md:rounded-3xl max-w-md w-full border border-purple-500/30 shadow-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col">
              <div className="p-6 sm:p-8 text-center flex-1 flex flex-col justify-center">
                {/* Иконка успеха */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Заголовок */}
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  Заявка отправлена!
                </h2>

                {/* Описание */}
                <p className="text-sm sm:text-base text-gray-300 mb-2 sm:mb-3">
                  Ваша заявка на абонемент принята и ожидает подтверждения администратором.
                </p>
                <p className="text-xs sm:text-sm text-purple-300 mb-6 sm:mb-8">
                  Статус можно посмотреть в личном кабинете
                </p>

                {/* Кнопки */}
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    onClick={() => {
                      setIsSuccessModalOpen(false)
                      router.push('/profile')
                    }}
                    variant="default"
                    className="w-full py-3 sm:py-4 text-sm sm:text-lg min-h-[44px]"
                  >
                    Перейти в личный кабинет
                  </Button>
                  <button
                    onClick={() => setIsSuccessModalOpen(false)}
                    className="w-full py-2.5 sm:py-3 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors min-h-[44px]"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </BeamsBackground>
  )
}
