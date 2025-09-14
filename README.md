# Multi-Tenant SaaS Notes Application

A secure, multi-tenant notes application built with Next.js and PostgreSQL, deployed on Vercel.

## Features

- Multi-tenancy with strict data isolation
- JWT-based authentication
- Role-based access control (Admin/Member)
- Subscription plans (Free/Pro) with feature gating
- CRUD operations for notes
- Responsive frontend

## Multi-Tenancy Approach

This application uses a **shared schema with tenant ID column** approach. All tenant data is stored in the same database tables but is strictly isolated using a `tenant_id` column. This approach provides:

1. **Good isolation**: Data is separated by tenant_id in queries
2. **Operational simplicity**: Single database to manage
3. **Cost efficiency**: No need for multiple database instances
4. **Scalability**: Can handle many tenants efficiently

## Database Schema

The application uses three main tables:

1. **tenants**: Stores tenant information and subscription plans
2. **users**: Stores user accounts with roles and tenant associations
3. **notes**: Stores notes with tenant and user associations

## Test Accounts

The following test accounts are available (all with password: `password`):

- Admin: `admin@acme.test` (Acme tenant)
- Member: `user@acme.test` (Acme tenant)
- Admin: `admin@globex.test` (Globex tenant)
- Member: `user@globex.test` (Globex tenant)

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro plan (Admin only)

## Deployment

The application is deployed on Vercel with the following environment variables:

- `JWT_SECRET`: Secret key for JWT token signing
- `POSTGRES_URL`: Connection string for PostgreSQL database

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `JWT_SECRET`: Any random string
   - `POSTGRES_URL`: Your PostgreSQL connection string
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Security Features

- Tenant data isolation enforced at the API level
- JWT-based authentication with expiration
- Role-based access control
- Password hashing (bcrypt)
- CORS enabled for API endpoints