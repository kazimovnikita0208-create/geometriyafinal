/**
 * Сервис для проверки правил записи и отмены занятий
 */

const telegramConfig = require('../config/telegram');

/**
 * Проверить, можно ли отменить запись на занятие
 * 
 * ПРАВИЛА:
 * 1. Вечерние занятия (после 15:00) - отмена за 4 часа
 * 2. Дневные занятия (10:00-15:00) - отмена до 21:00 предыдущего дня
 * 
 * @param {Date|string} lessonStartTime - Время начала занятия
 * @returns {object} { canCancel: boolean, reason: string }
 */
function canCancelBooking(lessonStartTime) {
  const now = new Date();
  const lessonStart = new Date(lessonStartTime);
  
  // Проверка: занятие уже прошло
  if (lessonStart <= now) {
    return {
      canCancel: false,
      reason: 'Занятие уже началось или прошло'
    };
  }
  
  const lessonHour = lessonStart.getHours();
  const { 
    eveningHoursBefore, 
    morningDeadlineHour, 
    morningClassesStart, 
    morningClassesEnd 
  } = telegramConfig.cancellationRules;
  
  // ПРАВИЛО 1: Вечерние занятия (после 15:00)
  if (lessonHour >= morningClassesEnd) {
    const hoursUntilLesson = (lessonStart - now) / (1000 * 60 * 60);
    
    if (hoursUntilLesson >= eveningHoursBefore) {
      return {
        canCancel: true,
        reason: null
      };
    } else {
      const cancelDeadline = new Date(lessonStart);
      cancelDeadline.setHours(cancelDeadline.getHours() - eveningHoursBefore);
      
      return {
        canCancel: false,
        reason: `Вечерние занятия можно отменить не позднее чем за ${eveningHoursBefore} часа до начала (до ${formatTime(cancelDeadline)})`
      };
    }
  }
  
  // ПРАВИЛО 2: Дневные занятия (10:00-15:00)
  if (lessonHour >= morningClassesStart && lessonHour < morningClassesEnd) {
    // Дедлайн - 21:00 предыдущего дня
    const deadline = new Date(lessonStart);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(morningDeadlineHour, 0, 0, 0);
    
    if (now <= deadline) {
      return {
        canCancel: true,
        reason: null
      };
    } else {
      return {
        canCancel: false,
        reason: `Дневные занятия можно отменить только до ${morningDeadlineHour}:00 предыдущего дня (до ${formatDateTime(deadline)})`
      };
    }
  }
  
  // Занятия в промежутке до 10:00 (если есть)
  // Применяем правило как для дневных
  const deadline = new Date(lessonStart);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(morningDeadlineHour, 0, 0, 0);
  
  if (now <= deadline) {
    return {
      canCancel: true,
      reason: null
    };
  } else {
    return {
      canCancel: false,
      reason: `Занятия до ${morningClassesStart}:00 можно отменить только до ${morningDeadlineHour}:00 предыдущего дня`
    };
  }
}

/**
 * Получить информацию о дедлайне отмены
 * @param {Date|string} lessonStartTime 
 * @returns {Date} - Дедлайн отмены
 */
function getCancelDeadline(lessonStartTime) {
  const lessonStart = new Date(lessonStartTime);
  const lessonHour = lessonStart.getHours();
  
  const { 
    eveningHoursBefore, 
    morningDeadlineHour, 
    morningClassesStart, 
    morningClassesEnd 
  } = telegramConfig.cancellationRules;
  
  // Вечерние занятия
  if (lessonHour >= morningClassesEnd) {
    const deadline = new Date(lessonStart);
    deadline.setHours(deadline.getHours() - eveningHoursBefore);
    return deadline;
  }
  
  // Дневные и утренние занятия
  const deadline = new Date(lessonStart);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(morningDeadlineHour, 0, 0, 0);
  return deadline;
}

/**
 * Проверить, можно ли записаться на занятие
 * @param {object} lesson - Объект занятия
 * @param {number} currentBookingsCount - Текущее количество записей
 * @returns {object} { canBook: boolean, reason: string }
 */
function canBookLesson(lesson, currentBookingsCount) {
  const now = new Date();
  const lessonStart = new Date(lesson.start_time);
  
  // Проверка: занятие уже началось
  if (lessonStart <= now) {
    return {
      canBook: false,
      reason: 'Занятие уже началось'
    };
  }
  
  // Проверка: есть свободные места
  if (currentBookingsCount >= lesson.capacity) {
    return {
      canBook: false,
      reason: 'Нет свободных мест'
    };
  }
  
  // Проверка: занятие активно
  if (!lesson.is_active) {
    return {
      canBook: false,
      reason: 'Занятие отменено'
    };
  }
  
  return {
    canBook: true,
    reason: null
  };
}

/**
 * Форматировать время
 * @param {Date} date 
 * @returns {string}
 */
function formatTime(date) {
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Форматировать дату и время
 * @param {Date} date 
 * @returns {string}
 */
function formatDateTime(date) {
  return date.toLocaleString('ru-RU', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Проверить, активен ли абонемент
 * @param {object} subscription 
 * @returns {object}
 */
function isSubscriptionValid(subscription) {
  const now = new Date();
  const validUntil = new Date(subscription.valid_until);
  
  // Проверка срока действия
  if (validUntil < now) {
    return {
      isValid: false,
      reason: 'Абонемент истёк'
    };
  }
  
  // Проверка остатка занятий
  if (subscription.lessons_remaining <= 0) {
    return {
      isValid: false,
      reason: 'Занятия на абонементе закончились'
    };
  }
  
  // Проверка активности
  if (!subscription.is_active) {
    return {
      isValid: false,
      reason: 'Абонемент неактивен'
    };
  }
  
  return {
    isValid: true,
    reason: null
  };
}

module.exports = {
  canCancelBooking,
  getCancelDeadline,
  canBookLesson,
  isSubscriptionValid,
  formatTime,
  formatDateTime
};

