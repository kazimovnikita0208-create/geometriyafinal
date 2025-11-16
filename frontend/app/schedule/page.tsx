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

// Моковые данные для демонстрации
const mockLessons = [
  {
    id: 1,
    title: 'Pole Dance',
    level: 'Начинающие',
    time: '10:00 - 11:30',
    date: 'Понедельник, 18 ноября',
    instructor: 'Анна Иванова',
    hall: 'Волгина, 117А',
    spots: 3,
    maxSpots: 8,
  },
  {
    id: 2,
    title: 'Растяжка',
    level: 'Все уровни',
    time: '18:00 - 19:00',
    date: 'Понедельник, 18 ноября',
    instructor: 'Мария Петрова',
    hall: 'Московское шоссе, 43',
    spots: 5,
    maxSpots: 10,
  },
  {
    id: 3,
    title: 'Exotic Pole Dance',
    level: 'Продолжающие',
    time: '19:30 - 21:00',
    date: 'Понедельник, 18 ноября',
    instructor: 'Ольга Смирнова',
    hall: 'Волгина, 117А',
    spots: 1,
    maxSpots: 6,
  },
]

export default function SchedulePage() {
  const router = useRouter()
  const [selectedHall, setSelectedHall] = useState('all')
  const [selectedDirection, setSelectedDirection] = useState('all')

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
                  Расписание занятий
                </h1>
                <p className="text-xs sm:text-sm text-purple-200/70 mt-1">
                  Выберите удобное время
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-6">
          
          {/* Фильтры - Адаптивные */}
          <div className="mb-6">
            <div className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Фильтры
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Зал */}
                <div>
                  <select
                    value={selectedHall}
                    onChange={(e) => setSelectedHall(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/40 border border-purple-500/30 text-white text-sm sm:text-base focus:border-purple-400 focus:outline-none"
                  >
                    <option value="all">Все залы</option>
                    <option value="volgina">Волгина, 117А</option>
                    <option value="moskovskoye">Московское шоссе, 43</option>
                  </select>
                </div>

                {/* Направление */}
                <div>
                  <select
                    value={selectedDirection}
                    onChange={(e) => setSelectedDirection(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/40 border border-purple-500/30 text-white text-sm sm:text-base focus:border-purple-400 focus:outline-none"
                  >
                    <option value="all">Все направления</option>
                    <option value="pole">Pole Dance</option>
                    <option value="exotic">Exotic Pole Dance</option>
                    <option value="stretching">Растяжка</option>
                    <option value="aerial">Воздушные полотна</option>
                    <option value="choreography">Хореография</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Список занятий - Адаптивный */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
              Ближайшие занятия
            </h2>
            
            {mockLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-purple-900/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 sm:p-6 hover:border-purple-400/40 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      {lesson.title}
                    </h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs sm:text-sm font-medium">
                      {lesson.level}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm text-purple-200/70">Свободно</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {lesson.spots}/{lesson.maxSpots}
                    </div>
                  </div>
                </div>

                {/* Info Grid - Адаптивная сетка */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                  {/* Время */}
                  <div className="flex items-start gap-2 text-purple-200">
                    <ClockIcon />
                    <div className="flex-1">
                      <div className="text-purple-200/70 text-xs sm:text-sm">{lesson.date}</div>
                      <div className="font-semibold text-sm sm:text-base">{lesson.time}</div>
                    </div>
                  </div>

                  {/* Зал */}
                  <div className="flex items-start gap-2 text-purple-200">
                    <MapPinIcon />
                    <div className="flex-1">
                      <div className="text-purple-200/70 text-xs sm:text-sm">Адрес</div>
                      <div className="font-semibold text-sm sm:text-base">{lesson.hall}</div>
                    </div>
                  </div>

                  {/* Инструктор */}
                  <div className="flex items-start gap-2 text-purple-200 sm:col-span-2">
                    <UsersIcon />
                    <div className="flex-1">
                      <div className="text-purple-200/70 text-xs sm:text-sm">Инструктор</div>
                      <div className="font-semibold text-sm sm:text-base">{lesson.instructor}</div>
                    </div>
                  </div>
                </div>

                {/* Actions - Адаптивные кнопки в 2 колонки */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="default"
                    className="w-full"
                    disabled={lesson.spots === 0}
                  >
                    {lesson.spots === 0 ? 'Мест нет' : 'Записаться'}
                  </Button>
                  <Button variant="outline" className="w-full">
                    Подробнее
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Заглушка для пустого состояния (когда нет занятий) */}
          {mockLessons.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📆</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Занятий не найдено
              </h3>
              <p className="text-purple-200/70 mb-6">
                Попробуйте изменить фильтры или вернитесь позже
              </p>
            </div>
          )}

        </div>
      </div>
    </BeamsBackground>
  )
}

