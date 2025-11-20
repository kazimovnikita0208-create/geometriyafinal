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
    id: 'pole-fit',
    name: 'Pole Fit',
    tagline: 'Красивый фитнес на пилоне',
    description: 'На занятии учим элементы и комбинации из них.\n\nНесмотря на то, что большую часть урока проводим «в воздухе», новичкам не стоит бояться Pole Fit. Нагрузка всегда дается по силам. Помимо суставной разминки и работы на пилоне, занятие включает в себя упражнения на общую и специальную физическую подготовку.\n\nОдин из самых эстетичных видов фитнеса, с которым подтягивается все тело!',
    features: [
      'Трюки и акробатика на пилоне',
      'Подходит для новичков',
      'Общая физическая подготовка',
      'Специальная физическая подготовка'
    ],
    levels: ['Вводный', 'Начинающий', 'Продолжающий', 'Продвинутый']
  },
  {
    id: 'pole-exotic',
    name: 'Pole Exotic',
    tagline: 'Танец с пилоном на каблуках',
    description: 'Направление, где ты сможешь выражать себя через музыку и свое тело. На такой тренировке мы учимся красиво двигаться в специальной обуви — стрипах: с пилоном и без него, в партере.',
    features: [
      'Танец на каблуках',
      'Работа с музыкальностью',
      'Движения на пилоне и в партере',
      'Развитие пластике'
    ],
    levels: ['Начинающие', 'Продолжающие']
  },
  {
    id: 'strength-flexibility',
    name: 'Сила & Гибкость',
    tagline: 'Силовая тренировка + растяжка',
    description: 'Направление, которое поможет обрести фигуру мечты и ускорить прогресс в Pole Fit и Pole Exotic. Включает в себя упражнения на общую физическую подготовку и стретчинг.',
    features: [
      'Общая физическая подготовка',
      'Стретчинг',
      'Подтянутое тело',
      'Способствует прогрессу на пилоне'
    ],
    levels: ['Все уровни']
  },
  {
    id: 'stretching',
    name: 'Растяжка',
    tagline: 'Здоровое тело, шпагаты и прогибы',
    description: 'Мы сочетаем разные виды стретчинга: активный, пассивный, статический и динамический; составляем программы занятий с учетом современных трендов. В нашем расписании есть классы как фитнес-растяжки, так и растяжки, направленной на достижение определенных целей (к примеру, шпагатов или мостиков).',
    features: [
      'Сочетание разных видов стретчинга',
      'Современные методики',
      'Фитнес-растяжка',
      'Растяжка на шпагат'
    ],
    levels: ['Все уровни']
  },
  {
    id: 'choreo',
    name: 'Choreo',
    tagline: 'Популярные женские стили',
    description: 'На Choreo мы учим связки в стилях High Heels и Jazz Funk.\n\nHigh Heels — танец на шпильках, где важно не только красиво двигаться, но и удержать равновесие. Направление развивает координацию движений, а также укрепляет мышцы ног.\n\nJazz Funk — симбиоз хип-хопа, джазовой и эстрадной хореографии, вакинга. Яркий танец, который исполняют в кроссовках.',
    features: [
      'Танцы на каблуках и в кроссовках',
      'Укрепление мышц ног',
      'Развитие координации',
      'Яркие эмоции'
    ],
    levels: ['Все уровни']
  },
  {
    id: 'strip',
    name: 'Strip',
    tagline: 'Современный стрип',
    description: 'На занятиях по этому направлению вы научитесь красиво и пластично двигаться на стрипах: стоя и в партере. Особое внимание в Strip уделяется музыкальности: каждое движение в танце выполняется на определенный звук.',
    features: [
      'Танцы на каблуках',
      'Работа с пластикой',
      'Развитие музыкальности',
      'Партерная акробатика'
    ],
    levels: ['Все уровни']
  }
]

export default function DirectionsPage() {
  const router = useRouter()

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen">
        
        {/* Header - Адаптивный */}
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-purple-500/20">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
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
                  Наши направления
                </h1>
                <p className="text-xs text-purple-200/70 mt-0.5 sm:mt-1 hidden sm:block">
                  Найдите то, что подходит именно вам
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 sm:px-6 py-4 sm:py-6">
          
          {/* Направления - Адаптивные карточки */}
          <div className="space-y-2.5 sm:space-y-6 mb-6 sm:mb-12">
            {directions.map((direction) => (
              <div
                key={direction.id}
                className="bg-purple-900/40 backdrop-blur-xl rounded-lg sm:rounded-xl border border-purple-500/20 p-3 sm:p-8 hover:border-purple-400/40 transition-colors"
              >
                {/* Header - Адаптивный */}
                <div className="mb-2 sm:mb-4">
                  <h2 className="text-base sm:text-3xl font-bold text-white mb-1">
                    {direction.name}
                  </h2>
                  <p className="text-purple-300 text-xs sm:text-base font-medium">
                    {direction.tagline}
                  </p>
                </div>

                {/* Description - Адаптивный размер */}
                <p className="text-purple-200/80 text-xs sm:text-base leading-relaxed mb-3 sm:mb-6">
                  {direction.description}
                </p>

                {/* Features & Levels - Адаптивная сетка */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mb-3 sm:mb-6">
                  {/* Features */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-purple-300 mb-1.5 sm:mb-3 flex items-center gap-1 sm:gap-2">
                      <SparklesIcon />
                      Особенности
                    </h3>
                    <ul className="space-y-1 sm:space-y-2">
                      {direction.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1 sm:gap-2 text-purple-200/80 text-xs sm:text-sm">
                          <CheckIcon />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Levels */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-purple-300 mb-1.5 sm:mb-3">
                      Уровни подготовки
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {direction.levels.map((level, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full bg-purple-500/20 text-purple-200 text-xs sm:text-sm font-medium border border-purple-400/20"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions - Адаптивные кнопки в 2 колонки */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    variant="default"
                    className="w-full text-xs sm:text-base py-2 sm:py-3"
                    onClick={() => router.push('/schedule')}
                  >
                    Записаться на занятие
                  </Button>
                  <Button variant="outline" className="w-full text-xs sm:text-base py-2 sm:py-3">
                    Подробнее
                  </Button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </BeamsBackground>
  )
}

