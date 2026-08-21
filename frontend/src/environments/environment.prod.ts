/**
 * Production environment configuration.
 *
 * VITE_API_URL is injected at Vercel build time via Environment Variables
 * in the Vercel dashboard. Falls back to localhost for local testing.
 *
 * In Vercel: set VITE_API_URL = https://your-backend.up.railway.app/api
 */
export const environment = {
  production: true,
  apiUrl: (window as any).__env?.apiUrl || 'https://fintrack-backend.up.railway.app/api'
};
