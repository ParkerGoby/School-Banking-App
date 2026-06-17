const BASE = '/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((body as { detail?: string }).detail ?? `Request failed: ${res.status}`);
  }

  return body as T;
}

export interface ApiUser {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'finance' | 'admin';
  is_active: boolean;
}

export interface ApiAccount {
  id: string;
  owner_id: string;
  balance: string;
  created_at: string;
}

export interface ApiTransaction {
  id: string;
  account_id: string;
  type: 'deposit' | 'withdrawal';
  amount: string;
  note: string | null;
  created_by: string;
  created_at: string;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),

  refresh: () =>
    request<{ access_token: string }>('/auth/refresh', { method: 'POST' }),

  me: () =>
    request<ApiUser>('/auth/me'),

  // Accounts
  getMyAccount: () =>
    request<ApiAccount>('/accounts/me'),

  listAccounts: () =>
    request<ApiAccount[]>('/accounts'),

  getAccount: (id: string) =>
    request<ApiAccount>(`/accounts/${id}`),

  // Transactions
  getMyTransactions: (skip = 0, limit = 50) =>
    request<ApiTransaction[]>(`/transactions/me?skip=${skip}&limit=${limit}`),

  deposit: (account_id: string, amount: number, note?: string) =>
    request<ApiTransaction>('/transactions/deposit', {
      method: 'POST',
      body: JSON.stringify({ account_id, type: 'deposit', amount, note }),
    }),

  withdraw: (account_id: string, amount: number, note?: string) =>
    request<ApiTransaction>('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify({ account_id, type: 'withdrawal', amount, note }),
    }),

  getAccountTransactions: (accountId: string, skip = 0, limit = 50) =>
    request<ApiTransaction[]>(`/transactions/${accountId}?skip=${skip}&limit=${limit}`),
};
