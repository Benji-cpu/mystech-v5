# Paths — Spiritual/Philosophical Frameworks

## Status: Planned (Spec Only)

## Overview

"Paths" evolve the dead `spiritualInterests` database field into a proper framework system. A Path is a spiritual or philosophical lens (e.g., Astrology, Zen, Stoicism) that shapes how the AI interprets readings and generates deck content. Users choose one active Path that influences their entire experience.

## Concept

- **Path**: A named framework with themes, symbolic vocabulary, and an interpretive lens paragraph
- **One active Path per user** — set globally on their profile
- **9 preset Paths** ship with the app (single-word names)
- **Custom Paths** created via AI-guided interview (3-5 turns with Lyra)
- **Shareable** — users can follow Paths created by others (like art styles)

## Preset Paths

| Name | Description | Example Themes |
|------|-------------|----------------|
| Astrology | Celestial bodies and zodiac archetypes | planetary influence, zodiac archetypes, houses, transits, cosmic cycles |
| Mindfulness | Present-moment awareness and compassion | present awareness, non-judgment, impermanence, compassion, breath |
| Zen | Direct experience beyond conceptual thought | emptiness, beginner's mind, koans, sitting, non-attachment |
| Archetypal | Jungian psychology and collective unconscious | shadow, anima/animus, collective unconscious, hero's journey, individuation |
| Tarot | Traditional Western esoteric symbolism | major arcana, elements, numerology, kabbalah, hermetic tradition |
| Stoicism | Virtue ethics and rational self-mastery | virtue, dichotomy of control, memento mori, amor fati, logos |
| Shamanic | Animistic nature-based spirituality | spirit animals, plant medicine, journeying, elements, ancestors |
| Mysticism | Direct experience of the divine/transcendent | union, contemplation, dark night, sacred geometry, theosis |
| Vedic | Hindu philosophical and yogic traditions | dharma, karma, chakras, gunas, maya, moksha |

### Preset Definition Structure

Each preset has:
- `name`: Single word
- `description`: One sentence (shown in selector UI)
- `themes`: 5-8 thematic keywords that guide AI context
- `symbolicVocabulary`: 10-15 terms the AI should weave into interpretations
- `interpretiveLens`: One paragraph describing how to approach card meanings through this framework
- `iconKey`: String key mapped to an icon component (e.g., `"star"`, `"lotus"`, `"mountain"`)

## Data Model

### New Tables

```sql
-- paths table
paths (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  description   text NOT NULL,
  themes        text[] NOT NULL,           -- e.g. ['planetary influence', 'zodiac archetypes']
  symbolic_vocabulary text[] NOT NULL,     -- e.g. ['transit', 'house', 'aspect']
  interpretive_lens text NOT NULL,         -- paragraph for AI prompt injection
  is_preset     boolean NOT NULL DEFAULT false,
  created_by    uuid REFERENCES users(id),
  is_public     boolean NOT NULL DEFAULT false,
  share_token   text UNIQUE,
  follower_count integer NOT NULL DEFAULT 0,
  icon_key      text NOT NULL DEFAULT 'sparkles',
  created_at    timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now()
)

-- path followers (many-to-many)
path_followers (
  path_id       uuid REFERENCES paths(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  followed_at   timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (path_id, user_id)
)
```

### Schema Modifications

```sql
-- Add active path to user profiles
ALTER TABLE user_profiles ADD COLUMN active_path_id uuid REFERENCES paths(id);

-- Snapshot path at reading/deck creation time
ALTER TABLE readings ADD COLUMN path_id uuid REFERENCES paths(id);
ALTER TABLE decks ADD COLUMN path_id uuid REFERENCES paths(id);
```

### Deprecated Fields (Remove in Migration)

- `astrology_profiles.spiritual_interests` — dead field, never populated
- `user_profiles.interests` — dead field, replaced by active path
- `chronicle_settings.interests` — dead field, replaced by active path

## Integration Points

### Reading Interpretation

When a user has an active Path, inject path context into the AI interpretation prompt:

```
// Added to system prompt for reading interpretation
The querent follows the {path.name} path.

Interpretive lens: {path.interpretiveLens}

When interpreting cards, weave in these themes where relevant: {path.themes.join(', ')}.
Use symbolic vocabulary from this tradition: {path.symbolicVocabulary.join(', ')}.
Do not force every term — use them naturally where the card meanings align.
```

### Deck Creation (Simple Mode)

Path context injected into card generation prompts to influence card names, descriptions, and image prompts.

### Deck Creation (Journey Mode)

Lyra references the user's active Path during the AI conversation, asking how their framework connects to the life experiences being explored.

### UI Touchpoints

- **Path selector**: Shown in reading setup zone (before spread selection) and deck creation forms
- **Active path badge**: Displayed on user profile and in the app sidebar
- **`/paths` hub page**: Browse presets, manage followed paths, create custom paths
- **Explore tab**: "Paths" tab alongside "Styles" and "Decks" in the explore section

## Custom Path Creation (Phase 2)

### AI-Guided Interview

Lyra guides a 3-5 turn conversation to understand the user's framework:

1. "What spiritual or philosophical tradition speaks to you most?"
2. "What themes or concepts from this tradition resonate with your daily life?"
3. "When you seek guidance, what kind of symbolic language feels meaningful?"
4. "How would you describe the lens through which you interpret life's patterns?"
5. (Optional) "Is there anything else that defines your spiritual perspective?"

After the interview, Lyra synthesizes a Path profile (name, description, themes, vocabulary, lens). The user can edit any field before saving.

### System Prompt for Interview

```
You are Lyra, a wise mystic guide helping the user define their spiritual path.
Your goal is to synthesize their responses into a structured Path profile with:
- A single-word or short name
- A one-sentence description
- 5-8 thematic keywords
- 10-15 symbolic vocabulary terms
- An interpretive lens paragraph (2-3 sentences)

Be warm, curious, and non-judgmental. Accept syncretic or unconventional frameworks.
After 3-5 exchanges, present the synthesized profile for their review.
```

## Sharing (Phase 2)

- Same pattern as art style sharing: share tokens, public page at `/shared/paths/[token]`
- **Follow/unfollow model** (no accept/reject gate — simpler than art style sharing)
- Followed paths appear in user's `/paths` hub alongside presets
- `follower_count` incremented/decremented on follow/unfollow
- Explore tab shows popular community paths

## Phased Rollout

### MVP (Phase 1)
- 9 preset Paths seeded in database
- Path selector in reading setup and deck creation
- `active_path_id` on user profile
- Path context injected into reading interpretation prompt
- Path context injected into simple deck creation prompt
- `/paths` hub page (presets only)
- Active path badge on profile

### Phase 2
- Custom Path creation via AI interview
- Path sharing (share tokens, public pages)
- Follow/unfollow model
- Paths in Explore tab
- Path context in Journey mode deck creation

### Phase 3
- Path analytics (which paths users engage with most)
- Path recommendations based on reading history
- Path evolution (Lyra suggests refinements over time)
- Path blending (combine two paths into a hybrid)

## Open Questions

- Should path selection be required or optional? (Recommendation: optional — no path = generic interpretation)
- Should changing your active path retroactively affect past readings? (Recommendation: no — path is snapshotted at creation time via `path_id` FK)
- Should preset paths be editable/forkable? (Recommendation: Phase 3 — fork a preset into a custom path)

## Testing Checklist

- [ ] All 9 preset paths seeded and selectable
- [ ] Active path persists on user profile
- [ ] Path context appears in AI interpretation (verify via prompt logging)
- [ ] Path context appears in deck creation prompts
- [ ] Path selector works on mobile (390px)
- [ ] No path selected = generic interpretation (no errors)
- [ ] Path badge displays correctly on profile
- [ ] `/paths` hub page renders all presets
