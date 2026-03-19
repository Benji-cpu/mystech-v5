// Chronicle flow — persistent shell state machine
// Pure TypeScript, no React imports beyond type usage

export type ChroniclePhase =
  | 'idle'
  | 'emergence_reveal'
  | 'greeting'
  | 'dialogue'
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

export type EmergenceCardData = {
  id: string;
  title: string;
  meaning: string;
  guidance: string;
  imageUrl: string | null;
  imageStatus: string;
  cardType: 'obstacle' | 'threshold';
  detectedPattern: string;
};

export type ChronicleState = {
  phase: ChroniclePhase;
  messages: ChronicleMessage[];
  isStreaming: boolean;
  lyraSignaledReady: boolean;
  card: ChronicleCard | null;
  miniReading: string | null;
  streakCount: number;
  newBadge: ChronicleBadgeNotice | null;
  journeyRecorded: boolean;
  error: string | null;
  emergenceCard: EmergenceCardData | null;
  emergenceMessage: string | null;
  emergenceAcknowledged: boolean;
};

// ── Actions ─────────────────────────────────────────────────────────────

export type ChronicleAction =
  | { type: 'START_GREETING' }
  | { type: 'GREETING_DONE' }
  | { type: 'ADD_USER_MESSAGE'; content: string }
  | { type: 'START_STREAMING' }
  | { type: 'STREAM_TOKEN'; token: string }
  | { type: 'STREAM_COMPLETE'; content: string }
  | { type: 'START_FORGING' }
  | { type: 'FORGE_COMPLETE'; card: ChronicleCard }
  | { type: 'FORGE_ERROR'; error: string }
  | { type: 'CARD_REVEALED' }
  | { type: 'START_READING' }
  | { type: 'READING_STREAM_TOKEN'; token: string }
  | { type: 'READING_COMPLETE'; miniReading: string }
  | { type: 'COMPLETE'; streakCount: number; newBadge: ChronicleBadgeNotice | null; journeyRecorded?: boolean }
  | { type: 'SKIP_TO_COMPLETE'; streakCount: number }
  | { type: 'LYRA_READY' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'STREAM_CANCEL'; error: string }
  | { type: 'RESTORE'; messages: ChronicleMessage[]; card: ChronicleCard | null; miniReading: string | null; phase: ChroniclePhase }
  | { type: 'UPDATE_CARD_IMAGE'; imageUrl: string | null; imageStatus: string }
  | { type: 'START_EMERGENCE'; card: EmergenceCardData; message: string }
  | { type: 'EMERGENCE_ACKNOWLEDGED' };

// ── Initial state ────────────────────────────────────────────────────────

export const initialChronicleState: ChronicleState = {
  phase: 'idle',
  messages: [],
  isStreaming: false,
  lyraSignaledReady: false,
  card: null,
  miniReading: null,
  streakCount: 0,
  newBadge: null,
  journeyRecorded: false,
  error: null,
  emergenceCard: null,
  emergenceMessage: null,
  emergenceAcknowledged: false,
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

    case 'START_FORGING':
      return { ...state, phase: 'card_forging', error: null };

    case 'FORGE_COMPLETE':
      return { ...state, phase: 'card_reveal', card: action.card, error: null };

    case 'FORGE_ERROR':
      return { ...state, phase: 'dialogue', error: action.error, lyraSignaledReady: false };

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

    case 'LYRA_READY':
      return { ...state, lyraSignaledReady: true };

    case 'SET_ERROR':
      return { ...state, error: action.error, isStreaming: false };

    case 'STREAM_CANCEL': {
      // Remove the blank assistant message pushed by START_STREAMING
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant' && !last.content) {
        msgs.pop();
      }
      return { ...state, messages: msgs, isStreaming: false, error: action.error };
    }

    case 'RESTORE':
      return {
        ...state,
        phase: action.phase,
        messages: action.messages,
        card: action.card,
        miniReading: action.miniReading,
      };

    case 'UPDATE_CARD_IMAGE':
      if (!state.card) return state;
      return {
        ...state,
        card: { ...state.card, imageUrl: action.imageUrl, imageStatus: action.imageStatus },
      };

    case 'START_EMERGENCE':
      return {
        ...state,
        phase: 'emergence_reveal',
        emergenceCard: action.card,
        emergenceMessage: action.message,
      };

    case 'EMERGENCE_ACKNOWLEDGED':
      return {
        ...state,
        phase: 'greeting',
        emergenceAcknowledged: true,
        // Keep emergenceCard and emergenceMessage — needed for greeting/dialogue context
      };

    default:
      return state;
  }
}

// ── Phase helpers ─────────────────────────────────────────────────────────

/** True when the card zone should be visible */
export function isCardZoneVisible(phase: ChroniclePhase): boolean {
  return phase === 'emergence_reveal' || phase === 'card_forging' || phase === 'card_reveal' || phase === 'reading' || phase === 'complete';
}

/** True when the dialogue zone should be visible */
export function isDialogueZoneVisible(phase: ChroniclePhase): boolean {
  return phase === 'emergence_reveal' || phase === 'greeting' || phase === 'dialogue' || phase === 'card_forging' || phase === 'reading' || phase === 'complete';
}

/** True when the mini-reading text is the main content (dialogue zone is reading) */
export function isReadingZoneActive(phase: ChroniclePhase): boolean {
  return phase === 'reading' || phase === 'complete';
}

/** User message count */
export function userMessageCount(messages: ChronicleMessage[]): number {
  return messages.filter((m) => m.role === 'user').length;
}
