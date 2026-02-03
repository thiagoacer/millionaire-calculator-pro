-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (opcional, para gerenciar usuários se necessário)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create calculations table (armazena todas as simulações)
CREATE TABLE IF NOT EXISTS calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  current_investment NUMERIC(15, 2) NOT NULL CHECK (current_investment >= 0),
  monthly_investment NUMERIC(15, 2) NOT NULL CHECK (monthly_investment >= 0),
  profile TEXT NOT NULL CHECK (profile IN ('conservative', 'aggressive')),
  years_real NUMERIC(10, 2) NOT NULL,
  years_optimized NUMERIC(10, 2) NOT NULL,
  scenario TEXT NOT NULL CHECK (scenario IN ('iniciante', 'investidor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculations_profile ON calculations(profile);
CREATE INDEX IF NOT EXISTS idx_calculations_email ON calculations(email);
CREATE INDEX IF NOT EXISTS idx_calculations_whatsapp ON calculations(whatsapp);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (ajuste conforme necessário)
-- Para permitir que qualquer pessoa insira cálculos (ideal para landing page)
CREATE POLICY "Anyone can insert calculations" ON calculations
  FOR INSERT WITH CHECK (true);

-- Para permitir leitura pública dos cálculos (opcional)
CREATE POLICY "Anyone can read calculations" ON calculations
  FOR SELECT USING (true);

-- Para usuários (se você quiser permitir criação pública)
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read users" ON users
  FOR SELECT USING (true);

-- Comentários nas tabelas
COMMENT ON TABLE users IS 'Tabela de usuários da aplicação';
COMMENT ON TABLE calculations IS 'Tabela de cálculos/simulações realizadas pelos usuários';

COMMENT ON COLUMN calculations.email IS 'Email do lead para envio de relatórios e acompanhamento';
COMMENT ON COLUMN calculations.whatsapp IS 'WhatsApp do lead para contato personalizado';
COMMENT ON COLUMN calculations.current_investment IS 'Valor atual investido em reais';
COMMENT ON COLUMN calculations.monthly_investment IS 'Valor de investimento mensal em reais';
COMMENT ON COLUMN calculations.profile IS 'Perfil do investidor: conservative ou aggressive';
COMMENT ON COLUMN calculations.years_real IS 'Anos para atingir 1 milhão no cenário real';
COMMENT ON COLUMN calculations.years_optimized IS 'Anos para atingir 1 milhão no cenário otimizado';
COMMENT ON COLUMN calculations.scenario IS 'Cenário do investidor: iniciante ou investidor';
