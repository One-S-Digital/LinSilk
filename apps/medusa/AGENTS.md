# AGENTS.md

## Overview

Maison Ayla's commerce backend: a Medusa v2 application (`@medusajs/medusa` 2.20.x, Node 20+,
PostgreSQL 15+). It is the `medusa` package in the repo's pnpm workspace; the storefront is the
sibling `apps/storefront` (Next.js).

Read `docs/HANDOVER.md` §5 and `docs/BACKEND-RENDER.md` at the repo root before changing the
domain. The storefront's `lib/` layer is the source of truth for the domain shape; this backend
conforms to it.

## Directory Structure

```text
apps/medusa/
├── medusa-config.ts      # Medusa config: DB URL, CORS, secrets, modules
├── integration-tests/    # setup.js (Jest setupFiles) and http/*.spec.ts suites
└── src/
    ├── admin/            # Admin dashboard extensions (widgets/, i18n/, routes)
    ├── api/              # API routes: api/store/*, api/admin/* (file-based)
    ├── jobs/             # Scheduled jobs
    ├── links/            # Module links between modules
    ├── migration-scripts/# Run automatically, once, on db:migrate. Never put seed data here.
    ├── modules/          # Custom modules (service + models + migrations)
    ├── scripts/          # One-off scripts run with `medusa exec` (seed lives here)
    ├── subscribers/      # Event subscribers
    └── workflows/        # Workflows and workflow steps
```

## Commands

pnpm only — never create a second lockfile. The lockfile lives at the repo root. From the repo
root:

```bash
pnpm services                                   # Postgres + Redis via docker compose
pnpm --filter medusa dev                        # http://localhost:9000, admin at /app
pnpm --filter medusa build
pnpm --filter medusa lint
pnpm --filter medusa test:unit                  # **/src/**/__tests__/**/*.unit.spec.ts
pnpm --filter medusa test:integration:modules   # **/src/modules/*/__tests__/**
pnpm --filter medusa test:integration:http      # **/integration-tests/http/*.spec.ts
pnpm --filter medusa exec medusa db:generate <module>
pnpm --filter medusa exec medusa db:migrate
pnpm --filter medusa exec medusa user -e <email> -p <password>
```

Install dependencies into this package, not the root: `pnpm --filter medusa add <pkg>`.

## Code Style

- The backend must satisfy `@medusajs/eslint-plugin`'s recommended config (`eslint.config.ts`).
  Its rules encode framework requirements, so a failure usually means the code is wrong. Never
  disable a `@medusajs/*` rule to make lint pass.
- No semicolons. Double quotes, 2-space indent.
- Files: kebab-case. Types/classes: PascalCase. Functions/variables: camelCase. DB columns:
  snake_case.

## Conventions

- Backend routing is file-based: `src/api/store/<path>/route.ts` exporting `GET`/`POST`/etc.
- Business logic belongs in workflows, not route handlers.
- Editing a custom module's model requires `medusa db:generate <module>`, or the change never
  applies.
- Go through module services and workflows; no raw SQL or direct DB clients.
- Integration suites need a reachable PostgreSQL.

## Off-Limits

- `.medusa/`, `dist/`, `build/` — build output.
- `pnpm-lock.yaml` — change it only through pnpm.
- `.env` — never commit, print, or copy secret values out of it. Document new variables in
  `.env.example`.
- Existing migrations in `src/modules/*/migrations/` — add a new one rather than rewriting.
- No destructive DB commands against the user's database without explicit confirmation.
