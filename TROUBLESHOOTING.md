# Troubleshooting Guide

## Server Running but Getting 500 Error

If the server is running on port 3000 but returning a 500 Internal Server Error, follow these steps:

### 1. Check Database Connection

Ensure your database is accessible and migrations are applied:

```bash
# Check migration status
pnpm prisma migrate status

# If migrations are pending, apply them
pnpm prisma migrate dev

# Or push schema directly (for development)
pnpm prisma db push
```

### 2. Verify Environment Variables

Check your `.env` file has all required variables:

```bash
# Required
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-32-character-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Optional but recommended
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

### 3. Check Browser Console

Open your browser's developer console (F12) and check for:
- Network errors
- Console errors
- Detailed error messages

### 4. Check Terminal Output

Look at the terminal where `pnpm dev` is running for:
- Database connection errors
- Missing environment variable warnings
- Stack traces
- Compilation errors

### 5. Common Issues

#### Database Connection Failed
- Verify DATABASE_URL is correct
- Check if database server is running
- Verify network connectivity to database

#### Missing Tables
```bash
pnpm prisma db push
```

#### Auth Configuration Error
- Ensure AUTH_SECRET is at least 32 characters
- Verify Google OAuth credentials are correct

### 6. Reset and Restart

If issues persist:

```bash
# Stop all Node processes
# (Windows PowerShell)
Stop-Process -Name node -Force

# Clear Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Restart
pnpm dev
```

### 7. Check Logs

The application uses structured logging. Check for:
- Error logs in console
- Database query logs (in development mode)
- Authentication errors

## Still Having Issues?

1. Check the actual error message in the browser console or terminal
2. Verify all dependencies are installed: `pnpm install`
3. Ensure Prisma Client is generated: `pnpm prisma generate`
4. Check if port 3000 is available: `netstat -ano | findstr :3000`
