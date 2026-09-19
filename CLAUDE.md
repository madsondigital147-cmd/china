# Nexus Logistics — Contexto para Claude Code

## Stack
- **Next.js 15.5** (App Router, Turbopack)
- **TypeScript 5.5** (strict)
- **Tailwind CSS 3.4** (CSS variables via `globals.css`)
- **Prisma 6** + PostgreSQL 16
- **NextAuth v5** (credentials + JWT, HttpOnly cookies)
- **API Keys** (Bearer, sha256 hash, rate limit)
- **Recharts**, **Lucide React**, **Zod**, **tsx** (testes)

## Comandos principais
```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Build production
npm run start        # Start production
npm run typecheck    # tsc --noEmit
npm run test         # node --import tsx --test "tests/**/*.test.ts"
npm run lint         # next lint
npx prisma migrate dev --name <nome>
npx prisma db seed
npx prisma studio
```

## Estrutura-chave
```
src/
├── app/
│   ├── (auth)/login, register
│   ├── (app)/          # Painel admin (protegido)
│   │   ├── dashboard, shipments, exceptions, notifications
│   │   ├── profile, settings, webhooks, audit-logs
│   │   └── carriers, customers, warehouse, reports, developer, support
│   ├── api/
│   │   ├── health, cron/cleanup
│   │   ├── settings/general
│   │   ├── v1/
│   │   │   ├── tracking/[trackingNumber]
│   │   │   ├── shipments, shipments/[id]
│   │   │   └── webhooks/[carrier]     # Correios/Jadlog + genérico
│   │   └── webhooks/[carrier]         # Alias legado
│   ├── layout.tsx      # Toaster wrapper (provider+renderer)
│   └── globals.css     # CSS vars (hex) → Tailwind tokens
├── components/
│   ├── ui/             # Button, Card, Table, Badge, Field, Skeleton, Toaster, ComingSoon
│   ├── layout/         # AppShell, Sidebar, Header, Breadcrumbs, LegalPage
│   ├── dashboard/      # ShipmentsChart, RouteMap
│   └── tracking/       # Timeline
├── lib/
│   ├── api/
│   │   ├── auth.ts           # ApiKey auth, logApiRequest, verifyCronSecret
│   │   ├── json.ts           # jsonOk/jsonError/badRequest/...
│   │   ├── carrier-webhooks.ts  # Correios/Jadlog signature validation
│   │   └── webhook-route.ts  # Handler genérico compartilhado
│   ├── auth/           # NextAuth config, session, password
│   ├── db.ts           # Prisma singleton
│   ├── status.ts       # normalizeStatus, STATUS_FLOW (11), DEFAULT_CARRIER_MAPPINGS
│   ├── utils.ts        # cn, formatDate, buildShipmentNumber, sha256, normalizeTracking
│   ├── rbac.ts         # Permissions by role
│   ├── validation/     # Zod schemas
│   └── theme.tsx       # Theme provider
├── services/           # Business logic (shipment, webhook, audit, notifications, dashboard)
├── actions/            # Server Actions (auth, inbox, shipments)
├── middleware.ts       # Rate limit (60/min, 120 webhooks) + CORS /api/v1
└── i18n/               # en, pt, zh
```

## Models Prisma principais
- `Organization`, `User`, `Role`, `Permission`
- `Carrier`, `CarrierService`, `CarrierStatusMapping`
- `Shipment`, `Package`, `Address`, `TrackingEvent`
- `ApiKey` (keyPrefix, keyHash, status, scopes), `ApiLog`
- `Notification`, `WebhookEvent`, `SystemSetting`
- `Warehouse`, `WarehouseLocation`, `WarehouseBin`
- `AuditLog`

## Status Shipment (fluxo canônico — 11)
```
DRAFT → CREATED → RECEIVED → PROCESSING → READY_FOR_DISPATCH
→ DISPATCHED → IN_TRANSIT → ARRIVED_DESTINATION → CUSTOMS
→ OUT_FOR_DELIVERY → DELIVERED
```
Terminais: `DELIVERED`, `RETURNED`, `CANCELLED`, `EXCEPTION`

## Webhooks
- **Generic**: `POST /api/v1/webhooks/:carrier` + `POST /api/webhooks/:carrier`
- **Correios**: header `x-correios-signature` (HMAC-SHA256)
- **Jadlog**: header `x-jadlog-signature` (HMAC-SHA256)
- Payload: `{ trackingNumber, status, occurredAt, location?, details? }`

## Auth
- **Web**: NextAuth credentials → JWT → cookie `nexus-session`
- **API**: `Authorization: Bearer nk_live_<key>` → sha256 → `ApiKey.keyHash`
- **Rate limit**: 60 req/min/IP (120 webhooks), in-memory Map sliding window
- **CORS**: `/api/v1/*` permite origin + OPTIONS 204

## Variáveis de ambiente (.env.example)
```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="openssl rand -base64 32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
WEBHOOK_SECRET="change-me"
CRON_SECRET="change-me-in-production"
CARRIER_API_URL="" / CARRIER_API_KEY="" / CARRIER_API_SECRET=""
CORREIOS_WEBHOOK_SECRET="" / JADLOG_WEBHOOK_SECRET=""
```

## Testes (14 passing)
```bash
npm run test
# buildShipmentNumber, tracking helpers, normalizeStatus, status helpers
```
Arquivos: `tests/status.test.ts`, `tests/shipment-number.test.ts`

## Deploy
- **Vercel** (recomendado): import repo, add env vars, deploy
- **Docker**: `docker compose up -d --build` (Postgres + app standalone)
- **DB providers**: Neon, Supabase, Railway, PlanetScale (pooling PgBouncer)

## Arquivos de config
- `next.config.mjs` — headers CSP, `output: 'standalone'`
- `tailwind.config.ts` — colors mapeados para `var(--*)` (hex em globals.css)
- `vercel.json` — headers, functions maxDuration 30s, cron 3h UTC
- `docker-compose.yml` + `Dockerfile` (multi-stage standalone)

## Seed (demo data)
```bash
npx prisma db seed
# Cria org, roles/perms, admin@demo.local / DemoAdmin!2026
# Carrier demo-cn, service demo-express, status mappings
# 3 demo shipments (CREATED, IN_TRANSIT, DELIVERED)
# Demo API Key impressa no console: nk_live_...
# Cliente Porto Velho: SHP-2026-XXXXXX / DEMO-CN-XXXXXX
```

## Gotchas
- **Toaster** deve envolver `children` em `layout.tsx` (provider+renderer)
- **Tailwind** usa CSS vars hex → `colors: { border: "var(--border)" }` (NÃO `hsl(var(--border))`)
- **Shipment** não tem `serviceCode` — use `service: { select: { code, name } }`
- **Exception** não tem relation `resolvedBy` — use `resolvedAt` + `resolutionNote`
- **Carrier** não tem `deletedAt`
- **Middleware** usa `x-forwarded-for` para IP, `req.headers.get("x-vercel-cron")` para cron

## Próximos passos sugeridos
- Testes de integração com DB (precisa Postgres)
- Página de relatórios com Recharts
- Integração real Correios/Jadlog (adapter)
- Fila de jobs (Redis/BullMQ) para webhooks pesados
- Multi-org completo (já preparado no schema)