// Chronicle flow — persistent shell state machine
// Pure TypeScript, no React imports beyond type usage

export type ChroniclePhase =
  | 'idle'
  | 'greeting'
  | 'dialogue'
  | 'reflecting'
  | 'card_forging'
  | 'card_reveal'
  | 'reading'
  | 'complete';

export type ChronicleCard = {
  id: string;
  title: string;
  meaning: string;
  guidance: string;
  imageUrl: string | null;
  imageStatus: string;
};

export type ChronicleMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChronicleBadgeNotice = {
  id: string;
  name: string;
  lyraMessage: string;
};

// ── State shape ─────────────────────────────────────────────────────────

export type ChronicleState = {
  phase: ChroniclePhase;
  messages: ChronicleMessage[];
  isStreaming: boolean;
  card: ChronicleCard | null;
  miniReading: string | null;
  streakCount: number;
  newBadge: ChronicleBadgeNotice | null;
  journeyRecorded: boolean;
  error: string | null;
};

// ── Actions ─────────────────────────────────────────────────────────────

export type ChronicleAction =
  | { type: 'START_GREETING' }
  | { type: 'GREETING_DONE' }
  | { type: 'ADD_USER_MESSAGE'; content: string }
  | { type: 'START_STREAMING' }
  | { type: 'STREAM_TOKEN'; token: string }
  | { type: 'STREAM_COMPLETE'; content: string }
  | { type: 'START_REFLECTING' }
  | { type: 'REFLECTING_DONE' }
  | { type: 'START_FORGING' }
  | { type: 'FORGE_COMPLETE'; card: ChronicleCard }
  | { type: 'FORGE_ERROR'; error: string }
  | { type: 'CARD_REVEALED' }
  | { type: 'START_READING' }
  | { type: 'READING_STREAM_TOKEN'; token: string }
  | { type: 'READING_COMPLETE'; miniReading: string }
  | { type: 'COMPLETE'; streakCount: number; newBadge: ChronicleBadgeNotice | null; journeyRecorded?: boolean }
  | { type: 'SKIP_TO_COMPLETE'; streakCount: number }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESTORE'; messages: ChronicleMessage[]; card: ChronicleCard | null; miniReading: string | null; phase: ChroniclePhase };

// ── Initial state ────────────────────────────────────────────────────────

export const initialChronicleState: ChronicleState = {
  phase: 'idle',
  messages: [],
  isStreaming: false,
  card: null,
  miniReading: null,
  streakCount: 0,
  newBadge: null,
  journeyRecorded: false,
  error: null,
};

// ── Reducer ──────────────────────────────────────────────────────────────

export function chronicleReducer(
  state: ChronicleState,
  action: ChronicleAction
): ChronicleState {
  switch (action.type) {
    case 'START_GREETING':
      return { ...state, phase: 'greeting', error: null };

    case 'GREETING_DONE':
      return { ...state, phase: 'dialogue' };

    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { role: 'user', content: action.content }],
      };

    case 'START_STREAMING':
      return {
        ...state,
        isStreaming: true,
        // Push a blank assistant message that will be filled token by token
        messages: [...state.messages, { role: 'assistant', content: '' }],
      };

    case 'STREAM_TOKEN': {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + action.token };
      }
      return { ...state, messages: msgs };
    }

    case 'STREAM_COMPLETE': {
      // Finalise the last assistant message with the full content
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: action.content };
      }
      return { ...state, messages: msgs, isStreaming: false };
    }

    case 'START_REFLECTING':
      return { ...state, phase: 'reflecting', isStreaming: false };

    case 'REFLECTING_DONE':
      return { ...state, phase: 'card_forging' };

    case 'START_FORGING':
      return { ...state, phase: 'card_forging', error: null };

    case 'FORGE_COMPLETE':
      return { ...state, phase: 'card_reveal', card: action.card, error: null };

    case 'FORGE_ERROR':
      return { ...state, phase: 'dialogue', error: action.error };

    case 'CARD_REVEALED':
      return { ...state, phase: 'reading' };

    case 'START_READING':
      return { ...state, phase: 'reading', isStreaming: true, miniReading: '' };

    case 'READING_STREAM_TOKEN':
      return {
        ...state,
        miniReading: (state.miniReading ?? '') + action.token,
      };

    case 'READING_COMPLETE':
      return { ...state, miniReading: action.miniReading, isStreaming: false };

    case 'COMPLETE':
      return {
        ...state,
        phase: 'complete',
        streakCount: action.streakCount,
        newBadge: action.newBadge,
        journeyRecorded: action.journeyRecorded ?? false,
        isStreaming: false,
      };

    case 'SKIP_TO_COMPLETE':
      return {
        ...state,
        phase: 'complete',
        streakCount: action.streakCount,
        isStreaming: false,
      };

    case 'SET_ERROR':
      return { ...state, error: action.error, isStreaming: false };

    case 'RESTORE':
      return {
        ...state,
        phase: action.phase,
        messages: action.messages,
        card: action.card,
        miniReading: action.miniReading,
      };

    default:
      return state;
  }
}

// ── Phase helpers ─────────────────────────────────────────────────────────

/** True when the card zone should be visible */
export function isCardZoneVisible(phase: ChroniclePhase): boolean {
  return phase === 'card_forging' || phase === 'card_reveal' || phase === 'reading' || phase === 'complete';
}

/** True when the dialogue zone should be visible */
export function isDialogueZoneVisible(phase: ChroniclePhase): boolean {
  return phase === 'greeting' || phase === 'dialogue' || phase === 'reflecting' || phase === 'reading' || phase === 'complete';
}

/** True when the mini-reading text is the main content (dialogue zone is reading) */
export function isReadingZoneActive(phase: ChroniclePhase): boolean {
  return phase === 'reading' || phase === 'complete';
}

/** User message count */
export function userMessageCount(messages: ChronicleMessage[]): number {
  return messages.filter((m) => m.role === 'user').length;
}
