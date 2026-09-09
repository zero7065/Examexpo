# ExamPadi AI — Quick Start

## Setup (2 minutes)

```bash
npm install
cp .env.example .env   # Fill in your keys
npm run dev
```

## Environment Variables

```bash
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Groq AI
VITE_GROQ_API_KEY=

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=
VITE_PAYSTACK_SECRET_KEY=
```

## Smoke Tests

1. **Auth:** Sign up → Select exam/subjects → Dashboard loads
2. **Practice:** Select subject → Answer 3 questions → View summary
3. **AI Tutor:** Ask a question → Get explanation
4. **Payments:** /payment page shows 3 plans
5. **Admin:** Login as jadai7065@gmail.com → Redirects to /admin
6. **Mobile:** DevTools responsive mode — no horizontal scroll

## Deploy to Vercel

1. Push to GitHub
2. Import at vercel.com/new
3. Add all env vars in Settings → Environment Variables
4. Deploy

**Important:** Vercel does NOT read `.env` files. You must set env vars in the Vercel dashboard.

## Paystack Test Card

```
Number:  4111 1111 1111 1111
Expiry:  12/28
CVV:     123
OTP:     123456
```

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Check errors
```

## Admin

- Email: `jadai7065@gmail.com`
- Password: `Admin1234`
- Auto-redirects to `/admin` on login
