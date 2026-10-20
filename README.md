# Nitish Kumar — Portfolio

## Development

1. Install dependencies: `npm run install:all`
2. Copy `server/.env.example` to `server/.env` and add SMTP credentials.
3. In one terminal run `npm run dev`; in another run `npm run server`.

The portfolio runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. The contact form safely falls back to the displayed email when mail delivery is unavailable.

## Production

Run `npm run build` for the Vite client. Deploy `client` to Vercel, set `VITE_API_URL` to the deployed API URL, and redeploy. Deploy `server` to Render with build command `npm install`, start command `npm start`, and the values from `server/.env.example`. Set `CLIENT_ORIGIN` to the exact Vercel domain (or a comma-separated allowlist).

The actual portrait and résumé are in `client/public/images/nitish-portrait.jpg` and `client/public/Nitish_Kumar.pdf`.
