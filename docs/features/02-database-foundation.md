# Feature 02: Database Foundation

## Overview
Set up Drizzle ORM with Neon serverless PostgreSQL. Create only the initial tables needed for auth and basic app functionality. Schema grows incrementally as features are built.

## Requirements

### Must Have
- [ ] Drizzle ORM configured with Neon serverless driver
- [ ] Database client singleton (`src/lib/db/index.ts`)
- [ ] NextAuth-compatible tables (users, accounts, sessions, verification_tokens)
- [ ] `drizzle-kit push` working to sync schema
- [ ] npm scripts for db:push, db:generate, db:studio

### Nice to Have
- [ ] Drizzle Studio accessible for debugging
- [ ] Seed script for development data

## Data Model

### Tables Created in This Feature

```
users
├── id              text (PK, cuid)
├── name            text
├── email           text (unique)
├── emailVerified   timestamp
├── image           text (nullable - Google avatar URL)
├── displayName     text (nullable - custom display name)
├── bio             text (nullable)
├── createdAt       timestamp (default now)
└── updatedAt       timestamp (default now)

accounts
├── id                  text (PK)
├── userId              text (FK → users, cascade delete)
├── type                text
├── provider            text
├── providerAccountId   text
├── refresh_token       text (nullable)
├── access_token        text (nullable)
├── expires_at          integer (nullable)
├── token_type          text (nullable)
├── scope               text (nullable)
└── id_token            text (nullable)
UNIQUE(provider, providerAccountId)

sessions
├── id            text (PK)
├── sessionToken  text (unique)
├── userId        text (FK → users, cascade delete)
└── expires       timestamp

verification_tokens
├── identifier  text
├── token       text (unique)
└── expires     timestamp
UNIQUE(identifier, token)
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/db/index.ts` | Create | Drizzle client with Neon serverless |
| `src/lib/db/schema.ts` | Create | Table definitions (auth tables only) |
| `drizzle.config.ts` | Create | Drizzle Kit configuration |
| `package.json` | Modify | Add db:push, db:generate, db:studio scripts |

## Implementation Notes

### Drizzle Client Setup
```typescript
// src/lib/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Package.json Scripts
```json
{
  "db:push": "drizzle-kit push",
  "db:generate": "drizzle-kit generate",
  "db:studio": "drizzle-kit studio"
}
```

## Dependencies to Install
- `drizzle-orm`
- `@neondatabase/serverless`
- `drizzle-kit` (dev dependency)

## Edge Cases
| Scenario | Handling |
|----------|----------|
| DATABASE_URL not set | Throw clear error on app start |
| Neon connection timeout | Drizzle/Neon handles retry internally |
| Schema push conflicts | Use `drizzle-kit push --force` if needed during dev |

## Testing Checklist
- [ ] `npm run db:push` succeeds without errors
- [ ] Tables visible in Neon console (users, accounts, sessions, verification_tokens)
- [ ] `npm run db:studio` opens Drizzle Studio
- [ ] Can import `db` from `@/lib/db` without errors
- [ ] App still starts with `npm run dev`

## Open Questions
1. Should we use `cuid` or `uuid` for primary keys? **Default: cuid via `createId()` from `@paralleldrive/cuid2`** — shorter, URL-safe, sortable
2. Should verification_tokens table be included even though we're not doing email auth? **Default: Yes** — NextAuth adapter expects it, low cost
