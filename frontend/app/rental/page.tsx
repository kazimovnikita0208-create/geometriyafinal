'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'
import api, { hallsAPI, Hall, pricesAPI, rentalAPI } from '@/lib/api'

// Иконки
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

// Залы будут загружаться из API

// Доступное время
const availableTimes = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
]

export default function RentalPage() {
  const router = useRouter()
  const [rentalType, setRentalType] = useState<'hall' | 'pole'>('hall')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    duration: '1',
    hall: '',
    poleCount: '1',
    participants: '',
    comment: ''
  })
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [halls, setHalls] = useState<Hall[]>([])
  const [loadingHalls, setLoadingHalls] = useState(false)
  const [polePricePerHour, setPolePricePerHour] = useState<number>(500)

  // Загружаем залы при монтировании компонента
  useEffect(() => {
    loadHalls()
  }, [])

  // Загружаем доступное время при изменении даты, зала или типа аренды
  useEffect(() => {
    if (formData.date && formData.hall) {
      loadAvailableTimes()
    } else {
      setAvailableTimes([])
    }
  }, [formData.date, formData.hall, rentalType])

  const loadHalls = async () => {
    try {
      setLoadingHalls(true)
      const [hallsResponse, pricesResponse] = await Promise.all([
        hallsAPI.getAll(),
        pricesAPI.get().catch(() => null)
      ])
      setHalls(hallsResponse.halls || [])
      if (pricesResponse) {
        setPolePricePerHour(pricesResponse.polePricePerHour)
      }
    } catch (error) {
      console.error('Error loading halls:', error)
      setHalls([])
    } finally {
      setLoadingHalls(false)
    }
  }

  const loadAvailableTimes = async () => {
    if (!formData.date || !formData.hall) {
      setAvailableTimes([])
      return
    }
    
    const hallId = parseInt(formData.hall)
    if (isNaN(hallId)) {
      console.error('Некорректный ID зала:', formData.hall)
      setAvailableTimes([])
      return
    }
    
    setLoadingTimes(true)
    try {
      console.log(`🔍 Запрос доступного времени: зал ${hallId}, дата ${formData.date}, тип ${rentalType}`)
      const response = await rentalAPI.getAvailability(
        hallId,
        formData.date,
        rentalType
      )
      console.log(`✅ Получено доступное время:`, response.availableTimes)
      setAvailableTimes(response.availableTimes || [])
      // Если выбранное время недоступно, сбрасываем его
      if (formData.time && !response.availableTimes.includes(formData.time)) {
        setFormData({ ...formData, time: '' })
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки доступного времени:', error)
      alert(error.message || 'Ошибка при загрузке доступного времени')
      setAvailableTimes([])
    } finally {
      setLoadingTimes(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.time || !formData.hall) {
      alert('Заполните все обязательные поля')
      return
    }

    setSubmitting(true)
    try {
      const bookingData: any = {
        hallId: parseInt(formData.hall),
        rentalType,
        date: formData.date,
        time: formData.time,
        duration: formData.duration
      }
      
      // Добавляем имя и телефон, если указаны
      if (formData.name && formData.name.trim()) {
        bookingData.name = formData.name.trim()
      }
      if (formData.phone && formData.phone.trim()) {
        bookingData.phone = formData.phone.trim()
      }
      
      // Добавляем poleCount только для аренды пилона
      if (rentalType === 'pole') {
        const poleCount = parseInt(formData.poleCount)
        if (isNaN(poleCount) || poleCount < 1) {
          alert('Укажите корректное количество пилонов')
          setSubmitting(false)
          return
        }
        bookingData.poleCount = poleCount
      }
      
      // Добавляем опциональные поля
      if (formData.participants) {
        bookingData.participants = parseInt(formData.participants)
      }
      if (formData.comment && formData.comment.trim()) {
        bookingData.comment = formData.comment.trim()
      }
      
      console.log('📤 Отправка заявки на аренду:', bookingData)
      await rentalAPI.createBooking(bookingData)
      
      alert('Спасибо! Ваша заявка на аренду принята. Мы свяжемся с вами в ближайшее время.')
      // Очистка формы
      setFormData({
        name: '',
        phone: '',
        date: '',
        time: '',
        duration: '1',
        hall: '',
        poleCount: '1',
        participants: '',
        comment: ''
      })
      setAvailableTimes([])
    } catch (error: any) {
      console.error('Error creating rental booking:', error)
      alert(error.message || 'Ошибка при создании заявки. Попробуйте еще раз.')
    } finally {
      setSubmitting(false)
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
              <div className="flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white">
                  Аренда
                </h1>
                <p className="text-xs text-purple-200/70 mt-0.5 sm:mt-1 hidden sm:block">
                  Забронируйте зал или пилон для занятий
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
          
          {/* Переключатель типа аренды */}
          <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Button
              variant={rentalType === 'hall' ? 'default' : 'outline'}
              className="flex-1 text-xs sm:text-sm md:text-base py-2.5 sm:py-3 min-h-[44px]"
              onClick={() => setRentalType('hall')}
            >
              <HomeIcon />
              <span className="ml-1 sm:ml-2">Аренда зала</span>
            </Button>
            <Button
              variant={rentalType === 'pole' ? 'default' : 'outline'}
              className="flex-1 text-xs sm:text-sm md:text-base py-2.5 sm:py-3 min-h-[44px]"
              onClick={() => setRentalType('pole')}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10M12 3v18" />
              </svg>
              <span className="ml-1 sm:ml-2">Аренда пилона</span>
            </Button>
          </div>

          {/* Аренда зала */}
          {rentalType === 'hall' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Описание залов */}
              <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 p-4 sm:p-6">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  Наши залы
                </h2>
                {loadingHalls ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  </div>
                ) : halls.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {halls.map((hall) => (
                      <div
                        key={hall.id}
                        className="bg-purple-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-500/20"
                      >
                        <h3 className="text-sm sm:text-lg font-bold text-white mb-2">
                          {hall.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-purple-200/80 mb-3">
                          {hall.address}
                        </p>
                        <div className="space-y-1.5 sm:space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200/70">
                            <UsersIcon />
                            <span>Вместимость: {hall.capacity} человек</span>
                          </div>
                          {hall.hasPoles && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200/80">
                              <CheckIcon />
                              <span>{hall.poleCount} пилонов</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200/80">
                            <CheckIcon />
                            <span>Зеркала</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200/80">
                            <CheckIcon />
                            <span>Раздевалка</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200/80">
                            <CheckIcon />
                            <span>Кондиционер</span>
                          </div>
                        </div>
                        <div className="text-base sm:text-xl font-bold text-white">
                          {hall.pricePerHour.toLocaleString('ru-RU')} ₽/час
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-purple-200/70">Нет доступных залов</p>
                  </div>
                )}
              </div>

              {/* Форма бронирования зала */}
              <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 p-4 sm:p-6">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  Забронировать зал
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Имя */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-2">
                        Ваше имя <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <UserIcon />
                        </div>
                        <input
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[44px]"
                          placeholder="Введите ваше имя"
                        />
                      </div>
                    </div>

                    {/* Телефон */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-purple-200 mb-2">
                        Телефон <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <PhoneIcon />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[44px]"
                          placeholder="+7 (___) ___-__-__"
                        />
                      </div>
                    </div>

                    {/* Выбор зала */}
                    <div>
                      <label htmlFor="hall" className="block text-sm font-medium text-purple-200 mb-2">
                        Выберите зал <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <MapPinIcon />
                        </div>
                        <select
                          id="hall"
                          required
                          value={formData.hall}
                          onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none text-sm sm:text-base min-h-[44px]"
                          style={{ color: '#ffffff' }}
                        >
                          <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>Выберите зал</option>
                          {halls.map((hall) => (
                            <option key={hall.id} value={hall.id} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                              {hall.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Количество участников */}
                    <div>
                      <label htmlFor="participants" className="block text-sm font-medium text-purple-200 mb-2">
                        Количество участников <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <UsersIcon />
                        </div>
                        <input
                          type="number"
                          id="participants"
                          required
                          min="1"
                          max="6"
                          value={formData.participants}
                          onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[44px]"
                          placeholder="Введите количество"
                        />
                      </div>
                    </div>

                    {/* Дата */}
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-purple-200 mb-2">
                        Дата <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <CalendarIcon />
                        </div>
                        <input
                          type="date"
                          id="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Время */}
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-purple-200 mb-2">
                        Время начала <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <ClockIcon />
                        </div>
                        <select
                          id="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          disabled={loadingTimes || !formData.date || !formData.hall || availableTimes.length === 0}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none text-sm sm:text-base min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ color: '#ffffff' }}
                        >
                          <option value="" style={{ color: '#9ca3af', backgroundColor: '#1f2937' }}>
                            {loadingTimes ? 'Загрузка...' : !formData.date || !formData.hall ? 'Сначала выберите дату и зал' : availableTimes.length === 0 ? 'Нет доступного времени' : 'Выберите время'}
                          </option>
                          {availableTimes.map((time) => (
                            <option key={time} value={time} style={{ color: '#ffffff', backgroundColor: '#1f2937' }}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Длительность */}
                    <div className="sm:col-span-2">
                      <label htmlFor="duration" className="block text-sm font-medium text-purple-200 mb-2">
                        Длительность (часов) <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="duration"
                        required
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none text-sm sm:text-base min-h-[44px]"
                        style={{ color: '#ffffff' }}
                      >
                        <option value="1" className="bg-purple-900">1 час</option>
                        <option value="2" className="bg-purple-900">2 часа</option>
                        <option value="3" className="bg-purple-900">3 часа</option>
                        <option value="4" className="bg-purple-900">4 часа</option>
                      </select>
                    </div>

                    {/* Комментарий */}
                    <div className="sm:col-span-2">
                      <label htmlFor="comment" className="block text-sm font-medium text-purple-200 mb-2">
                        Комментарий
                      </label>
                      <textarea
                        id="comment"
                        rows={3}
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        className="w-full px-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm sm:text-base resize-none min-h-[80px]"
                        placeholder="Дополнительные пожелания или вопросы"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    className="w-full text-sm sm:text-base py-3"
                    disabled={submitting}
                  >
                    {submitting ? 'Отправка...' : 'Отправить заявку на аренду'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Аренда пилона */}
          {rentalType === 'pole' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Информация об аренде пилона */}
              <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 p-4 sm:p-6">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-4">
                  Аренда пилона для индивидуальных занятий
                </h2>
                <p className="text-sm sm:text-base text-purple-200/80 mb-4">
                  Вы можете арендовать пилон в любом из наших залов для самостоятельных тренировок или занятий с личным тренером.
                </p>
                <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-500/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">{polePricePerHour.toLocaleString('ru-RU')} ₽/час</div>
                      <div className="text-sm text-purple-200/70">За один пилон</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-300 mb-1">Включено:</div>
                      <ul className="space-y-1 text-sm text-purple-200/80">
                        <li className="flex items-center gap-2">
                          <CheckIcon />
                          Доступ к раздевалке
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckIcon />
                          Зеркала в зале
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Форма бронирования пилона */}
              <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 p-4 sm:p-6">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  Забронировать пилон
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Имя */}
                    <div>
                      <label htmlFor="name-pole" className="block text-sm font-medium text-purple-200 mb-2">
                        Ваше имя <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <UserIcon />
                        </div>
                        <input
                          type="text"
                          id="name-pole"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[44px]"
                          placeholder="Введите ваше имя"
                        />
                      </div>
                    </div>

                    {/* Телефон */}
                    <div>
                      <label htmlFor="phone-pole" className="block text-sm font-medium text-purple-200 mb-2">
                        Телефон <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <PhoneIcon />
                        </div>
                        <input
                          type="tel"
                          id="phone-pole"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[44px]"
                          placeholder="+7 (___) ___-__-__"
                        />
                      </div>
                    </div>

                    {/* Выбор зала */}
                    <div>
                      <label htmlFor="hall-pole" className="block text-sm font-medium text-purple-200 mb-2">
                        Выберите зал <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <MapPinIcon />
                        </div>
                        <select
                          id="hall-pole"
                          required
                          value={formData.hall}
                          onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none text-sm sm:text-base min-h-[44px]"
                          style={{ color: '#ffffff' }}
                        >
                          <option value="" className="bg-purple-900">Выберите зал</option>
                          {halls.map((hall) => (
                            <option key={hall.id} value={hall.id} className="bg-purple-900">
                              {hall.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Количество пилонов */}
                    <div>
                      <label htmlFor="poleCount" className="block text-sm font-medium text-purple-200 mb-2">
                        Количество пилонов <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="poleCount"
                        required
                        value={formData.poleCount}
                        onChange={(e) => setFormData({ ...formData, poleCount: e.target.value })}
                        className="w-full px-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none text-sm sm:text-base min-h-[44px]"
                        style={{ color: '#ffffff' }}
                      >
                        <option value="1" className="bg-purple-900">1 пилон</option>
                        <option value="2" className="bg-purple-900">2 пилона</option>
                        <option value="3" className="bg-purple-900">3 пилона</option>
                        <option value="4" className="bg-purple-900">4 пилона</option>
                        <option value="5" className="bg-purple-900">5 пилонов</option>
                        <option value="6" className="bg-purple-900">6 пилонов</option>
                      </select>
                    </div>

                    {/* Дата */}
                    <div>
                      <label htmlFor="date-pole" className="block text-sm font-medium text-purple-200 mb-2">
                        Дата <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <CalendarIcon />
                        </div>
                        <input
                          type="date"
                          id="date-pole"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Время */}
                    <div>
                      <label htmlFor="time-pole" className="block text-sm font-medium text-purple-200 mb-2">
                        Время начала <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                          <ClockIcon />
                        </div>
                        <select
                          id="time-pole"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          disabled={loadingTimes || !formData.date || !formData.hall || availableTimes.length === 0}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none text-sm sm:text-base min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ color: '#ffffff' }}
                        >
                          <option value="" className="bg-purple-900">
                            {loadingTimes ? 'Загрузка...' : !formData.date || !formData.hall ? 'Сначала выберите дату и зал' : availableTimes.length === 0 ? 'Нет доступного времени' : 'Выберите время'}
                          </option>
                          {availableTimes.map((time) => (
                            <option key={time} value={time} className="bg-purple-900">
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Длительность */}
                    <div className="sm:col-span-2">
                      <label htmlFor="duration-pole" className="block text-sm font-medium text-purple-200 mb-2">
                        Длительность (часов) <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="duration-pole"
                        required
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none text-sm sm:text-base min-h-[44px]"
                        style={{ color: '#ffffff' }}
                      >
                        <option value="1" className="bg-purple-900">1 час</option>
                        <option value="2" className="bg-purple-900">2 часа</option>
                        <option value="3" className="bg-purple-900">3 часа</option>
                      </select>
                    </div>

                    {/* Комментарий */}
                    <div className="sm:col-span-2">
                      <label htmlFor="comment-pole" className="block text-sm font-medium text-purple-200 mb-2">
                        Комментарий
                      </label>
                      <textarea
                        id="comment-pole"
                        rows={3}
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        className="w-full px-4 py-2.5 sm:py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm sm:text-base resize-none min-h-[80px]"
                        placeholder="Дополнительные пожелания или вопросы"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    className="w-full text-sm sm:text-base py-3"
                    disabled={submitting}
                  >
                    {submitting ? 'Отправка...' : 'Отправить заявку на аренду'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Контакты */}
          <div className="text-center mt-6 sm:mt-8">
            <div className="inline-block bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 px-4 sm:px-8 py-4 sm:py-6 w-full sm:w-auto">
              <p className="text-xs sm:text-base text-purple-200 mb-2 sm:mb-3">
                Вопросы по аренде? Свяжитесь с нами
              </p>
              <div className="space-y-1.5 sm:space-y-2">
                <a
                  href="tel:+79170379765"
                  className="block text-sm sm:text-lg font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  📞 89170379765
                </a>
                <p className="text-xs sm:text-sm text-purple-200/70">
                  Звоните с 10:00 до 21:00 ежедневно
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </BeamsBackground>
  )
}

