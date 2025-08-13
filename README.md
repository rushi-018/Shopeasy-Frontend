# Shopeasy Frontend

A React + Vite single-page app for product discovery, price comparison, and real-time scraped listings. Pairs with the Shopeasy Backend for APIs and scraping.

Links
- Repo: https://github.com/rushi-018/Shopeasy-Frontend
- Backend repo: https://github.com/rushi-018/shopeasy-Backend

## Tech
- React 18, React Router 6, Redux Toolkit
- Axios, TailwindCSS
- Vite

## Project structure
- `src/components/` UI components
- `src/pages/` routed pages
- `src/services/` API clients (axios instance, price comparison, web scraper, etc.)
- `src/config/api.js` API base URL selection
- `src/store/` Redux store and slices

## Prerequisites
- Node.js 18+ and npm

## Setup
```bash
# from this folder
npm install
npm run dev
```
Vite dev server runs on http://localhost:5173.

By default, the frontend uses `src/config/api.js` to set the API base URL:
- Development: `http://localhost:5000/api`
- Production: a Vercel backend URL hard-coded in `src/config/api.js`

If you prefer env control, create `.env` or `.env.production` with:
```
VITE_API_URL=https://your-backend.vercel.app/api
```
and adjust `src/config/api.js` to read `import.meta.env.VITE_API_URL` when set.

## Scripts
- `npm run dev` start dev server
- `npm run build` production build to `dist/`
- `npm run preview` preview the production build
- `npm run lint` lint the project

## Pages of interest
- `/real-products` Real-time products page powered by backend scraper endpoints
- `/` Home, popular items, etc.

## Deployment (Vercel)
- Create a dedicated Vercel project for the frontend (do not mix with backend).
- Framework preset: Vite
- Build command: `vite build`
- Output directory: `dist`
- Optionally set `VITE_API_URL` in Environment Variables to point to your backend.

## Troubleshooting
- 401/CORS in production: ensure your backend project is a separate Vercel project and that backend Deployment Protection is disabled (see backend README).
- Network errors in `/real-products`: verify DevTools log "API Base URL" matches your backend and that `/api/scraper/status` returns JSON.

## License
MIT
