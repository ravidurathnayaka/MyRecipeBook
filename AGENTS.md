# AGENTS.md

## Cursor Cloud specific instructions

### Overview

RecipeBook is a full-stack Next.js 16 recipe management app (TypeScript, Prisma 7, PostgreSQL 16, NextAuth.js v5 with Google OAuth). Single application — not a monorepo.

### Services

| Service | How to start | Port |
|---------|-------------|------|
| PostgreSQL | `sudo docker start recipebook-db` (or create: `sudo docker run -d --name recipebook-db -e POSTGRES_USER=recipebook -e POSTGRES_PASSWORD=recipebook -e POSTGRES_DB=recipebook -p 5432:5432 postgres:16-alpine`) | 5432 |
| Next.js dev server | `pnpm dev` | 3000 |

### Key commands

See `package.json` scripts and the README for full details. Quick reference:

- **Lint**: `pnpm lint`
- **Dev server**: `pnpm dev`
- **Build**: `pnpm build --webpack`
- **Prisma migrations**: `pnpm prisma migrate dev`
- **Prisma generate**: `pnpm prisma generate` (also runs automatically via `postinstall`)

### Non-obvious caveats

- **Docker required**: PostgreSQL runs in a Docker container. Docker must be installed and the daemon must be running (`sudo dockerd` if not already started). The Docker-in-Docker setup requires `fuse-overlayfs` storage driver and `iptables-legacy`.
- **No automated tests**: The README mentions `pnpm test` but no test framework or test files exist yet.
- **pnpm build scripts warning**: `pnpm install` shows warnings about ignored build scripts for `@prisma/engines`, `esbuild`, `msgpackr-extract`, and `prisma`. Despite the warnings, `prisma generate` runs successfully via the `postinstall` hook.
- **Environment validation**: `lib/env.ts` validates env vars at startup via Zod. In development mode it logs warnings and continues; in production it throws. The `DATABASE_URL` is required.
- **Google OAuth**: Auth requires real Google OAuth credentials (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`). With placeholder values, the app starts and all non-auth routes work, but login will fail. The Google OAuth callback URL is `http://localhost:3000/api/auth/callback/google` (must be registered in the Google Cloud Console).
- **Prisma driver adapter**: Uses `@prisma/adapter-pg` (not the traditional binary engine). The Prisma client is generated to `lib/generated/prisma/`.
- **Husky commit hooks**: Commitlint enforces conventional commit format (e.g., `feat:`, `fix:`, `chore:`).
- **Migration files**: `prisma migrate dev` creates migration files in `prisma/migrations/`. These are gitignored if they don't already exist in the repo — be aware that running migrations generates new files.
- **Testing authenticated flows without Google login**: The app uses database sessions (`strategy: "database"` in `lib/auth.ts`). To test authenticated features without real Google login, insert a user and session directly into PostgreSQL, then set the cookie `authjs.session-token=<token>` in the browser. Example: `INSERT INTO "User" (...) VALUES (...); INSERT INTO "Session" ("sessionToken", "userId", expires, ...) VALUES ('<token>', '<userId>', NOW() + INTERVAL '30 days', ...);`
