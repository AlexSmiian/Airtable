-- infrastructure/db/init.sql

-- Видаляємо таблицю якщо існує
DROP TABLE IF EXISTS records CASCADE;

-- Одна таблиця з усіма даними
CREATE TABLE records (
                         id SERIAL PRIMARY KEY,
                         title TEXT,
                         description TEXT,
                         category TEXT,
                         status TEXT,
                         amount NUMERIC,
                         quantity INT,
                         price NUMERIC,
                         rate NUMERIC,
                         is_active BOOLEAN,
                         created_at TIMESTAMP DEFAULT NOW(),
                         updated_at TIMESTAMP DEFAULT NOW(),
                         tags JSONB,
                         attributes JSONB,
                         level INT,
                         priority INT,
                         code TEXT,
                         group_id INT,
                         meta JSONB,
                         comment TEXT
);

-- Індекси для швидкого пошуку
CREATE INDEX idx_records_category ON records(category);
CREATE INDEX idx_records_status ON records(status);
CREATE INDEX idx_records_created_at ON records(created_at);
CREATE INDEX idx_records_group_id ON records(group_id);
CREATE INDEX idx_records_tags ON records USING GIN(tags);
CREATE INDEX idx_records_meta ON records USING GIN(meta);

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригер для updated_at
CREATE TRIGGER update_records_updated_at
    BEFORE UPDATE ON records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();