'use client'

import { useRouter } from 'next/navigation'

export default function DirectionsPage() {
  const router = useRouter()

  const directions = [
    {
      name: 'Pole Dance',
      icon: '🎭',
      color: 'from-[#5833b6] to-[#7e57c2]',
      description: 'Танец на пилоне для начинающих и продолжающих. Развивает силу, гибкость и грацию.'
    },
    {
      name: 'Exotic Pole Dance',
      icon: '💃',
      color: 'from-[#b63384] to-[#d946a6]',
      description: 'Чувственный танец на пилоне в туфлях. Подходит для уверенных в себе танцовщиц.'
    },
    {
      name: 'Растяжка',
      icon: '🤸',
      color: 'from-[#33b683] to-[#10b981]',
      description: 'Stretching для развития гибкости и улучшения общего самочувствия.'
    },
    {
      name: 'Воздушные полотна',
      icon: '🎪',
      color: 'from-[#3384b6] to-[#3b82f6]',
      description: 'Акробатика на воздушных полотнах. Зрелищно и эффектно!'
    },
    {
      name: 'Хореография',
      icon: '💫',
      color: 'from-[#b68333] to-[#f59e0b]',
      description: 'Танцевальные связки без пилона. Развивает пластику и чувство ритма.'
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
        <h1 className="text-2xl font-bold">💃 О направлениях</h1>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {directions.map((direction, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-r ${direction.color} p-6 text-white rounded-xl shadow-lg animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{direction.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{direction.name}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {direction.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Дополнительная информация */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="font-semibold mb-3">✨ Почему выбирают нас?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span>👍</span>
                <span>Опытные преподаватели с сертификатами</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🏢</span>
                <span>Два зала с современным оборудованием</span>
              </li>
              <li className="flex items-start gap-2">
                <span>❤️</span>
                <span>Дружелюбная атмосфера</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⏰</span>
                <span>Удобное расписание</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

