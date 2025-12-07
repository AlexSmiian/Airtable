DROP TABLE IF EXISTS records CASCADE;

CREATE TABLE records (
                         id SERIAL PRIMARY KEY,
                         title TEXT,
                         firstNames TEXT,
                         lastNames TEXT,
                         description TEXT,
                         category JSONB,
                         primary_category TEXT,
                         status TEXT,
                         amount NUMERIC,
                         quantity INT,
                         price NUMERIC,
                         rate NUMERIC,
                         is_active BOOLEAN,
                         created_at TIMESTAMP DEFAULT NOW(),
                         updated_at TIMESTAMP DEFAULT NOW(),
                         tags JSONB,
                         primary_tag TEXT,
                         attributes JSONB,
                         primary_attribute TEXT,
                         level INT,
                         priority INT,
                         code TEXT,
                         group_id INT,
                         meta JSONB,
                         comment TEXT
);

CREATE INDEX idx_records_category ON records(category);
CREATE INDEX idx_records_status ON records(status);
CREATE INDEX idx_records_created_at ON records(created_at);
CREATE INDEX idx_records_group_id ON records(group_id);
CREATE INDEX idx_records_tags ON records USING GIN(tags);
CREATE INDEX idx_records_meta ON records USING GIN(meta);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_records_updated_at
    BEFORE UPDATE ON records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();