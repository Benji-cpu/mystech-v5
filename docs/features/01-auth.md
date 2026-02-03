# Feature: Authentication (Google OAuth)

## Overview
Users sign in with their Google account. No email/password auth. Session persists across browser closes.

## User Stories
- As a visitor, I want to sign in with Google so I can access my decks
- As a user, I want to stay signed in so I don't have to log in every time
- As a user, I want to sign out when using a shared computer

## Requirements

### Must Have
- [x] Google OAuth sign-in button on login page
- [x] Session persists (user stays logged in)
- [x] Protected routes redirect to login
- [x] Sign out functionality
- [x] User record created in database on first sign-in
- [x] Display user name/avatar in header when logged in

### Nice to Have
- [ ] "Remember me" option
- [ ] Account deletion option in settings

## UI/UX

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Centered card with Google sign-in button |
| Dashboard | `/dashboard` | Landing page after login (protected) |

### Components
- `GoogleSignInButton` - Styled Google OAuth button with loading state
- `UserMenu` - Header dropdown with avatar, name, email, settings links, sign out

### User Flow
1. User visits app -> sees marketing page
2. Clicks "Sign in" -> goes to `/login`
3. Clicks Google button -> Google OAuth redirect
4. Authorizes -> redirected to `/dashboard`
5. On return visits -> automatically logged in, goes to `/dashboard`

### Sign Out Flow
1. User clicks avatar in header
2. Dropdown shows name, email, settings, billing, "Sign Out"
3. Clicks sign out -> session cleared -> redirected to `/`

## Data Model

### Users Table (Auth.js v5 + extensions)
```
user
├── id              text (PK, cuid)
├── name            text
├── email           text (unique)
├── emailVerified   timestamp
├── image           text (Google avatar URL)
├── createdAt       timestamp (default now)
└── updatedAt       timestamp (default now)
```

### Accounts Table (Auth.js v5)
```
account
├── userId              text (FK -> user, cascade delete)
├── type                text
├── provider            text
├── providerAccountId   text
├── refresh_token       text?
├── access_token        text?
├── expires_at          integer?
├── token_type          text?
├── scope               text?
├── id_token            text?
├── session_state       text?
PK(provider, providerAccountId)
```

### Sessions Table (Auth.js v5)
```
session
├── sessionToken  text (PK)
├── userId        text (FK -> user, cascade delete)
└── expires       timestamp
```

### Verification Tokens Table (Auth.js v5)
```
verificationToken
├── identifier  text
├── token       text
├── expires     timestamp
PK(identifier, token)
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | Auth.js v5 handler |

## Implementation Notes

### Auth.js v5 (not v4)
- **Decision**: Used Auth.js v5 (`next-auth@beta`) instead of NextAuth v4
- **Reason**: NextAuth v4 has peer dependency `next@"^12 || ^13 || ^14 || ^15"` and doesn't support Next.js 16. The `@next-auth/drizzle-adapter` (v4) doesn't exist — only `@auth/drizzle-adapter` (v5).
- Auth.js v5 installed with `--legacy-peer-deps`

### Auth Configuration
- `src/auth.config.ts` — Edge-safe config (providers + authorized callback, no DB)
- `src/auth.ts` — Full config with DrizzleAdapter, JWT strategy, session/jwt callbacks
- JWT strategy for serverless compatibility (Neon)
- Session enriched with user ID via callbacks

### Route Protection (3 layers)
1. **Middleware** (`src/middleware.ts`) — Edge-level redirect using auth.config (no DB). Covers all `(app)` routes + `/login`. Next.js 16 shows deprecation warning (recommends `proxy.ts`), but middleware.ts still works.
2. **App layout** (`src/app/(app)/layout.tsx`) — Server-side session check, redirects to `/login`
3. **Server helpers** (`src/lib/auth/helpers.ts`) — `requireAuth()` for individual pages

### Environment Variables (Auth.js v5 convention)
```
AUTH_SECRET
AUTH_URL
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
```

### Error Handling
Login page displays contextual errors from `?error=` query param:
- `AccessDenied` -> "Access was denied. You may have cancelled the sign-in."
- `OAuthCallback` -> "There was a problem signing in with Google. Please try again."
- `OAuthAccountNotLinked` -> "This email is already associated with another sign-in method."
- default -> "An unexpected error occurred. Please try again."

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User denies Google permission | Redirect to `/login?error=AccessDenied`, show message |
| Session expires | Middleware redirects to login; layout + `requireAuth()` as fallback |
| Signed-in user visits `/login` | `authorized` callback redirects to `/dashboard` |
| Missing env vars | Auth.js throws clear error at startup |

## Files Created/Modified

| File | Action |
|------|--------|
| `src/auth.config.ts` | Created — Edge-safe auth config |
| `src/auth.ts` | Created — Full auth config with adapter |
| `src/app/api/auth/[...nextauth]/route.ts` | Created — API route |
| `src/middleware.ts` | Created — Route protection |
| `src/types/next-auth.d.ts` | Created — Type augmentation |
| `src/lib/db/index.ts` | Created — Drizzle client |
| `src/lib/db/schema.ts` | Created — Auth tables |
| `drizzle.config.ts` | Created — Drizzle Kit config |
| `src/lib/auth/helpers.ts` | Created — Server helpers |
| `src/components/auth/google-sign-in-button.tsx` | Created — OAuth button |
| `src/components/providers.tsx` | Modified — Added SessionProvider |
| `src/components/layout/user-menu.tsx` | Modified — Real user data + sign out |
| `src/components/layout/app-header.tsx` | Modified — Accepts user prop |
| `src/app/(app)/layout.tsx` | Modified — Server-side auth check |
| `src/app/(app)/dashboard/page.tsx` | Modified — Uses requireAuth() |
| `src/app/(auth)/login/page.tsx` | Modified — Error handling + GoogleSignInButton |
| `next.config.ts` | Modified — Google avatar domain |
| `package.json` | Modified — db scripts + auth packages |
| `.env.local` | Modified — AUTH_ prefix convention |

## Testing Checklist

- [ ] Can click Google sign-in and complete OAuth flow
- [ ] User record created in database after first sign-in
- [ ] Session persists after closing/reopening browser
- [ ] Protected pages redirect to login when not authenticated
- [ ] Protected pages load correctly when authenticated
- [ ] User avatar and name display in header
- [ ] Sign out clears session and redirects to home
- [ ] Signing in again works after signing out
- [ ] Login page shows error when Google permission denied
- [ ] `/login` redirects to `/dashboard` when already authenticated
- [ ] `npm run build` succeeds

## Open Questions

1. ~~Should we support email magic links?~~ **Decision: No, Google only for MVP**
2. ~~What should the login page look like?~~ **Decision: Centered card on mystical dark background, Google sign-in button, decorative star/gradient elements**
3. ~~Where should users land after login?~~ **Decision: /dashboard**
4. ~~NextAuth v4 or v5?~~ **Decision: Auth.js v5 (`next-auth@beta`) — v4 doesn't support Next.js 16**
5. ~~middleware.ts or proxy.ts?~~ **Decision: middleware.ts for now — Next.js 16 shows deprecation warning but it still works. Can migrate to proxy.ts later.**

## Dependencies

- `next-auth@beta` (Auth.js v5)
- `@auth/drizzle-adapter`
- `drizzle-orm` + `@neondatabase/serverless` (Feature 02 — built inline)
- `@paralleldrive/cuid2` (for ID generation)
