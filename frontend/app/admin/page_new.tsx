'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { subscriptionsAPI, Subscription } from '@/lib/api'

export default function AdminPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; subscriptionId: number | null }>({ 
    isOpen: false, 
    subscriptionId: null 
  })
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await subscriptionsAPI.getRequests()
      setSubscriptions(data.requests || [])
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      setLoading(true)
      await subscriptionsAPI.approve(id)
      await loadSubscriptions()
      alert('✅ Абонемент подтвержден!')
    } catch (error) {
      console.error('Ошибка:', error)
      alert('❌ Ошибка при подтверждении')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = (id: number) => {
    setRejectionModal({ isOpen: true, subscriptionId: id })
  }

  const confirmRejection = async () => {
    if (!rejectionModal.subscriptionId || !rejectionReason.trim()) {
      alert('⚠️ Укажите причину отказа')
      return
    }

    try {
      setLoading(true)
      await subscriptionsAPI.reject(rejectionModal.subscriptionId, rejectionReason)
      await loadSubscriptions()
      setRejectionModal({ isOpen: false, subscriptionId: null })
      setRejectionReason('')
      alert('✅ Абонемент отклонен')
    } catch (error) {
      console.error('Ошибка:', error)
      alert('❌ Ошибка при отклонении')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push('/')}
          className="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          ← Назад
        </button>
        <h1 className="text-3xl font-bold text-white">Админ-панель</h1>
        <p className="text-purple-200">Управление заявками на абонементы</p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {loading && subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-purple-200 mt-4">Загрузка заявок...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-4xl mx-auto mb-4">
              📋
            </div>
            <p className="text-purple-200 text-lg">Нет заявок на абонементы</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {subscriptions.map((subscription) => {
              const clientName = `${subscription.first_name || ''} ${subscription.last_name || ''}`.trim() || 'Клиент'
              const initials = clientName.split(' ').map(n => n[0]).join('').toUpperCase()

              return (
                <div
                  key={subscription.id}
                  className={`bg-gradient-to-br backdrop-blur-xl rounded-xl border p-5 transition-all ${
                    subscription.status === 'pending'
                      ? 'from-indigo-900/50 to-purple-800/30 border-indigo-500/30'
                      : subscription.status === 'confirmed'
                      ? 'from-green-900/30 to-purple-800/20 border-green-500/20'
                      : 'from-red-900/30 to-purple-800/20 border-red-500/20'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                          {initials}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">
                            {clientName}
                          </h3>
                          <p className="text-sm text-purple-300/90 font-semibold">{subscription.subscription_type_name}</p>
                          {subscription.phone && (
                            <p className="text-xs text-purple-300/70">{subscription.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        subscription.status === 'confirmed' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : subscription.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {subscription.status === 'confirmed' ? '✓ Подтвержден' : subscription.status === 'rejected' ? '✗ Отклонен' : '⏳ Ожидает'}
                      </div>
                    </div>

                    <div className="bg-purple-800/30 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-purple-300/70 text-xs block">Занятий</span>
                          <p className="text-white font-semibold">{subscription.lesson_count}</p>
                        </div>
                        <div>
                          <span className="text-purple-300/70 text-xs block">Адрес</span>
                          <p className="text-white font-semibold truncate">{(subscription as any).address || 'Не указан'}</p>
                        </div>
                        <div>
                          <span className="text-purple-300/70 text-xs block">Дата заявки</span>
                          <p className="text-white font-semibold">{formatDate(subscription.created_at)}</p>
                        </div>
                      </div>

                      {subscription.status === 'rejected' && (subscription as any).rejection_reason && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <div className="text-xs text-red-300/70 mb-1">Причина отказа:</div>
                          <p className="text-red-300 text-xs">{(subscription as any).rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    {subscription.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleApprove(subscription.id)}
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg font-semibold disabled:opacity-50 transition-all"
                        >
                          ✓ Подтвердить
                        </button>
                        <button
                          onClick={() => handleReject(subscription.id)}
                          disabled={loading}
                          className="px-4 py-2 border border-red-400/30 hover:bg-red-500/20 text-red-400 rounded-lg font-semibold disabled:opacity-50 transition-all"
                        >
                          ✗ Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black rounded-3xl max-w-md w-full border border-red-500/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-400/50 flex items-center justify-center text-red-400 text-2xl">
                ⚠️
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Отклонить заявку</h2>
                <p className="text-sm text-purple-200/70">Укажите причину отказа</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Причина отказа <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Например: К сожалению, на выбранное время нет свободных мест..."
                className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmRejection}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg font-semibold disabled:opacity-50 transition-all"
              >
                {loading ? 'Отправка...' : 'Отклонить заявку'}
              </button>
              <button
                onClick={() => {
                  setRejectionModal({ isOpen: false, subscriptionId: null })
                  setRejectionReason('')
                }}
                disabled={loading}
                className="px-4 py-3 border border-purple-500/30 hover:bg-purple-500/20 text-purple-200 rounded-lg font-semibold disabled:opacity-50 transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

