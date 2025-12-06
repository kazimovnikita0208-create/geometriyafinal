// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options?: RequestInit & { timeout?: number }): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Определяем таймаут: по умолчанию 5 секунд, но можно переопределить
    const timeout = options?.timeout ?? 5000;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: AbortSignal.timeout(timeout),
    };
    
    // Удаляем timeout из options, чтобы не передавать его дальше
    delete (config as any).timeout;

    // Добавляем токен если он есть
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API request failed' }));
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET запрос
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST запрос
  async post<T>(endpoint: string, data?: any, options?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT запрос
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE запрос
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Создаем единственный экземпляр API клиента
const api = new ApiClient(API_URL);

// API методы
export const directionsAPI = {
  getAll: () => api.get<{ directions: Direction[] }>('/api/directions'),
  getBySlug: (slug: string) => api.get<{ direction: Direction }>(`/api/directions/${slug}`),
};

export const hallsAPI = {
  getAll: () => api.get<{ halls: Hall[] }>('/api/halls'),
  getById: (id: number) => api.get<{ hall: Hall }>(`/api/halls/${id}`),
};

export const subscriptionTypesAPI = {
  getAll: () => api.get<{ subscriptionTypes: Record<string, SubscriptionType[]> }>('/api/subscription-types'),
  getById: (id: number) => api.get<{ subscriptionType: SubscriptionType }>(`/api/subscription-types/${id}`),
};

export const authAPI = {
  login: (initData: string) => api.post<{ token: string; user: User }>('/api/auth/login', { initData }),
  getMe: () => api.get<{ user: User }>('/api/auth/me'),
  logout: () => api.post<{ message: string }>('/api/auth/logout', {}),
};

export const subscriptionsAPI = {
  // Создать заявку на абонемент
  create: (data: {
    subscriptionTypeId: number;
    bookingType?: 'flexible' | 'automatic';
    // Для автоматической записи
    autoDirections?: number[]; // Массив ID направлений
    autoTrainerId?: number;
    autoHallId?: number;
    autoStartTime?: string;
    autoEndTime?: string;
    autoWeekdays?: number[]; // Массив дней недели (0-6)
    // Контактные данные
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  }) => api.post<{ message: string; subscription: Subscription }>('/api/subscriptions', data),
  
  // Получить свои абонементы
  getMy: () => api.get<{ subscriptions: Subscription[] }>('/api/subscriptions/my'),
  
  // Получить активные абонементы
  getActive: () => api.get<{ subscriptions: Subscription[] }>('/api/subscriptions/active'),
  
  // Для админа: получить все заявки
  getRequests: (status?: string) => 
    api.get<{ requests: Subscription[] }>(`/api/subscriptions/requests${status ? `?status=${status}` : ''}`),
  
  // Для админа: подтвердить заявку
  approve: (id: number) => api.post<{ message: string; subscription: Subscription }>(`/api/subscriptions/${id}/approve`, {}),
  
  // Для админа: отклонить заявку
  reject: (id: number, reason?: string) => api.post<{ message: string }>(`/api/subscriptions/${id}/reject`, { reason }),
  
  // Для админа: заморозить абонемент
  freeze: (id: number) => api.post<{ message: string }>(`/api/subscriptions/${id}/freeze`, {}),
  
  // Для админа: разморозить абонемент
  unfreeze: (id: number) => api.post<{ message: string }>(`/api/subscriptions/${id}/unfreeze`, {}),
  
  // Для клиента: заморозить абонемент
  freezeByClient: (id: number, freezeStartDate: string, freezeEndDate: string) => 
    api.post<{ message: string; freezeDays: number; remainingFreezes: number; remainingDays: number }>(
      `/api/subscriptions/${id}/freeze-by-client`, 
      { freezeStartDate, freezeEndDate }
    ),
  
  // Получить информацию о заморозках
  getFreezes: (id: number) => 
    api.get<{ 
      freezes: Array<{ id: number; freezeStartDate: string; freezeEndDate: string; freezeDays: number; createdAt: string }>;
      totalFreezeDays: number;
      freezeCount: number;
      remainingFreezes: number;
      remainingDays: number;
    }>(`/api/subscriptions/${id}/freezes`),
  
  // Для клиента: разморозить абонемент
  unfreezeByClient: (id: number) => 
    api.post<{ message: string; extensionDays: number; newValidUntil: string }>(
      `/api/subscriptions/${id}/unfreeze-by-client`, 
      {}
    ),
  
  // Для админа: удалить абонемент
  remove: (id: number) => api.delete<{ message: string }>(`/api/subscriptions/${id}`),
};

export const lessonsAPI = {
  // Получить все занятия
  getAll: (params?: {
    date?: string;
    direction_id?: number;
    hall_id?: number;
    from_date?: string;
    to_date?: string;
    include_past?: string; // 'true' для показа прошедших занятий (для админа)
  }) => {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.direction_id) query.append('direction_id', params.direction_id.toString());
    if (params?.hall_id) query.append('hall_id', params.hall_id.toString());
    if (params?.from_date) query.append('from_date', params.from_date);
    if (params?.to_date) query.append('to_date', params.to_date);
    if (params?.include_past) query.append('include_past', params.include_past);
    
    const queryString = query.toString();
    return api.get<{ lessons: Lesson[] }>(`/api/lessons${queryString ? `?${queryString}` : ''}`);
  },
  
  // Получить занятие по ID
  getById: (id: number) => api.get<Lesson>(`/api/lessons/${id}`),
  
  // Создать занятие (только админ)
  create: (data: {
    hall_id: number;
    direction_id: number;
    trainer_id: number;
    lesson_date: string;
    start_time: string;
    end_time: string;
    capacity?: number;
    description?: string;
    is_recurring?: boolean;
    recurrence_pattern?: any;
  }) => api.post<{ message: string; id: number }>('/api/lessons', data),
  
  // Обновить занятие (только админ)
  update: (id: number, data: Partial<Lesson>) => api.put<{ message: string }>(`/api/lessons/${id}`, data),
  
  // Удалить занятие (только админ)
  delete: (id: number) => api.delete<{ message: string }>(`/api/lessons/${id}`),
  
  // Очистить все занятия и бронирования (только админ)
  clear: () => api.delete<{ message: string; deleted_lessons: number; deleted_bookings: number }>('/api/lessons/clear'),
  
  // Очистить прошедшие занятия
  cleanupPast: () => api.delete<{ message: string; deleted_lessons: number; deleted_bookings: number }>('/api/lessons/cleanup-past'),
};

export const trainersAPI = {
  // Получить всех тренеров
  getAll: () => api.get<{ trainers: Trainer[] }>('/api/trainers'),
  
  // Получить тренера по ID
  getById: (id: number) => api.get<Trainer>(`/api/trainers/${id}`),
  
  // Создать тренера (только админ)
  create: (data: {
    name: string;
    last_name?: string;
    directions?: number[];
    bio?: string;
  }) => api.post<{ trainer: Trainer }>('/api/trainers', data),
  
  // Обновить тренера (только админ)
  update: (id: number, data: {
    name: string;
    last_name?: string;
    directions?: number[];
    bio?: string;
    is_active?: boolean;
  }) => api.put<{ trainer: Trainer }>(`/api/trainers/${id}`, data),
  
  // Удалить тренера (только админ)
  delete: (id: number) => api.delete<{ message: string }>(`/api/trainers/${id}`),
};

export const bookingsAPI = {
  // Получить свои записи (только предстоящие)
  getMy: () => api.get<{ bookings: Booking[] }>('/api/bookings/my'),
  
  // Получить все свои записи (включая прошедшие)
  getAllMy: () => api.get<{ bookings: Booking[] }>('/api/bookings/my/all'),
  
  // Получить все записи (только админ)
  getAll: (params?: { status?: string; date?: string; lesson_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.date) query.append('date', params.date);
    if (params?.lesson_id) query.append('lesson_id', params.lesson_id.toString());
    
    const queryString = query.toString();
    return api.get<{ bookings: Booking[] }>(`/api/bookings${queryString ? `?${queryString}` : ''}`);
  },
  
  // Создать запись
  create: (data: { lesson_id: number; subscription_id: number }) => 
    api.post<{ message: string; booking_id: number }>('/api/bookings', data),
  
  // Отменить запись
  cancel: (id: number) => api.delete<{ message: string }>(`/api/bookings/${id}`),
};

export const statsAPI = {
  // Получить статистику
  get: (period?: 'day' | 'week' | 'month' | 'all') => {
    const params = period && period !== 'all' ? `?period=${period}` : '';
    return api.get<{
      confirmedSubscriptions: number;
      confirmedSubscriptionsSum: number;
      totalLessons: number;
      activeUsers: number;
      totalSubscriptions: number;
      totalBookings: number;
      upcomingLessons: number;
      period: string;
    }>(`/api/stats${params}`);
  },
  // Получить детальную статистику по абонементам
  getSubscriptions: (period?: 'day' | 'week' | 'month' | 'all') => {
    const params = period && period !== 'all' ? `?period=${period}` : '';
    return api.get<{
      subscriptions: Array<{
        id: number;
        created_at: string;
        status: string;
        lessons_remaining: number;
        valid_from: string;
        valid_until: string;
        subscription_name: string;
        price: number;
        category: string;
        first_name: string;
        last_name: string;
        phone: string;
      }>;
    }>(`/api/stats/subscriptions${params}`);
  },
  // Получить детальную статистику по занятиям
  getLessons: (period?: 'day' | 'week' | 'month' | 'all') => {
    const params = period && period !== 'all' ? `?period=${period}` : '';
    return api.get<{
      lessons: Array<{
        id: number;
        lesson_date: string;
        start_time: string;
        end_time: string;
        capacity: number;
        current_bookings: number;
        direction_name: string;
        hall_name: string;
        trainer_name: string;
      }>;
    }>(`/api/stats/lessons${params}`);
  },
  // Получить детальную статистику по пользователям
  getUsers: () => api.get<{
    users: Array<{
      id: number;
      first_name: string;
      last_name: string;
      phone: string;
      telegram_id: number;
      username: string;
      subscriptions_count: number;
      total_lessons_remaining: number;
    }>;
  }>('/api/stats/users'),
  // Получить детальную статистику по записям
  getBookings: (period?: 'day' | 'week' | 'month' | 'all') => {
    const params = period && period !== 'all' ? `?period=${period}` : '';
    return api.get<{
      bookings: Array<{
        id: number;
        booking_date: string;
        status: string;
        lesson_date: string;
        start_time: string;
        end_time: string;
        direction_name: string;
        hall_name: string;
        trainer_name: string;
        first_name: string;
        last_name: string;
        phone: string;
      }>;
    }>(`/api/stats/bookings${params}`);
  },
};

export const recurringLessonsAPI = {
  // Получить все шаблоны
  getAll: () => api.get<{ templates: RecurringLesson[] }>('/api/recurring-lessons'),
  
  // Создать шаблон
  create: (data: {
    hall_id: number;
    direction_id: number;
    trainer_id: number;
    days_of_week: number[];
    start_time: string;
    end_time: string;
    capacity?: number;
    description?: string;
  }) => api.post<{ message: string; templates: RecurringLesson[] }>('/api/recurring-lessons', data),
  
  // Создать несколько шаблонов для одного тренера
  createBatch: (data: {
    trainer_id: number;
    schedule_items: Array<{
      day_of_week: number;
      direction_id: number;
      hall_id: number;
      start_time: string;
      end_time: string;
      capacity?: number;
      description?: string;
    }>;
  }) => api.post<{ message: string; templates: RecurringLesson[] }>('/api/recurring-lessons/batch', data),
  
  // Удалить шаблон
  remove: (id: number) => api.delete<{ message: string }>(`/api/recurring-lessons/${id}`),
  
  // Генерировать занятия на период (увеличенный таймаут для длительных операций)
  generate: (weeks?: number) => api.post<{ message: string; generated: number }>('/api/recurring-lessons/generate', { weeks }, { timeout: 120000 }), // 2 минуты для генерации
};

// Типы данных
export interface Direction {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  features: string[];
  levels: string[];
  color: string;
  requires_pole?: boolean; // true = с пилоном, false = без пилона
}

export interface Hall {
  id: number;
  name: string;
  address: string;
  capacity: number;
  hasPoles: boolean;
  poleCount: number;
  pricePerHour: number;
}

export interface SubscriptionType {
  id: number;
  category: 'classic' | 'fitness' | 'combo'; // Категория абонемента
  name: string;
  lessonCount: number;
  price: number;
  validityDays: number;
  description: string;
  pole_lessons?: number; // Для комбо
  fitness_lessons?: number; // Для комбо
}

export interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isAdmin: boolean;
  notificationsEnabled: boolean;
}

export interface Subscription {
  id: number;
  user_id: number;
  subscription_type_id: number;
  lessons_remaining: number;
  pole_lessons_remaining?: number; // Для комбо-абонементов
  fitness_lessons_remaining?: number; // Для комбо-абонементов
  valid_from: string;
  valid_until: string;
  booking_type: 'flexible' | 'automatic';
  
  // Поля для автоматической записи
  auto_direction?: string; // (deprecated, используйте auto_directions)
  auto_directions?: number[]; // Массив ID направлений для авто-записи
  auto_weekdays?: number[]; // Массив дней недели (0-6)
  auto_trainer_id?: number; // ID тренера
  auto_hall_id?: number; // ID зала
  auto_start_time?: string; // Время начала (HH:MM)
  auto_end_time?: string; // Время окончания (HH:MM)
  
  status: 'pending' | 'confirmed' | 'rejected' | 'frozen';
  is_active: boolean;
  created_at: string;
  // Joined fields
  subscription_name?: string;
  subscription_type_name?: string;
  category?: string; // 'classic', 'fitness', 'combo'
  price?: number;
  lesson_count?: number;
  pole_lessons?: number; // Для типа абонемента
  fitness_lessons?: number; // Для типа абонемента
  first_name?: string;
  last_name?: string;
  phone?: string;
  username?: string;
  telegram_id?: string;
  // Для отображения авто-записи
  auto_trainer_name?: string;
  auto_hall_name?: string;
  auto_direction_names?: string[];
}

export interface Lesson {
  id: number;
  hall_id: number;
  direction_id: number;
  trainer_id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  current_bookings: number;
  is_recurring: boolean;
  recurrence_pattern?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  hall_name?: string;
  hall_address?: string;
  direction_name?: string;
  direction_color?: string;
  trainer_name?: string;
  available_spots?: number;
}

export interface Trainer {
  id: number;
  name: string;
  last_name?: string;
  phone?: string;
  email?: string;
  directions?: number[]; // Массив ID направлений
  bio?: string;
  is_active: boolean;
}

export interface Booking {
  id: number;
  user_id: number;
  lesson_id: number;
  subscription_id: number;
  booking_date: string;
  status: 'confirmed' | 'cancelled';
  booked_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  // Joined fields
  lesson_date?: string;
  start_time?: string;
  end_time?: string;
  lesson_description?: string;
  direction_name?: string;
  direction_color?: string;
  hall_name?: string;
  hall_address?: string;
  trainer_name?: string;
  subscription_name?: string;
  lessons_remaining?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  telegram_id?: number;
}

export interface RecurringLesson {
  id: number;
  hall_id: number;
  direction_id: number;
  trainer_id: number;
  day_of_week: number; // 1 = Понедельник, 2 = Вторник, 3 = Среда, 4 = Четверг, 5 = Пятница, 6 = Суббота, 7 = Воскресенье
  start_time: string;
  end_time: string;
  capacity: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  direction_name?: string;
  direction_color?: string;
  hall_name?: string;
  hall_address?: string;
  trainer_name?: string;
}

// Rental API
export interface RentalBooking {
  id: number;
  user_id: number;
  hall_id: number;
  rental_type: 'hall' | 'pole';
  pole_count?: number;
  start_time: string;
  end_time: string;
  participants?: number;
  total_price: number;
  comment?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  hall_name?: string;
  hall_address?: string;
  hall_pole_count?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface RentalAvailability {
  availableTimes: string[];
}

// Rental API
export const rentalAPI = {
  getAvailability: async (hallId: number, date: string, rentalType: 'hall' | 'pole'): Promise<RentalAvailability> => {
    return api.request<RentalAvailability>(`/api/rental/availability?hallId=${hallId}&date=${date}&rentalType=${rentalType}`);
  },
  
  createBooking: async (data: {
    hallId: number;
    rentalType: 'hall' | 'pole';
    poleCount?: number;
    date: string;
    time: string;
    duration: string;
    participants?: number;
    comment?: string;
  }): Promise<RentalBooking> => {
    return api.request<RentalBooking>('/api/rental/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getMyBookings: async (): Promise<RentalBooking[]> => {
    return api.request<RentalBooking[]>('/api/rental/bookings/my');
  },
  
  // Admin methods
  getAllBookings: async (status?: string): Promise<RentalBooking[]> => {
    const url = status ? `/api/rental/bookings/all?status=${status}` : '/api/rental/bookings/all';
    return api.request<RentalBooking[]>(url);
  },
  
  updateBookingStatus: async (id: number, status: 'pending' | 'confirmed' | 'cancelled'): Promise<RentalBooking> => {
    return api.request<RentalBooking>(`/api/rental/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Для обратной совместимости (используем any для динамических свойств)
(api as any).getRentalAvailability = rentalAPI.getAvailability;
(api as any).createRentalBooking = rentalAPI.createBooking;
(api as any).getMyRentalBookings = rentalAPI.getMyBookings;
(api as any).getAllRentalBookings = rentalAPI.getAllBookings;
(api as any).updateRentalBookingStatus = rentalAPI.updateBookingStatus;

// Prices API
export interface PricesData {
  subscriptionTypes: Array<{
    id: number;
    name: string;
    category: string;
    price: number;
    lessonCount: number;
  }>;
  halls: Array<{
    id: number;
    name: string;
    pricePerHour: number;
    poleCount: number;
  }>;
  polePricePerHour: number;
}

// Prices API
export const pricesAPI = {
  get: async (): Promise<PricesData> => {
    return api.request<PricesData>('/api/prices');
  },
  
  updateSubscriptionTypePrice: async (id: number, price: number): Promise<{ message: string; price: number }> => {
    return api.request<{ message: string; price: number }>(`/api/prices/subscription-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ price }),
    });
  },
  
  updateHallPrice: async (id: number, pricePerHour: number): Promise<{ message: string; pricePerHour: number }> => {
    return api.request<{ message: string; pricePerHour: number }>(`/api/prices/halls/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ pricePerHour }),
    });
  },
  
  updatePoleRentalPrice: async (pricePerHour: number): Promise<{ message: string; pricePerHour: number }> => {
    return api.request<{ message: string; pricePerHour: number }>('/api/prices/pole-rental', {
      method: 'PUT',
      body: JSON.stringify({ pricePerHour }),
    });
  },
};

// Для обратной совместимости (используем any для динамических свойств)
(api as any).getPrices = pricesAPI.get;
(api as any).updateSubscriptionTypePrice = pricesAPI.updateSubscriptionTypePrice;
(api as any).updateHallPrice = pricesAPI.updateHallPrice;
(api as any).updatePoleRentalPrice = pricesAPI.updatePoleRentalPrice;

// Notifications API
export const notificationsAPI = {
  // Templates
  getTemplates: () => api.get<{ templates: Array<any> }>('/api/notifications/templates'),
  createTemplate: (data: { name: string; type: string; title: string; message: string; variables?: any }) =>
    api.post<{ message: string; template: any }>('/api/notifications/templates', data),
  updateTemplate: (id: number, data: { name?: string; type?: string; title?: string; message?: string; variables?: any; is_active?: number }) =>
    api.put<{ message: string; template: any }>(`/api/notifications/templates/${id}`, data),
  deleteTemplate: (id: number) =>
    api.delete<{ message: string }>(`/api/notifications/templates/${id}`),

  // Notifications
  getNotifications: (params?: { status?: string; type?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.type) query.append('type', params.type);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return api.get<{ notifications: Array<any>; total: number }>(`/api/notifications?${query.toString()}`);
  },
  createNotification: (data: {
    templateId?: number;
    userId?: number;
    title: string;
    message: string;
    type: string;
    targetAudience?: string;
    targetConfig?: any;
    scheduledAt?: string;
  }) => api.post<{ message: string; notificationId?: number; notificationsCreated?: number; sent?: number; failed?: number }>('/api/notifications', data),
  sendNotification: (id: number) =>
    api.post<{ message: string }>(`/api/notifications/${id}/send`, {}),

  // Schedules
  getSchedules: () => api.get<{ schedules: Array<any> }>('/api/notifications/schedules'),
  createSchedule: (data: {
    templateId: number;
    name: string;
    scheduleType: string;
    scheduleConfig?: any;
    targetAudience?: string;
    targetConfig?: any;
  }) => api.post<{ message: string; schedule: any }>('/api/notifications/schedules', data),
  updateSchedule: (id: number, data: {
    name?: string;
    scheduleType?: string;
    scheduleConfig?: any;
    targetAudience?: string;
    targetConfig?: any;
    is_active?: number;
  }) => api.put<{ message: string; schedule: any }>(`/api/notifications/schedules/${id}`, data),
  deleteSchedule: (id: number) =>
    api.delete<{ message: string }>(`/api/notifications/schedules/${id}`),

  // Users
  getUsers: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get<{ users: Array<any> }>(`/api/notifications/users${query}`);
  },
};

export default api;

