# Bluelite - Luxury Travel Platform

A curated selection of destinations crafted for absolute comfort and privacy.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript + JavaScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **Animations**: Motion (Framer Motion successor)
- **Web Scraping**: Puppeteer + Chromium (for Instagram)
- **Deployment**: Vercel

## 📁 Project Structure

```
bluelite-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   └── scrape-instagram/
│   │   │       └── route.js   # Instagram scraping endpoint
│   │   ├── globals.css        # Global styles + Tailwind
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── Admin.jsx          # Admin panel
│   │   ├── VenueShowcase.jsx  # Venue display
│   │   ├── VenueDetail.jsx    # Individual venue
│   │   ├── GateScreen.jsx     # Entry screen
│   │   ├── ConciergeModal.jsx # Contact form
│   │   ├── CustomMap.jsx      # Google Maps integration
│   │   ├── CountUp.jsx        # Animated counters
│   │   ├── Badge.jsx          # UI badge component
│   │   └── Noise.jsx          # Grain effect
│   ├── hooks/
│   │   └── usePortfolio.js    # Supabase data hook
│   ├── lib/
│   │   └── supabase.js        # Supabase client config
│   └── assets/
│       └── portfolio.json     # Fallback data
├── public/                    # Static assets
│   ├── hero_bw.mp4           # Hero video
│   ├── orizontal_bw.mp4      # Secondary video
│   └── venues/               # Venue images
└── .env.local                # Environment variables (not in git)
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup

Create a `portfolio` table in your Supabase project:

```sql
-- Create the portfolio table
CREATE TABLE portfolio (
  id INT PRIMARY KEY,
  data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Create policy for read access (public)
CREATE POLICY "Enable read access for all users" ON portfolio
FOR SELECT USING (true);

-- Create policy for write access (admin only)
CREATE POLICY "Enable all operations for anon users" ON portfolio
FOR ALL USING (true) WITH CHECK (true);
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎨 Features

### Public Website
- **Gate Screen**: Elegant entry experience with user tracking
- **Destination Showcase**: Curated luxury destinations
- **Venue Categories**: Nightclubs, Beach Clubs, Restaurants, Hotels, Festive
- **Concierge Services**: Villa Rental, Private Jet, Yacht Charter, Supercar Rental, Private Transfer, Legal Counsel
- **Interactive Maps**: Google Maps integration for venues
- **Responsive Design**: Mobile-first, optimized for all devices

### Admin Panel
- **Access**: Navigate to `/#/admin` (bypasses gate screen)
- **Destination Management**: Add, edit, delete, hide, reorder destinations
- **Venue Management**: Full CRUD for venues with drag & drop
- **Tier System**: Standard, Featured, Premium venues
- **Instagram Integration**: Automatic image scraping from Instagram profiles
- **Real-time Updates**: Changes saved directly to Supabase
- **Validation**: Mandatory fields with visual indicators
- **iPad Optimized**: Collapsible sidebar, large touch targets

### Instagram Scraping
- **Endpoint**: `/api/scrape-instagram` (POST)
- **Automatic**: Scrapes up to 6 images from Instagram profiles
- **Smart Cleanup**: Removes old images after successful scraping
- **Venue Integration**: Updates venue images in database

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Build the Next.js app
- Configure serverless functions
- Enable edge caching
- Set up automatic deployments

## 🎯 Key Pages

- `/` - Homepage with hero video and destination list
- `/#/destination/[name]` - Individual destination page
- `/#/destination/[dest]/venue/[category]/[venue]` - Venue detail page
- `/#/admin` - Admin panel (password-protected in production)

## 🔒 Security

- Row Level Security (RLS) enabled on Supabase
- X-Frame-Options and X-Content-Type-Options headers
- Environment variables for sensitive data
- No API keys in client-side code

## 🐛 Troubleshooting

### Instagram Scraping Not Working
- Check Instagram profile is public
- Verify Puppeteer/Chromium are installed correctly
- Check Vercel function logs for errors

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is active
- Confirm RLS policies are configured

### Build Errors
- Run `npm install` to update dependencies
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version (should be 18+)

## 📝 Notes

- **Hash-based Routing**: Uses `#` for SPA navigation (no page reloads)
- **Client Components**: Most components use `'use client'` directive
- **Fallback Data**: Local JSON used if Supabase unavailable
- **Mobile Support**: Gate screen warning on Admin panel

## 🔄 Migration from Vite

This project was successfully migrated from Vite to Next.js to enable:
- ✅ Working API routes for Instagram scraping
- ✅ Better performance with server-side rendering
- ✅ Simplified Vercel deployment
- ✅ Zero configuration needed

## 📄 License

Private - All rights reserved

## 👨‍💻 Development

Built with ❤️ by Bluelite Team

---

**Bluelite** - Discretion. Precision. Elegance.