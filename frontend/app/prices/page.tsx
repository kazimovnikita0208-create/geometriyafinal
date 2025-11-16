'use client'

import { useRouter } from 'next/navigation'

export default function PricesPage() {
  const router = useRouter()

  const subscriptions = [
    {
      name: 'Пробное занятие',
      price: '500',
      lessons: '1 занятие',
      validity: '7 дней',
      features: ['Знакомство со студией', 'Любое направление', 'Без абонемента'],
      color: 'border-gray-300'
    },
    {
      name: '4 занятия',
      price: '3200',
      lessons: '4 занятия',
      validity: '30 дней',
      features: ['Все направления', 'Запись онлайн', 'Отмена занятий'],
      color: 'border-[#5833b6]',
      popular: true
    },
    {
      name: '8 занятий',
      price: '5600',
      lessons: '8 занятий',
      validity: '30 дней',
      features: ['Все направления', 'Запись онлайн', 'Отмена занятий', 'Выгода 700₽'],
      color: 'border-[#b63384]',
      popular: true
    },
    {
      name: '12 занятий',
      price: '7800',
      lessons: '12 занятий',
      validity: '45 дней',
      features: ['Все направления', 'Запись онлайн', 'Отмена занятий', 'Выгода 1400₽'],
      color: 'border-[#33b683]'
    },
    {
      name: 'Безлимит',
      price: '9900',
      lessons: 'Без ограничений',
      validity: '30 дней',
      features: ['Все направления', 'Приоритетная запись', 'Отмена занятий', 'Максимальная выгода'],
      color: 'border-[#b68333]'
    }
  ]

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
        <h1 className="text-2xl font-bold">💰 Цены и абонементы</h1>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {subscriptions.map((sub, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl shadow-lg border-2 ${sub.color} p-6 animate-fade-in relative`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {sub.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#5833b6] to-[#7e57c2] text-white text-xs font-bold px-4 py-1 rounded-full">
                    ПОПУЛЯРНО
                  </span>
                </div>
              )}
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{sub.name}</h3>
                <div className="text-4xl font-bold text-[#5833b6] mb-1">
                  {sub.price} ₽
                </div>
                <div className="text-sm text-gray-600">
                  {sub.lessons} • {sub.validity}
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {sub.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full bg-gradient-to-r from-[#5833b6] to-[#7e57c2] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                Купить абонемент
              </button>
            </div>
          ))}

          {/* Дополнительная информация */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="font-semibold mb-3">📌 Условия</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Абонемент действует с момента первого посещения</li>
              <li>• Можно посещать любые направления</li>
              <li>• Возможна заморозка абонемента (по договоренности)</li>
              <li>• Отмена вечерних занятий - за 4 часа</li>
              <li>• Отмена дневных занятий - до 21:00 предыдущего дня</li>
            </ul>
          </div>

          <div className="text-center text-sm text-gray-600 mt-6">
            <p>Остались вопросы?</p>
            <p className="mt-2">📞 +7 (XXX) XXX-XX-XX</p>
          </div>
        </div>
      </div>
    </div>
  )
}

