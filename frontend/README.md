# Auth Service — Frontend

React + TypeScript + Vite client for the Go auth service in the repo root.

**Stack:** React 19, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS.

## Running locally

1. Start Postgres and the Go API from the repo root (`go run ./cmd/server`). It listens on `:8080`.
2. Start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:5173.

In development, Vite proxies `/api` to `http://localhost:8080` (see `vite.config.ts`), so the browser only ever talks to one origin.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Serve the production build locally |

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | API base URL. Set it when the frontend is hosted on a different origin than the API, and add that origin to the API's `CORS_ALLOWED_ORIGINS`. |

Copy `.env.example` to `.env.local` to override it. `.env.local` is git-ignored.

## Pages

| Route | Access | API |
|---|---|---|
| `/login`, `/register` | Guests | `POST /auth/login`, `POST /auth/register` |
| `/forgot-password` | Anyone | `POST /auth/forgot-password` |
| `/reset-password/:token` | Anyone (opened from the emailed link) | `POST /auth/reset-password` |
| `/profile` | Signed in | `GET /me`, `PATCH /me` |
| `/admin/users` | Admins | `GET /admin/users`, `DELETE /admin/users/:id` |

## Notes

- **Session:** the API returns a 24h JWT in the login response body. It is stored in `localStorage` and sent as `Authorization: Bearer …`. There is no refresh or logout endpoint, so logging out only clears the token on the client. Moving to an httpOnly cookie would protect the token from XSS. That would require changes on the API side.
- **Password reset:** the reset email must link to `<frontend origin>/reset-password/<token>`. The page reads the token from the URL, so the user only enters the 6-digit code and a new password. To test locally before email is wired up, take the token and code from the Go server log and open `http://localhost:5173/reset-password/<token>`.
- **Admins:** registration always creates a `user`. To make someone an admin, update the database: `UPDATE users SET role = 'admin' WHERE email = '…';`
- **Validation:** forms validate on the client with the same rules as the Go `binding` tags (`src/lib/validation.ts`). Keep the two in sync.
