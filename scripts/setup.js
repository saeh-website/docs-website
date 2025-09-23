#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up SAEH Documentation Website...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please create .env.local with your database URLs:');
  console.log(`
DATABASE_URL="postgresql://username:password@localhost:5432/saeh_docs?schema=public"
MONGODB_URL="mongodb://localhost:27017/saeh_docs"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-this-in-production"
  `);
  process.exit(1);
}

console.log('✅ Found .env.local file');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Generate Prisma clients
  console.log('🔧 Generating Prisma clients...');
  execSync('npx prisma generate --schema=./prisma/schema.postgres.prisma', { stdio: 'inherit' });
  execSync('npx prisma generate --schema=./prisma/schema.mongo.prisma', { stdio: 'inherit' });
  
  // Push database schemas
  console.log('🗄️ Setting up database schemas...');
  execSync('npx prisma db push --schema=./prisma/schema.postgres.prisma', { stdio: 'inherit' });
  execSync('npx prisma db push --schema=./prisma/schema.mongo.prisma', { stdio: 'inherit' });
  
  // Seed the database
  console.log('🌱 Seeding database with default data...');
  execSync('node scripts/seed.js', { stdio: 'inherit' });
  
  console.log('\n🎉 Setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:3000');
  console.log('3. Login with:');
  console.log('   - Superadmin: superadmin / admin123');
  console.log('   - Site Admin: siteadmin1 / siteadmin123');
  console.log('   - Editor: editor1 / editor123');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
