// Use environment variable for API URL
// Development: Set VITE_API_URL=http://localhost:3000 in .env.local
// Production: Set VITE_API_URL=https://api.intecomart.com in .env.production
// export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const API_URL = import.meta.env.VITE_API_URL || "https://api.intecomart.com";

// For production deployment, create a .env.production file with:
// VITE_API_URL=https://api.intecomart.com