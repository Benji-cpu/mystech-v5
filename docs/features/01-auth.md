# Feature: Authentication (Google OAuth)

## Overview
Users sign in with their Google account. No email/password auth. Session persists across browser closes.

## User Stories
- As a visitor, I want to sign in with Google so I can access my decks
- As a user, I want to stay signed in so I don't have to log in every time
- As a user, I want to sign out when using a shared computer

## Requirements

### Must Have
- [ ] Google OAuth sign-in button on login page
- [ ] Session persists (user stays logged in)
- [ ] Protected routes redirect to login
- [ ] Sign out functionality
- [ ] User record created in database on first sign-in
- [ ] Display user name/avatar in header when logged in

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
- `GoogleSignInButton` - Styled Google OAuth button
- `UserMenu` - Header dropdown with avatar, name, sign out

### User Flow
1. User visits app → sees marketing page
2. Clicks "Sign in" → goes to `/login`
3. Clicks Google button → Google OAuth popup
4. Authorizes → redirected to `/dashboard`
5. On return visits → automatically logged in, goes to `/dashboard`

### Sign Out Flow
1. User clicks avatar in header
2. Dropdown shows "Sign out"
3. Clicks sign out → session cleared → redirected to `/`

## Data Model

### Users Table (NextAuth default + extensions)
```
users
├── id              UUID (PK)
├── name            String
├── email           String (unique)
├── emailVerified   DateTime?
├── image           String? (Google avatar URL)
├── createdAt       DateTime
└── updatedAt       DateTime
```

### Accounts Table (NextAuth default)
```
accounts
├── id                  UUID (PK)
├── userId              UUID (FK → users)
├── type                String
├── provider            String
├── providerAccountId   String
├── refresh_token       String?
├── access_token        String?
├── expires_at          Int?
├── token_type          String?
├── scope               String?
└── id_token            String?
```

### Sessions Table (NextAuth default)
```
sessions
├── id            UUID (PK)
├── sessionToken  String (unique)
├── userId        UUID (FK → users)
└── expires       DateTime
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth.js handler |

## Implementation Notes

### NextAuth Configuration
- Use `DrizzleAdapter` for database
- Configure Google provider
- Set session strategy to "jwt" for serverless compatibility (Neon)
- Add callbacks to include user ID in session
- Redirect to `/dashboard` after successful sign-in

### Protected Routes
- Create middleware or wrapper for authenticated pages
- Check session server-side in layouts/pages
- Redirect to `/login` if not authenticated

### Environment Variables Required
```
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User denies Google permission | Show error message, stay on login page |
| User's Google account suspended | NextAuth handles, show generic error |
| Session expires | Redirect to login on next request |
| Same email, different Google account | Link to existing user (NextAuth default) |

## Testing Checklist

- [ ] Can click Google sign-in and complete OAuth flow
- [ ] User record created in database after first sign-in
- [ ] Session persists after closing/reopening browser
- [ ] Protected pages redirect to login when not authenticated
- [ ] Protected pages load correctly when authenticated
- [ ] User avatar and name display in header
- [ ] Sign out clears session and redirects to home
- [ ] Signing in again works after signing out

## Open Questions

1. ~~Should we support email magic links?~~ **Decision: No, Google only for MVP**
2. ~~What should the login page look like?~~ **Decision: Centered card on mystical dark background, Google sign-in button, decorative star/gradient elements**
3. ~~Where should users land after login?~~ **Decision: /dashboard**

## Dependencies

- NextAuth.js
- @auth/drizzle-adapter
- Database schema must be set up first (Feature 0.2)