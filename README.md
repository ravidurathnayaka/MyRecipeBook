# RecipeBook - Production-Ready Recipe Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

A modern, production-ready recipe management application built with Next.js 16, TypeScript, Prisma, and PostgreSQL. Features include user authentication, recipe CRUD operations, favorites, admin dashboard, and more.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Google OAuth integration with NextAuth.js
- ✅ **Recipe Management** - Create, read, update, delete recipes
- ✅ **Recipe Moderation** - Admin approval workflow for recipes
- ✅ **Favorites System** - Save and manage favorite recipes
- ✅ **User Profiles** - Manage user profile information
- ✅ **Search & Filtering** - Search recipes by title, description, category
- ✅ **Shopping Lists** - Generate shopping lists from recipe ingredients
- ✅ **Admin Dashboard** - User management and recipe moderation

### Production Features
- ✅ **Security** - Input validation, security headers, CSRF protection
- ✅ **Error Handling** - Centralized error handling and structured logging
- ✅ **Database Optimization** - Indexed queries and connection pooling
- ✅ **Docker Support** - Complete Docker and Docker Compose setup
- ✅ **Health Checks** - API health check endpoints
- ✅ **Environment Validation** - Type-safe environment variable validation
- ✅ **API Documentation** - Comprehensive API documentation

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **pnpm** (or npm/yarn)
- **PostgreSQL** 14+ or use Docker Compose
- **Google OAuth** credentials (for authentication)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd myrecipebook
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/recipebook"

# NextAuth
AUTH_SECRET="your-secret-key-min-32-characters-long"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

# Google OAuth (Required)
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

# Optional
SUPER_ADMIN_EMAIL="admin@example.com"
LOG_LEVEL="info"
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Generate Prisma Client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# (Optional) Seed database with sample data
# pnpm prisma db seed
```

### 5. Create a super admin

```bash
pnpm create-admin your-email@example.com
```

### 6. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Start all services (database + app)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Build Docker Image

```bash
# Build the image
docker build -t recipebook:latest .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
  -e AUTH_GOOGLE_ID="..." \
  -e AUTH_GOOGLE_SECRET="..." \
  recipebook:latest
```

## 📁 Project Structure

```
myrecipebook/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (mainlayout)/        # Main layout routes
│   ├── actions/             # Server actions
│   └── api/                 # API routes
├── components/              # React components
│   ├── form/                # Form components
│   ├── general/             # Reusable components
│   └── ui/                  # UI primitives
├── lib/                     # Shared libraries
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client
│   ├── errors/             # Error handling
│   ├── validations/        # Zod schemas
│   ├── logger.ts           # Structured logging
│   └── env.ts              # Environment validation
├── prisma/                  # Database schema
│   └── schema.prisma
└── public/                  # Static assets
```

For detailed structure documentation, see [docs/STRUCTURE.md](./docs/STRUCTURE.md).

## 🔐 Security Features

### Implemented Security Measures

- ✅ **Input Validation** - Zod schema validation for all API inputs
- ✅ **Security Headers** - HSTS, XSS protection, frame options, etc.
- ✅ **Environment Validation** - Type-safe environment variable validation
- ✅ **Authentication** - NextAuth.js with Google OAuth
- ✅ **Authorization** - Role-based access control (USER, SUPER_ADMIN)
- ✅ **SQL Injection Protection** - Prisma ORM with parameterized queries
- ✅ **Error Handling** - Sanitized error messages in production
- ✅ **Request Validation** - All API routes validate inputs

### Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Use strong AUTH_SECRET** - Minimum 32 characters, generate with `openssl rand -base64 32`
3. **Keep dependencies updated** - Run `pnpm audit` regularly
4. **Use HTTPS in production** - Always use HTTPS, never HTTP
5. **Rotate secrets regularly** - Change AUTH_SECRET and OAuth secrets periodically

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### Test Coverage

- Unit tests for utilities and helpers
- Integration tests for API routes
- E2E tests for critical user flows

Target: **80%+ code coverage**

## 📊 API Documentation

### Health Check

```
GET /api/health
```

Returns the health status of the application and database connectivity.

### Recipes API

#### List Recipes
```
GET /api/recipes?page=1&limit=10&category=BREAKFAST&search=query
```

#### Get Recipe
```
GET /api/recipes/:id
```

#### Create Recipe (Authenticated)
```
POST /api/recipes
Content-Type: application/json

{
  "title": "Recipe Title",
  "description": "Recipe description",
  "category": "BREAKFAST",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "steps": ["step 1", "step 2"],
  ...
}
```

#### Update Recipe (Authenticated)
```
PUT /api/recipes/:id
```

#### Delete Recipe (Authenticated)
```
DELETE /api/recipes/:id
```

### Favorites API

#### List Favorites (Authenticated)
```
GET /api/favorites
```

#### Add Favorite (Authenticated)
```
POST /api/favorites
{
  "recipeId": "uuid"
}
```

#### Remove Favorite (Authenticated)
```
DELETE /api/favorites?recipeId=uuid
```

### Admin API

All admin endpoints require `SUPER_ADMIN` role.

#### List Users
```
GET /api/admin/users?page=1&limit=10&role=USER
```

#### Update User Role
```
PUT /api/admin/users
{
  "userId": "user-id",
  "role": "SUPER_ADMIN"
}
```

#### List All Recipes (with status filter)
```
GET /api/admin/recipes?status=PENDING&page=1&limit=10
```

#### Update Recipe Status
```
PATCH /api/admin/recipes
{
  "recipeId": "recipe-id",
  "status": "APPROVED"
}
```

## 🚢 Deployment

### Environment Setup

1. Set all required environment variables
2. Run database migrations: `pnpm prisma migrate deploy`
3. Generate Prisma Client: `pnpm prisma generate`
4. Build the application: `pnpm build`
5. Start the production server: `pnpm start`

### Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] AUTH_SECRET is secure and unique
- [ ] HTTPS enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Monitoring setup (optional)
- [ ] Backups configured for database
- [ ] Health checks configured for load balancer

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker Deployment

See Docker section above for containerized deployment.

## 🔧 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm create-admin # Create super admin user
```

### Database Management

```bash
# Create a new migration
pnpm prisma migrate dev --name migration-name

# Apply migrations
pnpm prisma migrate deploy

# Open Prisma Studio
pnpm prisma studio

# Reset database (development only)
pnpm prisma migrate reset
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code structure and patterns
- Run `pnpm lint` before committing
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues, questions, or contributions:

1. Check existing [Issues](https://github.com/your-repo/issues)
2. Create a new issue if needed
3. See [docs/](./docs/) for detailed documentation

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

**Built with ❤️ using Next.js, TypeScript, and PostgreSQL**
