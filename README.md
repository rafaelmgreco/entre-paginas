# Entre Páginas

Estante de leitura compartilhada feita com Next.js App Router, TypeScript, Supabase e Vercel. Usuários criam conta, registram livros com nome de quem está lendo e atualizam páginas. A estante é compartilhada entre todas as contas deste projeto.

## Rodar localmente

1. Instale Node.js LTS.
2. No terminal, rode `npm install`.
3. Copie `.env.example` para `.env.local` e preencha as duas variáveis do Supabase.
4. Rode `npm run dev` e abra `http://localhost:3000`.

## Supabase passo a passo (plano Free)

1. Acesse [supabase.com](https://supabase.com), crie uma conta e selecione **New project**.
2. Crie uma organização no plano **Free**, escolha uma senha forte para o banco, dê ao projeto o nome `entre-paginas` e escolha uma região próxima de você. Guarde a senha do banco em um gerenciador; o app não precisa dela.
3. Quando o projeto estiver pronto, abra **SQL Editor → New query**, copie todo o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run**. Isso cria a tabela compartilhada e ativa RLS.
4. Abra **Project Settings → API** (ou **Connect**, conforme a tela atual). Copie a **Project URL** e a chave pública **Publishable** (em projetos antigos, a chave `anon`). Nunca use `service_role` no navegador nem em `NEXT_PUBLIC_*`.
5. No projeto local, copie `.env.example` como `.env.local` e preencha:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publishable
   ```

6. Em **Authentication → URL Configuration**, configure `http://localhost:3000` como Site URL. Depois do deploy, inclua também o domínio da Vercel em **Redirect URLs**. Confirme o e-mail ao criar a primeira conta.
7. Inicie localmente com `npm install` e `npm run dev`.

## Publicar na Vercel sem AWS

1. Suba este diretório para um repositório GitHub seu (não envie `.env.local`).
2. Em [vercel.com](https://vercel.com), importe o repositório. A Vercel detecta Next.js automaticamente.
3. Antes do deploy, adicione em **Settings → Environment Variables** as mesmas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Selecione Production, Preview e Development conforme desejar.
4. Faça o deploy. Copie o domínio `*.vercel.app` atribuído e adicione-o ao Supabase em **Authentication → URL Configuration → Redirect URLs**; atualize também o Site URL para o domínio de produção.

Não é necessário criar VM, EC2, servidor ou conta AWS: Next.js roda na infraestrutura gerenciada da Vercel e os dados ficam no Supabase. Os dois têm opções gratuitas, sujeitas a cotas e mudanças de plano. No Free, o Supabase informa limite de 500 MB por banco e pode pausar projetos com pouca atividade após uma semana; dados e configurações continuam no projeto pausado, que precisa ser reativado. Consulte [limites e preços](https://supabase.com/pricing) antes de colocar o site em uso contínuo.

## Arquitetura

- `src/controllers`: Server Actions e revalidação de páginas.
- `src/services`: validação de entradas e regras de progresso.
- `src/repositories`: acesso à tabela Supabase.
- `src/lib/supabase`: cliente server-side com cookies para Auth.

Todos os membros autenticados veem a estante compartilhada. Contas podem adicionar livros e atualizar qualquer progresso do grupo; quem criou um registro pode removê-lo diretamente pelo banco. Para um clube privado, adicione convites/membros e uma política RLS com `club_id` antes de compartilhar o endereço publicamente.
