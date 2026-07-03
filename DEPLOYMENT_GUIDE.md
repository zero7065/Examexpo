# ExamPadi AI — Deployment & Testing Guide

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+
- Git

### Setup
```bash
# 1. Clone repository
git clone <your-repo-url>
cd "jamb ai tutor"

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your API keys

# 4. Start dev server
npm run dev

# 5. Open browser
# Visit http://localhost:5173
```

---

## 📋 Environment Variables Setup

### Required Keys

#### 🔐 Firebase (for auth & database)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Copy credentials from **Project Settings → Web**
4. Fill in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

#### 🤖 AI Tutor (Gemini or Groq)
**Option A: Google Gemini (Recommended)**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create API key
3. Add to `.env`:
   ```
   VITE_GEMINI_API_KEY=your_gemini_key
   ```

**Option B: Groq**
1. Sign up at [Groq Console](https://console.groq.com/)
2. Create API key
3. Add to `.env`:
   ```
   VITE_GROQ_API_KEY=your_groq_key
   ```

#### 💳 Paystack (for payments)
1. Create account at [Paystack](https://paystack.com/)
2. Go to **Settings → API Keys**
3. Copy **Public Key** (starts with `pk_test_` or `pk_live_`)
4. Add to `.env`:
   ```
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   ```

---

## 🧪 Testing Checklist

### 1. Authentication Flow
```
( ) Sign up with email
( ) Verify email (if configured)
( ) Login with credentials
( ) Logout
( ) Forgot password
( ) Update profile
```

### 2. Practice Session
```
( ) Select exam type (JAMB/WAEC)
( ) Select subject(s)
( ) Select difficulty level
( ) Answer 5+ questions
( ) Verify correct/incorrect highlighting
( ) Check timer (if mock mode)
( ) View session summary
```

### 3. AI Tutor Features
```
( ) Free user: Can ask AI 5 times/day
( ) 5th AI message: Should trigger Pro upgrade modal
( ) Pro user: Can ask AI unlimited
( ) Explanations load and display correctly
( ) Explanation includes memory tips (if configured)
```

### 4. Payment Flow (Sandbox Testing)
```
( ) Navigate to /payment
( ) See 3 plan options (Free, Pro Monthly, Pro Yearly)
( ) Click "Pay ₦3,000" for Monthly Pro
( ) Paystack modal opens
( ) Use test card: 4111 1111 1111 1111
  - Expiry: Any future date (e.g., 12/28)
  - CVV: Any 3 digits (e.g., 123)
( ) Click "Authorize"
( ) See success message
( ) Verify user subscription in Firestore
( ) Verify redirect to /payment/success
```

### 5. Responsiveness
```
( ) Test on desktop (1920x1080)
( ) Test on tablet (768x1024)
( ) Test on mobile (375x667)
( ) Verify no horizontal scrolling
( ) Verify touch targets ≥44x44px
( ) Verify buttons/inputs easily tappable
( ) Test landscape orientation
```

### 6. Performance
```
( ) Page load time < 3 seconds
( ) Lazy-loaded pages load on demand
( ) No 404 errors in console
( ) No memory leaks (DevTools)
( ) Smooth scrolling
```

### 7. Accessibility
```
( ) Tab navigation works
( ) Screen reader detects headings
( ) Color contrast adequate (WCAG AA)
( ) Focus indicators visible
```

---

## 🏗️ Building for Production

### Build Locally
```bash
# Clean install (recommended)
rm -rf node_modules package-lock.json
npm install

# Lint check
npm run lint

# Production build
npm run build

# Preview build locally
npm run preview
```

### Verify Build Output
```bash
# Check dist folder
ls -la dist/

# Should contain:
# - index.html (entry point)
# - assets/ (JS bundles, CSS)
# - Other static files
```

### Build Success Criteria
- ✅ No errors in console
- ✅ No warnings about bundle size (or documented)
- ✅ `dist/` folder is < 5MB
- ✅ All pages load from production build

---

## 🌐 Deployment

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel link        # Connect repo
vercel env pull    # Get env vars
# Edit .env.local to set secrets
vercel deploy      # Deploy preview
vercel --prod      # Deploy to production
```

### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option 3: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init      # Configure
firebase deploy    # Deploy
```

### Set Environment Variables on Deployment Platform

**Vercel:**
1. Go to **Settings → Environment Variables**
2. Add all vars from `.env`
3. Redeploy

**Netlify:**
1. Go to **Site configuration → Build & deploy → Environment**
2. Add all vars
3. Trigger redeploy

**Firebase:**
1. Update `.firebaserc` with your project ID
2. Deploy with env vars set locally

---

## 📊 Question Bank Coverage

### Current Coverage
| Subject | Questions | Status |
|---------|-----------|--------|
| Use of English Language | ~15 | ✅ |
| Mathematics | ~20 | ✅ |
| Physics | ~15 | ✅ |
| Chemistry | ~15 | ✅ |
| Biology | ~15 | ✅ |
| Economics | ~15 | ✅ |
| Government | ~15 | ✅ |
| English | ~15 | ✅ |
| Further Mathematics | 0 | ❌ |
| Literature | 0 | ❌ |
| Geography | 0 | ❌ |
| History | 0 | ❌ |

### Add More Questions
```javascript
// In src/data/questionBank.js, add to QUESTION_BANK:
"Subject Name": [
  {
    id: "subj_2026_001",
    subject: "Subject Name",
    year: 2026,
    exam: "JAMB",
    topic: "Topic",
    difficulty: "medium",
    question: "Question text?",
    options: { A: "...", B: "...", C: "...", D: "..." },
    correctAnswer: "A",
    explanation: "Why A is correct...",
    hint: "Think about..."
  },
  // ... more questions
]
```

---

## 🐛 Troubleshooting

### Problem: `VITE_PAYSTACK_PUBLIC_KEY is missing`
**Solution:** Add key to `.env` and restart dev server

### Problem: AI Tutor not responding
**Solution:**
1. Check VITE_GEMINI_API_KEY or VITE_GROQ_API_KEY in `.env`
2. Verify API key is active and has quota
3. Check console for error messages

### Problem: Payment modal doesn't open
**Solution:**
1. Verify VITE_PAYSTACK_PUBLIC_KEY is correct
2. Check browser console for errors
3. Ensure domains are whitelisted in Paystack settings

### Problem: Questions not loading
**Solution:**
1. Check Firestore rules allow read
2. Verify questionBank.js has no syntax errors
3. Check browser console for import errors

### Problem: Mobile layout broken
**Solution:**
1. Verify `<meta name="viewport">` is in HTML
2. Test with DevTools mobile emulation
3. Check for fixed widths in styles (should be %)

---

## 📈 Performance Optimization

### Current Optimizations
- ✅ Route-based code splitting (lazy loading)
- ✅ Image optimization (Lucide icons)
- ✅ CSS purging (Tailwind)
- ✅ Gzip compression (Vite)

### Additional Steps
```bash
# Analyze bundle size
npm run build -- --mode analyze

# Monitor performance
# Use Chrome DevTools Lighthouse
```

---

## 🔒 Security Checklist

- ✅ Never commit `.env` (in `.gitignore`)
- ✅ Use environment variables for secrets
- ✅ Firebase rules restrict Firestore access
- ✅ Paystack keys are public (but restricted by domain)
- ✅ API keys rotated periodically
- ✅ No sensitive data in browser storage

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Check GitHub issues
3. Review console errors
4. Test in dev mode vs production
5. Contact team with full error logs

---

**Last Updated:** July 3, 2026
**Version:** 1.0.0
