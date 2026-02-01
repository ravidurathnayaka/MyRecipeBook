# Vercel Deployment Guide

This guide walks you through deploying the Recipe Book application to Vercel.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Git Repository** - Code pushed to GitHub, GitLab, or Bitbucket
3. **Database** - PostgreSQL database (Vercel Postgres, Neon, Supabase, or Railway)
4. **Google OAuth** - Credentials from [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Database Setup

For Vercel serverless, use a PostgreSQL provider with **connection pooling**:

### Recommended Providers

- **Vercel Postgres** - Native integration, automatic connection pooling
- **Neon** - Serverless PostgreSQL, free tier available
- **Supabase** - PostgreSQL with connection pooler (use port 6543)
- **Railway** - Simple setup with connection pooling

### Connection String Format

```
# Use pooler URL (add ?pgbouncer=true for Neon)
postgresql://user:password@host:5432/database?pgbouncer=true&connection_limit=1
```

> **Important**: Serverless functions need connection pooling. Use the pooler/transaction URL, not the direct connection URL.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `next build --webpack` (or use default - vercel.json overrides)
   - **Install Command**: `pnpm install`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login and deploy
vercel login
vercel
```

## Step 3: Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (use pooler URL) |
| `AUTH_SECRET` | ✅ | Generate: `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | ✅ | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth Client Secret |
| `AUTH_URL` | ✅ | Your Vercel URL: `https://your-app.vercel.app` |
| `AUTH_TRUST_HOST` | ✅ | Set to `true` for Vercel |
| `SUPER_ADMIN_EMAIL` | Optional | Email for initial super admin |

### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 4: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Web application)
3. Add authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
   - `https://your-app.vercel.app` (for preview deployments)
4. Copy Client ID and Client Secret to Vercel env vars

## Step 5: Database Migrations

Run migrations before first deploy or use a post-deploy script:

```bash
# Locally, with production DATABASE_URL
DATABASE_URL="your-production-url" pnpm prisma migrate deploy
```

Or add to Vercel Build Command in Project Settings:
```
prisma generate && prisma migrate deploy && next build --webpack
```

## Step 6: Create Super Admin

After first deployment:

```bash
DATABASE_URL="your-production-url" pnpm create-admin admin@example.com
```

## Troubleshooting

### Build Fails

- **Turbopack errors on Windows**: Use `--webpack` flag (already in package.json)
- **Prisma client not found**: Ensure `postinstall` runs (prisma generate)
- **Module not found**: Check all imports use `@/` path alias

### Runtime Errors

- **Database connection limits**: Use connection pooler URL
- **AUTH_SECRET invalid**: Must be at least 32 characters
- **OAuth redirect mismatch**: Verify AUTH_URL and Google redirect URIs match

### Environment Variables Not Loading

- Ensure variables are set for correct environment (Production/Preview)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

## Vercel-Specific Configuration

The `vercel.json` includes:

- **Build Command**: Uses webpack for stable builds
- **Framework**: Next.js (auto-detected)
- **Regions**: `iad1` (US East) - change in vercel.json if needed

## Post-Deployment Checklist

- [ ] Application loads at Vercel URL
- [ ] Login with Google works
- [ ] Can create/view recipes
- [ ] Favorites work when logged in
- [ ] Admin dashboard accessible (after creating super admin)
- [ ] Health check: `https://your-app.vercel.app/api/health`
