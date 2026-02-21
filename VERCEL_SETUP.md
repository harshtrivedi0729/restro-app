# Vercel Deployment - Database Seeding Instructions

## After Deploying to Vercel

Your app is now live, but you need to seed the database with restaurant data. Follow these steps:

### Option 1: Using Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Pull environment variables from Vercel
vercel env pull .env.production.local

# 3. Seed the database
DATABASE_URL="$(grep DATABASE_URL .env.production.local | cut -d '=' -f2-)" npm run db:seed

# 4. Clean up
rm .env.production.local
```

### Option 2: Manual Setup

```bash
# 1. Set your Vercel database URL
export DATABASE_URL="postgresql://postgres:Harshtrivedi@db.fjmhximlxptesggtfpoy.supabase.co:5432/postgres"

# 2. Push schema
npx prisma db push

# 3. Seed the database
npm run db:seed
```

### Option 3: Using Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project
3. Go to SQL Editor
4. Create the tables manually or run the migration file from `prisma/migrations/`

## Verify Everything Works

After seeding, visit your Vercel app URL and you should see:

✅ **Homepage** - Shows 4 restaurants
- The Golden Spoon (Luxury)
- Moonlight Terrace (Romantic)
- Electric Nights (Party)
- Canvas & Cuisine (Artistic)

✅ **Restaurant Pages** - Click on any restaurant to see:
- Menu with dishes
- Booking form
- Feedback section
- Admin dashboard

✅ **Admin Dashboard** - Access at `/admin` to see:
- All bookings
- Feedback
- Restaurant management

## Troubleshooting

**If restaurants are not showing:**

1. Check environment variables in Vercel are set correctly
2. Run the seed command manually as shown above
3. Verify database connection works
4. Check Supabase dashboard to confirm data was inserted

**If you get connection errors:**

1. Ensure DATABASE_URL includes the correct credentials
2. Check Supabase network access settings
3. Verify Vercel can reach your database from their IP

## Support

For more help, check:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- GitHub repository: [harshtrivedi0729/restro-app](https://github.com/harshtrivedi0729/restro-app)
