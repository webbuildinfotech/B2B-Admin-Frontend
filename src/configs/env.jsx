// Use environment variable for API URL
// In development we use /api so Vite proxy forwards to backend (avoids connection limit when Admin + Vendor Web run together)
// Production: Set VITE_API_URL=https://api.intecomart.com in .env.production
export const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || "https://api.intecomart.com");

// For production deployment, create a .env.production file with:
// VITE_API_URL=https://api.intecomart.com