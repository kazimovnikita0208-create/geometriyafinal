'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('Пользователь')

  useEffect(() => {
    // Получаем данные пользователя из Telegram
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      const user = tg.initDataUnsafe?.user
      if (user) {
        setUserName(user.first_name || 'Пользователь')
      }
    }
  }, [])

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
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userName}</h1>
            <p className="text-purple-100 text-sm">Личный кабинет</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Абонемент */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>🎟️</span>
              <span>Мой абонемент</span>
            </h3>
            
            <div className="bg-gradient-to-r from-[#5833b6] to-[#7e57c2] text-white p-4 rounded-lg mb-4">
              <div className="text-center">
                <div className="text-sm opacity-90 mb-1">Абонемент не активен</div>
                <div className="text-2xl font-bold mb-2">Купите абонемент</div>
                <button 
                  onClick={() => router.push('/prices')}
                  className="bg-white text-[#5833b6] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                  Посмотреть цены
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center">
              После покупки абонемента здесь отобразится информация о количестве занятий и сроке действия
            </div>
          </div>

          {/* Будущие занятия */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>📅</span>
              <span>Мои занятия</span>
            </h3>
            
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-gray-600 mb-4">У вас пока нет записей на занятия</p>
              <button 
                onClick={() => router.push('/schedule')}
                className="bg-gradient-to-r from-[#5833b6] to-[#7e57c2] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Записаться на занятие
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>📊</span>
              <span>Статистика</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#5833b6]">0</div>
                <div className="text-xs text-gray-600 mt-1">Посещено</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#b63384]">0</div>
                <div className="text-xs text-gray-600 mt-1">Запланировано</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#33b683]">0</div>
                <div className="text-xs text-gray-600 mt-1">Осталось</div>
              </div>
            </div>
          </div>

          {/* Настройки */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>⚙️</span>
              <span>Настройки</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Уведомления</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5833b6]"></div>
                </label>
              </div>
              
              <div className="pt-3 border-t">
                <button className="text-[#5833b6] text-sm font-medium">
                  Изменить контактные данные
                </button>
              </div>
            </div>
          </div>

          {/* Контакты */}
          <div className="text-center text-sm text-gray-600 mt-6">
            <p className="mb-2">Есть вопросы?</p>
            <p>📞 +7 (XXX) XXX-XX-XX</p>
            <p className="mt-2">📸 @geometriya_dance</p>
          </div>
        </div>
      </div>
    </div>
  )
}

