# Cinemate

Cinemate is a client-side React single-page application for discovering movies. It fetches live movie data from [The Movie Database (TMDB)](https://developer.themoviedb.org/docs), and uses Supabase Auth to require account creation and sign-in before the movie catalog can be accessed.

## Features

- Discover popular movies, search by title, filter by genre and year, sort by popularity/rating/release date, and navigate result pages.
- Open a movie details page with its synopsis, genres, rating, runtime, and release year.
- Save and remove favorites; the watchlist persists across reloads using `localStorage`.
- Create an account and sign in with email/password. A Supabase email-confirmation flow is supported when enabled.
- Responsive layouts, loading states, and recoverable error and empty states.

## React application

The application uses functional React components and React Router. Reusable UI such as movie cards, grids, pagination, loading states, and movie-detail views is implemented in `src/App.tsx`. TMDB request and response handling is centralized in `src/lib/tmdb.ts`; Supabase Auth client configuration is in `src/lib/supabase.ts`.

| Route | View |
| --- | --- |
| `/auth` | Create an account or sign in |
| `/` | Discover, search, filter, and sort movies |
| `/movie/:id` | Movie details |
| `/favorites` | Saved watchlist |

All movie routes require an authenticated Supabase session. Movie and genre data are fetched asynchronously from TMDB; the interface shows loading, error, and empty states while handling the responses.

## External APIs

- **TMDB REST API** — movie discovery (`/discover/movie`), title search (`/search/movie`), genre list (`/genre/movie/list`), and movie details (`/movie/{id}`). Requires a TMDB API key.
- **Supabase Auth** — email/password account creation, email confirmation when configured, sign-in, session persistence, and sign-out.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a Supabase project and enable email/password authentication.
3. Create `.env.local` in the project root:

   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

New users create an account on the signup page. If email confirmation is enabled in Supabase, confirm the email before signing in. The Supabase anon key is intended for frontend use; never expose a service-role key in the client.

## GitHub collaboration

Host the project in a **public GitHub repository**. Make changes on dedicated feature branches (for example, `feature/movie-search` or `feature/watchlist`), then submit a pull request for review and merge; do not commit directly to `main`. Use descriptive conventional commit prefixes such as `feat:`, `fix:`, `style:`, and `docs:`.

## Scripts

- `npm run dev` — start the Vite development server.
- `npm run build` — create a production build.
- `npm run typecheck` — run TypeScript checks.
- `npm run lint` — check code quality.
