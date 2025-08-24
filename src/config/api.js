// Central API base URL for the frontend
// Use a Vite env var in all environments, with a localhost fallback for dev.
// Set VITE_API_URL in Vercel (e.g., https://your-backend.vercel.app/api)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (import.meta.env.DEV) {
  // Helpful during local dev
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 Environment:', import.meta.env.MODE);
}