# 🚀 Guia Rápido - Configuração Supabase

## ✅ Passo a Passo

### 1. Execute o SQL no Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Abra seu projeto
3. Clique em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Abra o arquivo `supabase/setup.sql` deste projeto
6. **Copie TODO o conteúdo** do arquivo
7. Cole no SQL Editor do Supabase
8. Clique em **Run** ▶️

### 2. Configure as variáveis de ambiente localmente

Crie um arquivo `.env` na raiz do projeto:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Onde encontrar as credenciais

No Supabase Dashboard:
1. Vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 4. Configure no Vercel (você já fez isso! ✓)

Você já adicionou as variáveis no Vercel. Certifique-se que os nomes são:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 5. Teste localmente

```bash
npm run dev
```

Faça um cálculo na aplicação e verifique se os dados aparecem no Supabase:
1. No Supabase, vá em **Table Editor**
2. Clique na tabela **calculations**
3. Você deve ver o registro que acabou de criar!

## 📊 Estrutura das Tabelas

### `calculations` - Armazena todas as simulações
- `id` - UUID único
- `name` - Nome da pessoa
- `age` - Idade
- `current_investment` - Investimento atual (R$)
- `monthly_investment` - Investimento mensal (R$)
- `profile` - Perfil: "conservative" ou "aggressive"
- `years_real` - Anos para atingir 1 milhão (cenário real)
- `years_optimized` - Anos para atingir 1 milhão (otimizado)
- `scenario` - "iniciante" ou "investidor"
- `created_at` - Data/hora da simulação

### `users` - (Opcional) Para gerenciar usuários
- `id` - UUID único
- `name` - Nome
- `email` - Email (único)
- `created_at` / `updated_at` - Timestamps

## 🔒 Segurança

As tabelas têm **Row Level Security (RLS)** habilitado com políticas que permitem:
- ✅ Qualquer pessoa pode criar cálculos (ideal para landing page)
- ✅ Qualquer pessoa pode ler cálculos

**Para produção**, você pode querer ajustar essas políticas no Supabase.

## 📈 Próximos passos

Após configurar:

1. ✅ Teste localmente
2. ✅ Faça deploy no Vercel (já deve funcionar com as variáveis que você configurou)
3. 📊 Veja os dados no Supabase Table Editor
4. 📧 Configure notificações (opcional)

## 🆘 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Certifique-se que o arquivo `.env` existe e está na raiz do projeto
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### Dados não aparecem no Supabase
- Verifique o console do navegador para erros
- Confirme que executou o SQL corretamente
- Verifique se as variáveis de ambiente estão corretas

### No Vercel não funciona
- Vá em **Settings** > **Environment Variables**
- Confirme que as variáveis estão lá
- Faça um novo deploy após adicionar as variáveis

## 📞 Suporte

- Documentação Supabase: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
