-- Adicionar colunas email e whatsapp na tabela calculations
ALTER TABLE calculations
ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS whatsapp TEXT NOT NULL DEFAULT '';

-- Criar índice para email (útil para buscar leads por email)
CREATE INDEX IF NOT EXISTS idx_calculations_email ON calculations(email);

-- Criar índice para whatsapp (útil para buscar leads por WhatsApp)
CREATE INDEX IF NOT EXISTS idx_calculations_whatsapp ON calculations(whatsapp);

-- Comentários nas novas colunas
COMMENT ON COLUMN calculations.email IS 'Email do lead para envio de relatórios e acompanhamento';
COMMENT ON COLUMN calculations.whatsapp IS 'WhatsApp do lead para contato personalizado';
