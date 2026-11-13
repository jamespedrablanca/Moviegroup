# Cinemate

Cinemate is a React single-page application for discovering movies. It fetches live movie data from [The Movie Database (TMDB)](https://developer.themoviedb.org/docs) and stores user accounts in a local MySQL database through a small PHP API.

## Features

- Discover popular movies, search by title, filter by genre and year, sort by popularity/rating/release date, and navigate result pages.
- Open a movie details page with its synopsis, genres, rating, runtime, and release year.
- Save and remove favorites; the watchlist persists across reloads using `localStorage`.
- Create an account and sign in with email/password; passwords are stored as secure hashes in MySQL.
- Responsive layouts, loading states, and recoverable error and empty states.

## React application

The application uses functional React components and React Router. Reusable UI such as movie cards, grids, pagination, loading states, and movie-detail views is implemented in `src/App.tsx`. TMDB request handling is in `src/lib/tmdb.ts`; account requests are in `src/lib/auth.ts` and handled by the PHP API in `api/auth.php`.

| Route | View |
| --- | --- |
| `/auth` | Create an account or sign in |
| `/` | Discover, search, filter, and sort movies |
| `/movie/:id` | Movie details |
| `/favorites` | Saved watchlist |

All movie routes require an authenticated PHP session. Movie and genre data are fetched asynchronously from TMDB; the interface shows loading, error, and empty states while handling the responses.

## External APIs

- **TMDB REST API** — movie discovery (`/discover/movie`), title search (`/search/movie`), genre list (`/genre/movie/list`), and movie details (`/movie/{id}`). Requires a TMDB API key.
- **Local MySQL** — account names, unique email addresses, password hashes, and account creation dates. PHP manages registration, sign-in, and HTTP-only session cookies.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start **Apache** and **MySQL** from the XAMPP Control Panel.
3. Import `api/database.sql` in phpMyAdmin (usually `http://localhost/phpmyadmin`). This creates the `cinemate_db` database and `accounts` table.
4. In `.env.local`, configure the TMDB API key:

   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

   Cinemate uses XAMPP's local MySQL defaults (`root` with an empty password). If your MySQL credentials differ, set `CINEMATE_DB_HOST`, `CINEMATE_DB_NAME`, `CINEMATE_DB_USER`, and `CINEMATE_DB_PASSWORD` in the Apache environment or adjust the local values in `api/config.php`.

5. Start the Vite development server:

   ```sh
   npm run dev
   ```

New users create an account on the signup page, then sign in. The Vite development server proxies `/Moviegroup/api` to XAMPP's Apache server. Keep this local development database private; a production deployment needs properly managed database credentials, HTTPS, and additional operational protections.

## GitHub collaboration

Host the project in a **public GitHub repository**. Make changes on dedicated feature branches (for example, `feature/movie-search` or `feature/watchlist`), then submit a pull request for review and merge; do not commit directly to `main`. Use descriptive conventional commit prefixes such as `feat:`, `fix:`, `style:`, and `docs:`.

## Scripts

- `npm run dev` — start the Vite development server.
- `npm run build` — create a production build.
- `npm run typecheck` — run TypeScript checks.
- `npm run lint` — check code quality.
