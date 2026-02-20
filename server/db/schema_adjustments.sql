-- Tabela de ajustes de parcelas (exclusão ou edição de valores/datas específicas)
CREATE TABLE IF NOT EXISTS purchase_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES imports(id) ON DELETE CASCADE, -- Note: 'imports' seems to be 'compras' or 'purchases'. Checking schema.sql... It is 'compras' in schema but 'purchases' in context? 
    -- Schema.sql says 'compras'. Context says 'purchases'. Let's check schema.sql again.
    -- schema.sql content: CREATE TABLE IF NOT EXISTS compras ...
    -- So key should be REFERENCES compras(id)
    purchase_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    parcela_index INTEGER NOT NULL, -- 1-based index da parcela original
    is_deleted BOOLEAN DEFAULT FALSE,
    custom_value DECIMAL(10, 2), -- Se não for nulo, sobrepõe o valor original
    custom_date DATE, -- Se não for nulo, sobrepõe a data original
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_adjustments_purchase ON purchase_adjustments(purchase_id);
