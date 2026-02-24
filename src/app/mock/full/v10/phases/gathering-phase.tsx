"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { AURORA, TIMING, FORMATIONS } from "../aurora-journey-theme";
import { GsapTextReveal } from "../gsap-text-reveal";
import { GsapContentMaterializer } from "../gsap-content-materializer";
import type { JourneyAction, GatheringSubPhase, UserStar } from "../aurora-journey-state";
import type { AuroraRibbonHandle } from "../aurora-ribbons";

interface GatheringPhaseProps {
  subPhase: GatheringSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  auroraRef: React.RefObject<AuroraRibbonHandle | null>;
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
  auroraRef,
  isActive,
  userName,
}: GatheringPhaseProps) {
  const [nameInput, setNameInput] = useState("");
  const [intentionInput, setIntentionInput] = useState("");
  const [currentLyraText, setCurrentLyraText] = useState(LYRA_NAME_PROMPT);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Drive text content changes per sub-phase
  useEffect(() => {
    if (!isActive) return;

    if (subPhase === "name_input") {
      setCurrentLyraText(LYRA_NAME_PROMPT);
    } else if (subPhase === "name_absorb") {
      setCurrentLyraText(LYRA_NAME_RESPONSE(userName));
    } else if (subPhase === "intention_input") {
      setCurrentLyraText(LYRA_INTENTION_PROMPT);
    } else if (subPhase === "intention_absorb") {
      setCurrentLyraText(LYRA_INTENTION_RESPONSE);
    }
  }, [subPhase, isActive, userName]);

  // GSAP timeline choreography for auto-advance sub-phases
  useEffect(() => {
    if (!isActive) return;

    const ctx = gsap.context(() => {
      if (subPhase === "name_absorb") {
        // After text reveal completes, add user star and advance
        const textDuration = LYRA_NAME_RESPONSE(userName).length * TIMING.charStagger + 1.0;
        const tl = gsap.timeline();
        tl.call(() => {
          const openFrame = FORMATIONS.open_frame;
          const nameStar: UserStar = {
            id: "user-name",
            label: userName,
            cx: (openFrame.sheliak.cx + openFrame.vega.cx) / 2 + 5,
            cy: (openFrame.sheliak.cy + openFrame.vega.cy) / 2,
            connectedTo: "vega",
          };
          dispatch({ type: "ADD_USER_STAR", star: nameStar });
        }, [], textDuration);
        tl.call(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "intention_input" });
        }, [], `+=${1.2}`);
      } else if (subPhase === "intention_absorb") {
        const textDuration = LYRA_INTENTION_RESPONSE.length * TIMING.charStagger + 1.0;
        const tl = gsap.timeline();
        tl.call(() => {
          const openFrame = FORMATIONS.open_frame;
          const intentStar: UserStar = {
            id: "user-intention",
            label: "intention",
            cx: (openFrame.sulafat.cx + openFrame.vega.cx) / 2 - 5,
            cy: (openFrame.sulafat.cy + openFrame.vega.cy) / 2,
            connectedTo: "sulafat",
          };
          dispatch({ type: "ADD_USER_STAR", star: intentStar });
        }, [], textDuration);
        tl.call(() => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
        }, [], `+=${1.5}`);
      } else if (subPhase === "complete") {
        const tl = gsap.timeline();
        tl.call(() => {
          dispatch({ type: "START_BREATH_PAUSE" });
        }, [], 0.8);
        tl.call(() => {
          dispatch({ type: "ADVANCE_PHASE" });
          dispatch({ type: "END_BREATH_PAUSE" });
        }, [], `+=${(TIMING.breathPause + 200) / 1000}`);
      }
    });

    return () => ctx.revert();
  }, [subPhase, isActive, dispatch, userName]);

  // Auto-focus inputs
  useEffect(() => {
    if (subPhase === "name_input" && inputRef.current && isActive) {
      setTimeout(() => inputRef.current?.focus(), 500);
    }
    if (subPhase === "intention_input" && textareaRef.current && isActive) {
      setTimeout(() => textareaRef.current?.focus(), 500);
    }
  }, [subPhase, isActive]);

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
    <div
      className="flex flex-col items-center justify-center flex-1 px-6 min-h-0"
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Lyra's text — GSAP char-split reveal */}
      <GsapContentMaterializer
        visible={isActive}
        auroraRef={auroraRef}
        className="text-center max-w-md mx-auto mb-8"
        id="gathering-lyra-text"
      >
        <div className="min-h-[3em]">
          <GsapTextReveal
            key={currentLyraText}
            text={currentLyraText}
            isActive={isActive}
          />
        </div>
      </GsapContentMaterializer>

      {/* Input area */}
      <GsapContentMaterializer
        visible={showInput}
        auroraRef={auroraRef}
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
              ref={inputRef}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name..."
              className="w-full px-4 py-3 rounded-xl text-center font-serif text-lg bg-white/5 backdrop-blur-xl border border-white/10 outline-none focus:border-white/20 transition-colors min-h-[44px]"
              style={{ color: AURORA.text }}
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="px-6 py-3 rounded-full border transition-colors self-center min-h-[44px] min-w-[44px] disabled:opacity-30 cursor-pointer"
              style={{
                borderColor: AURORA.borderAccent,
                color: AURORA.accent,
                background: "rgba(196, 122, 42, 0.05)",
              }}
            >
              <span className="text-sm tracking-widest uppercase">Offer</span>
            </button>
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
              ref={textareaRef}
              value={intentionInput}
              onChange={(e) => setIntentionInput(e.target.value)}
              placeholder="What weighs on your heart..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-center font-serif text-base bg-white/5 backdrop-blur-xl border border-white/10 outline-none focus:border-white/20 transition-colors resize-none min-h-[44px]"
              style={{ color: AURORA.text }}
            />
            <button
              type="submit"
              disabled={!intentionInput.trim()}
              className="px-6 py-3 rounded-full border transition-colors self-center min-h-[44px] min-w-[44px] disabled:opacity-30 cursor-pointer"
              style={{
                borderColor: AURORA.borderAccent,
                color: AURORA.accent,
                background: "rgba(196, 122, 42, 0.05)",
              }}
            >
              <span className="text-sm tracking-widest uppercase">Set Intention</span>
            </button>
          </form>
        )}
      </GsapContentMaterializer>
    </div>
  );
}
