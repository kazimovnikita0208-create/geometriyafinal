-- Удаление дубликатов из таблицы halls
-- Оставляем только уникальные залы по комбинации name + address

-- Сначала проверяем дубликаты
SELECT 
  name, 
  address, 
  COUNT(*) as count
FROM halls
GROUP BY name, address
HAVING COUNT(*) > 1;

-- Удаляем дубликаты, оставляя только запись с минимальным id
DELETE FROM halls
WHERE id NOT IN (
  SELECT MIN(id)
  FROM halls
  GROUP BY name, address
);

-- Проверяем результат
SELECT COUNT(*) as total_halls FROM halls;

