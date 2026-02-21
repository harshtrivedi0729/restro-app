# Deployment Guide

This guide will help you deploy the Luxe Restaurant Platform to production.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Supabase, Neon, or Railway)
- Cloudinary account (for image optimization)

## Step 1: Database Setup

### Option A: Supabase (Recommended for Free Tier)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (URI format)
5. Use this as your `DATABASE_URL`

### Option B: Neon (Serverless PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string
4. Use this as your `DATABASE_URL`

### Option C: Railway

1. Go to [railway.app](https://railway.app) and create an account
2. Create a new PostgreSQL database
3. Copy the connection string
4. Use this as your `DATABASE_URL`

## Step 2: Push Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to production database
DATABASE_URL="your_production_db_url" npx prisma db push

# Seed initial data (optional)
DATABASE_URL="your_production_db_url" npm run db:seed
```

## Step 3: Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) and create an account
2. Go to Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. These will be your environment variables

## Step 4: Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## Step 5: Environment Variables

Add these environment variables in Vercel:

```
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Optional (if using Supabase):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 6: Post-Deployment

After deployment:

1. Run database migrations:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

2. Seed sample data (optional):
   ```bash
   npm run db:seed
   ```

3. Access your admin dashboard:
   - Go to `https://your-domain.vercel.app/admin`

## Step 7: Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if your database allows connections from Vercel IPs
- For Supabase, ensure connection pooling is enabled

### Build Errors

- Check that all environment variables are set
- Verify Prisma schema is correct
- Check build logs in Vercel dashboard

### Image Upload Issues

- Verify Cloudinary credentials
- Check Cloudinary upload settings
- Ensure CORS is configured correctly

## Monitoring

- Use Vercel Analytics (free tier available)
- Set up error tracking (Sentry recommended)
- Monitor database performance
- Track API usage

## Scaling Considerations

- Use connection pooling for database (Supabase/Neon have this built-in)
- Enable Vercel Edge Caching for static assets
- Consider CDN for images (Cloudinary provides this)
- Monitor API rate limits
- Set up database backups

## Security Checklist

- [ ] All environment variables are set
- [ ] Database credentials are secure
- [ ] API keys are not exposed in client-side code
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented (future enhancement)
- [ ] Authentication is set up (future enhancement)

## Support

For deployment issues, check:
- Vercel documentation
- Prisma documentation
- Next.js documentation
- Your database provider's documentation

