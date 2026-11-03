# Entre Páginas

Estante de leitura compartilhada feita com Next.js App Router, TypeScript, Supabase e Vercel. O catálogo de livros fica no Supabase; cada conta registra o próprio progresso. As capas existentes em `public/covers` continuam funcionando, e os novos cadastros podem enviar imagens para o Supabase Storage.

## Rodar localmente

1. Instale Node.js LTS.
2. Na raiz do projeto, rode `npm install`.
3. Copie `.env.example` para `.env.local` e preencha a URL e a chave pública do Supabase.
4. Rode `npm run dev` e abra `http://localhost:3000`.

## Configurar o banco Supabase

Se o banco ainda está vazio, abra **SQL Editor → New query**, execute [`supabase/schema.sql`](./supabase/schema.sql) e pronto: o catálogo começa com Alchemised (960 páginas) e Caminho dos Reis (1.240 páginas).

Se você já executou o schema antigo, rode em vez disso [`supabase/upgrade_old_books_schema.sql`](./supabase/upgrade_old_books_schema.sql). Ele preserva os registros antigos em `books_legacy_20261103`, cria o catálogo novo e mantém eventuais progressos que já existirem.

Para bancos configurados antes das preferências de cor, execute também [`supabase/reader_preferences.sql`](./supabase/reader_preferences.sql) no SQL Editor. Ele cria as preferências RGB dos leitores, prepara as contas existentes e aplica RLS para cada pessoa só alterar a própria cor.

Para habilitar a coleção individual, execute [`supabase/personal_books.sql`](./supabase/personal_books.sql) no SQL Editor depois do schema do catálogo. A tabela usa RLS por `user_id`; cada conta consegue listar, cadastrar, atualizar e apagar apenas os próprios livros. Se o bucket `book-covers` já está configurado, o script também atualiza a política para permitir que cada pessoa remova capas sem uso da própria coleção. A opção **Minha coleção** aparece no menu de usuários autenticados e há também um atalho no fim da página inicial.

Depois da migração, cada pessoa pode escolher a cor da própria barra junto ao campo de nome no painel **Seu perfil no clube**. A cor é salva como `rgb(r, g, b)` no banco e aparece para todas as pessoas da estante.

Depois, em **Project Settings → API → Exposed schemas** (o nome pode aparecer em **Integrations → Data API**), confira se `public` está exposto à Data API. Projetos recentes podem exigir essa ativação explícita. O SQL já concede às contas autenticadas as permissões necessárias e liga políticas RLS nas duas tabelas.

### Ativar a administração

Para habilitar o painel administrativo em um banco que já está em uso:

1. No Supabase, abra **SQL Editor → New query**.
2. Copie o conteúdo de [`supabase/admin_access.sql`](./supabase/admin_access.sql) e execute.
3. Entre novamente no site com `rafaelmgreco@hotmail.com`.

O script cria e preenche `public.profiles` a partir das contas existentes no Supabase Auth, e mantém os perfis sincronizados para novos cadastros. O painel permite consultar as contas, corrigir o total de páginas e remover livros. Ao remover, os progressos daquele livro também são apagados. Ao reduzir o total de páginas, os progressos acima do novo limite são ajustados.

O administrador é definido pelo e-mail autenticado `rafaelmgreco@hotmail.com`, validado tanto nas ações do servidor quanto nas políticas RLS do banco. Não é usado o nome ou metadado editável do perfil para conceder acesso. O arquivo de migração deve ser executado uma vez no projeto Supabase.

## Capas dos livros

As capas atuais que já estão em `public/covers` continuam sendo servidas junto com o projeto. Para livros cadastrados pelo site, a pessoa envia a imagem no próprio formulário, sem editar o repositório ou fazer deploy.

### Configurar envio pelo Supabase Storage

O formulário de cadastro também aceita capas enviadas por qualquer conta autenticada. Para habilitar:

1. No Supabase, abra **Storage → New bucket** e crie o bucket `book-covers` como **Public**.
2. Nas restrições do bucket, permita somente `image/jpeg`, `image/png` e `image/webp`, com limite de **2 MB** por arquivo.
3. Abra **SQL Editor → New query**, execute [`supabase/book_covers_storage.sql`](./supabase/book_covers_storage.sql).

O app valida os bytes do arquivo no servidor e só aceita JPG/JPEG, PNG e WebP até 2 MB. O Server Action recebe até 3 MB para acomodar a imagem e os dados do formulário. A capa é enviada com nome aleatório ao Storage e seu caminho fica no cadastro do livro. Ao remover um livro pelo painel admin, o app também remove a capa do bucket. O bucket é público para leitura das imagens; o envio exige login e a exclusão é restrita ao admin. No plano Free, o Storage tem 1 GB de espaço e 5 GB de egress, compartilhados pela organização; acompanhe o consumo em **Project → Usage**.

## Publicar na Vercel

1. Importe o repositório GitHub na Vercel.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em **Settings → Environment Variables**.
3. Faça o deploy. Em Supabase **Authentication → URL Configuration**, configure o domínio da Vercel como Site URL e inclua-o nas Redirect URLs.

Não é necessário criar VM, EC2 ou servidor AWS. A Vercel hospeda o Next.js e o Supabase mantém o banco, ambos com opções gratuitas sujeitas às cotas e regras atuais dos respectivos planos.

## Arquitetura

- `src/controllers`: Server Actions.
- `src/services`: validação, geração de nome de capa e regras de páginas.
- `src/repositories`: acesso às tabelas `books` e `reading_progress`.
- `src/controllers`, `src/services` e `src/repositories`: ações e acesso da administração.
- `src/lib/supabase`: cliente server-side com cookies para Auth.
- `src/middleware.ts`: atualiza a sessão Supabase no Next.js 15.
- `supabase/schema.sql`: instalação limpa do banco.
- `supabase/upgrade_old_books_schema.sql`: script manual para atualizar o schema antigo pelo SQL Editor.
- `supabase/admin_access.sql`: perfis sincronizados com Auth e permissões administrativas para banco existente.
- `supabase/book_covers_storage.sql`: políticas RLS do bucket público de capas.
- `supabase/reader_preferences.sql`: preferência RGB por pessoa, com RLS individual.
- `supabase/personal_books.sql`: coleção privada de livros com RLS por usuário.

Pessoas autenticadas compartilham o catálogo e conseguem comparar o progresso de todos. Cada conta só cria e atualiza seu próprio progresso, protegido por RLS.

Cada usuário escolhe um nome de exibição no cadastro ou no painel **Seu perfil no clube**. Alterá-lo atualiza o nome mostrado nas leituras anteriores. O nome é apenas para exibição; permissões continuam baseadas no ID autenticado da conta.

## Sessão de login

O login fica salvo em cookies usados pelo SSR do Next.js, com validade de 7 dias de inatividade. O middleware renova a sessão durante o uso; clicar em **Sair** remove os cookies. O JWT continua curto e é renovado pelo Supabase. Um limite absoluto de sessão de 7 dias configurado no servidor Supabase só está disponível nos planos pagos; no Free, o prazo de 7 dias deste app é por inatividade.
