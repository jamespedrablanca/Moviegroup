import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, Check, ChevronLeft, ChevronRight, Clapperboard, Clock3, Film, Heart, LoaderCircle, LockKeyhole, Mail, Search, SlidersHorizontal, Star, UserRound, X } from 'lucide-react';
import { getGenres, getImageUrl, getMovie, getMovies, type Genre, type Movie } from '@/lib/tmdb';
import { createAccount, getCurrentUser, signIn, signOut, type AuthUser } from '@/lib/auth';

const FALLBACK_YEAR = new Date().getFullYear();
const posterFallback = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser); })
      .catch((reason: unknown) => {
        if (active) setAuthError(reason instanceof Error ? reason.message : 'We couldn’t verify your account. Please try again.');
      })
      .finally(() => { if (active) setAuthLoading(false); });

    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    await signOut();
    setUser(null);
  }

  return (
    <Routes>
      <Route path="/auth" element={
        authLoading
          ? <AuthLoading />
          : user
            ? <Navigate to="/" replace />
            : <AuthPage initialError={authError} onSignedIn={setUser} />
      } />
      <Route path="*" element={
        authLoading
          ? <AuthLoading />
          : user
            ? <Shell user={user} onSignOut={handleSignOut} />
            : <RequireAuth />
      } />
    </Routes>
  );
}

function RequireAuth() {
  const location = useLocation();
  return <Navigate to="/auth" replace state={{ from: location }} />;
}

function AuthLoading() {
  return <div className="auth-loading" role="status"><LoaderCircle className="spin" size={30} /><span>Getting your cinema ready…</span></div>;
}

function AuthPage({ initialError, onSignedIn }: { initialError: string; onSignedIn: (user: AuthUser) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState('');
  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'signup') {
        await createAccount(name.trim(), email.trim(), password);
        setMode('login');
        setPassword('');
        setNotice('Your account was created. Sign in with your new details to continue.');
      } else {
        const authenticatedUser = await signIn(email.trim(), password);
        onSignedIn(authenticatedUser);
        navigate(destination, { replace: true });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We couldn’t complete that request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode: 'signup' | 'login') {
    setMode(nextMode);
    setError('');
    setNotice('');
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-panel">
          <Link className="brand auth-brand" to="/auth">
            <span className="brand-mark"><Clapperboard size={19} strokeWidth={2.5} /></span>
            <span>Cine<span>mate</span></span>
          </Link>
          <div className="auth-intro">
            <p className="eyebrow"><span className="eyebrow-line" /> A little more movie magic</p>
            <h1>{mode === 'signup' ? <>Your next favorite<br /><em>starts here.</em></> : <>Welcome back,<br /><em>movie lover.</em></>}</h1>
            <p>{mode === 'signup' ? 'Create your free account to explore films and build a watchlist that feels like yours.' : 'Sign in to pick up where you left off and get back to finding your next favorite film.'}</p>
          </div>
          <div className="auth-perks">
            <div><span className="perk-icon"><Search size={17} /></span><span><strong>Find your next favorite</strong><small>Explore films picked for every mood.</small></span></div>
            <div><span className="perk-icon"><Bookmark size={17} /></span><span><strong>Keep your watchlist close</strong><small>Save the films you can’t wait to see.</small></span></div>
          </div>
          <div className="auth-decoration" aria-hidden="true"><div className="auth-reel"><Film size={34} /></div><div className="auth-orbit" /></div>
          <span className="auth-footnote">MADE FOR MOVIE PEOPLE</span>
        </div>
        <div className="auth-form-panel">
          <div className="auth-mobile-brand">
            <span className="brand-mark"><Clapperboard size={19} strokeWidth={2.5} /></span>
            <span>Cine<span>mate</span></span>
          </div>
          <div className="auth-form-heading">
            <p className="eyebrow">{mode === 'signup' ? 'Join the club' : 'Your account'}</p>
            <h2>{mode === 'signup' ? 'Create your account' : 'Sign in to Cinemate'}</h2>
            <p>{mode === 'signup' ? 'It only takes a moment to get started.' : 'Good to have you back.'}</p>
          </div>
          {mode === 'signup' && <div className="auth-highlights" aria-label="Cinemate account benefits"><span><Bookmark size={14} />Personal watchlist</span><span><Search size={14} />Discover new films</span></div>}
          <form className="auth-form" onSubmit={submit}>
            {mode === 'signup' && <label className="auth-field"><span>Your name</span><div><UserRound size={17} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" maxLength={100} required /></div></label>}
            <label className="auth-field"><span>Email address</span><div><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" maxLength={190} required /></div></label>
            <label className="auth-field"><span>Password</span><div><LockKeyhole size={17} /><input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={mode === 'signup' ? 8 : undefined} maxLength={72} required /></div></label>
            {error && <p className="auth-message auth-error" role="alert">{error}</p>}
            {notice && <p className="auth-message auth-notice" role="status"><Check size={17} />{notice}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17} /> Please wait…</> : mode === 'signup' ? 'Create account' : 'Sign in'}<ChevronRight size={17} /></button>
          </form>
          <p className="auth-switch">{mode === 'signup' ? 'Already have an account?' : 'New to Cinemate?'} <button type="button" onClick={() => changeMode(mode === 'signup' ? 'login' : 'signup')}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button></p>
          <p className="auth-legal">By continuing, you agree to enjoy great movies responsibly.</p>
        </div>
      </section>
    </main>
  );
}

function Shell({ user, onSignOut }: { user: AuthUser; onSignOut: () => Promise<void> }) {
  const location = useLocation();
  const favorites = readFavorites();
  const [favoriteIds, setFavoriteIds] = useState<number[]>(favorites);
  const [signOutError, setSignOutError] = useState('');

  function toggleFavorite(id: number) {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id];
      localStorage.setItem('cinema-favorites', JSON.stringify(next));
      return next;
    });
  }

  async function signOut() {
    setSignOutError('');
    try {
      await onSignOut();
    } catch (reason) {
      setSignOutError(reason instanceof Error ? reason.message : 'We couldn’t sign you out. Please try again.');
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark"><Clapperboard size={19} strokeWidth={2.5} /></span>
          <span>Cine<span>mate</span></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className={location.pathname === '/' ? 'active' : ''} to="/">Discover</Link>
          <Link className={location.pathname === '/favorites' ? 'active' : ''} to="/favorites">My List <span className="nav-count">{favoriteIds.length}</span></Link>
        </nav>
        <div className="header-account"><span className="header-badge"><span className="status-dot" /> Curated for you</span><span className="account-email">{user.email}</span><button className="sign-out-button" onClick={signOut}>Sign out</button></div>
      </header>
      {signOutError && <p className="sign-out-error" role="alert">{signOutError}</p>}
      <main>
        <Routes>
          <Route path="/" element={<DiscoverPage favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />} />
          <Route path="/favorites" element={<FavoritesPage favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />} />
          <Route path="/movie/:id" element={<MoviePage favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />} />
        </Routes>
      </main>
      <footer><span>© {FALLBACK_YEAR} Cinemate</span><span>Made for movie people</span></footer>
    </div>
  );
}

function DiscoverPage({ favoriteIds, onToggleFavorite }: { favoriteIds: number[]; onToggleFavorite: (id: number) => void }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { getGenres().then(setGenres).catch(() => undefined); }, []);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getMovies({ query: activeQuery, with_genres: genre, primary_release_year: year, sort_by: sort, page })
      .then((data) => { if (!cancelled) { setMovies(data.results); setTotalPages(Math.min(data.total_pages, 500)); } })
      .catch((reason: Error) => { if (!cancelled) setError(reason.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeQuery, genre, year, sort, page]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setActiveQuery(query.trim());
  }

  function resetFilters() {
    setQuery(''); setActiveQuery(''); setGenre(''); setYear(''); setSort('popularity.desc'); setPage(1);
  }

  const heading = activeQuery ? `Results for “${activeQuery}”` : 'Popular right now';
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> Your next favorite film</p>
          <h1>Find stories<br /><em>worth watching.</em></h1>
          <p className="hero-text">Explore handpicked movies, discover hidden gems, and keep your watchlist close.</p>
          <form className="search-form" onSubmit={submitSearch}>
            <Search size={20} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies, people, genres..." aria-label="Search movies" />
            <button type="submit">Search</button>
          </form>
          <div className="quick-tags"><span>Trending:</span><button onClick={() => { setQuery('Dune'); setActiveQuery('Dune'); setPage(1); }}>Dune</button><button onClick={() => { setQuery('The Batman'); setActiveQuery('The Batman'); setPage(1); }}>The Batman</button><button onClick={() => { setQuery('Oppenheimer'); setActiveQuery('Oppenheimer'); setPage(1); }}>Oppenheimer</button></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-art-glow" /><div className="hero-ticket"><Film size={30} /><span>TONIGHT'S<br /><strong>FEATURE</strong></span></div><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /></div>
      </section>
      <section className="catalog-section">
        <div className="section-heading"><div><p className="eyebrow">The collection</p><h2>{heading}</h2></div><span className="result-count">{loading ? 'Finding films...' : `${movies.length} films on this page`}</span></div>
        <div className="filter-bar"><div className="filter-title"><SlidersHorizontal size={16} /> Refine</div><select value={genre} onChange={(event) => { setGenre(event.target.value); setPage(1); }} aria-label="Filter by genre"><option value="">All genres</option>{genres.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select value={year} onChange={(event) => { setYear(event.target.value); setPage(1); }} aria-label="Filter by year"><option value="">Any year</option>{Array.from({ length: 25 }, (_, index) => FALLBACK_YEAR - index).map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Sort movies"><option value="popularity.desc">Most popular</option><option value="vote_average.desc">Top rated</option><option value="primary_release_date.desc">Newest releases</option></select>{(genre || year || sort !== 'popularity.desc' || activeQuery) && <button className="clear-button" onClick={resetFilters}><X size={14} /> Clear</button>}</div>
        {error ? <ErrorState message={error} onRetry={() => setPage((current) => current)} /> : loading ? <LoadingGrid /> : movies.length === 0 ? <EmptyState /> : <MovieGrid movies={movies} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} />}
        {!loading && !error && movies.length > 0 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
      </section>
    </>
  );
}

function MovieGrid({ movies, favoriteIds, onToggleFavorite }: { movies: Movie[]; favoriteIds: number[]; onToggleFavorite: (id: number) => void }) {
  return <div className="movie-grid">{movies.map((movie, index) => <MovieCard key={movie.id} movie={movie} rank={index + 1} isFavorite={favoriteIds.includes(movie.id)} onToggleFavorite={onToggleFavorite} />)}</div>;
}

function MovieCard({ movie, rank, isFavorite, onToggleFavorite }: { movie: Movie; rank: number; isFavorite: boolean; onToggleFavorite: (id: number) => void }) {
  return <article className="movie-card"><Link to={`/movie/${movie.id}`} className="poster-wrap"><img src={getImageUrl(movie.poster_path) ?? posterFallback} alt={`${movie.title} poster`} /><span className="card-rank">0{rank}</span><span className="poster-overlay">View details <ChevronRight size={14} /></span></Link><button className={`favorite-button ${isFavorite ? 'saved' : ''}`} onClick={() => onToggleFavorite(movie.id)} aria-label={isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}><Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} /></button><div className="movie-info"><Link to={`/movie/${movie.id}`}><h3>{movie.title}</h3></Link><div className="movie-meta"><span>{movie.release_date?.slice(0, 4) || '—'}</span><span className="meta-dot" /><span className="rating"><Star size={13} fill="currentColor" /> {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span></div></div></article>;
}

function FavoritesPage({ favoriteIds, onToggleFavorite }: { favoriteIds: number[]; onToggleFavorite: (id: number) => void }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(favoriteIds.length > 0);
  useEffect(() => { if (!favoriteIds.length) { setMovies([]); setLoading(false); return; } let cancelled = false; setLoading(true); Promise.all(favoriteIds.map((id) => getMovie(String(id)).catch(() => null))).then((results) => { if (!cancelled) setMovies(results.filter((movie): movie is Movie => movie !== null)); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [favoriteIds]);
  return <section className="catalog-section page-section"><div className="section-heading"><div><p className="eyebrow">Your collection</p><h2>My watchlist</h2></div><span className="result-count">{favoriteIds.length} saved {favoriteIds.length === 1 ? 'film' : 'films'}</span></div>{loading ? <LoadingGrid /> : movies.length ? <MovieGrid movies={movies} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} /> : <div className="empty-state"><Bookmark size={28} /><h3>Your watchlist is waiting.</h3><p>Save films from Discover and they’ll show up here.</p><Link className="button-link" to="/">Browse movies</Link></div>}</section>;
}

function MoviePage({ favoriteIds, onToggleFavorite }: { favoriteIds: number[]; onToggleFavorite: (id: number) => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!id) return; getMovie(id).then(setMovie).catch(() => setMovie(null)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div className="detail-loading"><LoaderCircle className="spin" size={30} /></div>;
  if (!movie) return <section className="detail-error"><h2>We couldn’t find that movie.</h2><button className="button-link" onClick={() => navigate('/')}>Back to discover</button></section>;
  const saved = favoriteIds.includes(movie.id);
  return <section className="detail-page"><button className="back-link" onClick={() => navigate(-1)}><ChevronLeft size={17} /> Back to browsing</button><div className="detail-layout"><div className="detail-poster"><img src={getImageUrl(movie.poster_path) ?? posterFallback} alt={`${movie.title} poster`} /></div><div className="detail-copy"><p className="eyebrow">Movie profile</p><h1>{movie.title}</h1>{movie.tagline && <p className="tagline">“{movie.tagline}”</p>}<div className="detail-meta"><span><Star size={16} fill="currentColor" /> {movie.vote_average.toFixed(1)} rating</span><span><Clock3 size={16} /> {movie.runtime ? `${movie.runtime} min` : 'Runtime unknown'}</span><span>{movie.release_date?.slice(0, 4)}</span></div><p className="detail-overview">{movie.overview || 'No synopsis is available for this film yet.'}</p><div className="genre-pills">{movie.genres?.map((item) => <span key={item.id}>{item.name}</span>)}</div><button className={`save-button ${saved ? 'saved' : ''}`} onClick={() => onToggleFavorite(movie.id)}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved to my list' : 'Save to my list'}</button></div></div></section>;
}

function LoadingGrid() { return <div className="movie-grid">{Array.from({ length: 8 }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-poster" /><div className="skeleton-line" /><div className="skeleton-small" /></div>)}</div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="empty-state error-state"><X size={28} /><h3>Something went off script.</h3><p>{message}</p><button className="button-link" onClick={onRetry}>Try again</button></div>; }
function EmptyState() { return <div className="empty-state"><Search size={28} /><h3>No films found.</h3><p>Try a different title or loosen your filters.</p></div>; }
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) { const pages = useMemo(() => Array.from({ length: Math.min(5, totalPages) }, (_, index) => Math.max(1, Math.min(page - 2, totalPages - 4)) + index).filter((item) => item <= totalPages), [page, totalPages]); return <div className="pagination"><button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={17} /></button>{pages.map((item) => <button className={item === page ? 'current' : ''} key={item} onClick={() => onChange(item)}>{item}</button>)}<button disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={17} /></button></div>; }
function readFavorites(): number[] { try { const value = JSON.parse(localStorage.getItem('cinema-favorites') ?? '[]'); return Array.isArray(value) ? value.filter((id): id is number => typeof id === 'number') : []; } catch { return []; } }

export default App;
