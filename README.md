# Cinemate

Cinemate is a client-side React movie discovery experience powered by The Movie Database (TMDB). Browse popular releases, search by title, filter by genre or year, sort by rating and release date, open a full movie profile, and save favorites to a personal watchlist.

## Features

- Responsive single-page experience with client-side routes for Discover, My List, and movie details.
- TMDB data fetched asynchronously with loading skeletons and friendly error/empty states.
- Keyword search, genre filtering, year filtering, sorting, and page navigation.
- Favorites persist across reloads using localStorage.
- Responsive layout for desktop, tablet, and mobile screens.

## API

- [The Movie Database API](https://developer.themoviedb.org/docs)

## Setup

1. Install dependencies with `npm install`.
2. Create a `.env.local` file in the project root.
3. Add `VITE_TMDB_API_KEY=your_tmdb_api_key` to that file.
4. Start the Vite development server with `npm run dev`.

## Team contributions

- Member 1: API integration, search/filter behavior, and movie detail view.
- Member 2: Visual design, reusable movie cards, watchlist persistence, and responsive styling.

## Scripts

- `npm run dev` — start the development server.
- `npm run build` — create a production build.
- `npm run typecheck` — run TypeScript checks.
- `npm run lint` — check code quality.
