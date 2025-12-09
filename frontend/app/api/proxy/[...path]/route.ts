import { NextRequest, NextResponse } from 'next/server';

/**
 * API Proxy Route
 * Проксирует все запросы к backend, обходя CORS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PATCH');
}

export async function OPTIONS() {
  // Обработка preflight запросов
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // Получаем URL backend из переменных окружения
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Убираем завершающий слэш из backendUrl
    backendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    
    // Собираем путь к API endpoint
    const path = params.path ? `/${params.path.join('/')}` : '';
    const url = `${backendUrl}${path}`;
    
    // Логируем для отладки
    console.log(`🔵 Proxy: ${method} ${path} → ${url}`);
    console.log(`📋 Proxy: Backend URL: ${backendUrl}`);
    
    // Получаем query параметры из оригинального запроса
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;
    
    // Получаем тело запроса (если есть)
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch {
        // Тело может быть пустым
      }
    }
    
    // Получаем заголовки из оригинального запроса
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Передаем Authorization заголовок если он есть
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`🔑 Proxy: Authorization header found: ${authHeader.substring(0, 30)}...`);
    } else {
      console.log(`⚠️ Proxy: No Authorization header found`);
      console.log(`📋 Proxy: All request headers:`, Object.fromEntries(request.headers.entries()));
    }
    
    // Также проверяем cookie (на случай, если токен там)
    const cookies = request.headers.get('cookie');
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    // Делаем запрос к backend
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body || undefined,
    });
    
    // Получаем данные из ответа
    let data: any;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    
    // Логируем ответ для отладки
    if (!response.ok) {
      console.log(`❌ Proxy error: ${response.status} ${response.statusText}`, data);
    }
    
    // Возвращаем ответ с правильными заголовками
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

