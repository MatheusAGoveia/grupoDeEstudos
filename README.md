# Tripulação

Uma plataforma para conhecer pessoas interessadas em aprender e construir produtos reais em grupo — sem transformar a experiência em um processo seletivo corporativo.

## O que já funciona

- jornada interativa de criação do perfil em cinco etapas;
- conta pessoal para salvar e continuar depois;
- perfil com interesses, tecnologias, projetos, experiências e respostas abertas;
- área do candidato com status, feedbacks, próximos passos e histórico;
- Sala Zero privada para visualizar todas as respostas;
- filtros, status, impressões, notas internas, conversas e feedback individual;
- notas e impressões administrativas nunca são enviadas para o candidato;
- entrada administrativa escondida, protegida por frase secreta e bloqueio de tentativas;
- banco Postgres persistente e senhas protegidas com hash.

## Rodando localmente

Requisitos: Node.js 24 ou superior e uma instância Postgres.

```bash
npm install
cp .env.example .env
npm run dev
```

Abra `http://localhost:5173`.

## Variáveis privadas

Configure o arquivo `.env` antes de iniciar:

```env
PORT=3333
JWT_SECRET=uma-chave-grande-e-aleatoria
ADMIN_SECRET_PHRASE=uma-frase-longa-que-so-voce-conhece
POSTGRES_URL=postgresql://usuario:senha@host/banco?sslmode=require
```

O arquivo `.env` está ignorado pelo Git e nunca deve ser publicado. Em produção, configure essas variáveis diretamente no serviço de hospedagem.

## Acesso à Sala Zero

A entrada não aparece na navegação. Na página inicial, mantenha pressionados por pouco mais de dois segundos os três pontos quase invisíveis no canto direito do rodapé. Também é possível abrir diretamente `/sala-zero`.

A segurança acontece no servidor: a frase secreta não é enviada ao navegador, o cookie é inacessível ao JavaScript e cinco erros bloqueiam novas tentativas por 15 minutos.

## Produção

```bash
npm run build
npm start
```

Na Vercel, conecte um banco Postgres ao projeto e configure `POSTGRES_URL`, `JWT_SECRET` e `ADMIN_SECRET_PHRASE` como variáveis privadas de Production. A função em `api/index.ts` atende às rotas da API; as tabelas são criadas na primeira conexão.

GitHub Pages não é suficiente para este projeto porque ele precisa de autenticação, API e banco de dados.
