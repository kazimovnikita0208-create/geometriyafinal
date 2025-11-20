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

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
)

// Абонементы с детальной информацией
const subscriptionCategories = [
  {
    id: 'classic',
    title: 'КЛАССИЧЕСКИЙ',
    subtitle: 'Распространяется на все направления студии',
    popular: true,
    badge: 'Популярно',
    subscriptions: [
      { lessons: '1 занятие', price: '700' },
      { lessons: '4 занятия', price: '2 500' },
      { lessons: '6 занятий', price: '3 300' },
      { lessons: '8 занятий', price: '3 800' },
      { lessons: '12 занятий', price: '4 600' },
      { lessons: '16 занятий', price: '5 400' },
      { lessons: 'Безлимит', price: '5 900' }
    ]
  },
  {
    id: 'fitness',
    title: 'ТОЛЬКО ФИТНЕС',
    subtitle: 'Распространяется на все занятия без пилона: растяжку, силу и гибкость, choreo, strip',
    popular: false,
    badge: null,
    subscriptions: [
      { lessons: '1 занятие', price: '600' },
      { lessons: '4 занятия', price: '2 200' },
      { lessons: '6 занятий', price: '2 600' },
      { lessons: '8 занятий', price: '3 000' },
      { lessons: '12 занятий', price: '3 700' }
    ]
  },
  {
    id: 'combo',
    title: 'КОМБО-АБОНЕМЕНТ',
    subtitle: 'Лимитированное количество занятий с пилоном и без',
    popular: false,
    badge: 'Выгодно',
    subscriptions: [
      { lessons: '2 любых занятия на пилоне и 2 — без', price: '2 300' },
      { lessons: '4 любых занятия на пилоне и 4 — без', price: '3 500' },
      { lessons: '8 любых занятий на пилоне и 4 — без', price: '4 300' }
    ]
  }
]

// Условия
const terms = [
  'Абонемент действует 1 месяц с даты первого занятия по нему',
  'В случае отпуска или больничного можно воспользоваться «заморозкой» и продлить действие абонемента на срок до 2 недель',
  'Отмена или перенос вечернего занятия возможны не позднее, чем за 4 часа до его начала',
  'Отмена или перенос утреннего или дневного занятия осуществляются до 21:00 предшествующего дня'
]

// Правила пользования абонементом
const rules = [
  {
    title: 'Что делать, если я заболела / ухожу в отпуск, командировку?',
    content: [
      'В случае больничного, отпуска или командировки вы можете «заморозить» абонемент, т.е. продлить его срок действия на срок до 2 недель.',
      '«Заморозкой» занимается координатор групп. Чтобы воспользоваться опцией, просто напишите ему. «Заморозка» начнет действовать со следующего дня после вашего предупреждения.'
    ]
  },
  {
    title: 'Можно ли отменить запись разово?',
    content: [
      'Конечно! Причина не важна :) Если ваше занятие должно состояться вечером после 17:00, нужно выписаться не позже, чем за 4 часа до начала тренировки. В таком случае ваше место смогут занять другие желающие.',
      'Если ваше занятие должно состояться в первой половине дня до 17:00, нужно выписаться не позже 21:00 предыдущего дня. К примеру: если вы записаны на занятие в воскресенье в 12:00, необходимо предупредить о своем отсутствии до 21:00 субботы.'
    ]
  },
  {
    title: 'Обязательно ли закреплять за собой место в группах?',
    content: [
      'Необязательно. У нас в студии действует два формата записи — «гибкая» и «автомат».',
      'При «гибкой» записи можно записываться каждую неделю на свободные места в разные группы.',
      'При «автомате» можно закрепить за собой место в определенных группах и не беспокоиться, что его заберут раньше вас.',
      'Важно: если вы записываетесь «автоматом», нужно ходить регулярно. При пропуске занятия в группе более 3 недель подряд запись «автоматом» автоматически снимается.'
    ]
  }
]

export default function PricesPage() {
  const router = useRouter()
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCategoryData, setSelectedCategoryData] = useState<any>(null)
  const [selectedLessons, setSelectedLessons] = useState<string>('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    lessons: '',
    bookingType: 'flexible', // 'flexible' или 'automatic'
    direction: '',
    weekdays: [] as string[]
  })

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация для автоматической записи
    if (formData.bookingType === 'automatic') {
      if (!formData.direction) {
        alert('Пожалуйста, выберите направление')
        return
      }
      if (!formData.weekdays || formData.weekdays.length === 0) {
        alert('Пожалуйста, выберите хотя бы один день недели')
        return
      }
    }
    
    // Здесь будет логика отправки данных
    console.log('Booking data:', { ...formData, category: selectedCategory })
    
    // Закрываем модальное окно и очищаем форму
    setIsBookingModalOpen(false)
    setFormData({ 
      firstName: '', 
      lastName: '', 
      phone: '', 
      address: '', 
      lessons: '',
      bookingType: 'flexible',
      direction: '',
      weekdays: []
    })
    setSelectedLessons('')
    
    // Уведомление с информацией о типе записи
    const bookingTypeText = formData.bookingType === 'flexible' 
      ? 'Вы выбрали гибкую запись.' 
      : `Вы выбрали запись автоматом на ${formData.direction}.`
    alert(`Спасибо! Ваша заявка принята. ${bookingTypeText} Мы свяжемся с вами в ближайшее время.`)
  }

  const openBookingModal = (category: any, lessons?: string) => {
    setSelectedCategory(category.title)
    setSelectedCategoryData(category)
    if (lessons) {
      setSelectedLessons(lessons)
      setFormData(prev => ({ ...prev, lessons, bookingType: 'flexible', direction: '', weekdays: [] }))
    } else {
      setSelectedLessons('')
      setFormData(prev => ({ ...prev, lessons: '', bookingType: 'flexible', direction: '', weekdays: [] }))
    }
    setIsBookingModalOpen(true)
  }

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
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
                  Абонементы
                </h1>
                <p className="text-xs text-purple-200/70 mt-0.5 sm:mt-1 hidden sm:block">
                  Выберите подходящий тариф
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
          
          {/* Абонементы по категориям */}
          <div className="space-y-4 sm:space-y-8 mb-8 sm:mb-12">
            {subscriptionCategories.map((category) => (
              <div
                key={category.id}
                className="bg-purple-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-500/20 p-3 sm:p-6 md:p-8 hover:border-purple-400/40 transition-colors relative"
              >
                {/* Badge */}
                {category.badge && (
                  <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white text-xs font-bold border border-purple-400/50 shadow-lg">
                      <SparklesIcon />
                      {category.badge}
                    </span>
                  </div>
                )}

                {/* Заголовок категории */}
                <div className="text-center mb-4 sm:mb-6 mt-2 sm:mt-0">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                    {category.title}
                  </h2>
                  <p className="text-purple-200/80 text-xs sm:text-base max-w-2xl mx-auto">
                    {category.subtitle}
                  </p>
                </div>

                {/* Таблица цен */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {category.subscriptions.map((sub, idx) => (
                    <div 
                      key={idx}
                      onClick={() => openBookingModal(category, sub.lessons)}
                      className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 rounded-lg sm:rounded-xl bg-purple-800/30 border border-purple-500/10 hover:border-purple-400/50 hover:bg-purple-800/50 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <span className="text-purple-100 text-xs sm:text-base font-medium">
                        {sub.lessons}
                      </span>
                      <span className="text-white text-base sm:text-xl font-bold">
                        {sub.price} ₽
                      </span>
                    </div>
                  ))}
                </div>

                {/* Дополнительная информация */}
                <div className="text-center text-xs text-purple-200/60 mb-3 sm:mb-4">
                  Срок действия абонемента — 1 месяц
                </div>

                {/* Action */}
                <Button
                  variant={category.popular ? "default" : "secondary"}
                  className="w-full text-sm sm:text-base py-2.5 sm:py-3"
                  onClick={() => openBookingModal(category)}
                >
                  Начать заниматься
                </Button>
              </div>
            ))}
          </div>

          {/* Условия */}
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <InfoIcon />
              Условия использования абонементов
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {terms.map((term, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-purple-200/80 text-sm leading-relaxed">
                    {term}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопка Правила */}
          <div className="text-center mb-8">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsRulesModalOpen(true)}
            >
              <BookOpenIcon />
              Правила пользования абонементом
            </Button>
          </div>

          {/* Контакты */}
          <div className="text-center">
            <div className="inline-block bg-purple-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 px-8 py-6">
              <p className="text-purple-200 mb-2">
                Остались вопросы? Свяжитесь с нами
              </p>
              <a 
                href="tel:+79170379765"
                className="text-2xl font-bold text-white hover:text-purple-300 transition-colors"
              >
                📞 89170379765
              </a>
              <p className="text-sm text-purple-200/70 mt-3">
                Звоните с 10:00 до 21:00 ежедневно
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Модальное окно с правилами */}
      {isRulesModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsRulesModalOpen(false)}
        >
          <div 
            className="bg-purple-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-purple-900/95 backdrop-blur-xl border-b border-purple-500/30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                <BookOpenIcon />
                <span className="truncate">Правила пользования</span>
              </h2>
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="text-purple-200 hover:text-white transition-colors flex-shrink-0"
              >
                <XIcon />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {rules.map((rule, idx) => (
                <div key={idx} className="bg-purple-800/30 rounded-xl p-4 sm:p-6 border border-purple-500/20">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
                    {rule.title}
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {rule.content.map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-purple-200/90 text-sm sm:text-base leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-purple-900/95 backdrop-blur-xl border-t border-purple-500/30 px-4 sm:px-6 py-3 sm:py-4">
              <Button
                variant="default"
                className="w-full"
                onClick={() => setIsRulesModalOpen(false)}
              >
                Понятно
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно бронирования абонемента */}
      {isBookingModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsBookingModalOpen(false)}
        >
          <div 
            className="bg-purple-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-purple-900/95 backdrop-blur-xl border-b border-purple-500/30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Бронирование абонемента
              </h2>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-purple-200 hover:text-white transition-colors flex-shrink-0"
              >
                <XIcon />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleBookingSubmit} className="p-4 sm:p-6 space-y-4">
              {/* Выбранная категория */}
              <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-500/20">
                <p className="text-sm text-purple-200/70 mb-1">Выбранный тариф:</p>
                <p className="text-lg font-bold text-white">{selectedCategory}</p>
              </div>

              {/* Имя */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-purple-200 mb-2">
                  Имя <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="Введите ваше имя"
                  />
                </div>
              </div>

              {/* Фамилия */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-purple-200 mb-2">
                  Фамилия <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="Введите вашу фамилию"
                  />
                </div>
              </div>

              {/* Номер телефона */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-purple-200 mb-2">
                  Номер телефона <span className="text-red-400">*</span>
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
                    className="w-full pl-10 pr-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
              </div>

              {/* Адрес студии */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-purple-200 mb-2">
                  Адрес студии <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                    <MapPinIcon />
                  </div>
                  <select
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="" className="bg-purple-900">Выберите адрес</option>
                    <option value="Адрес 1" className="bg-purple-900">Адрес студии 1</option>
                    <option value="Адрес 2" className="bg-purple-900">Адрес студии 2</option>
                  </select>
                </div>
              </div>

              {/* Количество занятий */}
              <div>
                <label htmlFor="lessons" className="block text-sm font-medium text-purple-200 mb-2">
                  Количество занятий <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-300">
                    <ListIcon />
                  </div>
                  <select
                    id="lessons"
                    required
                    value={formData.lessons}
                    onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="" className="bg-purple-900">Выберите количество занятий</option>
                    {selectedCategoryData?.subscriptions.map((sub: any, idx: number) => (
                      <option key={idx} value={sub.lessons} className="bg-purple-900">
                        {sub.lessons} - {sub.price} ₽
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Тип записи */}
              <div className="pt-4 border-t border-purple-500/20">
              <label className="block text-sm font-medium text-purple-200 mb-3">
                Тип записи <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Гибкая запись */}
                <div
                  onClick={() => setFormData({ ...formData, bookingType: 'flexible', direction: '', weekdays: [] })}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.bookingType === 'flexible'
                      ? 'border-purple-400 bg-purple-600/30'
                      : 'border-purple-500/20 bg-purple-800/20 hover:border-purple-400/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      formData.bookingType === 'flexible' ? 'border-purple-400' : 'border-purple-500/40'
                    }`}>
                      {formData.bookingType === 'flexible' && (
                        <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">Гибкая запись</h4>
                      <p className="text-xs text-purple-200/70 leading-relaxed">
                        Вы записываетесь на занятия самостоятельно каждый раз в удобное время и день
                      </p>
                    </div>
                  </div>
                </div>

                {/* Запись автоматом */}
                <div
                  onClick={() => setFormData({ ...formData, bookingType: 'automatic' })}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.bookingType === 'automatic'
                      ? 'border-purple-400 bg-purple-600/30'
                      : 'border-purple-500/20 bg-purple-800/20 hover:border-purple-400/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      formData.bookingType === 'automatic' ? 'border-purple-400' : 'border-purple-500/40'
                    }`}>
                      {formData.bookingType === 'automatic' && (
                        <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">Запись автоматом</h4>
                      <p className="text-xs text-purple-200/70 leading-relaxed">
                        Вы закрепляетесь за определенным направлением и днями недели
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Дополнительные поля для автоматической записи */}
            {formData.bookingType === 'automatic' && (
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-purple-500/20">
                {/* Выбор направления */}
                <div>
                  <label htmlFor="direction" className="block text-sm font-medium text-purple-200 mb-2">
                    Направление <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="direction"
                    required={formData.bookingType === 'automatic'}
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none text-sm"
                  >
                    <option value="" className="bg-purple-900">Выберите направление</option>
                    <option value="pole-fit" className="bg-purple-900">Pole Fit</option>
                    <option value="pole-exotic" className="bg-purple-900">Pole Exotic</option>
                    <option value="strength-flexibility" className="bg-purple-900">Сила & Гибкость</option>
                    <option value="stretching" className="bg-purple-900">Растяжка</option>
                    <option value="choreo" className="bg-purple-900">Choreo</option>
                    <option value="strip" className="bg-purple-900">Strip</option>
                  </select>
                </div>

                {/* Выбор дней недели */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Дни недели <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'monday', label: 'Пн' },
                      { value: 'tuesday', label: 'Вт' },
                      { value: 'wednesday', label: 'Ср' },
                      { value: 'thursday', label: 'Чт' },
                      { value: 'friday', label: 'Пт' },
                      { value: 'saturday', label: 'Сб' },
                      { value: 'sunday', label: 'Вс' }
                    ].map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const weekdays = formData.weekdays || []
                          if (weekdays.includes(day.value)) {
                            setFormData({
                              ...formData,
                              weekdays: weekdays.filter(d => d !== day.value)
                            })
                          } else {
                            setFormData({
                              ...formData,
                              weekdays: [...weekdays, day.value]
                            })
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          (formData.weekdays || []).includes(day.value)
                            ? 'bg-purple-600 text-white border-2 border-purple-400'
                            : 'bg-purple-800/30 text-purple-200 border-2 border-purple-500/20 hover:border-purple-400/50'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-purple-200/60 mt-2">
                    Выберите дни, в которые вы планируете посещать занятия
                  </p>
                </div>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsBookingModalOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="flex-1"
                >
                  Отправить заявку
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BeamsBackground>
  )
}

