# Feature 14: AI Reading Interpretation

## Overview
After cards are drawn in a reading, the AI generates a streaming interpretation that weaves together the card meanings, their spread positions, the user's question, and any person cards present. Uses tiered AI quality (Free: Flash-Lite, Pro: 2.5 Flash).

## User Stories
- As a user, I want the AI to interpret my reading based on the cards drawn
- As a user, I want the interpretation to relate to my question
- As a user, I want to see the interpretation stream in real-time
- As a user, I want person cards to be interpreted with their personal meaning

## Requirements

### Must Have
- [ ] AI interpretation using Vercel AI SDK `streamText()`
- [ ] System prompt incorporating: spread type, position meanings, card details, question
- [ ] Streaming display (typewriter-style text appearance)
- [ ] Person cards include their personal meaning/relationship context
- [ ] Tiered model: Free = Gemini 2.0 Flash-Lite, Pro = Gemini 2.5 Flash
- [ ] Interpretation saved to reading record after completion
- [ ] "Get Interpretation" button after cards are revealed

### Nice to Have
- [ ] Regenerate interpretation option
- [ ] Interpretation section headers (Overall Theme, Individual Cards, Guidance)
- [ ] Highlight which part of interpretation relates to which card

## UI/UX

### Interpretation Display
```
┌────────────────────────────────────────┐
│ Your Reading                           │
│                                        │
│ [Three Card Spread displayed above]    │
│                                        │
├────────────────────────────────────────┤
│ ✨ Interpretation                      │
│                                        │
│ The cards have spoken, and they reveal │
│ a journey from reflection to action... │
│                                        │
│ **The First Frost (Past)**             │
│ In the position of what has been, this │
│ card speaks of a period of dormancy... │
│ ▌                                      │ ← streaming cursor
│                                        │
├────────────────────────────────────────┤
│ [🔄 Regenerate]  [💾 Save Reading]     │
└────────────────────────────────────────┘
```

After streaming completes:
- Full interpretation visible with scroll
- Save button stores the interpretation
- Share button (Feature 15) becomes available

## AI Prompt Design

### System Prompt
```
You are a wise oracle reader interpreting a {spreadType} card reading. Your tone is mystical, insightful, and personally meaningful — like a trusted spiritual guide who sees deeply.

Spread type: {spreadType}
User's question: {question || "No specific question — provide general guidance"}

Cards drawn:
{For each card in reading:}
Position {n}: {positionName}
Card: "{cardTitle}"
{If person card: "This is a Person Card representing {name} ({relationship}): {description}"}
Meaning: {meaning}
Guidance: {guidance}

Structure your interpretation:
1. **Opening** — Set the tone and acknowledge the question/intention
2. **Card-by-Card** — Interpret each card in its position, weaving connections between them
3. **Synthesis** — How do the cards work together? What's the overall message?
4. **Guidance** — Practical, actionable advice based on the reading

For person cards, honor the personal relationship. The person's presence in this position carries special significance.

Write naturally in flowing paragraphs. Use markdown for structure (**bold** for card names and section headers). Aim for 400-800 words depending on spread complexity.
```

### Word Count by Spread
| Spread | Target Words |
|--------|-------------|
| Single | 200-300 |
| Three Card | 400-500 |
| Five Card | 500-700 |
| Celtic Cross | 700-1000 |

## Data Model
No new tables. Updates `readings.interpretation` field with completed text.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/reading` | Stream reading interpretation |

### POST `/api/ai/reading`
**Input:**
```json
{
  "readingId": "abc123"
}
```

**Process:**
1. Load reading with all reading_cards, their associated cards/person_cards
2. Determine AI model based on user's plan (free vs pro)
3. Construct prompt with spread context, card details, question
4. Stream response via Vercel AI SDK
5. After stream completes, save full interpretation to reading record
6. Return streamed response

### Model Selection
```typescript
const model = userPlan === 'pro'
  ? google('gemini-2.5-flash')       // Deeper, more nuanced
  : google('gemini-2.0-flash-lite'); // Simpler, cheaper
```

## Dependencies
- `ai` (Vercel AI SDK)
- `@ai-sdk/google` (Gemini provider)

## Edge Cases
| Scenario | Handling |
|----------|----------|
| AI stream fails mid-response | Show partial text + error message, allow retry |
| Reading has no question | Prompt adjusts to "general guidance" mode |
| Reading includes only person cards | Prompt focuses on relational/personal themes |
| Very long card meanings (lots of context) | Summarize card meanings if total context exceeds model limits |
| User navigates away during stream | Interpretation still saved if stream was completing server-side |
| Regenerate requested | Create new AI call, overwrite previous interpretation |

## Testing Checklist
- [ ] Interpretation streams in real-time after card draw
- [ ] Interpretation references specific cards by name
- [ ] Interpretation references spread positions
- [ ] Question/intention is woven into interpretation
- [ ] Person cards interpreted with relationship context
- [ ] Free tier uses Flash-Lite model
- [ ] Pro tier uses 2.5 Flash model
- [ ] Interpretation saved to database after completion
- [ ] Regenerate produces a new interpretation
- [ ] Markdown formatting renders correctly (bold, headers)
- [ ] Works for all spread types (single through Celtic cross)

## Open Questions
1. Should we use Gemini's thinking/reasoning mode for deeper interpretations? **Default: Yes for Pro tier Celtic cross readings (complex). No for simple spreads — unnecessary cost.**
2. Should interpretation be auto-triggered or require button click? **Default: Button click ("Reveal Interpretation") — gives user a moment to reflect on the cards before AI speaks.**
3. Should we cache/save the AI model used for each reading? **Default: No, not needed. Reading quality is self-evident.**
