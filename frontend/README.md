# SSOJ Frontend (Vite + React + TypeScript)

Minimal frontend for SSOJ for teaching/demo purposes.

## Quick start

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run dev server

```bash
npm run dev
```

Notes:
- The dev server proxies `/api` to `http://localhost:8080` by default. Use `VITE_API_BASE_URL` env var to change.
- Auth uses server-side HttpSession (cookie). Axios is configured to send credentials.
- This is intentionally minimal; you can swap textarea with Monaco later.
