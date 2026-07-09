# 🗄️ Guia: Banco de Testes - Qual Abordagem Usar?

### Desenvolver com teste
npm run dev:test

### desenvolver com produção
npm run dev

---


### 2️⃣ **Docker Manual (docker run)**

```powershell
# Subir banco
docker run -d \
  --name pg-test \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_PASSWORD=testpass123 \
  -e POSTGRES_DB=monitor_estudos_test \
  -p 5433:5432 \
  postgres:16-alpine

# Ver logs
docker logs pg-test

# Parar
docker stop pg-test

# Deletar
docker rm pg-test
```


### 3️⃣ **Docker + NPM Scripts** ✅ **← USE ESTA**

```powershell
# Subir banco
npm run test:db:up

# Migração
npm run test:migrate

# Abrir Prisma Studio http://localhost:51212/
npm run test:studio
# Resetar (limpa tudo)
npm run test:db:reset

# Ver logs
npm run test:db:logs

# Descer
npm run test:db:down
```

---

## 🎯 Guia Rápido: Qual Usar Quando?

### Cenário: "Quero testar novo campo no schema"
```powershell
# USE ISTO ✅
npm run test:db:up          # Inicia banco teste
npm run test:migrate        # Aplica schema
npm run test:studio         # Vê dados
npm run test:db:reset       # Limpa tudo ao final
```

npx prisma db pull # Puxa schema do banco para o prisma
npx prisma generate # Gera client atualizado
npx prisma migrate dev 
### Cenário: "Quero ver SQL sendo executado"
```powershell
# USE pgAdmin para DEBUG
docker run -d \
  --name pgadmin \
  -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4

# Browser: http://localhost:5050
```


---

## 🐳 Portas: Qual Usar?

| Banco | Porta | Ambiente | URL |
|------|-------|----------|-----|
| Produção (cloud) | 5432 | `.env` | `db.prisma.io:5432` |
| Testes (Docker) | **5433** | `.env.test` | `localhost:5433` |
| Extra (se quiser) | 5434 | `.env.dev` | `localhost:5434` |
| pgAdmin web | 5050 | Browser | `localhost:5050` |

> ℹ️ **Porta 51212** que você mencionou não é padrão Postgres. Pode usar, é só mudar `5433` para `51212` no `docker-compose.test.yml`.


---

## 📋 Checklist: Primeiros 5 Minutos

- [ ] `npm run test:db:up` — Sobe Postgres local
- [ ] Espera ~10s, verifica `docker ps`
- [ ] `npm run test:migrate` — Cria tabelas
- [ ] `npm run test:studio` — Abre Prisma Studio
- [ ] Testa inserindo/editando dados manualmente
- [ ] `npm run test:db:down` — Para container

---


## Prisma ORM Tutorial

`npx prisma migrate dev` Criar/aplicar migration
`npx prisma generate` gerar client
`npx prisma studio` interface visual






---

Perfeito. Vamos simplificar em um fluxo único, do zero, para não se perder nos comandos do Prisma.

Fluxo recomendado no seu projeto

1. Desenvolvimento de schema sempre em branch de feature
2. Teste sempre no banco de teste local
3. Produção só aplica migrations já versionadas
4. Nunca usar db push em produção

Passo a passo do zero

1. Subir ambiente de teste
- npm install
- npm run test:db:up

2. Aplicar estado atual do projeto no banco de teste
- npm run test:migrate

⚠️ **Resolução de Conflitos (Drift) e Erros (`ltree` does not exist)**
Se houver divergência entre o seu banco e as migrations (Drift detected), ou se você tentou rodar `test:push` e encontrou erro de extensão faltante (`type "ltree" does not exist`):
- O `test:push` falha porque ele ignora as migrations que criam extensões no PostgreSQL (como o `ltree`).
- A solução correta é limpar o banco de testes e aplicar as migrations do zero:
  1. `npm run test:db:reset` (Limpa e reinicia o banco Docker)
  2. `npm run test:migrate` (Aplica as migrations corretamente. Se houver mudanças no schema, ele pedirá para criar uma nova migration)
  3. `npm run test:seed` (Opcional, para popular dados de teste)

3. Alterar o schema
- editar schema.prisma

4. Criar migration da alteração
- npm run test:migrate -- --name nome_da_mudanca
Exemplo:
- npm run test:migrate -- --name add_topic_parent

5. Gerar client
- npx prisma generate

6. Validar aplicação
- npm run build
- npm run dev:test
- opcional: npm run test:studio

7. Commit correto
- incluir:
- schema.prisma
- pasta nova em migrations
- se seu repositório versiona client gerado, incluir também prisma

Fluxo quando vai para main

1. Merge da feature para main
2. Em produção, com DATABASE_URL de produção:
- npx prisma migrate deploy
3. Se necessário, seed:
- npx prisma db seed

Regra de ouro:
- main/prod nunca roda migrate dev
- main/prod usa migrate deploy

Se precisar ajuste básico direto na main

Mesmo sendo ajuste pequeno, faça assim:

1. Criar branch curta a partir da main
2. Alterar schema.prisma
3. Gerar migration no banco de teste
- npm run test:migrate -- --name hotfix_nome
4. Validar build
- npm run build
5. Merge para main
6. Produção
- npx prisma migrate deploy

Guia rápido dos comandos Prisma (sem confusão)

1. prisma migrate dev
- Uso: desenvolvimento local
- Faz: cria/aplica migration e atualiza histórico
- Não usar em produção

2. prisma migrate deploy
- Uso: produção/CI
- Faz: aplica migrations existentes
- Comando certo para produção

3. prisma db push
- Uso: protótipo local rápido, sem histórico
- ⚠️ **Cuidado**: Evite usar se o projeto depender de extensões (como `ltree`) criadas em migrations, pois o `push` não executa essas extensões e falhará.
- Não usar em produção com migrations

4. prisma generate
- Uso: sempre após mudar schema ou migration
- Faz: atualiza Prisma Client

5. prisma studio
- Uso: inspeção manual de dados

6. prisma migrate resolve
- Uso: recuperar estado quando migration falhou em produção
- Só usar conscientemente (caso avançado)

## 🚑 Playbook: Como Recuperar Erro de Migration (P3018)

Quando você tenta rodar `npx prisma migrate deploy` no banco de **produção** e se depara com um erro do tipo:
`A migration failed to apply... Database error: ERROR: column "X" of relation "Y" already exists` (Erro P3018)

Isso significa que o banco de produção já possui a coluna/tabela que a migration está tentando criar (geralmente porque ela foi criada manualmente antes). O Prisma então entra num estado de falha para proteger o banco de conflitos.

**Passo a passo para resolver:**

1. **Identifique a Migration com Erro**
   No log do erro, você verá o nome da pasta da migration, algo como:
   `Migration name: 20260625161837`

2. **Verifique o Estado do Banco**
   Se o erro indica "already exists" e você sabe que os dados estão corretos, o banco já está no estado que deveria ficar. Caso contrário, acesse o banco via pgAdmin e faça a alteração manual para que o schema fique igual ao esperado pela migration.

3. **Marque a Migration como Resolvida (`applied`)**
   Para avisar ao Prisma que o conteúdo daquela migration já existe no banco e ele pode marcá-la como concluída (parando de tentar rodá-la e travar o processo), use o comando **`resolve --applied`** passando o nome exato da migration:
   
   ```powershell
   # ⚠️ Atenção: A flag correta é "--applied" (com dois 'p')
   npx prisma migrate resolve --applied "20260625161837"
   ```

4. **Retome o Deploy**
   Com a divergência resolvida no histórico do Prisma, rode o deploy novamente para aplicar qualquer outra migration subsequente que estivesse pendente:
   ```powershell
   npx prisma migrate deploy
   ```