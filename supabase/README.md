# Configuração do Supabase

## 1. Criar conta no Supabase

Acesse [https://supabase.com](https://supabase.com) e crie uma conta gratuita.

## 2. Criar novo projeto

1. No dashboard do Supabase, clique em "New Project"
2. Escolha um nome para o projeto (ex: "millionaire-calculator")
3. Escolha uma senha segura para o banco de dados
4. Selecione a região mais próxima (ex: South America - São Paulo)

## 3. Executar migrations

### Opção 1: Via SQL Editor (Recomendado)

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole todo o conteúdo do arquivo `migrations/001_create_tables.sql`
4. Clique em **Run** para executar

### Opção 2: Via Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar ao projeto
supabase link --project-ref <seu-project-ref>

# Executar migrations
supabase db push
```

## 4. Obter credenciais

1. No dashboard do Supabase, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon/public key** (VITE_SUPABASE_ANON_KEY)

## 5. Configurar variáveis de ambiente

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as credenciais:

```env
VITE_SUPABASE_URL=https://seu-project.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

## 6. Estrutura das tabelas

### Tabela: `users`
- **id**: UUID (Primary Key)
- **name**: Texto (nome do usuário)
- **email**: Texto único (opcional)
- **created_at**: Timestamp
- **updated_at**: Timestamp

### Tabela: `calculations`
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key para users, opcional)
- **name**: Texto (nome da pessoa)
- **age**: Inteiro (idade)
- **current_investment**: Numérico (investimento atual em R$)
- **monthly_investment**: Numérico (investimento mensal em R$)
- **profile**: Texto ('conservative' ou 'aggressive')
- **years_real**: Numérico (anos no cenário real)
- **years_optimized**: Numérico (anos no cenário otimizado)
- **scenario**: Texto ('iniciante' ou 'investidor')
- **created_at**: Timestamp

## 7. Políticas de segurança (RLS)

As tabelas têm Row Level Security habilitado com políticas públicas que permitem:
- Inserção de novos cálculos por qualquer pessoa
- Leitura de cálculos por qualquer pessoa

**Importante**: Para produção, você pode querer ajustar essas políticas para restringir o acesso.

## 8. Verificar instalação

Após executar as migrations, você pode verificar se tudo está correto:

1. Vá em **Table Editor** no Supabase
2. Você deve ver as tabelas `users` e `calculations`
3. Teste inserindo um registro manualmente

## 9. Próximos passos

Após configurar o Supabase:

1. Configure as variáveis de ambiente no Vercel (se estiver usando)
2. Teste localmente com `npm run dev`
3. Verifique se os dados estão sendo salvos corretamente no Supabase

## Dicas

- Use o **SQL Editor** do Supabase para fazer queries e análises
- Configure **Database Webhooks** se quiser notificações de novos cálculos
- Use **Realtime** se quiser atualizações em tempo real
- Configure **Storage** se precisar armazenar arquivos no futuro
