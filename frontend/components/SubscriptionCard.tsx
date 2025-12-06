import { useState, useEffect } from 'react'
import { Subscription, subscriptionsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { SnowflakeIcon, PoleIcon, FitnessIcon, ClockIcon, TicketIcon, ClipboardIcon, RobotIcon, FireIcon, CalendarIcon, UserIcon, MapPinIcon, SparklesIcon } from '@/components/ui/icons'

interface SubscriptionCardProps {
  subscription: Subscription
}


const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [showFreezeModal, setShowFreezeModal] = useState(false)
  const [freezeStartDate, setFreezeStartDate] = useState('')
  const [freezeEndDate, setFreezeEndDate] = useState('')
  const [freezeInfo, setFreezeInfo] = useState<{
    totalFreezeDays: number;
    freezeCount: number;
    remainingFreezes: number;
    remainingDays: number;
  } | null>(null)
  const [loadingFreeze, setLoadingFreeze] = useState(false)
  const [loadingFreezeInfo, setLoadingFreezeInfo] = useState(false)

  useEffect(() => {
    if (subscription.status === 'confirmed' && subscription.id) {
      loadFreezeInfo()
    }
  }, [subscription.id, subscription.status])

  const loadFreezeInfo = async () => {
    if (!subscription.id) return
    try {
      setLoadingFreezeInfo(true)
      const info = await subscriptionsAPI.getFreezes(subscription.id)
      setFreezeInfo({
        totalFreezeDays: info.totalFreezeDays,
        freezeCount: info.freezeCount,
        remainingFreezes: info.remainingFreezes,
        remainingDays: info.remainingDays
      })
    } catch (error) {
      console.error('Ошибка загрузки информации о заморозках:', error)
    } finally {
      setLoadingFreezeInfo(false)
    }
  }

  const handleFreeze = async () => {
    if (!freezeStartDate || !freezeEndDate) {
      alert('Укажите даты начала и окончания заморозки')
      return
    }

    if (!subscription.id) return

    try {
      setLoadingFreeze(true)
      await subscriptionsAPI.freezeByClient(subscription.id, freezeStartDate, freezeEndDate)
      alert('✅ Абонемент успешно заморожен')
      setShowFreezeModal(false)
      setFreezeStartDate('')
      setFreezeEndDate('')
      // Перезагружаем страницу для обновления данных
      window.location.reload()
    } catch (error: any) {
      alert(`❌ ${error.message || 'Ошибка при заморозке абонемента'}`)
    } finally {
      setLoadingFreeze(false)
    }
  }

  const handleUnfreeze = async () => {
    if (!subscription.id) return

    if (!confirm('Разморозить абонемент? Срок действия будет продлен на количество дней заморозки.')) {
      return
    }

    try {
      setLoadingFreeze(true)
      const result = await subscriptionsAPI.unfreezeByClient(subscription.id)
      const daysText = result.extensionDays === 1 ? 'день' : result.extensionDays < 5 ? 'дня' : 'дней'
      alert(`✅ Абонемент успешно разморожен. Срок действия продлен на ${result.extensionDays} ${daysText} до ${new Date(result.newValidUntil).toLocaleDateString('ru-RU')}`)
      // Перезагружаем страницу для обновления данных
      window.location.reload()
    } catch (error: any) {
      alert(`❌ ${error.message || 'Ошибка при разморозке абонемента'}`)
    } finally {
      setLoadingFreeze(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Ожидает подтверждения',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          icon: <ClockIcon className="w-5 h-5" />
        }
      case 'confirmed':
        return {
          text: 'Активна',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
          icon: <CheckCircleIcon />
        }
      case 'rejected':
        return {
          text: 'Отклонена',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
          icon: <XCircleIcon />
        }
      case 'expired':
        return {
          text: 'Истекла',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50',
          icon: <XCircleIcon />
        }
      case 'completed':
        return {
          text: 'Завершена',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50',
          icon: <CheckCircleIcon />
        }
      case 'frozen':
        return {
          text: 'Заморожена',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/50',
          icon: <SnowflakeIcon className="w-5 h-5" />
        }
      default:
        return {
          text: status,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50',
          icon: <ClockIcon className="w-5 h-5" />
        }
    }
  }

  const statusInfo = getStatusInfo(subscription.status)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDaysRemaining = (validUntil: string) => {
    const now = new Date()
    const end = new Date(validUntil)
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  const daysRemaining = getDaysRemaining(subscription.valid_until)
  const progress = subscription.lesson_count 
    ? ((subscription.lessons_remaining / subscription.lesson_count) * 100)
    : 0

  // Маппинг категорий на русские названия
  const categoryNames: Record<string, string> = {
    'classic': 'КЛАССИЧЕСКИЙ',
    'fitness': 'ТОЛЬКО ФИТНЕС',
    'combo': 'КОМБО-АБОНЕМЕНТ',
    'КЛАССИЧЕСКИЙ': 'КЛАССИЧЕСКИЙ',
    'ТОЛЬКО ФИТНЕС': 'ТОЛЬКО ФИТНЕС',
    'КОМБО-АБОНЕМЕНТ': 'КОМБО-АБОНЕМЕНТ'
  }
  const categoryDisplayName = subscription.category ? categoryNames[subscription.category] || subscription.category : ''

  return (
    <div className={`bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-xl rounded-xl border ${statusInfo.borderColor} p-6`}>
      {/* Заголовок с статусом */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            {subscription.subscription_name}
          </h3>
          {categoryDisplayName && (
            <p className="text-sm text-purple-200/70">{categoryDisplayName}</p>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
          <span className={statusInfo.color}>{statusInfo.icon}</span>
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      {/* Статистика - стильное отображение с выравниванием по левому краю */}
      <div className="space-y-3 mb-4">
        {/* Занятия */}
        {subscription.category === 'combo' ? (
          <>
            {/* Комбо-абонемент: раздельные счётчики */}
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-purple-500/20">
              <div>
                <div className="text-xs text-purple-200/70 mb-1 flex items-center gap-1">
                  <PoleIcon className="w-4 h-4" />
                  <span>С пилоном</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {subscription.pole_lessons_remaining || 0}/{subscription.pole_lessons || 0}
                  <span className="text-sm font-normal text-purple-200/70 ml-2">занятий</span>
                </div>
              </div>
              <PoleIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-purple-500/20">
              <div>
                <div className="text-xs text-purple-200/70 mb-1 flex items-center gap-1">
                  <FitnessIcon className="w-4 h-4" />
                  <span>Фитнес</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {subscription.fitness_lessons_remaining || 0}/{subscription.fitness_lessons || 0}
                  <span className="text-sm font-normal text-purple-200/70 ml-2">занятий</span>
                </div>
              </div>
              <FitnessIcon className="w-8 h-8 text-purple-400" />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-purple-500/20">
            <div>
              <div className="text-xs text-purple-200/70 mb-1 flex items-center gap-1">
                {subscription.category === 'fitness' ? (
                  <>
                    <FitnessIcon className="w-4 h-4" />
                    <span>Фитнес-занятия</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span>Занятия</span>
                  </>
                )}
              </div>
              <div className="text-lg font-bold text-white">
                {subscription.lessons_remaining}/{subscription.lesson_count}
                <span className="text-sm font-normal text-purple-200/70 ml-2">
                  (осталось/всего)
                </span>
              </div>
            </div>
            {subscription.lessons_remaining === subscription.lesson_count ? (
              <TicketIcon className="w-8 h-8 text-purple-400" />
            ) : (
              <ClipboardIcon className="w-8 h-8 text-purple-400" />
            )}
          </div>
        )}

        {/* Срок действия */}
        {subscription.status === 'confirmed' && (
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-purple-500/20">
            <div>
              <div className="text-xs text-purple-200/70 mb-1">Срок действия</div>
              <div className="text-lg font-bold text-purple-300">
                {daysRemaining} {daysRemaining === 1 ? 'день' : daysRemaining < 5 ? 'дня' : 'дней'}
              </div>
            </div>
            <ClockIcon className="w-8 h-8 text-purple-400" />
          </div>
        )}
      </div>

      {/* Прогресс-бар - только для активных */}
      {subscription.status === 'confirmed' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-purple-200/70 mb-2">
            <span>Использовано</span>
            <span>{100 - Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-purple-950/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${100 - progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Информация */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-purple-200/70">Адрес:</span>
          <span className="text-white font-medium">{(subscription as any).address || 'Не указан'}</span>
        </div>
        {subscription.status === 'confirmed' && (
          <div className="flex justify-between">
            <span className="text-purple-200/70">Действителен до:</span>
            <span className="text-white font-medium">{formatDate(subscription.valid_until)}</span>
          </div>
        )}
        {subscription.status === 'rejected' && (subscription as any).rejection_reason && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300">
              <span className="font-semibold">Причина отказа:</span> {(subscription as any).rejection_reason}
            </p>
          </div>
        )}
        {subscription.status === 'pending' && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300 text-center font-medium">
              Ожидает подтверждения
            </p>
          </div>
        )}
      </div>

      {/* Информация об автоматической записи */}
      {subscription.booking_type === 'automatic' && subscription.status === 'confirmed' && (
        <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-500/30">
          <h4 className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
            <RobotIcon className="w-4 h-4" />
            <span>Автоматическая запись</span>
          </h4>
          <div className="text-xs text-green-200/80 space-y-1">
            {subscription.auto_hall_name && (
              <p className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span>{subscription.auto_hall_name}</span>
              </p>
            )}
            {subscription.auto_trainer_name && (
              <p className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>{subscription.auto_trainer_name}</span>
              </p>
            )}
            {subscription.auto_start_time && subscription.auto_end_time && (
              <p className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span>{subscription.auto_start_time} - {subscription.auto_end_time}</span>
              </p>
            )}
            {subscription.auto_weekdays && subscription.auto_weekdays.length > 0 && (
              <p className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{subscription.auto_weekdays.map(d => ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d]).join(', ')}</span>
              </p>
            )}
            <p className="text-xs text-green-200/60 mt-2 italic">
              Вы автоматически записываетесь на все занятия, соответствующие этим параметрам
            </p>
          </div>
        </div>
      )}

      {/* Кнопка заморозки для активных абонементов */}
      {subscription.status === 'confirmed' && (
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          {freezeInfo && (
            <div className="mb-3 text-xs text-purple-200/70">
              <p>Использовано заморозок: {freezeInfo.freezeCount}/3</p>
              <p>Использовано дней: {freezeInfo.totalFreezeDays}/14</p>
              {freezeInfo.remainingFreezes > 0 && freezeInfo.remainingDays > 0 && (
                <p className="text-green-400 mt-1">
                  Доступно: {freezeInfo.remainingFreezes} заморозок, {freezeInfo.remainingDays} дней
                </p>
              )}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setShowFreezeModal(true)}
            disabled={freezeInfo ? (freezeInfo.remainingFreezes <= 0 || freezeInfo.remainingDays <= 0) : false}
          >
            <SnowflakeIcon className="w-4 h-4" />
            <span>Заморозить абонемент</span>
          </Button>
        </div>
      )}

      {/* Кнопка разморозки для замороженных абонементов */}
      {subscription.status === 'frozen' && (
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 font-semibold mb-1">Абонемент заморожен</p>
            <p className="text-xs text-blue-200/70">
              После разморозки срок действия абонемента будет продлен на количество дней заморозки
            </p>
            {subscription.booking_type === 'automatic' && (
              <p className="text-xs text-blue-200/70 mt-1">
                Ваши записи также будут перенесены на соответствующее количество дней
              </p>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 flex items-center justify-center gap-2"
            onClick={handleUnfreeze}
            disabled={loadingFreeze}
          >
            {loadingFreeze ? (
              'Загрузка...'
            ) : (
              <>
                <FireIcon className="w-4 h-4" />
                <span>Разморозить абонемент</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Модальное окно заморозки */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-purple-900/95 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Заморозить абонемент</h3>
            
            {freezeInfo && (
              <div className="mb-4 p-3 bg-purple-800/30 rounded-lg border border-purple-500/20">
                <p className="text-sm text-purple-200/70 mb-1">
                  Осталось заморозок: <span className="text-white font-semibold">{freezeInfo.remainingFreezes}</span>
                </p>
                <p className="text-sm text-purple-200/70">
                  Осталось дней: <span className="text-white font-semibold">{freezeInfo.remainingDays}</span> из 14
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Дата начала заморозки
                </label>
                <input
                  type="date"
                  value={freezeStartDate}
                  onChange={(e) => setFreezeStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Дата окончания заморозки
                </label>
                <input
                  type="date"
                  value={freezeEndDate}
                  onChange={(e) => setFreezeEndDate(e.target.value)}
                  min={freezeStartDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white"
                />
              </div>
              {freezeStartDate && freezeEndDate && (
                <div className="p-3 bg-purple-800/30 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-purple-200/70">
                    Дней заморозки: <span className="text-white font-semibold">
                      {Math.ceil((new Date(freezeEndDate).getTime() - new Date(freezeStartDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowFreezeModal(false)
                  setFreezeStartDate('')
                  setFreezeEndDate('')
                }}
              >
                Отмена
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={handleFreeze}
                disabled={loadingFreeze || !freezeStartDate || !freezeEndDate}
              >
                {loadingFreeze ? 'Загрузка...' : 'Заморозить'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

