# ⛏️ Build Idea Forge

A Minecraft build inspiration generator for young players. Generates themed build ideas with mobs, features, and challenges — plus an AI-powered step-by-step blueprint.

## Setup

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Add your API key
Edit the `.env` file in the root:
```
ANTHROPIC_API_KEY=your_key_here
```
Get a key at https://console.anthropic.com

### 3. Run the app
```bash
npm run dev
```

This starts both the Express server (port 3001) and the Vite dev server (port 5173).

Open http://localhost:5173 in your browser.

## Project Structure

```
minecraft-forge/
├── .env                  # Your Anthropic API key (never commit this!)
├── package.json          # Root scripts
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx       # Main component
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   └── vite.config.js    # Proxies /api → localhost:3001
└── server/
    ├── index.js          # Express server + /api/blueprint route
    └── package.json
```

## Deploying

**Vercel / Netlify** — build the client with `cd client && npm run build`, deploy the `dist/` folder, and host the server separately (e.g. Railway, Render, or a VPS).

Or use a full-stack platform like **Railway** to deploy both together.
