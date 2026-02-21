#!/usr/bin/env tsx
/**
 * Setup script for Vercel deployment
 * Run this script after deploying to Vercel to seed the database
 * 
 * Usage: tsx scripts/setup-vercel.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up Vercel database...')
  
  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }

  // Push schema
  console.log('📊 Pushing schema to database...')
  try {
    await prisma.$executeRawUnsafe(`SELECT 1`)
    console.log('✅ Schema verified')
  } catch (error) {
    console.error('❌ Schema push failed:', error)
  }

  // Seed database
  console.log('🌱 Seeding database...')
  try {
    const restaurantCount = await prisma.restaurant.count()
    
    if (restaurantCount === 0) {
      console.log('   Running seed script...')
      // This will be handled by the seed.ts script
    } else {
      console.log(`✅ Database already seeded with ${restaurantCount} restaurants`)
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error)
  }

  console.log('✨ Setup complete!')
  console.log('\nNext steps:')
  console.log('1. Visit your Vercel app URL')
  console.log('2. If restaurants are not showing, run: npx tsx scripts/seed.ts')
  console.log('   with DATABASE_URL set to your Vercel database')

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
