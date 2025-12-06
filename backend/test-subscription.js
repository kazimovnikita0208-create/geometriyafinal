// Простой тест для создания абонемента
const http = require('http');

const data = JSON.stringify({
  subscriptionTypeId: 1,
  firstName: 'Nikita',
  lastName: 'Test',
  phone: '89397187500',
  address: 'TOC Okhotny Ryad',
  bookingType: 'flexible'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/subscriptions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Тестирование создания абонемента...\n');

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`Статус: ${res.statusCode}`);
    console.log(`Ответ:\n${responseData}\n`);
    
    if (res.statusCode === 200) {
      const result = JSON.parse(responseData);
      console.log('✅ Заявка создана успешно!');
      console.log(`   ID: ${result.subscription.id}`);
      console.log(`   Статус: ${result.subscription.status}`);
      console.log(`   Абонемент: ${result.subscription.subscription_name}`);
      
      // Теперь получим список абонементов
      console.log('\n🔍 Получаем список абонементов...\n');
      
      const getOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/subscriptions/my',
        method: 'GET'
      };
      
      const getReq = http.request(getOptions, (getRes) => {
        let getData = '';
        
        getRes.on('data', (chunk) => {
          getData += chunk;
        });
        
        getRes.on('end', () => {
          const getResult = JSON.parse(getData);
          console.log(`✅ Найдено абонементов: ${getResult.subscriptions.length}`);
          getResult.subscriptions.forEach((sub, index) => {
            console.log(`\n   ${index + 1}. ${sub.subscription_name}`);
            console.log(`      Статус: ${sub.status}`);
            console.log(`      Адрес: ${sub.address}`);
            console.log(`      Занятий осталось: ${sub.lessons_remaining}`);
          });
        });
      });
      
      getReq.on('error', (error) => {
        console.error('❌ Ошибка при получении списка:', error.message);
      });
      
      getReq.end();
    } else {
      console.error('❌ Ошибка создания заявки');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Ошибка:', error.message);
});

req.write(data);
req.end();

