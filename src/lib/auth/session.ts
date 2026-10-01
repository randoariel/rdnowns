import type { SessionOptions } from 'iron-session';

export interface SessionData {
  adminId: string;
  isLoggedIn: boolean;
  fingerprint?: string;
  createdAt?: number;
}

export const SESSION_OPTIONS: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'rdn_session_secure',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict', // Strict against CSRF attacks
    maxAge: 8 * 60 * 60, // Maximum session lifespan 8 hours
    path: '/',
  },
};
