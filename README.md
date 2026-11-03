# Entre Páginas

Estante de leitura compartilhada feita com Next.js App Router, TypeScript, Supabase e Vercel. O catálogo de livros fica no Supabase; cada conta registra o próprio progresso. As capas são arquivos estáticos no repositório em `public/covers`, sem Storage ou S3.

## Rodar localmente

1. Instale Node.js LTS.
2. Na raiz do projeto, rode `npm install`.
3. Copie `.env.example` para `.env.local` e preencha a URL e a chave pública do Supabase.
4. Rode `npm run dev` e abra `http://localhost:3000`.

## Configurar o banco Supabase

Se o banco ainda está vazio, abra **SQL Editor → New query**, execute [`supabase/schema.sql`](./supabase/schema.sql) e pronto: o catálogo começa com Alchemised (960 páginas) e Caminho dos Reis (1.240 páginas).

Se você já executou o schema antigo, rode em vez disso [`supabase/upgrade_old_books_schema.sql`](./supabase/upgrade_old_books_schema.sql). Ele preserva os registros antigos em `books_legacy_20261103`, cria o catálogo novo e mantém eventuais progressos que já existirem.

Depois, em **Project Settings → API → Exposed schemas** (o nome pode aparecer em **Integrations → Data API**), confira se `public` está exposto à Data API. Projetos recentes podem exigir essa ativação explícita. O SQL já concede às contas autenticadas as permissões necessárias e liga políticas RLS nas duas tabelas.

## Capas manuais

Ao cadastrar um livro, o site cria o caminho a partir do título: letras minúsculas, sem acentos e espaços trocados por hífens. Salve o arquivo `.jpg` com esse nome dentro de `public/covers` e inclua-o no commit.

Exemplos:

- Alchemised → `public/covers/alchemised.jpg`
- Caminho dos Reis → `public/covers/caminho-dos-reis.jpg`
- O conto da aia → `public/covers/o-conto-da-aia.jpg`

Enquanto a imagem não estiver na pasta, a estante mostra uma capa provisória com o título. Não envie imagens para o banco, Supabase Storage ou S3.

## Publicar na Vercel

1. Importe o repositório GitHub na Vercel.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em **Settings → Environment Variables**.
3. Faça o deploy. Em Supabase **Authentication → URL Configuration**, configure o domínio da Vercel como Site URL e inclua-o nas Redirect URLs.

Não é necessário criar VM, EC2 ou servidor AWS. A Vercel hospeda o Next.js e o Supabase mantém o banco, ambos com opções gratuitas sujeitas às cotas e regras atuais dos respectivos planos.

## Arquitetura

- `src/controllers`: Server Actions.
- `src/services`: validação, geração de nome de capa e regras de páginas.
- `src/repositories`: acesso às tabelas `books` e `reading_progress`.
- `src/lib/supabase`: cliente server-side com cookies para Auth.
- `src/middleware.ts`: atualiza a sessão Supabase no Next.js 15.
- `supabase/schema.sql`: instalação limpa do banco.
- `supabase/upgrade_old_books_schema.sql`: script manual para atualizar o schema antigo pelo SQL Editor.

Pessoas autenticadas compartilham o catálogo e conseguem comparar o progresso de todos. Cada conta só cria e atualiza seu próprio progresso, protegido por RLS.

## Sessão de login

O login fica salvo em cookies usados pelo SSR do Next.js, com validade de 7 dias de inatividade. O middleware renova a sessão durante o uso; clicar em **Sair** remove os cookies. O JWT continua curto e é renovado pelo Supabase. Um limite absoluto de sessão de 7 dias configurado no servidor Supabase só está disponível nos planos pagos; no Free, o prazo de 7 dias deste app é por inatividade.
