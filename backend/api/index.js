// Vercel serverless function entry point
// Этот файл используется Vercel для обработки всех запросов

// Проверяем, что мы на Vercel
if (process.env.VERCEL) {
  console.log('🚀 Запуск на Vercel');
}

// Импортируем Express app
const app = require('../src/index.js');

// Экспортируем для Vercel
// Vercel автоматически обработает все HTTP методы, включая OPTIONS
module.exports = app;
