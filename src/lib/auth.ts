export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthResponse = {
  user?: AuthUser | null;
  message?: string;
  error?: string;
};

const apiBase = import.meta.env.VITE_AUTH_API_BASE || '/Moviegroup/api';

async function request(action: string, method: 'GET' | 'POST', body?: Record<string, string>): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}/auth.php?action=${action}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Can’t connect to the account database. Start Apache and MySQL in XAMPP, then try again.');
  }

  let result: AuthResponse;
  try {
    result = await response.json() as AuthResponse;
  } catch {
    throw new Error('The account server returned an unreadable response. Check that Apache is running.');
  }

  if (!response.ok) {
    throw new Error(result.error || 'The account request could not be completed.');
  }
  return result;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const result = await request('session', 'GET');
  return result.user ?? null;
}

export async function createAccount(name: string, email: string, password: string): Promise<void> {
  await request('register', 'POST', { name, email, password });
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const result = await request('login', 'POST', { email, password });
  if (!result.user) {
    throw new Error('The account server did not return a signed-in user.');
  }
  return result.user;
}

export async function signOut(): Promise<void> {
  await request('logout', 'POST');
}
