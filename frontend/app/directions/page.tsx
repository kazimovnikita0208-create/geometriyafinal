'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeamsBackground } from '@/components/ui/beams-background'
import { Button } from '@/components/ui/button'
import { directionsAPI, Direction } from '@/lib/api'
import { mockDirections } from '@/lib/mockData'

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

export default function DirectionsPage() {
  const router = useRouter()
  // Инициализируем сразу с mock данными для мгновенного отображения
  const [directions, setDirections] = useState<Direction[]>(mockDirections)

  // Загружаем данные из backend в фоне и обновляем когда готовы
  useEffect(() => {
    // Прокручиваем к началу страницы при загрузке
    window.scrollTo(0, 0)
    
    const loadDirections = async () => {
      try {
        const response = await directionsAPI.getAll()
        // Обновляем только если получили данные из backend
        if (response.directions && response.directions.length > 0) {
          setDirections(response.directions)
        }
      } catch (err) {
        // Если backend недоступен, остаемся на mock данных
        console.warn('Backend недоступен, используем mock данные:', err)
      }
    }

    // Загружаем сразу без задержки
    loadDirections()
  }, [])

  return (
    <BeamsBackground intensity="medium">
      <main className="min-h-screen relative flex flex-col text-white pb-20 sm:pb-24 z-10">
        <div className="relative z-20 px-3 sm:px-4 pt-3 sm:pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
                onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <ChevronLeftIcon />
          </button>
          <div className="text-center flex-1 px-2">
            <h1 className="text-xl sm:text-2xl font-bold">Наши направления</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Найдите то, что подходит именно вам</p>
              </div>
          <div className="w-9" />
        </div>

        {/* Направления */}
        <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {directions.map((direction) => (
              <div
                key={direction.id}
              className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-purple-500/20"
              >
              {/* Header */}
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <SparklesIcon />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 break-words">{direction.name}</h2>
                  <p className="text-purple-300 text-xs sm:text-sm md:text-base">{direction.tagline}</p>
                </div>
                </div>

              {/* Description */}
              <p className="text-gray-200 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 whitespace-pre-line leading-relaxed">
                  {direction.description}
                </p>

              {/* Features & Levels Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Особенности */}
                  <div>
                  <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <SparklesIcon />
                      Особенности
                    </h3>
                  <div className="space-y-2">
                    {direction.features && direction.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="mt-0.5 text-green-400 flex-shrink-0">
                          <CheckIcon />
                        </div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                      ))}
                  </div>
                  </div>

                {/* Уровни подготовки */}
                  <div>
                  <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-3">
                      Уровни подготовки
                    </h3>
                  <div className="flex flex-wrap gap-2">
                    {direction.levels && direction.levels.map((level, index) => (
                        <span
                        key={index}
                        className="px-3 py-1.5 bg-purple-800/50 border border-purple-500/30 rounded-full text-sm font-medium"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="default"
                  className="flex-1 min-h-[44px] text-sm sm:text-base"
                    onClick={() => router.push('/prices')}
                  >
                    Приобрести абонемент
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </BeamsBackground>
  )
}
