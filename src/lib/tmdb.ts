const API_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

export type Genre = {
  id: number;
  name: string;
};

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  status?: string;
};

type MovieResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results: Movie[];
};

type GenreResponse = { genres: Genre[] };

const apiKey = import.meta.env.VITE_TMDB_API_KEY;

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  if (!apiKey) {
    throw new Error('The movie service is not configured yet. Add your TMDB API key to the environment settings.');
  }

  const searchParams = new URLSearchParams({ api_key: apiKey, language: 'en-US' });
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') searchParams.set(key, String(value));
  });

  const response = await fetch(`${API_BASE}${path}?${searchParams.toString()}`);
  if (!response.ok) throw new Error('The movie service could not respond. Please try again.');
  return response.json() as Promise<T>;
}

export function getImageUrl(path: string | null, backdrop = false) {
  if (!path) return null;
  return `${backdrop ? BACKDROP_BASE : IMAGE_BASE}${path}`;
}

export function getMovies(params: Record<string, string | number | undefined>) {
  const endpoint = params.query ? '/search/movie' : '/discover/movie';
  const { query, ...rest } = params;
  return request<MovieResponse>(endpoint, { ...rest, query });
}

export function getMovie(id: string) {
  return request<Movie>(`/movie/${id}`);
}

export function getGenres() {
  return request<GenreResponse>('/genre/movie/list').then((data) => data.genres);
}
