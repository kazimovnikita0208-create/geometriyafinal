'use client'

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

// Абонементы с детальной информацией
const subscriptions = [
  {
    id: 'trial',
    name: 'Пробное занятие',
    price: '500',
    pricePerLesson: '500',
    lessons: '1 занятие',
    validity: '7 дней',
    description: 'Идеально для знакомства со студией',
    features: [
      'Знакомство со студией',
      'Любое направление на выбор',
      'Без покупки абонемента',
      'Консультация тренера'
    ],
    popular: false,
    badge: null
  },
  {
    id: 'small',
    name: '4 занятия',
    price: '3200',
    pricePerLesson: '800',
    lessons: '4 занятия',
    validity: '30 дней',
    description: 'Подходит для начинающих',
    features: [
      'Все направления',
      'Запись онлайн 24/7',
      'Отмена занятий по правилам',
      'Заморозка абонемента'
    ],
    popular: true,
    badge: 'Популярно'
  },
  {
    id: 'medium',
    name: '8 занятий',
    price: '5600',
    pricePerLesson: '700',
    lessons: '8 занятий',
    validity: '30 дней',
    description: 'Оптимальный выбор',
    features: [
      'Все направления',
      'Запись онлайн 24/7',
      'Отмена занятий по правилам',
      'Заморозка абонемента',
      'Выгода 700₽'
    ],
    popular: true,
    badge: 'Выгодно'
  },
  {
    id: 'large',
    name: '12 занятий',
    price: '7800',
    pricePerLesson: '650',
    lessons: '12 занятий',
    validity: '45 дней',
    description: 'Для регулярных тренировок',
    features: [
      'Все направления',
      'Запись онлайн 24/7',
      'Отмена занятий по правилам',
      'Заморозка абонемента',
      'Выгода 1400₽',
      'Приоритет в записи'
    ],
    popular: false,
    badge: null
  },
  {
    id: 'unlimited',
    name: 'Безлимит',
    price: '9900',
    pricePerLesson: '~330',
    lessons: 'Без ограничений',
    validity: '30 дней',
    description: 'Максимум возможностей',
    features: [
      'Все направления без ограничений',
      'Приоритетная запись',
      'Отмена в любое время',
      'Индивидуальный подход',
      'Максимальная выгода',
      'Скидки на дополнительные услуги'
    ],
    popular: false,
    badge: 'Premium'
  }
]

// Условия
const terms = [
  'Абонемент действует с момента первого посещения',
  'Можно посещать любые направления',
  'Возможна заморозка абонемента (по договоренности)',
  'Отмена вечерних занятий - не позднее чем за 4 часа',
  'Отмена дневных занятий (10:00-15:00) - до 21:00 предыдущего дня',
  'Абонемент не подлежит возврату после активации'
]

export default function PricesPage() {
  const router = useRouter()

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
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
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Цены и абонементы
                </h1>
                <p className="text-sm text-purple-200/70 mt-1">
                  Выберите подходящий вариант
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          
          {/* Абонементы Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-purple-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6 md:p-8 hover:border-purple-400/40 transition-colors relative"
              >
                {/* Badge */}
                {sub.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white text-xs font-bold border border-purple-400/50 shadow-lg">
                      <SparklesIcon />
                      {sub.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                    {sub.name}
                  </h3>
                  <p className="text-purple-300 text-xs sm:text-sm mb-4">
                    {sub.description}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                      {sub.price}
                    </span>
                    <span className="text-xl sm:text-2xl text-purple-200 ml-2">₽</span>
                  </div>
                  
                  {/* Price per lesson */}
                  <div className="text-xs sm:text-sm text-purple-200/70 mb-3">
                    {sub.pricePerLesson}₽ за занятие
                  </div>
                  
                  {/* Details */}
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-purple-500/20 text-purple-200 text-xs sm:text-sm">
                    <span>{sub.lessons}</span>
                    <span>•</span>
                    <span>{sub.validity}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3">
                    Что входит:
                  </h4>
                  <ul className="space-y-2">
                    {sub.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-purple-200/80 text-sm">
                        <CheckIcon />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action */}
                <Button
                  variant={sub.popular ? "default" : "secondary"}
                  className="w-full"
                  onClick={() => router.push('/schedule')}
                >
                  Купить абонемент
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

          {/* Контакты */}
          <div className="text-center">
            <div className="inline-block bg-purple-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 px-8 py-6">
              <p className="text-purple-200 mb-2">
                Остались вопросы? Свяжитесь с нами
              </p>
              <a 
                href="tel:+7XXXXXXXXXX"
                className="text-2xl font-bold text-white hover:text-purple-300 transition-colors"
              >
                📞 +7 (XXX) XXX-XX-XX
              </a>
              <p className="text-sm text-purple-200/70 mt-3">
                Звоните с 10:00 до 22:00 ежедневно
              </p>
            </div>
          </div>

        </div>
      </div>
    </BeamsBackground>
  )
}

