# Feature 16: Deck Collaboration

## Overview
Deck owners can invite others to collaborate on a deck via invite link. Collaborators can be editors (add/edit/delete cards) or viewers (read-only). An activity log tracks all changes on shared decks.

## User Stories
- As a deck owner, I want to invite a friend to collaborate on my deck
- As a deck owner, I want to control who can edit vs just view
- As an invited user, I want to preview the invitation before accepting
- As an editor, I want to add and edit cards on a shared deck
- As a deck owner, I want to see what changes collaborators have made
- As a deck owner, I want to remove a collaborator

## Requirements

### Must Have
- [ ] Invite collaborator via link (no email service needed)
- [ ] Invitation preview page (shows deck info, accept/reject buttons)
- [ ] Collaborator roles: editor (full CRUD on cards) and viewer (read-only)
- [ ] Collaborator management page (list, change roles, remove)
- [ ] Activity log tracking: card_added, card_edited, card_deleted, member_joined
- [ ] Authorization checks on all card operations
- [ ] Free tier: view-only access to shared decks. Pro: full edit access

### Nice to Have
- [ ] Real-time presence indicators (who's viewing the deck)
- [ ] Notification when collaborator makes changes
- [ ] Transfer deck ownership

## UI/UX

### Collaborators Page (`/decks/[deckId]/collaborators`)
```
┌────────────────────────────────────────────┐
│ Deck Collaborators                         │
│ "Seasons of My Life"                       │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [👤] You (Owner)                       │ │
│ │ [👤] Sarah M.    Editor  [▼ Role] [✕] │ │
│ │ [👤] James K.    Viewer  [▼ Role] [✕] │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ [+ Invite Collaborator]                    │
│                                            │
│ ─── Recent Activity ───                    │
│ Sarah added "The Rising Moon" • 2h ago     │
│ James joined as viewer • 1d ago            │
│ You edited "First Light" • 2d ago          │
└────────────────────────────────────────────┘
```

### Invite Dialog
```
┌────────────────────────────────────┐
│ Invite to "Seasons of My Life"     │
│                                    │
│ Role: [Editor ▼]                   │
│                                    │
│ Share this link:                   │
│ ┌──────────────────────────────┐  │
│ │ mystech.app/invite/abc123    │  │
│ └──────────────────────────────┘  │
│ [📋 Copy Link]                    │
│                                    │
│ Link expires in 7 days            │
│ [Close]                           │
└────────────────────────────────────┘
```

### Invitation Preview Page (`/invite/[token]`)
```
┌────────────────────────────────────────────┐
│ You've Been Invited!                       │
│                                            │
│ [User Name] has invited you to             │
│ collaborate on:                            │
│                                            │
│ "Seasons of My Life"                       │
│ A deck about life transitions and growth   │
│ 12 cards • Watercolor Dream style          │
│                                            │
│ Your role: Editor                          │
│                                            │
│ [Accept Invitation]  [Decline]             │
└────────────────────────────────────────────┘
```
- If not logged in: "Sign in to accept" button → redirect to login → back to invite page
- If already a collaborator: "You're already a member of this deck"

## Data Model

### New Tables

```
deck_collaborators
├── id          text (PK, cuid)
├── deckId      text (FK → decks, cascade delete)
├── userId      text (FK → users, cascade delete)
├── role        text — 'editor' | 'viewer'
├── invitedBy   text (FK → users)
├── accepted    boolean (default true — accepted when they click accept)
├── createdAt   timestamp (default now)
└── updatedAt   timestamp (default now)
UNIQUE(deckId, userId)
INDEX on deckId
INDEX on userId

deck_invitations
├── id          text (PK, cuid)
├── deckId      text (FK → decks, cascade delete)
├── role        text — 'editor' | 'viewer'
├── token       text (unique, not null)
├── createdBy   text (FK → users)
├── expiresAt   timestamp (not null)
├── acceptedBy  text (FK → users, nullable)
├── acceptedAt  timestamp (nullable)
└── createdAt   timestamp (default now)

activity_log
├── id          text (PK, cuid)
├── deckId      text (FK → decks, cascade delete)
├── userId      text (FK → users)
├── action      text — 'card_added' | 'card_edited' | 'card_deleted' | 'member_joined' | 'member_left'
├── details     jsonb (nullable) — { cardTitle, oldValue, newValue, etc. }
└── createdAt   timestamp (default now)
INDEX on deckId
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/decks/[deckId]/collaborators` | List collaborators + activity |
| POST | `/api/decks/[deckId]/collaborators/invite` | Create invitation link |
| PATCH | `/api/decks/[deckId]/collaborators/[userId]` | Change collaborator role |
| DELETE | `/api/decks/[deckId]/collaborators/[userId]` | Remove collaborator |
| GET | `/api/invite/[token]` | Get invitation details (public) |
| POST | `/api/invite/[token]/accept` | Accept invitation (auth required) |
| POST | `/api/invite/[token]/decline` | Decline invitation |
| GET | `/api/decks/[deckId]/activity` | Get activity log |

### Authorization Matrix

| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| View deck | ✅ | ✅ | ✅ |
| View cards | ✅ | ✅ | ✅ |
| Add card | ✅ | ✅ | ❌ |
| Edit card | ✅ | ✅ | ❌ |
| Delete card | ✅ | ✅ | ❌ |
| Edit deck metadata | ✅ | ❌ | ❌ |
| Delete deck | ✅ | ❌ | ❌ |
| Invite collaborators | ✅ | ❌ | ❌ |
| Remove collaborators | ✅ | ❌ | ❌ |
| View activity log | ✅ | ✅ | ✅ |

## Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/decks/[deckId]/collaborators` | Required (owner) | Manage collaborators |
| `/invite/[token]` | Required to accept | Invitation preview |

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Invite link expired | Show "This invitation has expired" |
| User tries to accept their own invite | Show "You can't accept your own invitation" |
| User already a collaborator clicks invite | Show "You're already a member" |
| Owner removes self | Not allowed, show error |
| Free tier user invited as editor | They can view but edits are blocked ("Upgrade to edit") |
| Deck deleted while invite is pending | Invite page shows "Deck no longer available" |
| User deletes account who was a collaborator | CASCADE removes their collaborator record |
| Activity log gets very long | Paginate, show last 50 by default |

## Testing Checklist
- [ ] Owner can create an invite link
- [ ] Invite link shows deck preview
- [ ] Logged-in user can accept invitation
- [ ] Not-logged-in user prompted to sign in first
- [ ] Accepted collaborator appears in collaborator list
- [ ] Editor can add/edit/delete cards
- [ ] Viewer can only view cards (edit actions hidden/blocked)
- [ ] Owner can change collaborator role
- [ ] Owner can remove collaborator
- [ ] Activity log shows card changes
- [ ] Activity log shows member join/leave
- [ ] Expired invite shows appropriate message
- [ ] Free tier collaborator limited to view-only
- [ ] Shared decks appear in collaborator's deck list with "Shared" badge

## Open Questions
1. Should invite links be single-use or multi-use? **Default: Single-use — one person per link. Owner generates a new link for each person.**
2. Should collaborators be able to see each other's names? **Default: Yes, the collaborator list is visible to all members.**
3. Should there be a limit on collaborators per deck? **Default: Free = 3 collaborators, Pro = 10 collaborators.**
