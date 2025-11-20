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

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// Направления с полной информацией
const directions = [
  {
    id: 'pole-fit',
    name: 'Pole Fit',
    description: 'Элементы и комбо на пилоне',
    trainers: ['Анна Иванова', 'Мария Петрова', 'Ольга Смирнова'],
    halls: ['Волгина, 117А', 'Московское шоссе, 43'],
  },
  {
    id: 'pole-exotic',
    name: 'Pole Exotic',
    description: 'Танец с пилоном на каблуках',
    trainers: ['Ольга Смирнова', 'Екатерина Новикова'],
    halls: ['Волгина, 117А', 'Московское шоссе, 43'],
  },
  {
    id: 'strength-flexibility',
    name: 'Сила & Гибкость',
    description: 'Силовая тренировка + растяжка',
    trainers: ['Мария Петрова', 'Анна Иванова'],
    halls: ['Волгина, 117А', 'Московское шоссе, 43'],
  },
  {
    id: 'stretching',
    name: 'Растяжка',
    description: 'Здоровое тело, шпагаты и прогибы',
    trainers: ['Мария Петрова', 'Екатерина Новикова'],
    halls: ['Волгина, 117А', 'Московское шоссе, 43'],
  },
  {
    id: 'choreo',
    name: 'Choreo (High Heels, Jazz Funk)',
    description: 'Танцы на каблуках и в кроссовках',
    trainers: ['Ольга Смирнова', 'Екатерина Новикова'],
    halls: ['Волгина, 117А', 'Московское шоссе, 43'],
  },
  {
    id: 'strip',
    name: 'Strip',
    description: 'Современный стрип',
    trainers: ['Ольга Смирнова', 'Екатерина Новикова'],
    halls: ['Волгина, 117А', 'Московское шоссе, 43'],
  },
]

// Моковые даты и время для модального окна
const mockSchedule = [
  { date: 'Понедельник, 18 ноября', times: ['10:00', '12:00', '18:00', '20:00'] },
  { date: 'Вторник, 19 ноября', times: ['10:00', '14:00', '18:00', '19:30'] },
  { date: 'Среда, 20 ноября', times: ['11:00', '15:00', '18:00', '20:00'] },
  { date: 'Четверг, 21 ноября', times: ['10:00', '12:00', '17:00', '19:00'] },
  { date: 'Пятница, 22 ноября', times: ['10:00', '14:00', '18:00', '20:00'] },
]

export default function SchedulePage() {
  const router = useRouter()
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedDirection, setSelectedDirection] = useState<any>(null)
  const [directionSelections, setDirectionSelections] = useState<any>({})

  const openScheduleModal = (direction: any) => {
    setSelectedDirection(direction)
    setIsScheduleModalOpen(true)
  }

  const updateDirectionSelection = (directionId: string, field: string, value: string) => {
    setDirectionSelections((prev: any) => ({
      ...prev,
      [directionId]: {
        ...prev[directionId],
        [field]: value,
      },
    }))
  }

  return (
    <BeamsBackground intensity="medium">
      <div className="min-h-screen">
        
        {/* Header */}
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
                  Запись на занятия
                </h1>
                <p className="text-xs text-purple-200/70 mt-0.5 sm:mt-1 hidden sm:block">
                  Выберите направление и параметры
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 sm:px-6 py-4 sm:py-6">
          
          {/* Список всех направлений */}
          <div className="space-y-2.5 sm:space-y-6">
            {directions.map((direction) => (
              <div
                key={direction.id}
                className="bg-purple-900/40 backdrop-blur-xl rounded-lg sm:rounded-xl border border-purple-500/20 p-3 sm:p-6 hover:border-purple-400/40 transition-colors"
              >
                {/* Header */}
                <div className="mb-2 sm:mb-4">
                  <h3 className="text-base sm:text-2xl font-bold text-white mb-1">
                    {direction.name}
                  </h3>
                  <p className="text-purple-200/80 text-xs sm:text-base leading-snug">
                    {direction.description}
                  </p>
                </div>

                {/* Селекты - встроенные фильтры */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5 sm:mb-4">
                  {/* Тренер */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-purple-200 mb-1 sm:mb-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <UsersIcon />
                        Тренер
                      </div>
                    </label>
                    <select
                      value={directionSelections[direction.id]?.trainer || ''}
                      onChange={(e) => updateDirectionSelection(direction.id, 'trainer', e.target.value)}
                      className="w-full px-2.5 py-1.5 sm:px-4 sm:py-3 rounded-lg bg-purple-800/30 border border-purple-500/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none"
                    >
                      <option value="" className="bg-purple-900">Выберите тренера</option>
                      {direction.trainers.map((trainer, idx) => (
                        <option key={idx} value={trainer} className="bg-purple-900">
                          {trainer}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Зал */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-purple-200 mb-1 sm:mb-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MapPinIcon />
                        Адрес студии
                      </div>
                    </label>
                    <select
                      value={directionSelections[direction.id]?.hall || ''}
                      onChange={(e) => updateDirectionSelection(direction.id, 'hall', e.target.value)}
                      className="w-full px-2.5 py-1.5 sm:px-4 sm:py-3 rounded-lg bg-purple-800/30 border border-purple-500/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none"
                    >
                      <option value="" className="bg-purple-900">Выберите адрес</option>
                      {direction.halls.map((hall, idx) => (
                        <option key={idx} value={hall} className="bg-purple-900">
                          {hall}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Кнопка записаться */}
                <Button
                  variant="default"
                  className="w-full text-xs sm:text-base py-2 sm:py-3"
                  onClick={() => openScheduleModal(direction)}
                >
                  Записаться на занятие
                </Button>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Модальное окно с расписанием */}
      {isScheduleModalOpen && selectedDirection && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsScheduleModalOpen(false)}
        >
          <div 
            className="bg-purple-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-purple-900/95 backdrop-blur-xl border-b border-purple-500/30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                <CalendarIcon />
                <span className="truncate">{selectedDirection.name}</span>
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-purple-200 hover:text-white transition-colors flex-shrink-0"
              >
                <XIcon />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {mockSchedule.map((day, dayIdx) => (
                <div key={dayIdx} className="bg-purple-800/30 rounded-xl p-3 sm:p-4 border border-purple-500/20">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
                    {day.date}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {day.times.map((time, timeIdx) => (
                      <button
                        key={timeIdx}
                        onClick={() => {
                          alert(`Вы записались на ${selectedDirection.name} ${day.date} в ${time}`)
                          setIsScheduleModalOpen(false)
                        }}
                        className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-purple-700/30 border border-purple-500/20 text-white text-sm sm:text-base font-medium hover:bg-purple-600/50 hover:border-purple-400/50 transition-all active:scale-95"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-purple-900/95 backdrop-blur-xl border-t border-purple-500/30 px-4 sm:px-6 py-3 sm:py-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </BeamsBackground>
  )
}

