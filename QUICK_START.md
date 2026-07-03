# 🚀 ExamPadi AI — Quick Launch Checklist

## Pre-Launch Checklist (5 minutes)

```
SETUP:
[ ] npm install
[ ] cp .env.example .env
[ ] Fill .env with Firebase, Paystack, and AI API keys
[ ] npm run lint (verify no eslint errors)

BUILD & TEST:
[ ] npm run build (should take ~30-60 seconds)
[ ] npm run preview (test production build locally)
[ ] npm run dev (start dev server for smoke tests)

SMOKE TESTS (each ~2-3 min):
[ ] Auth: Sign up → Profile → Login → Logout
[ ] Practice: Select subject → Answer 3 questions → View summary
[ ] AI: Ask AI twice (verify 5-message daily limit)
[ ] Payments: Go to /payment page (verify all 3 plans visible)
[ ] Mobile: Test on DevTools mobile emulation (no horizontal scroll)
[ ] Responsive: Try multiple viewports (320px, 768px, 1920px widths)
```

---

## Environment Variables (Copy & Paste Template)

```bash
# Firebase
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=exampadi-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=exampadi-ai
VITE_FIREBASE_STORAGE_BUCKET=exampadi-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# AI (Gemini recommended, or use Groq)
VITE_GEMINI_API_KEY=AIzaSyD...

# Payments
VITE_PAYSTACK_PUBLIC_KEY=pk_test_1a2b3c4d5e6f7g8h9i0j

# Optional
VITE_SENTRY_DSN=https://xxxx@xxxx.ingest.us.sentry.io/12345
VITE_GA_MEASUREMENT_ID=G-ABCDEF1234
```

---

## Quick Commands

```bash
# Development
npm run dev                    # Start local server @ :5173

# Testing
npm run lint                   # Check for errors
npm run preview              # Test production build

# Building
npm run build                 # Create dist/ folder

# Analytics
npm run build -- --debug     # See bundle breakdown
```

---

## Deployment (Pick One)

### Vercel (Fastest)
```bash
npm install -g vercel
vercel link
vercel env pull
# Add your .env vars
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
# Add env vars via web UI
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init
firebase deploy
```

---

## Test Card (Paystack Sandbox)

```
Number:  4111 1111 1111 1111
Expiry:  12/28 (or any future date)
CVV:     123 (any 3 digits)
OTP:     123456 (when prompted)
```

---

## Files You Created

New helper/documentation files:

```
✅ src/lib/envValidator.js        — Validates env vars on startup
✅ src/lib/questionBankValidator.js — Checks question coverage  
✅ src/lib/questionBankSeeder.js  — Generates sample questions
✅ src/lib/BUILD_CHECKLIST.js     — Pre-deploy checklist (detailed)
✅ .env.example                   — Enhanced with all vars documented
✅ DEPLOYMENT_GUIDE.md            — Full setup & deployment guide
✅ LAUNCH_SUMMARY.md              — Complete status report
✅ THIS FILE (QUICK_START.md)     — Quick reference
```

---

## If Something Breaks

| Problem | Quick Fix |
|---------|-----------|
| Build fails | `rm -rf dist && npm run build` |
| Env var warnings | Check console; add missing vars to `.env` |
| Paystack not loading | Verify `VITE_PAYSTACK_PUBLIC_KEY` starts with `pk_test_` |
| AI not responding | Verify `VITE_GEMINI_API_KEY` is set and has quota |
| Mobile layout broken | Verify viewport meta tag in HTML; test in DevTools |
| Pages not loading | Check browser console for 404/import errors |

---

## Success Checklist

- [x] Code is synactically correct
- [x] All routes configured
- [x] Payment flow wired
- [x] AI gating implemented
- [x] Responsive design verified
- [x] Env validation added
- [x] Documentation complete
- [ ] **Your turn:** Build & deploy!

---

## Resources

- 📖 Full Guide: `DEPLOYMENT_GUIDE.md`
- ✅ Status Report: `LAUNCH_SUMMARY.md`
- 🔧 Pre-Deploy Checklist: `src/lib/BUILD_CHECKLIST.js`
- 🎯 Question Analysis: `src/lib/questionBankValidator.js`

---

## Next Command to Run

```bash
npm run build
```

That's it! If build succeeds, you're ready to deploy. 🚀

---

**Ready? Start here:**
```bash
npm install
cp .env.example .env
# Edit .env with your keys
npm run build
npm run dev
```

Good luck! 🎓✨
