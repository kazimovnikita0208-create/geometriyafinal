// Vercel serverless function entry point
// Этот файл используется Vercel для обработки всех запросов

// Проверяем, что мы на Vercel
if (process.env.VERCEL) {
  console.log('🚀 Запуск на Vercel');
}

// Импортируем Express app
const app = require('../src/index.js');

// Для Vercel нужно экспортировать функцию handler
// Vercel автоматически передаст все HTTP методы, включая OPTIONS
module.exports = (req, res) => {
  // Логируем входящий запрос
  console.log(`📥 Vercel handler: ${req.method} ${req.url} | Origin: ${req.headers.origin || 'none'}`);
  
  // Передаем запрос в Express app
  return app(req, res);
};
