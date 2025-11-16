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

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

// Направления с подробной информацией
const directions = [
  {
    id: 'pole-dance',
    name: 'Pole Dance',
    tagline: 'Сила, гибкость, грация',
    description: 'Танец на пилоне для начинающих и продолжающих. Развивает силу, гибкость и грацию. Идеально подходит для тех, кто хочет обрести уверенность в себе и красивое тело.',
    features: [
      'Группы для разных уровней подготовки',
      'Профессиональные пилоны X-Pole',
      'Акцент на технику и безопасность',
      'Развитие силы верхней части тела'
    ],
    levels: ['Начинающие', 'Продолжающие', 'Продвинутые']
  },
  {
    id: 'exotic',
    name: 'Exotic Pole Dance',
    tagline: 'Чувственность и пластика',
    description: 'Чувственный танец на пилоне в туфлях. Подходит для уверенных в себе танцовщиц. Развивает пластику, женственность и артистизм.',
    features: [
      'Танец в высоких каблуках',
      'Работа с женственностью',
      'Хореографические связки',
      'Развитие артистизма'
    ],
    levels: ['Начинающие', 'Продолжающие']
  },
  {
    id: 'stretching',
    name: 'Растяжка',
    tagline: 'Гибкость и здоровье',
    description: 'Stretching для развития гибкости и улучшения общего самочувствия. Подходит для любого уровня подготовки. Помогает снять напряжение и улучшить осанку.',
    features: [
      'Все уровни гибкости',
      'Безопасные техники растяжки',
      'Шпагаты и мостики',
      'Улучшение осанки'
    ],
    levels: ['Все уровни']
  },
  {
    id: 'aerial',
    name: 'Воздушные полотна',
    tagline: 'Акробатика и грация',
    description: 'Акробатика на воздушных полотнах. Зрелищно и эффектно! Развивает силу, координацию и преодоление страха высоты.',
    features: [
      'Профессиональное оборудование',
      'Обучение с нуля',
      'Акробатические элементы',
      'Работа на высоте'
    ],
    levels: ['Начинающие', 'Продолжающие']
  },
  {
    id: 'choreography',
    name: 'Хореография',
    tagline: 'Пластика и ритм',
    description: 'Танцевальные связки без пилона. Развивает пластику и чувство ритма. Отличный способ освоить базу танца и раскрепоститься.',
    features: [
      'Танцевальные стили',
      'Работа с музыкальностью',
      'Хореографические постановки',
      'Развитие координации'
    ],
    levels: ['Начинающие', 'Продолжающие']
  }
]

// Преимущества студии
const benefits = [
  {
    icon: '🎓',
    title: 'Опытные преподаватели',
    description: 'Сертифицированные тренеры с многолетним опытом'
  },
  {
    icon: '🏢',
    title: 'Современные залы',
    description: 'Два зала с профессиональным оборудованием'
  },
  {
    icon: '💜',
    title: 'Дружелюбная атмосфера',
    description: 'Поддержка и комфорт для каждого ученика'
  },
  {
    icon: '⏰',
    title: 'Удобное расписание',
    description: 'Занятия в утреннее, дневное и вечернее время'
  }
]

export default function DirectionsPage() {
  const router = useRouter()

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen">
        
        {/* Header - Адаптивный */}
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-purple-500/20">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ChevronLeftIcon />
                <span className="hidden sm:inline">Назад</span>
              </Button>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Наши направления
                </h1>
                <p className="text-xs sm:text-sm text-purple-200/70 mt-1">
                  Найдите то, что подходит именно вам
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-6">
          
          {/* Направления - Адаптивные карточки */}
          <div className="space-y-6 mb-12">
            {directions.map((direction) => (
              <div
                key={direction.id}
                className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6 sm:p-8 hover:border-purple-400/40 transition-colors"
              >
                {/* Header - Адаптивный */}
                <div className="mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {direction.name}
                  </h2>
                  <p className="text-purple-300 text-sm sm:text-base font-medium">
                    {direction.tagline}
                  </p>
                </div>

                {/* Description - Адаптивный размер */}
                <p className="text-purple-200/80 text-sm sm:text-base leading-relaxed mb-6">
                  {direction.description}
                </p>

                {/* Features & Levels - Адаптивная сетка */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Features */}
                  <div>
                    <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                      <SparklesIcon />
                      Особенности
                    </h3>
                    <ul className="space-y-2">
                      {direction.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-purple-200/80 text-sm">
                          <CheckIcon />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Levels */}
                  <div>
                    <h3 className="text-sm font-semibold text-purple-300 mb-3">
                      Уровни подготовки
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {direction.levels.map((level, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-200 text-sm font-medium border border-purple-400/20"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions - Адаптивные кнопки в 2 колонки */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => router.push('/schedule')}
                  >
                    Записаться на занятие
                  </Button>
                  <Button variant="outline" className="w-full">
                    Подробнее
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Преимущества студии - Адаптивная сетка */}
          <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <SparklesIcon />
              Почему выбирают нас
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl sm:text-4xl mb-3">{benefit.icon}</div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-200/70">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </BeamsBackground>
  )
}

