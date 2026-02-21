# Quick Start Guide

Get up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Database

### Quick Option: Use Supabase (Free)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings > Database
4. Add to `.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Alternative: Local PostgreSQL

```env
DATABASE_URL="postgresql://user:password@localhost:5432/luxe_restaurants"
```

## 3. Set Up Environment

Create `.env` file:

```env
# Required
DATABASE_URL="your_database_url"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## 4. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema
npm run db:push

# Seed sample data
npm run db:seed
```

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What You Get

- **Homepage**: List of all restaurants
- **4 Sample Restaurants** with different vibes:
  - The Golden Spoon (Luxury) - `/the-golden-spoon`
  - Moonlight Terrace (Romantic) - `/moonlight-terrace`
  - Electric Nights (Party) - `/electric-nights`
  - Canvas & Cuisine (Artistic) - `/canvas-cuisine`
- **Admin Dashboard**: `/admin`
- **QR Experience**: `/qr/[restaurant-slug]/[table-number]`

## Next Steps

1. Customize restaurants in database
2. Add your own dishes and menus
3. Configure Cloudinary for image uploads
4. Deploy to Vercel (see DEPLOYMENT.md)

## Troubleshooting

**Database connection error?**
- Check DATABASE_URL is correct
- Ensure database is accessible
- Try `npx prisma studio` to verify connection

**Build errors?**
- Run `npm run db:generate` again
- Clear `.next` folder: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`

**Port already in use?**
- Change port: `npm run dev -- -p 3001`

## Need Help?

Check the main [README.md](./README.md) for detailed documentation.

