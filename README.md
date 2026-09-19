# Nexus Logistics

SaaS de gestão logística — Next.js 15 (App Router) + TypeScript + Tailwind 3.4 + Prisma 6 + PWA.

## Stack

- **Framework**: Next.js 15.5 (App Router, Turbopack)
- **Language**: TypeScript 5.5 (strict)
- **Database**: PostgreSQL 16 via Prisma 6
- **Styling**: Tailwind CSS 3.4 (CSS variables)
- **Auth**: NextAuth v5 (credentials + JWT, HttpOnly cookies)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Validation**: Zod
- **Testing**: Node --test + tsx
- **PWA**: next-pwa (Workbox)

## Requisitos

- Node.js 20+
- pnpm 9+ (corepack)
- PostgreSQL 16 (ou Docker)
- Variáveis de ambiente (ver `.env.example`)

## Quick Start (Docker)

```bash
# 1. Clone e configure .env
cp .env.example .env
# edite .env com seus valores

# 2. Suba tudo
docker compose up -d --build

# 3. Acesse
# App: http://localhost:3000
# Postgres: localhost:5432
```

## Quick Start (Local)

```bash
# 1. Instale deps
pnpm install

# 2. Configure .env
cp .env.example .env
# edite DATABASE_URL, AUTH_SECRET, etc.

# 3. DB
pnpm prisma migrate dev --name init
pnpm prisma db seed

# 4. Dev
pnpm dev
# http://localhost:3000
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Build production |
| `pnpm start` | Start production |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Testes unitários (Node --test) |
| `pnpm lint` | ESLint |
| `pnpm prisma:*` | Comandos Prisma |

## Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"

# Auth
AUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Carriers (exemplos)
CORREIOS_API_URL="https://api.correios.com.br"
CORREIOS_CLIENT_ID="..."
CORREIOS_CLIENT_SECRET="..."
JADLOG_API_URL="https://api.jadlog.com.br"
JADLOG_API_KEY="..."

# Webhooks
WEBHOOK_SECRET="gere-chave-forte"
```

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (app)/                # Painel admin (protegido)
│   │   ├── dashboard/page.tsx
│   │   ├── shipments/
│   │   ├── exceptions/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── webhooks/page.tsx
│   │   ├── audit-logs/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── health/route.ts
│   │   ├── v1/
│   │   │   ├── tracking/[trackingNumber]/route.ts
│   │   │   ├── shipments/route.ts
│   │   │   ├── shipments/[id]/route.ts
│   │   │   └── webhooks/[carrier]/route.ts
│   │   └── webhooks/[carrier]/route.ts   # alias legado
│   ├── layout.tsx            # Toaster wrapper
│   └── globals.css
├── components/
│   ├── ui/                   # Componentes base (Button, Card, Table, etc.)
│   ├── providers.tsx         # SessionProvider, Toaster, QueryClient
│   └── layout/               # Sidebar, Header, Breadcrumbs
├── lib/
│   ├── api/
│   │   ├── auth.ts           # ApiKey auth, logApiRequest
│   │   ├── json.ts           # Helpers JSON response
│   │   └── webhook-route.ts  # Handler inbound webhook compartilhado
│   ├── auth.ts               # NextAuth config
│   ├── db.ts                 # Prisma client singleton
│   ├── status.ts             # normalizeStatus, STATUS_FLOW
│   ├── utils.ts              # Helpers (cn, formatDate, tracking, etc.)
│   └── validations/          # Zod schemas
├── services/                 # Lógica de negócio (webhook, audit, shipment)
├── actions/                  # Server Actions (ex: markNotificationsRead)
└── middleware.ts             # Rate limit + CORS /api/v1
```

## API v1

### Autenticação
```http
Authorization: Bearer nk_live_<key>
```

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check (DB ping) |
| GET | `/api/v1/tracking/:trackingNumber` | Rastreamento por código |
| GET | `/api/v1/shipments` | Listar shipments (paginado, filtros) |
| GET | `/api/v1/shipments/:id` | Detalhe shipment |
| POST | `/api/v1/webhooks/:carrier` | Webhook carrier (auth por assinatura) |
| POST | `/api/webhooks/:carrier` | Alias legado |

### Rate Limits
- **Padrão**: 60 req/min por IP
- **Webhooks**: 120 req/min por IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Webhooks
Payload padrão:
```json
{
  "tracking_number": "BR123456789BR",
  "status": "OUT_FOR_DELIVERY",
  "occurred_at": "2026-09-19T14:30:00Z",
  "location": "CD São Paulo",
  "details": "Saiu para entrega"
}
```
Assinatura: `X-Signature: sha256=<hex>` validada com `WEBHOOK_SECRET`.

## Status de Shipment

Fluxo canônico (11 estados):
```
DRAFT → CREATED → RECEIVED → PROCESSING → READY_FOR_DISPATCH
→ DISPATCHED → IN_TRANSIT → ARRIVED_DESTINATION → CUSTOMS
→ OUT_FOR_DELIVERY → DELIVERED
```
Terminais: `DELIVERED`, `RETURNED`, `CANCELLED`, `EXCEPTION`.

`normalizeStatus()` mapeia códigos de carriers para canônicos (tabela default + DB overrides).

## Testes

```bash
pnpm test
# 14 testes: buildShipmentNumber, tracking helpers, normalizeStatus, status helpers
```

## Deploy

### Vercel (recomendado)
1. Conecte repo
2. Adicione `DATABASE_URL`, `AUTH_SECRET`, etc. nas env vars
3. Build command: `pnpm build`
4. Output: automatic

### Docker (VPS/EC2)
```bash
docker compose -f docker-compose.yml up -d --build
# Configure reverse proxy (nginx/traefik) + SSL
```

## Licença

MIT