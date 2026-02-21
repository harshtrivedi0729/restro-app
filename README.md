# Luxe Restaurant Platform

A premium, production-ready Restaurant Experience Platform built for India's high-end dining scene. This is a Gen-Z and wealthy-diner-focused luxury experience platform that can serve multiple restaurants, each with completely different looks, feels, and vibes, all powered by the same core system.

## 🎯 Features

### Core Capabilities
- **Multi-Tenant Restaurant System**: Each restaurant has unique branding, colors, fonts, and personality
- **Premium Menu Experience**: Rich dish pages with images, ingredients, stories, pairings, and nutritional info
- **Smart Table Booking**: AI-powered time suggestions, wait-time predictions, occasion-based booking
- **QR-Based Experience**: Table-specific mobile-first luxury experience (no app required)
- **Story & Legacy Module**: Restaurant timeline, founder story, chef journey, awards
- **Owner Dashboard**: Analytics, insights, booking management, best-selling dishes

### Restaurant Personality Engine
Each restaurant can be configured with:
- Brand vibe (Luxury, Romantic, Party, Calm, Artistic)
- Target audience
- Custom colors (primary, secondary, accent)
- Font families
- Animation intensity
- Dark mode preference

### Menu Features
- High-quality dish images
- Ingredients as icons
- Protein & calorie information
- Storytelling: why each dish is famous
- Best-seller badges
- Chef recommendations
- Drink/wine pairings
- Allergen information
- Upsell suggestions

### Booking System
- Person count selection
- Occasion-based booking (Date, Birthday, Anniversary, Business, Casual, Celebration)
- Seating preferences (Window, Outdoor, Private, Bar)
- Live slot visualization
- Approximate wait-time prediction
- AI suggestions for best booking time
- Pre-order food option
- Priority booking flag

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Shadcn/UI (Radix UI)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Image Optimization**: Cloudinary
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (Supabase recommended)
- Cloudinary account (for image optimization)
- Vercel account (for deployment)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/luxe_restaurants?schema=public"

# Supabase (optional, if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth (for future implementation)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Seed Sample Data

```bash
# Run the seed script
npx tsx scripts/seed.ts
```

This will create 4 sample restaurants with different vibes:
- **The Golden Spoon** (Luxury) - Mumbai
- **Moonlight Terrace** (Romantic) - Delhi
- **Electric Nights** (Party) - Bangalore
- **Canvas & Cuisine** (Artistic) - Kolkata

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── [slug]/            # Restaurant-specific pages
│   │   ├── page.tsx       # Restaurant homepage
│   │   ├── menu/          # Menu pages
│   │   ├── book/          # Booking page
│   │   └── booking/       # Booking confirmation
│   ├── qr/                # QR code experience
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── ui/                # Shadcn/UI components
│   ├── restaurant/        # Restaurant-specific components
│   └── booking/           # Booking components
├── lib/                   # Utilities
│   ├── prisma.ts          # Prisma client
│   ├── theme-engine.ts    # Restaurant theme system
│   ├── booking-ai.ts      # AI booking suggestions
│   └── utils.ts           # Helper functions
├── prisma/
│   └── schema.prisma      # Database schema
└── scripts/
    └── seed.ts            # Database seeding
```

## 🎨 Customizing Restaurant Themes

Each restaurant's theme is controlled by the `Restaurant` model in the database. You can customize:

- `vibe`: LUXURY, ROMANTIC, PARTY, CALM, ARTISTIC
- `primaryColor`: Main brand color (hex)
- `secondaryColor`: Secondary color (hex)
- `accentColor`: Accent color (hex)
- `fontFamily`: Custom font family
- `animationIntensity`: low, medium, high
- `darkModeDefault`: true/false

The theme engine automatically applies these settings to the entire restaurant experience.

## 📱 QR Code Experience

Each table has a unique QR code that links to:
- `/qr/[restaurant-slug]/[table-number]`

This provides a mobile-first experience with:
- Quick menu access
- Table booking
- Tonight's vibe
- Featured dishes
- Full restaurant experience link

## 🔐 Admin Dashboard

Access the admin dashboard at `/admin` to:
- View booking analytics
- See peak-time insights
- Track best-selling dishes
- Monitor cancellation rates
- View repeat customers
- Manage restaurants

## 🚢 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Database Setup

For production, use:
- **Supabase** (recommended for free tier)
- **Neon** (serverless PostgreSQL)
- **Railway** (easy PostgreSQL hosting)

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform.

## 📊 Database Schema

Key models:
- `Restaurant`: Restaurant information and branding
- `Menu`: Menu collections
- `MenuCategory`: Menu categories
- `Dish`: Individual dishes with full details
- `Booking`: Table reservations
- `Table`: Physical tables with QR codes
- `Story`: Restaurant stories and content
- `Analytics`: Booking and performance metrics

## 🎯 Future Enhancements

- Payment gateway integration
- Online ordering (for pre-orders)
- Customer reviews and ratings
- Loyalty program
- Email notifications
- SMS confirmations
- Multi-language support
- Advanced analytics dashboard
- Mobile app (React Native)

## 📝 License

This project is built as a production-ready SaaS platform. Customize and deploy as needed.

## 🤝 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for India's premium dining scene**

