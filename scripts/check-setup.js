#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking SAEH Documentation Website setup...\n');

const checks = [
  {
    name: 'Node.js version',
    check: () => {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      return major >= 16;
    },
    message: 'Node.js 16+ required'
  },
  {
    name: '.env.local file',
    check: () => fs.existsSync(path.join(process.cwd(), '.env.local')),
    message: 'Create .env.local with database URLs'
  },
  {
    name: 'package.json',
    check: () => fs.existsSync(path.join(process.cwd(), 'package.json')),
    message: 'package.json should exist'
  },
  {
    name: 'node_modules',
    check: () => fs.existsSync(path.join(process.cwd(), 'node_modules')),
    message: 'Run: npm install'
  },
  {
    name: 'Prisma Postgres schema',
    check: () => fs.existsSync(path.join(process.cwd(), 'prisma', 'schema.postgres.prisma')),
    message: 'Prisma PostgreSQL schema missing'
  },
  {
    name: 'Prisma MongoDB schema',
    check: () => fs.existsSync(path.join(process.cwd(), 'prisma', 'schema.mongo.prisma')),
    message: 'Prisma MongoDB schema missing'
  },
  {
    name: 'Public directory',
    check: () => fs.existsSync(path.join(process.cwd(), 'public')),
    message: 'Public directory missing'
  },
  {
    name: 'Seed script',
    check: () => fs.existsSync(path.join(process.cwd(), 'scripts', 'seed.js')),
    message: 'Seed script missing'
  }
];

let allPassed = true;

checks.forEach(({ name, check, message }) => {
  const passed = check();
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (!passed) {
    console.log(`   → ${message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready to setup.');
  console.log('\nNext steps:');
  console.log('1. Ensure your databases (PostgreSQL & MongoDB) are running');
  console.log('2. Update .env.local with your actual database URLs');
  console.log('3. Run: node scripts/setup.js');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}
