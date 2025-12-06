/**
 * Конфигурация Supabase для backend
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️  Supabase не настроен. Используйте SQLite для локальной разработки.');
  console.warn('   Для работы на Vercel необходимо настроить:');
  console.warn('   - SUPABASE_URL');
  console.warn('   - SUPABASE_SERVICE_ROLE_KEY');
}

let supabaseClient = null;

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Подключение к Supabase успешно');
  }

  return supabaseClient;
}

// Проверка, используется ли Supabase
function isSupabaseEnabled() {
  return !!(SUPABASE_URL && SUPABASE_KEY);
}

module.exports = {
  getSupabaseClient,
  isSupabaseEnabled,
  SUPABASE_URL,
  SUPABASE_KEY
};

