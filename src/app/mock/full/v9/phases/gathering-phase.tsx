"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { LYRA, SPRING, TIMING, FORMATIONS } from "../lyra-journey-theme";
import { ContentMaterializer } from "../content-materializer";
import type { JourneyAction, GatheringSubPhase, UserStar } from "../lyra-journey-state";
import type { ParticleHandle } from "../lyra-particles";

interface GatheringPhaseProps {
  subPhase: GatheringSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  particleRef: React.RefObject<ParticleHandle | null>;
  isActive: boolean;
  userName: string;
  userIntention: string;
}

const LYRA_NAME_PROMPT = "Tell me, what name do you carry in this world?";
const LYRA_NAME_RESPONSE = (name: string) => `${name}... a beautiful resonance. I will remember you.`;
const LYRA_INTENTION_PROMPT = "What calls you to the cards today? What question weighs upon your heart?";
const LYRA_INTENTION_RESPONSE = "Your intention anchors our work. The cards will listen.";

export function GatheringPhase({
  subPhase,
  dispatch,
  particleRef,
  isActive,
  userName,
  userIntention,
}: GatheringPhaseProps) {
  const [nameInput, setNameInput] = useState("");
  const [intentionInput, setIntentionInput] = useState("");
  const [lyraText, setLyraText] = useState(LYRA_NAME_PROMPT);
  const [isTyping, setIsTyping] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Animate Lyra "typing" text
  const animateLyraText = useCallback((text: string, onComplete?: () => void) => {
    setIsTyping(true);
    setLyraText("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setLyraText((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        onComplete?.();
      }
    }, TIMING.letterDelay);
    timersRef.current.push(interval as unknown as ReturnType<typeof setTimeout>);
  }, []);

  // Handle sub-phase auto-advances
  useEffect(() => {
    if (!isActive) return;

    if (subPhase === "name_input") {
      animateLyraText(LYRA_NAME_PROMPT);
    } else if (subPhase === "name_absorb") {
      animateLyraText(LYRA_NAME_RESPONSE(userName), () => {
        // Add user star for name
        const openFrame = FORMATIONS.open_frame;
        const nameStar: UserStar = {
          id: "user-name",
          label: userName,
          cx: (openFrame.sheliak.cx + openFrame.vega.cx) / 2 + 5,
          cy: (openFrame.sheliak.cy + openFrame.vega.cy) / 2,
          connectedTo: "vega",
        };
        dispatch({ type: "ADD_USER_STAR", star: nameStar });

        const t = setTimeout(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "intention_input" });
        }, 1200);
        timersRef.current.push(t);
      });
    } else if (subPhase === "intention_input") {
      animateLyraText(LYRA_INTENTION_PROMPT);
    } else if (subPhase === "intention_absorb") {
      animateLyraText(LYRA_INTENTION_RESPONSE, () => {
        // Add user star for intention
        const openFrame = FORMATIONS.open_frame;
        const intentStar: UserStar = {
          id: "user-intention",
          label: "intention",
          cx: (openFrame.sulafat.cx + openFrame.vega.cx) / 2 - 5,
          cy: (openFrame.sulafat.cy + openFrame.vega.cy) / 2,
          connectedTo: "sulafat",
        };
        dispatch({ type: "ADD_USER_STAR", star: intentStar });

        const t = setTimeout(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
        }, 1500);
        timersRef.current.push(t);
      });
    } else if (subPhase === "complete") {
      const t = setTimeout(() => {
        dispatch({ type: "START_BREATH_PAUSE" });
        const t2 = setTimeout(() => {
          dispatch({ type: "ADVANCE_PHASE" });
          dispatch({ type: "END_BREATH_PAUSE" });
        }, TIMING.breathPause + 200);
        timersRef.current.push(t2);
      }, 800);
      timersRef.current.push(t);
    }

    return clearTimers;
  }, [subPhase, isActive, dispatch, clearTimers, animateLyraText, userName]);

  const handleNameSubmit = useCallback(() => {
    if (!nameInput.trim()) return;
    dispatch({ type: "SET_USER_NAME", name: nameInput.trim() });
    dispatch({ type: "SET_SUB_PHASE", subPhase: "name_absorb" });
  }, [nameInput, dispatch]);

  const handleIntentionSubmit = useCallback(() => {
    if (!intentionInput.trim()) return;
    dispatch({ type: "SET_USER_INTENTION", intention: intentionInput.trim() });
    dispatch({ type: "SET_SUB_PHASE", subPhase: "intention_absorb" });
  }, [intentionInput, dispatch]);

  const showNameInput = subPhase === "name_input";
  const showIntentionInput = subPhase === "intention_input";
  const showInput = showNameInput || showIntentionInput;

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 px-6 min-h-0"
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Lyra's text */}
      <ContentMaterializer
        visible={isActive}
        particleRef={particleRef}
        className="text-center max-w-md mx-auto mb-8"
        id="gathering-lyra-text"
      >
        <p
          className="font-serif text-lg sm:text-xl leading-relaxed min-h-[3em]"
          style={{ color: LYRA.text }}
        >
          {lyraText}
          {isTyping && (
            <span
              className="inline-block w-[2px] h-[1em] ml-1 align-middle animate-pulse"
              style={{ backgroundColor: LYRA.gold }}
            />
          )}
        </p>
      </ContentMaterializer>

      {/* Input area */}
      <ContentMaterializer
        visible={showInput}
        particleRef={particleRef}
        delay={400}
        className="w-full max-w-sm mx-auto"
        id="gathering-input"
      >
        {showNameInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNameSubmit();
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name..."
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-center font-serif text-lg bg-white/5 backdrop-blur-xl border border-white/10 outline-none focus:border-white/20 transition-colors min-h-[44px]"
              style={{ color: LYRA.text }}
            />
            <motion.button
              type="submit"
              disabled={!nameInput.trim()}
              className="px-6 py-3 rounded-full border transition-colors self-center min-h-[44px] min-w-[44px] disabled:opacity-30"
              style={{
                borderColor: LYRA.borderGold,
                color: LYRA.gold,
                background: "rgba(201, 169, 78, 0.05)",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-sm tracking-widest uppercase">Offer</span>
            </motion.button>
          </form>
        )}

        {showIntentionInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleIntentionSubmit();
            }}
            className="flex flex-col gap-3"
          >
            <textarea
              value={intentionInput}
              onChange={(e) => setIntentionInput(e.target.value)}
              placeholder="What weighs on your heart..."
              autoFocus
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-center font-serif text-base bg-white/5 backdrop-blur-xl border border-white/10 outline-none focus:border-white/20 transition-colors resize-none min-h-[44px]"
              style={{ color: LYRA.text }}
            />
            <motion.button
              type="submit"
              disabled={!intentionInput.trim()}
              className="px-6 py-3 rounded-full border transition-colors self-center min-h-[44px] min-w-[44px] disabled:opacity-30"
              style={{
                borderColor: LYRA.borderGold,
                color: LYRA.gold,
                background: "rgba(201, 169, 78, 0.05)",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-sm tracking-widest uppercase">Set Intention</span>
            </motion.button>
          </form>
        )}
      </ContentMaterializer>
    </motion.div>
  );
}
