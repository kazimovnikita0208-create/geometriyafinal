/**
 * Скрипт для установки тестового токена
 * Использование: Откройте консоль браузера (F12) и выполните этот код
 */

async function setupTestToken() {
  try {
    console.log('🔧 Настройка тестового токена...');
    
    // Получаем URL backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Создаем тестового пользователя через специальный endpoint
    // Или используем существующего тестового пользователя
    const testInitData = 'user=%7B%22id%22%3A999999999%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22test_user%22%7D&auth_date=' + Math.floor(Date.now() / 1000) + '&hash=test_hash';
    
    try {
      // Пытаемся авторизоваться через тестовые данные
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData: testInitData }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('✅ Тестовый токен установлен!');
          console.log('Пользователь:', data.user);
          return true;
        }
      }
    } catch (error) {
      console.warn('⚠️ Не удалось получить токен через API:', error);
    }
    
    // Если не удалось получить токен через API, используем тестовый токен
    // ВАЖНО: Backend должен поддерживать этот тестовый токен
    const testToken = 'test-token-for-development';
    const testUser = {
      id: 1,
      telegramId: '999999999',
      firstName: 'Тестовый',
      lastName: 'Пользователь',
      username: 'test_user',
      isAdmin: true,
      isActive: true
    };
    
    localStorage.setItem('token', testToken);
    localStorage.setItem('user', JSON.stringify(testUser));
    
    console.log('✅ Тестовый токен установлен (требует поддержки на backend)');
    console.log('Пользователь:', testUser);
    console.log('⚠️ ВНИМАНИЕ: Backend должен поддерживать тестовый токен "test-token-for-development"');
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка установки тестового токена:', error);
    return false;
  }
}

// Автоматически выполняем при загрузке скрипта
if (typeof window !== 'undefined') {
  // Экспортируем функцию для ручного вызова
  window.setupTestToken = setupTestToken;
  console.log('📝 Для установки тестового токена выполните: setupTestToken()');
}

