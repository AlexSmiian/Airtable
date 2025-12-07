DROP TABLE IF EXISTS records CASCADE;

CREATE TABLE records (
                         id SERIAL PRIMARY KEY,
                         title TEXT,
                         first_names TEXT,
                         last_names TEXT,
                         description TEXT,
                         category JSONB,
                         primary_category TEXT,
                         status JSONB,
                         primary_status TEXT,
                         amount NUMERIC,
                         quantity INT,
                         price NUMERIC,
                         rate NUMERIC,
                         is_active JSONB,
                         primary_is_active TEXT,
                         created_at TIMESTAMP DEFAULT NOW(),
                         updated_at TIMESTAMP DEFAULT NOW(),
                         tags JSONB,
                         primary_tag TEXT,
                         attributes JSONB,
                         primary_attribute TEXT,
                         level JSONB,
                         primary_level TEXT,
                         priority JSONB,
                         primary_priority TEXT,
                         code TEXT,
                         group_id INT,
                         meta JSONB,
                         primary_meta TEXT,
                         comment TEXT
);

CREATE INDEX idx_records_created_at ON records(created_at);
CREATE INDEX idx_records_group_id ON records(group_id);

CREATE INDEX idx_records_category_gin ON records USING GIN(category);
CREATE INDEX idx_records_status_gin ON records USING GIN(status);
CREATE INDEX idx_records_tags_gin ON records USING GIN(tags);
CREATE INDEX idx_records_attributes_gin ON records USING GIN(attributes);
CREATE INDEX idx_records_level_gin ON records USING GIN(level);
CREATE INDEX idx_records_priority_gin ON records USING GIN(priority);
CREATE INDEX idx_records_meta_gin ON records USING GIN(meta);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_records_updated_at
    BEFORE UPDATE ON records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
