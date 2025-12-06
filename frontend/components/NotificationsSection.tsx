'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { notificationsAPI } from '@/lib/api'

interface NotificationsSectionProps {
  subTab: 'create' | 'templates' | 'schedules' | 'history'
  setSubTab: (tab: 'create' | 'templates' | 'schedules' | 'history') => void
  templates: any[]
  notifications: any[]
  schedules: any[]
  users: any[]
  showNotificationModal: boolean
  setShowNotificationModal: (show: boolean) => void
  showTemplateModal: boolean
  setShowTemplateModal: (show: boolean) => void
  showScheduleModal: boolean
  setShowScheduleModal: (show: boolean) => void
  newNotification: any
  setNewNotification: (notification: any) => void
  newTemplate: any
  setNewTemplate: (template: any) => void
  newSchedule: any
  setNewSchedule: (schedule: any) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  loadTemplates: () => Promise<void>
  loadNotifications: () => Promise<void>
  loadSchedules: () => Promise<void>
  loadUsers: (search?: string) => Promise<void>
}

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default function NotificationsSection(props: NotificationsSectionProps) {
  const {
    subTab,
    setSubTab,
    templates,
    notifications,
    schedules,
    users,
    showNotificationModal,
    setShowNotificationModal,
    showTemplateModal,
    setShowTemplateModal,
    showScheduleModal,
    setShowScheduleModal,
    newNotification,
    setNewNotification,
    newTemplate,
    setNewTemplate,
    newSchedule,
    setNewSchedule,
    loading,
    setLoading,
    loadTemplates,
    loadNotifications,
    loadSchedules,
    loadUsers
  } = props

  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    if (subTab === 'templates') {
      loadTemplates()
    } else if (subTab === 'history') {
      loadNotifications()
    } else if (subTab === 'schedules') {
      loadSchedules()
    } else if (subTab === 'create') {
      loadUsers()
    }
  }, [subTab])

  const handleCreateNotification = async () => {
    try {
      setLoading(true)
      await notificationsAPI.createNotification(newNotification)
      alert('✅ Уведомление создано и отправлено')
      setShowNotificationModal(false)
      setNewNotification({
        templateId: '',
        userId: '',
        title: '',
        message: '',
        type: 'personal',
        targetAudience: 'single',
        targetConfig: {},
        scheduledAt: ''
      })
      loadNotifications()
    } catch (error: any) {
      alert(`❌ ${error.message || 'Ошибка при создании уведомления'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      setLoading(true)
      await notificationsAPI.createTemplate(newTemplate)
      alert('✅ Шаблон создан')
      setShowTemplateModal(false)
      setNewTemplate({
        name: '',
        type: 'personal',
        title: '',
        message: '',
        variables: {}
      })
      loadTemplates()
    } catch (error: any) {
      alert(`❌ ${error.message || 'Ошибка при создании шаблона'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = async () => {
    try {
      setLoading(true)
      await notificationsAPI.createSchedule(newSchedule)
      alert('✅ Расписание создано')
      setShowScheduleModal(false)
      setNewSchedule({
        templateId: '',
        name: '',
        scheduleType: 'daily',
        scheduleConfig: {},
        targetAudience: 'all',
        targetConfig: {}
      })
      loadSchedules()
    } catch (error: any) {
      alert(`❌ ${error.message || 'Ошибка при создании расписания'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Уведомления</h2>
          <p className="text-purple-200/60 text-sm">Управление уведомлениями для клиентов</p>
        </div>
      </div>

      {/* Подвкладки */}
      <div className="flex gap-2 border-b border-purple-500/20">
        <button
          onClick={() => setSubTab('create')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            subTab === 'create'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-purple-200/60 hover:text-purple-200'
          }`}
        >
          Создать уведомление
        </button>
        <button
          onClick={() => setSubTab('templates')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            subTab === 'templates'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-purple-200/60 hover:text-purple-200'
          }`}
        >
          Шаблоны
        </button>
        <button
          onClick={() => setSubTab('schedules')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            subTab === 'schedules'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-purple-200/60 hover:text-purple-200'
          }`}
        >
          Расписание
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            subTab === 'history'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-purple-200/60 hover:text-purple-200'
          }`}
        >
          История
        </button>
      </div>

      {/* Контент вкладок */}
      {subTab === 'create' && (
        <div className="space-y-4">
          <Button
            onClick={() => setShowNotificationModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            + Создать уведомление
          </Button>

          {showNotificationModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-purple-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Создать уведомление</h3>
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="text-purple-200 hover:text-white"
                  >
                    <XIcon />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Тип получателей</label>
                    <select
                      value={newNotification.targetAudience}
                      onChange={(e) => setNewNotification({ ...newNotification, targetAudience: e.target.value })}
                      className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white"
                    >
                      <option value="single">Одному пользователю</option>
                      <option value="all">Всем пользователям</option>
                      <option value="active_subscriptions">С активными абонементами</option>
                    </select>
                  </div>

                  {newNotification.targetAudience === 'single' && (
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Пользователь</label>
                      <input
                        type="text"
                        placeholder="Поиск пользователя..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value)
                          loadUsers(e.target.value)
                        }}
                        className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white mb-2"
                      />
                      <select
                        value={newNotification.userId}
                        onChange={(e) => setNewNotification({ ...newNotification, userId: e.target.value })}
                        className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white"
                      >
                        <option value="">Выберите пользователя</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} {user.phone && `(${user.phone})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Тип уведомления</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
                      className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white"
                    >
                      <option value="personal">Персональное</option>
                      <option value="reminder">Напоминание</option>
                      <option value="promotion">Акция</option>
                      <option value="system">Системное</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Заголовок</label>
                    <input
                      type="text"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                      className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white"
                      placeholder="Заголовок уведомления"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Сообщение</label>
                    <textarea
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                      className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white min-h-[150px]"
                      placeholder="Текст уведомления"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreateNotification}
                      disabled={loading || !newNotification.title || !newNotification.message}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {loading ? 'Отправка...' : 'Отправить'}
                    </Button>
                    <Button
                      onClick={() => setShowNotificationModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'templates' && (
        <div className="space-y-4">
          <Button
            onClick={() => setShowTemplateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            + Создать шаблон
          </Button>

          <div className="grid gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">{template.name}</h4>
                    <p className="text-purple-200/70 text-sm mt-1">{template.title}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    template.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {template.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {showTemplateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-purple-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 max-w-2xl w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Создать шаблон</h3>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-purple-200 hover:text-white"
                  >
                    <XIcon />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Название</label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Тип</label>
                    <select
                      value={newTemplate.type}
                      onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                      className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white"
                    >
                      <option value="personal">Персональное</option>
                      <option value="reminder">Напоминание</option>
                      <option value="promotion">Акция</option>
                      <option value="system">Системное</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Заголовок</label>
                    <input
                      type="text"
                      value={newTemplate.title}
                      onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                      className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Сообщение</label>
                    <textarea
                      value={newTemplate.message}
                      onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                      className="w-full px-4 py-2 bg-purple-800/30 border border-purple-500/20 rounded-lg text-white min-h-[150px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreateTemplate}
                      disabled={loading || !newTemplate.name || !newTemplate.title || !newTemplate.message}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {loading ? 'Создание...' : 'Создать'}
                    </Button>
                    <Button
                      onClick={() => setShowTemplateModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'schedules' && (
        <div className="space-y-4">
          <Button
            onClick={() => setShowScheduleModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            + Создать расписание
          </Button>

          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">{schedule.name}</h4>
                    <p className="text-purple-200/70 text-sm mt-1">{schedule.template_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    schedule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {schedule.is_active ? 'Активно' : 'Неактивно'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="backdrop-blur-xl rounded-xl border border-purple-500/20 bg-purple-900/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">{notification.title}</h4>
                    <p className="text-purple-200/70 text-sm mt-1">{notification.message}</p>
                    <p className="text-purple-200/50 text-xs mt-2">
                      {notification.user_name} • {new Date(notification.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    notification.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                    notification.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {notification.status === 'sent' ? 'Отправлено' :
                     notification.status === 'failed' ? 'Ошибка' : 'Ожидает'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


