export interface AuthResponse {
  userId: string;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  sessionCreated: boolean;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
}

export interface AuthState {
  userId: string | null;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  loading: boolean;
  error: string | null;
}
