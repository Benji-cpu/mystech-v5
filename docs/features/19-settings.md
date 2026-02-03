# Feature 19: Settings Page

## Overview
User profile and account settings. Users can update their display name, bio, and view connected accounts. Includes a danger zone for account deletion.

## User Stories
- As a user, I want to set a display name different from my Google name
- As a user, I want to add a bio/description
- As a user, I want to see which Google account is connected
- As a user, I want to delete my account and all data

## Requirements

### Must Have
- [ ] Profile section: display name, bio
- [ ] Account section: connected Google account info (email, avatar)
- [ ] Save profile changes
- [ ] Danger zone: delete account with confirmation
- [ ] Account deletion removes all user data (decks, cards, readings, person cards, etc.)

### Nice to Have
- [ ] Upload custom avatar (overriding Google avatar)
- [ ] Notification preferences
- [ ] Export data (download all decks/readings as JSON)

## UI/UX

### Settings Page (`/settings`)
```
┌────────────────────────────────────────────┐
│ Settings                                   │
│                                            │
│ ─── Profile ───                            │
│                                            │
│ [Avatar]  Display Name: [___________]      │
│           Bio:                             │
│           [_____________________________]  │
│           [_____________________________]  │
│                                            │
│ [Save Changes]                             │
│                                            │
│ ─── Connected Account ───                  │
│                                            │
│ Google: user@gmail.com ✅ Connected        │
│                                            │
│ ─── Subscription ───                       │
│                                            │
│ Current plan: Free                         │
│ [Manage Billing →]  (links to /settings/billing)
│                                            │
│ ─── Danger Zone ───                        │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Delete Account                         │ │
│ │ Permanently delete your account and    │ │
│ │ all associated data. This cannot be    │ │
│ │ undone.                                │ │
│ │ [Delete My Account]                    │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Delete Confirmation Dialog
```
┌────────────────────────────────────────┐
│ ⚠️ Delete Account                      │
│                                        │
│ This will permanently delete:          │
│ • All your decks and cards            │
│ • All your readings                   │
│ • All your person cards               │
│ • Your profile and preferences        │
│                                        │
│ Type "DELETE" to confirm:              │
│ [___________]                          │
│                                        │
│ [Cancel]  [Delete Permanently]         │
└────────────────────────────────────────┘
```

## Data Model
No new tables. Uses existing `users` table fields: `displayName`, `bio`.

### Account Deletion Cascade
Due to CASCADE delete on foreign keys, deleting the user record automatically removes:
- accounts (OAuth connections)
- sessions
- decks → cards (cascaded)
- person_cards
- readings → reading_cards (cascaded)
- subscriptions
- usage_tracking
- deck_collaborators
- activity_log entries
- art_styles (created by user)

Additionally:
- Cancel Stripe subscription if active
- Delete Vercel Blob files (person card photos, card images)

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/user/profile` | Get current user profile |
| PATCH | `/api/user/profile` | Update display name, bio |
| DELETE | `/api/user/account` | Delete account (requires confirmation) |

### DELETE `/api/user/account`
**Input:**
```json
{
  "confirmation": "DELETE"
}
```

**Process:**
1. Verify confirmation text matches "DELETE"
2. Cancel Stripe subscription if exists
3. Delete Vercel Blob files for user's images
4. Delete user record (cascades everything)
5. Clear session
6. Return success

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User types wrong confirmation text | Button stays disabled until exact match |
| Stripe cancellation fails during deletion | Log error, continue with deletion (orphaned Stripe customer is fine) |
| Blob deletion fails | Log error, continue (orphaned blobs are cleaned up later) |
| User is a deck owner with active collaborators | Deck is deleted, collaborators lose access |
| Display name is empty | Fall back to Google name |
| Very long bio | Max 500 characters, enforced client + server side |

## Testing Checklist
- [ ] Can update display name
- [ ] Can update bio
- [ ] Changes persist after page refresh
- [ ] Connected Google account info displays correctly
- [ ] "Manage Billing" links to billing page
- [ ] Delete account requires typing "DELETE"
- [ ] Delete button disabled until confirmation matches
- [ ] Account deletion removes all data
- [ ] After deletion, user is logged out and redirected to home
- [ ] Stripe subscription cancelled on deletion

## Open Questions
1. Should display name be unique? **Default: No, display names don't need to be unique. They're just for personalization.**
2. Should we offer data export before deletion? **Default: Nice to have but not for initial build. Add later if users request it.**
3. Should collaborators be notified when an owner deletes their account? **Default: No notification mechanism yet (no email service). Decks just disappear for collaborators.**
