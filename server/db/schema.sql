-- Schema do banco de dados PostgreSQL para o Gerenciador de Cartão

-- Tabela de configuração do cartão
CREATE TABLE IF NOT EXISTS configuracao (
    id SERIAL PRIMARY KEY,
    limite_total DECIMAL(10, 2) NOT NULL DEFAULT 20000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de devedores
CREATE TABLE IF NOT EXISTS devedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de compras
CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devedor_id UUID NOT NULL REFERENCES devedores(id) ON DELETE CASCADE,
    descricao VARCHAR(500) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    num_parcelas INTEGER NOT NULL CHECK (num_parcelas > 0),
    data_compra DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de parcelas
CREATE TABLE IF NOT EXISTS parcelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_compras_devedor ON compras(devedor_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_compra ON parcelas(compra_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_pago ON parcelas(pago);

-- Inserir configuração inicial
INSERT INTO configuracao (limite_total) VALUES (20000.00) ON CONFLICT DO NOTHING;

-- View para calcular limite usado
CREATE OR REPLACE VIEW limite_usado AS
SELECT 
    COALESCE(SUM(p.valor), 0) AS valor_usado
FROM parcelas p
INNER JOIN compras c ON p.compra_id = c.id
WHERE p.pago = FALSE;

-- View para resumo por devedor
CREATE OR REPLACE VIEW resumo_devedores AS
SELECT 
    d.id,
    d.nome,
    d.telefone,
    COALESCE(SUM(CASE WHEN p.pago = FALSE THEN p.valor ELSE 0 END), 0) AS total_devido,
    COUNT(DISTINCT c.id) AS total_compras,
    COUNT(CASE WHEN p.pago = FALSE THEN 1 END) AS parcelas_pendentes
FROM devedores d
LEFT JOIN compras c ON c.devedor_id = d.id
LEFT JOIN parcelas p ON p.compra_id = c.id
GROUP BY d.id, d.nome, d.telefone;

-- Tabela de ajustes de parcelas (exclusão ou edição de valores/datas específicas)
CREATE TABLE IF NOT EXISTS purchase_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    parcela_index INTEGER NOT NULL, -- 1-based index da parcela original
    is_deleted BOOLEAN DEFAULT FALSE,
    custom_value DECIMAL(10, 2), -- Se não for nulo, sobrepõe o valor original
    custom_date DATE, -- Se não for nulo, sobrepõe a data original
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_adjustments_purchase ON purchase_adjustments(purchase_id);

