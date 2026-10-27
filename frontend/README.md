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

## Structure

The frontend is a modular monolith, laid out like the Go service:

```
src/
  app/            App shell: router, providers, layout        (≈ cmd/server + routes/)
  shared/         Code with no business rules                 (≈ helpers/, responses/, requests/)
    api/          HTTP client, ApiResponse/Pagination types
    components/   Alert, Button, FormField, Spinner
    lib/          errors, formatting, shared field validation
  modules/
    auth/         Login, register, password reset, session, route guards  (≈ modules/auth)
    users/        Profile and admin user management                       (≈ modules/users)
```

Each module owns its `api.ts`, `types.ts`, pages, components and `routes.tsx`, and exposes a public API in `index.ts`.

- **Import modules only through `@/modules/<name>`.** `npm run lint` fails on deep imports like `@/modules/auth/api`.
- **Dependencies go one way:** `users → auth → shared`. `shared` never imports a module. It gets tokens through `configureAuth`, which `setupAuth()` installs in `main.tsx`.
- **To add a module,** create `src/modules/<name>/` with a `routes.tsx` and `index.ts`, then mount its routes in `src/app/App.tsx`.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | API base URL. Set it when the frontend is hosted on a different origin than the API, and add that origin to the API's `CORS_ALLOWED_ORIGINS`. |

Copy `.env.example` to `.env.local` to override it. `.env.local` is git-ignored.

## Pages

| Route | Access | API |
|---|---|---|
| `/login`, `/register` | Guests | `POST /auth/login`, `POST /auth/register` |
| (any signed-in page) | Signed in | `POST /auth/refresh` (on 401), `POST /auth/logout` |
| `/forgot-password` | Anyone | `POST /auth/forgot-password` |
| `/reset-password/:token` | Anyone (opened from the emailed link) | `POST /auth/reset-password` |
| `/profile` | Signed in | `GET /me`, `PATCH /me` |
| `/admin/users` | Admins | `GET /admin/users`, `DELETE /admin/users/:id` |

## Notes

- **Session:** login returns an access token (15 min) and a refresh token (7 days). Both are stored in `localStorage`, and the access token is sent as `Authorization: Bearer …`. On a 401 the client calls `POST /auth/refresh` and retries once. Parallel requests share a single refresh, because the API revokes a refresh token once it is used. If the refresh is rejected, the tokens are cleared and the guards redirect to `/login`. Log out calls `POST /auth/logout` to revoke the refresh token. Moving the tokens to httpOnly cookies would protect them from XSS. That would require changes on the API side.
- **Role and user ID** come from the access token's claims (`user_id`, `role`), as `AuthMiddleware` reads them on the server. The guards don't need a request to decide. The profile itself is loaded from `GET /me`.
- **Password reset:** the reset email must link to `<frontend origin>/reset-password/<token>`. The page reads the token from the URL, so the user only enters the 6-digit code and a new password. To test locally before email is wired up, take the token and code from the Go server log and open `http://localhost:5173/reset-password/<token>`.
- **Admins:** registration always creates a `user`. To make someone an admin, update the database: `UPDATE users SET role = 'admin' WHERE email = '…';`
- **Validation:** forms validate on the client with the same rules as the Go `binding` tags (`src/shared/lib/validation.ts` and each module's `validation.ts`). Keep the two in sync.
