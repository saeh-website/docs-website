# SAEH Documentation Website

A Next.js documentation platform with dual database architecture and role-based authentication.

## Features

- **Dual Database Architecture**: PostgreSQL for users/domains, MongoDB for documents
- **Role-based Authentication**: Editor, Site Admin, Doc Admin, Superadmin
- **Arabic RTL Support**: Full Arabic interface with Cairo font
- **Rich Text Editor**: Quill.js for document editing
- **Responsive Design**: Mobile-friendly interface

## Quick Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create `.env.local` file:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/saeh_docs?schema=public"
   MONGODB_URL="mongodb://localhost:27017/saeh_docs"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

3. **Set up databases**:
   ```bash
   # Generate Prisma clients
   npx prisma generate --schema=./prisma/schema.postgres.prisma
   npx prisma generate --schema=./prisma/schema.mongo.prisma
   
   # Push database schemas
   npx prisma db push --schema=./prisma/schema.postgres.prisma
   npx prisma db push --schema=./prisma/schema.mongo.prisma
   
   # Seed the database
   node scripts/seed.js
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```


## User Roles

- **Editor**: Can view and edit documents in their domain
- **Site Admin**: Can manage users and documents in their domain
- **Doc Admin**: Can manage all users, documents, and domains
- **Superadmin**: Full system access

## API Endpoints

- `GET/POST /api/docs` - Document management
- `GET/POST /api/users` - User management
- `GET/POST/DELETE /api/domains` - Domain management
- `GET/POST /api/auth/[...nextauth]` - Authentication

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Authentication**: NextAuth.js
- **Databases**: PostgreSQL + MongoDB
- **ORM**: Prisma
- **Editor**: Quill.js
- **UI**: Material UI Icons
- **Styling**: CSS with Arabic/RTL support
