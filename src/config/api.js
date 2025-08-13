// // API Configuration
// const getApiUrl = () => {
//   // Production URLs - always use the latest backend
//   if (import.meta.env.PROD) {
//     // List of backend URLs in order of preference
//     const backendUrls = [
//       'https://shopeasy-ia457ug1t-rushirajs-projects-9e4285a6.vercel.app/api',
//       'https://shopeasy-4oui928ge-rushirajs-projects-9e4285a6.vercel.app/api',
//       'https://shopeasy-30nju76l9-rushirajs-projects-9e4285a6.vercel.app/api',
//       'https://shopeasy-mft5yajnr-rushirajs-projects-9e4285a6.vercel.app/api'
//     ];
    
//     // Use the first one (latest)
//     return backendUrls[0];
//   }
  
//   // Check for environment variable
//   if (import.meta.env.VITE_API_URL) {
//     return import.meta.env.VITE_API_URL;
//   }
  
//   // Development fallback
//   return 'http://localhost:5000/api';
// };

// export const API_BASE_URL = getApiUrl();

// console.log('🔧 API Base URL:', API_BASE_URL);
// console.log('🔧 Environment:', import.meta.env.MODE);
// console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL); 
//simple version
// API Configuration - SIMPLE AND PERMANENT
// API Configuration - ENVIRONMENT VARIABLE ONLY
// API Configuration - PERMANENT BACKEND
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    // Use the NEW backend URL (latest deploy with CORS fixes)
    return 'https://shopeasy-backend-gh9th2333-rushirajs-projects-9e4285a6.vercel.app/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiUrl();
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', import.meta.env.MODE);