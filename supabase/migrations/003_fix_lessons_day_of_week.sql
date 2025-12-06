-- Исправление колонки day_of_week в таблице lessons
-- Разрешаем NULL значения для разовых занятий

ALTER TABLE lessons ALTER COLUMN day_of_week DROP NOT NULL;

