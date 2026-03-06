'use client';

import {
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { MicrophoneButton } from '@/components/voice/microphone-button';
import { LyraSigil } from '@/components/guide/lyra-sigil';
import { useImmersiveOptional } from '@/components/immersive/immersive-provider';

import {
  chronicleReducer,
  initialChronicleState,
  isCardZoneVisible,
  isDialogueZoneVisible,
  isReadingZoneActive,
  userMessageCount,
  type ChronicleState,
} from './use-chronicle-state';
import { ChronicleDialogue } from './chronicle-dialogue';
import { CardForgingAnimation } from './card-forging-animation';
import { OracleCard } from '@/components/cards/oracle-card';

import type { Card, CardImageStatus, ChronicleEntry, ChronicleSettings, JourneyPosition } from '@/types';

// ── Springs ──────────────────────────────────────────────────────────────

const ZONE_SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };
const CONTENT_SPRING = { type: 'spring' as const, stiffness: 280, damping: 28 };

// ── Greeting messages by time of day ─────────────────────────────────────

function getLyraGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5)  return "The night holds its breath. What stirs within you at this quiet hour?";
  if (hour < 12) return "Good morning. The day is fresh with possibility. What threads of your life shall we explore today?";
  if (hour < 17) return "The afternoon light bends to listen. How have the hours been weaving themselves for you today?";
  if (hour < 21) return "As evening descends, I am here. What has today placed in your hands — or taken away?";
  return "The night deepens. Before you rest, let us tend to the threads of today. What wishes to be known?";
}

function getPathAwareGreeting(waypointName: string): string {
  const hour = new Date().getHours();
  if (hour < 5) return `The night is still. Today's waypoint — "${waypointName}" — waits for your reflection.`;
  if (hour < 12) return `Good morning. Your path continues today through "${waypointName}." What has this theme been stirring in you?`;
  if (hour < 17) return `The afternoon bends to listen. Today we walk with "${waypointName}." What comes to mind?`;
  if (hour < 21) return `As evening descends, let us tend to "${waypointName}." What has the day revealed about this theme?`;
  return `The night deepens. Before you rest, let us sit with "${waypointName}." What wishes to be known?`;
}

// ── Reflecting messages ───────────────────────────────────────────────────

const REFLECTING_MESSAGES = [
  "I see the threads of what you have shared... let me weave them into something tangible for you.",
  "The patterns are coming together. Something is taking shape from the essence of today...",
  "I am gathering the wisdom from our exchange, distilling it into a card born of this moment.",
];

// ── Props ─────────────────────────────────────────────────────────────────

interface ChronicleFlowProps {
  deckId: string;
  initialEntry: ChronicleEntry | null;
  settings: ChronicleSettings | null;
  todayCard: {
    id: string;
    title: string;
    meaning: string;
    guidance: string;
    imageUrl: string | null;
    imageStatus: string;
  } | null;
  initialPhase: string;
  isFirstEntry?: boolean;
  journeyPosition: JourneyPosition | null;
}

// ── ChronicleCard → Card adapter ──────────────────────────────────────────

function toCard(chronicle: NonNullable<ChronicleFlowProps['todayCard']>): Card {
  return {
    id: chronicle.id,
    deckId: '',
    cardNumber: 0,
    title: chronicle.title,
    meaning: chronicle.meaning,
    guidance: chronicle.guidance,
    imageUrl: chronicle.imageUrl,
    imagePrompt: null,
    imageStatus: chronicle.imageStatus as CardImageStatus,
    cardType: 'general' as const,
    originContext: null,
    createdAt: new Date(),
  };
}

// ── Badge notification ────────────────────────────────────────────────────

interface BadgeNoticeProps {
  name: string;
  lyraMessage: string;
  onDismiss: () => void;
}

function BadgeNotice({ name, lyraMessage, onDismiss }: BadgeNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={CONTENT_SPRING}
      className="rounded-2xl bg-gradient-to-r from-[#c9a94e]/10 to-purple-900/20 border border-[#c9a94e]/30 p-4"
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: 2 }}
          className="text-2xl shrink-0"
        >
          ✦
        </motion.div>
        <div className="min-w-0">
          <p className="text-[#c9a94e] font-semibold text-sm mb-1">{name} — Earned!</p>
          <p className="text-white/60 text-xs leading-relaxed">{lyraMessage}</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors w-full text-right"
      >
        Continue
      </button>
    </motion.div>
  );
}

// ── Streak badge ──────────────────────────────────────────────────────────

function StreakBadge({ count }: { count: number }) {
  if (count < 2) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={CONTENT_SPRING}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c9a94e]/10 border border-[#c9a94e]/20"
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-[#c9a94e] text-xs"
      >
        ✦
      </motion.span>
      <span className="text-[#c9a94e] text-xs font-medium">{count} day streak</span>
    </motion.div>
  );
}

// ── Action input bar ──────────────────────────────────────────────────────

interface ActionBarProps {
  phase: string;
  inputValue: string;
  isStreaming: boolean;
  canForge: boolean;
  isFirstEntry: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onForge: () => void;
  onMicTranscript: (text: string, isFinal: boolean) => void;
}

function ActionBar({
  phase,
  inputValue,
  isStreaming,
  canForge,
  onInputChange,
  onSend,
  isFirstEntry,
  onForge,
  onMicTranscript,
}: ActionBarProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (phase === 'greeting' || phase === 'reflecting' || phase === 'card_forging') {
    return (
      <div className="h-11 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#c9a94e]/50"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  if (phase === 'dialogue') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={CONTENT_SPRING}
        className="flex flex-col gap-2"
      >
        {/* Input row — standard pattern matching ConversationChat */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            disabled={isStreaming}
            maxLength={500}
            rows={1}
            className="min-h-[44px] max-h-[120px] resize-none bg-white/5 border-white/10 text-white/90 placeholder:text-white/25 focus-visible:ring-[#c9a94e]/20 focus-visible:border-[#c9a94e]/40"
          />
          <MicrophoneButton
            onTranscript={onMicTranscript}
          />
          <Button
            type="button"
            size="icon"
            onClick={onSend}
            disabled={isStreaming || !inputValue.trim()}
            className="flex-shrink-0 h-[44px] w-[44px]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Forge CTA — shown after Lyra's wrap-up signal */}
        {canForge && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={CONTENT_SPRING}
          >
            {isFirstEntry && (
              <p className="text-xs text-[#c9a94e]/60 text-center mb-2">
                Your first card is ready to be forged from today&apos;s conversation
              </p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onForge}
              className={cn(
                'w-full py-3 rounded-xl font-semibold text-sm',
                'bg-gradient-to-r from-[#c9a94e] to-[#daa520] text-black',
                'shadow-lg shadow-[#c9a94e]/20 hover:shadow-xl hover:shadow-[#c9a94e]/30',
                'transition-shadow duration-300',
              )}
            >
              Forge Your Card
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (phase === 'card_reveal') {
    return <div className="h-11" />;
  }

  if (phase === 'reading') {
    return (
      <div className="h-11" />
    );
  }

  if (phase === 'complete') {
    return null;
  }

  return null;
}

// ── Main Chronicle Flow ───────────────────────────────────────────────────

export function ChronicleFlow({
  deckId,
  initialEntry,
  settings,
  todayCard,
  initialPhase,
  isFirstEntry = false,
  journeyPosition,
}: ChronicleFlowProps) {
  const immersive = useImmersiveOptional();
  const setMoodPreset = immersive?.setMoodPreset;

  // Normalise initialPhase to a known ChroniclePhase
  const resolvedInitialPhase = (() => {
    const valid = ['idle', 'greeting', 'dialogue', 'reflecting', 'card_forging', 'card_reveal', 'reading', 'complete'];
    return valid.includes(initialPhase) ? (initialPhase as ChronicleState['phase']) : 'idle';
  })();

  const [state, dispatch] = useReducer(chronicleReducer, {
    ...initialChronicleState,
    phase: resolvedInitialPhase,
    card: todayCard ?? null,
    streakCount: settings?.streakCount ?? 0,
  });

  const [inputValue, setInputValue] = useState('');
  const [reflectingMsg, setReflectingMsg] = useState('');
  const [showBadge, setShowBadge] = useState(true);

  // Refs for one-shot effects
  const reflectingFired = useRef(false);
  const forgeFired = useRef(false);
  const readingFired = useRef(false);
  const completeFired = useRef(false);

  const { phase, messages, isStreaming, lyraSignaledReady, card, miniReading, streakCount, newBadge, journeyRecorded, error } = state;

  const canForge = useMemo(
    () => lyraSignaledReady && !isStreaming,
    [lyraSignaledReady, isStreaming]
  );

  // ── Restore from server state ────────────────────────────────────────

  useEffect(() => {
    if (resolvedInitialPhase === 'idle') return;

    const restoredMessages = initialEntry?.conversation?.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })) ?? [];

    dispatch({
      type: 'RESTORE',
      messages: restoredMessages,
      card: todayCard ?? null,
      miniReading: initialEntry?.miniReading ?? null,
      phase: resolvedInitialPhase,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  // ── Mood shifts ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!setMoodPreset) return;
    const moodMap: Record<string, string> = {
      idle: 'default',
      greeting: 'reading-setup',
      dialogue: 'reading-setup',
      reflecting: 'midnight',
      card_forging: 'forging',
      card_reveal: 'golden',
      reading: 'card-reveal',
      complete: 'completion',
    };
    const preset = moodMap[phase];
    if (preset) setMoodPreset(preset as Parameters<typeof setMoodPreset>[0]);
  }, [phase, setMoodPreset]);

  // ── Phase: greeting — push Lyra's greeting message ────────────────────
  // StrictMode-safe: uses cleanup `cancelled` flag instead of a persistent ref guard

  useEffect(() => {
    if (phase !== 'greeting') return;

    let cancelled = false;

    dispatch({ type: 'START_STREAMING' });

    const greeting = journeyPosition
      ? getPathAwareGreeting(journeyPosition.waypoint.name)
      : getLyraGreeting();
    let i = 0;

    function tick() {
      if (cancelled) return;
      if (i < greeting.length) {
        dispatch({ type: 'STREAM_TOKEN', token: greeting[i] });
        i++;
        setTimeout(tick, 18);
      } else {
        dispatch({ type: 'STREAM_COMPLETE', content: greeting });
        setTimeout(() => {
          if (!cancelled) dispatch({ type: 'GREETING_DONE' });
        }, 600);
      }
    }

    // Small initial delay to let React settle
    setTimeout(tick, 18);

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, journeyPosition]);

  // ── Phase: reflecting — show a brief message then trigger forge ───────

  useEffect(() => {
    if (phase !== 'reflecting' || reflectingFired.current) return;
    reflectingFired.current = true;

    const msg = REFLECTING_MESSAGES[Math.floor(Math.random() * REFLECTING_MESSAGES.length)];
    setReflectingMsg(msg);

    // Transition to forging after message shown (longer pause for smoother transition)
    const timer = setTimeout(() => {
      dispatch({ type: 'REFLECTING_DONE' });
    }, 3500);

    return () => clearTimeout(timer);
  }, [phase]);

  // ── Phase: card_forging — call forge API ──────────────────────────────

  useEffect(() => {
    if (phase !== 'card_forging' || forgeFired.current) return;
    forgeFired.current = true;

    fetch('/api/chronicle/today/forge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          dispatch({ type: 'FORGE_ERROR', error: data.error ?? 'Failed to forge card' });
          return;
        }
        dispatch({ type: 'FORGE_COMPLETE', card: data.data });
      })
      .catch(() => {
        dispatch({ type: 'FORGE_ERROR', error: 'Something went wrong forging your card.' });
      });
  }, [phase, deckId]);

  // ── Phase: reading — stream mini-reading ─────────────────────────────

  useEffect(() => {
    if (phase !== 'reading' || readingFired.current) return;
    readingFired.current = true;

    dispatch({ type: 'START_READING' });

    fetch('/api/chronicle/today/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          dispatch({ type: 'SET_ERROR', error: 'Failed to generate reading.' });
          return;
        }
        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let accumulated = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          dispatch({ type: 'READING_STREAM_TOKEN', token: chunk });
        }

        dispatch({ type: 'READING_COMPLETE', miniReading: accumulated });

        // Auto-complete after reading finishes
        setTimeout(() => {
          if (!completeFired.current) {
            completeFired.current = true;
            callComplete();
          }
        }, 800);
      })
      .catch(() => {
        dispatch({ type: 'SET_ERROR', error: 'Something went wrong with the reading.' });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Complete API ──────────────────────────────────────────────────────

  const callComplete = useCallback(() => {
    fetch('/api/chronicle/today/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        dispatch({
          type: 'COMPLETE',
          streakCount: data.data.streak?.streakCount ?? streakCount,
          newBadge: data.data.newBadge ?? null,
          journeyRecorded: data.data.journeyRecorded ?? false,
        });
      })
      .catch(() => {
        dispatch({ type: 'COMPLETE', streakCount, newBadge: null });
      });
  }, [deckId, streakCount]);

  // ── Card image polling — polls until imageStatus leaves "generating" ──

  const imagePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!card || card.imageStatus !== 'generating') {
      if (imagePollRef.current) clearInterval(imagePollRef.current);
      return;
    }
    imagePollRef.current = setInterval(() => {
      fetch('/api/chronicle/today')
        .then((r) => r.json())
        .then((data) => {
          const updated = data.data?.todayCard;
          if (updated && updated.imageStatus !== 'generating') {
            dispatch({ type: 'UPDATE_CARD_IMAGE', imageUrl: updated.imageUrl, imageStatus: updated.imageStatus });
            if (imagePollRef.current) clearInterval(imagePollRef.current);
          }
        })
        .catch(() => {});
    }, 3000);
    return () => { if (imagePollRef.current) clearInterval(imagePollRef.current); };
  }, [card?.id, card?.imageStatus]);

  // ── Reset one-shot refs when returning to dialogue after error (allows retry) ──

  useEffect(() => {
    if (phase === 'dialogue' && error) {
      forgeFired.current = false;
      reflectingFired.current = false;
    }
  }, [phase, error]);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleMicTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal && text.trim()) {
      setInputValue((prev) => {
        const separator = prev.trim() ? ' ' : '';
        return prev + separator + text;
      });
    }
  }, []);

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isStreaming) return;

    setInputValue('');
    dispatch({ type: 'ADD_USER_MESSAGE', content });
    dispatch({ type: 'START_STREAMING' });

    try {
      const res = await fetch('/api/chronicle/today/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, deckId }),
      });

      if (!res.ok) {
        dispatch({ type: 'STREAM_COMPLETE', content: "I am having trouble hearing you. Please try again." });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let accumulated = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        dispatch({ type: 'STREAM_TOKEN', token: chunk });
      }

      dispatch({ type: 'STREAM_COMPLETE', content: accumulated });

      // Check if Lyra signaled readiness (2+ exchanges, response doesn't end with a question)
      const totalUserMsgs = userMessageCount(messages) + 1; // +1 for the just-sent message
      if (totalUserMsgs >= 2 && !accumulated.trim().endsWith('?')) {
        dispatch({ type: 'LYRA_READY' });
      }
    } catch {
      dispatch({ type: 'STREAM_COMPLETE', content: "The connection wavered. Please try again." });
    }
  }, [inputValue, isStreaming, deckId, messages]);

  const handleForge = useCallback(() => {
    if (!canForge) return;
    dispatch({ type: 'START_REFLECTING' });
  }, [canForge]);

  // ── Auto-transition: card_reveal → reading (or → /readings/new for journey users) ──

  useEffect(() => {
    if (phase !== 'card_reveal') return;
    const timer = setTimeout(() => {
      if (journeyPosition && card) {
        try {
          sessionStorage.setItem('mystech_reading_handoff', JSON.stringify({
            source: 'chronicle',
            chronicleCardId: card.id,
            question: journeyPosition.waypoint.suggestedIntention,
            deckId,
          }));
        } catch { /* sessionStorage unavailable */ }
        window.location.href = '/readings/new?source=chronicle';
      } else {
        dispatch({ type: 'CARD_REVEALED' });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase, journeyPosition, card, deckId]);

  // ── Zone visibility ──────────────────────────────────────────────────

  const showCardZone = isCardZoneVisible(phase);
  const showDialogueZone = isDialogueZoneVisible(phase);
  const isReadingActive = isReadingZoneActive(phase);

  // Card zone: dominant during forging, half during reveal, compact during reading/complete
  const cardZoneStyle = (() => {
    if (phase === 'card_forging') return { flex: '0 0 65%' }; // Leave room for reflecting text
    if (phase === 'card_reveal') return { flex: '0 0 50%' };
    if (phase === 'reading' || phase === 'complete') return { flex: '0 0 35%' };
    return { flex: 0 };
  })();

  // Dialogue zone: full during chat/reading, partially visible during forging, hidden during reveal
  const dialogueZoneFlex = (() => {
    if (!showDialogueZone) return 0;
    if (phase === 'card_reveal') return 0;
    if (phase === 'card_forging') return 0.3; // Keep reflecting message partially visible during forge
    return 1;
  })();

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 h-[100dvh] flex flex-col overflow-hidden relative">
      {/* ── CARD ZONE — always mounted, resizes ── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden flex items-center justify-center px-4"
        animate={{
          ...cardZoneStyle,
          opacity: showCardZone ? 1 : 0,
        }}
        transition={ZONE_SPRING}
      >
        {/* Forging animation */}
        <div
          className={cn(
            'w-full h-full transition-opacity duration-300',
            phase === 'card_forging' ? 'opacity-100' : 'opacity-0 pointer-events-none h-0'
          )}
        >
          {(phase === 'card_forging' || phase === 'card_reveal') && (
            <CardForgingAnimation />
          )}
        </div>

        {/* Revealed card — stays in card zone through reveal, reading, and complete */}
        {(phase === 'card_reveal' || phase === 'reading' || phase === 'complete') && card && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={CONTENT_SPRING}
            className="absolute flex flex-col items-center gap-3"
          >
            <OracleCard
              card={toCard(card)}
              size={phase === 'card_reveal' ? 'md' : 'sm'}
              hideTitle={phase !== 'card_reveal'}
            />
            {phase !== 'card_reveal' && (
              <p className="text-sm font-semibold text-white/90 text-center mt-1 max-w-[140px] leading-snug">
                {card.title}
              </p>
            )}
            {phase === 'card_reveal' && isFirstEntry && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-white/40 text-center max-w-xs"
              >
                This is your first Chronicle card. Each day you return, another card is added to your deck.
              </motion.p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ── DIALOGUE ZONE — always mounted, resizes ── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden flex flex-col"
        animate={{
          flex: dialogueZoneFlex,
          opacity: showDialogueZone ? 1 : 0,
        }}
        transition={{
          ...ZONE_SPRING,
          delay: showDialogueZone ? 0.1 : 0,
        }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-2 flex flex-col pt-4">
          <div className="flex-1" />{/* pushes content to bottom when conversation is short */}
          {/* Reflecting message */}
          {phase === 'reflecting' && reflectingMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 py-4"
            >
              <LyraSigil size="sm" state="speaking" />
              <div className="flex-1 rounded-2xl px-4 py-3 bg-purple-950/60 border border-purple-500/15 text-sm text-white/80 leading-relaxed rounded-tl-sm">
                {reflectingMsg}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  className="inline-block w-0.5 h-3.5 bg-[#c9a94e] ml-0.5 align-text-bottom"
                />
              </div>
            </motion.div>
          )}

          {/* Chat messages */}
          {(phase === 'greeting' || phase === 'dialogue') && (
            <ChronicleDialogue
              messages={messages}
              isStreaming={isStreaming}
            />
          )}

          {/* Reading phase: mini-reading text (card stays in card zone above) */}
          {(phase === 'reading' || phase === 'complete') && (
            <div className="flex flex-col gap-4 py-2">
              {/* Mini-reading */}
              <ChronicleDialogue
                messages={[]}
                isStreaming={isStreaming}
                miniReading={miniReading}
                showMiniReading={isReadingActive}
              />

              {/* Complete: badge + Deepen CTA */}
              {phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...CONTENT_SPRING, delay: 0.4 }}
                  className="space-y-3"
                >
                  {/* Badge notice */}
                  <AnimatePresence>
                    {newBadge && showBadge && (
                      <BadgeNotice
                        key={newBadge.id}
                        name={newBadge.name}
                        lyraMessage={newBadge.lyraMessage}
                        onDismiss={() => setShowBadge(false)}
                      />
                    )}
                  </AnimatePresence>

                </motion.div>
              )}
            </div>
          )}

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-400/80 text-center py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── ACTION ZONE — always mounted ── */}
      <motion.div
        layout
        className="shrink-0 p-4 pb-[max(16px,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-lg mx-auto">
          <ActionBar
            phase={phase}
            inputValue={inputValue}
            isStreaming={isStreaming}
            canForge={canForge}
            isFirstEntry={isFirstEntry}
            onInputChange={setInputValue}
            onSend={handleSend}
            onForge={handleForge}
            onMicTranscript={handleMicTranscript}
          />
        </div>
      </motion.div>
    </div>
  );
}
