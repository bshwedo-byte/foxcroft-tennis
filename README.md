# Foxcroft Hills Tennis Team App

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon key
- `VITE_VAPID_PUBLIC_KEY` — generated VAPID public key (for push notifications)

### 3. Set up the database
Run the contents of `supabase/schema.sql` in your Supabase SQL Editor
(Supabase Dashboard → SQL Editor → New Query → paste and run)

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Add environment variables in Vercel project settings
4. Deploy — done!

## Push Notifications Setup

### Generate VAPID keys
```bash
npx web-push generate-vapid-keys
```
Copy the public key to `.env` as `VITE_VAPID_PUBLIC_KEY`

### Supabase Edge Function
Set these secrets in your Supabase project:
```bash
supabase secrets set VAPID_PUBLIC_KEY=your_public_key
supabase secrets set VAPID_PRIVATE_KEY=your_private_key
```

Then deploy the function:
```bash
supabase functions deploy send-push
```

## Adding Players
As admin, use the Admin tab → Add Player to create accounts.
Players receive a password reset email to set their own password.
# foxcroft-tennis
# foxcroft-tennis
