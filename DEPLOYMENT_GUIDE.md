# ExamPadi AI — Deployment Guide

## Prerequisites

- Node.js 18+
- npm 9+
- Git

## Local Setup

```bash
git clone <your-repo-url>
cd "jamb ai tutor"
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
# Visit http://localhost:5173
```

## Environment Variables

### Required

```bash
# Firebase (Auth + Firestore)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Groq AI Tutor
VITE_GROQ_API_KEY=

# Paystack Payments
VITE_PAYSTACK_PUBLIC_KEY=
VITE_PAYSTACK_SECRET_KEY=
```

### Optional

```bash
# Admin UIDs (auto-seeds jadai7065@gmail.com by default)
VITE_ADMIN_UIDS=
```

### Setup Steps

1. **Firebase:** Console → Project Settings → Web app → Copy config
2. **Firebase Auth:** Enable Email/Password + Google sign-in methods
3. **Firebase Firestore:** Create database in `eur3` region
4. **Firebase Rules:** `allow read, write: if request.auth != null;`
5. **Groq:** Sign up at console.groq.com → Create API key
6. **Paystack:** Dashboard → Settings → API keys → Copy public + secret keys

## Deploy to Vercel

```bash
npm install -g vercel
vercel link
vercel --prod
```

**Set env vars in Vercel dashboard:**
1. Go to project → Settings → Environment Variables
2. Add all variables from `.env`
3. Redeploy

**Vercel does NOT read `.env` files** — env vars must be set in the dashboard.

## Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
# Add env vars via web UI
```

## Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## Build

```bash
npm run build        # Production build to dist/
npm run preview      # Preview build locally
npm run lint         # Check for errors
```

## Testing Checklist

### Auth
- [ ] Sign up with email/password
- [ ] Sign in with Google
- [ ] Login with credentials
- [ ] Logout
- [ ] Forgot password

### Onboarding
- [ ] Select exam type
- [ ] Select 3+ subjects
- [ ] Set target score (JAMB) or grade (WAEC/NECO/NABTEB)
- [ ] Redirects to dashboard

### Practice
- [ ] Select subjects
- [ ] Answer questions
- [ ] View explanations (Pro or within free limit)
- [ ] Session summary saves to Firestore
- [ ] XP and streak update

### AI Tutor
- [ ] Ask a question
- [ ] Get AI explanation
- [ ] Free users limited to daily cap
- [ ] Pro users unlimited

### Payments
- [ ] View plans on /payment
- [ ] Paystack modal opens
- [ ] Test card: 4111 1111 1111 1111
- [ ] Subscription activates in Firestore
- [ ] Pro features unlock

### Admin
- [ ] Auto-redirect to /admin for admin users
- [ ] User list loads from Firestore
- [ ] Assign Pro to users
- [ ] Question management

### Responsive
- [ ] Desktop: sidebar navigation works
- [ ] Mobile: bottom nav works
- [ ] No horizontal scroll
- [ ] Touch targets >= 44x44px

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails | `rm -rf dist node_modules && npm install && npm run build` |
| AI not responding | Check `VITE_GROQ_API_KEY` in `.env` and Vercel dashboard |
| Payment not working | Verify `VITE_PAYSTACK_PUBLIC_KEY` starts with `pk_live_` or `pk_test_` |
| Admin not redirecting | Ensure email is `jadai7065@gmail.com` or UID is in `VITE_ADMIN_UIDS` |
| Onboarding loop | Check Firestore `users/{uid}` has `onboarded: true` |
| Navbar not showing | Ensure user is logged in; navbar hides for guests |
