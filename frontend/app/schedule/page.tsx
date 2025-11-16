'use client'

import { useRouter } from 'next/navigation'

export default function SchedulePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5833b6] to-[#7e57c2] text-white p-6">
        <button 
          onClick={() => router.back()}
          className="mb-4 text-white/80 hover:text-white flex items-center gap-2"
        >
          ← Назад
        </button>
        <h1 className="text-2xl font-bold">📅 Расписание занятий</h1>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Фильтры */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Фильтры</h3>
            <div className="space-y-3">
              <select className="w-full p-3 border-2 border-gray-200 rounded-lg">
                <option>Все залы</option>
                <option>ул. Волгина, 117А</option>
                <option>Московское шоссе, 43</option>
              </select>
              <select className="w-full p-3 border-2 border-gray-200 rounded-lg">
                <option>Все направления</option>
                <option>Pole Dance</option>
                <option>Exotic Pole Dance</option>
                <option>Растяжка</option>
                <option>Воздушные полотна</option>
                <option>Хореография</option>
              </select>
            </div>
          </div>

          {/* Заглушка расписания */}
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📆</div>
            <h3 className="text-xl font-semibold mb-2">Расписание загружается</h3>
            <p className="text-gray-600 mb-6">
              Здесь будет отображаться расписание занятий с возможностью записи
            </p>
            <div className="text-sm text-gray-500">
              Функционал будет реализован на следующем этапе
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

