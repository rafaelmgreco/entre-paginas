const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function sessionCookieOptions<T extends { maxAge?: number }>(options: T) {
  // Keep Supabase's deletion cookie intact during sign-out; otherwise use a 7-day inactivity window.
  return { ...options, maxAge: options.maxAge === 0 ? 0 : SESSION_COOKIE_MAX_AGE };
}
