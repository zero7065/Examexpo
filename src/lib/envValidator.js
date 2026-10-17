/**
 * Environment Validation & Startup Checks
 * Verifies all required env vars and logs helpful warnings during app bootstrap
 */

const REQUIRED_ENVS = {
  VITE_FIREBASE_API_KEY: { required: false, desc: 'Firebase API Key for auth/database' },
  VITE_FIREBASE_AUTH_DOMAIN: { required: false, desc: 'Firebase auth domain' },
  VITE_FIREBASE_PROJECT_ID: { required: false, desc: 'Firebase project ID' },
  VITE_PAYSTACK_PUBLIC_KEY: { required: false, desc: 'Paystack public sandbox/live key for payments' },
  VITE_SENTRY_DSN: { required: false, desc: 'Sentry DSN for error tracking' },
  VITE_GA_MEASUREMENT_ID: { required: false, desc: 'Google Analytics measurement ID' },
};

const FEATURE_FLAGS = {
  // AI runs through our server proxy (api/ai.js), which holds GROQ_API_KEY
  // server-side. Nothing client-side to check, so the tutor is always on.
  AI_TUTOR: [],
  PAYMENTS: ['VITE_PAYSTACK_PUBLIC_KEY'],
  ERROR_TRACKING: ['VITE_SENTRY_DSN'],
  ANALYTICS: ['VITE_GA_MEASUREMENT_ID'],
};

// Static lookup — NEVER read import.meta.env with a dynamic key: Vite cannot
// replace that expression, so it bundles the ENTIRE env object (secrets and
// all) into the public JS. Add each var here explicitly instead.
const ENV_VALUES = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID,
};

export function validateEnvironment() {
  const warnings = [];
  const missing = [];
  const configured = {};

  for (const [key, meta] of Object.entries(REQUIRED_ENVS)) {
    const value = ENV_VALUES[key];
    if (!value) {
      missing.push({ key, ...meta });
      if (meta.required) {
        warnings.push(`❌ CRITICAL: ${key} is missing! ${meta.desc}`);
      } else {
        warnings.push(`⚠️  Optional: ${key} not set. ${meta.desc}`);
      }
    } else {
      configured[key] = true;
    }
  }

  // Feature availability
  const features = {};
  for (const [feature, envKeys] of Object.entries(FEATURE_FLAGS)) {
    // Empty list = no client-side requirement (always available).
    features[feature] = envKeys.length === 0 || envKeys.some(key => ENV_VALUES[key]);
  }

  return {
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
    allConfigured: missing.length === 0,
    configured,
    missing,
    features,
    warnings,
  };
}

export function logEnvValidation() {
  const validation = validateEnvironment();

  if (import.meta.env.DEV) {
    console.group('🔧 ExamPadi Environment Validation');
    
    console.log(`Environment: ${validation.isDevelopment ? 'Development' : 'Production'}`);
    console.log(`Status: ${validation.allConfigured ? '✅ All required vars set' : '⚠️  Some vars missing'}`);
    
    if (validation.warnings.length > 0) {
      console.group('⚠️  Warnings & Missing Configs');
      validation.warnings.forEach(w => console.warn(w));
      console.groupEnd();
    }

    console.group('🎯 Feature Status');
    Object.entries(validation.features).forEach(([feature, enabled]) => {
      console.log(`${feature}: ${enabled ? '✅ Enabled' : '❌ Disabled'}`);
    });
    console.groupEnd();

    console.groupEnd();
  }

  return validation;
}

export function checkFeature(featureName) {
  const validation = validateEnvironment();
  const isEnabled = validation.features[featureName];
  
  if (!isEnabled && import.meta.env.DEV) {
    const requiredEnvs = FEATURE_FLAGS[featureName] || [];
    console.warn(
      `⚠️  "${featureName}" feature is disabled.\n` +
      `Required env vars: ${requiredEnvs.join(', ')}\n` +
      `Please add them to your .env file for this feature to work.`
    );
  }

  return isEnabled;
}

export function getFeatureStatus() {
  const validation = validateEnvironment();
  return {
    aiTutorEnabled: validation.features.AI_TUTOR,
    paymentsEnabled: validation.features.PAYMENTS,
    errorTrackingEnabled: validation.features.ERROR_TRACKING,
    analyticsEnabled: validation.features.ANALYTICS,
  };
}

// Usage: Import this in src/main.jsx and call logEnvValidation() during app bootstrap
export default {
  validateEnvironment,
  logEnvValidation,
  checkFeature,
  getFeatureStatus,
};
