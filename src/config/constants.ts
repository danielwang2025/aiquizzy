
/**
 * Configuration constants for the application
 */

// Stripe price IDs for subscription plans
export const STRIPE_PRICE_IDS = {
  PREMIUM: 'price_premium_monthly',
  BUSINESS: 'price_business_monthly'
};

// API rate limits
export const API_RATE_LIMITS = {
  FREE: 5,         // requests per minute for free users
  REGISTERED: 30,  // requests per minute for registered users
  PREMIUM: 100     // requests per minute for premium users
};

// Quiz generation limits
export const QUIZ_LIMITS = {
  FREE: 5,        // questions per month for free users
  REGISTERED: 50, // questions per month for registered users
  PREMIUM: 1000   // questions per month for premium users
};

// Maximum values for quiz customization
export const MAX_VALUES = {
  QUESTIONS: 50,
  OPTIONS: 6,
  TEXT_LENGTH: 2000
};
