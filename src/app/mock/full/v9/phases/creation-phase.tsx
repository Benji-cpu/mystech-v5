"use client";

import { useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LYRA, SPRING, SPRING_GENTLE, TIMING } from "../lyra-journey-theme";
import { ContentMaterializer } from "../content-materializer";
import type { JourneyAction, CreationSubPhase } from "../lyra-journey-state";
import type { ParticleHandle } from "../lyra-particles";
import { getAllCards, MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
import type { MockFullCard } from "../../_shared/types";

interface CreationPhaseProps {
  subPhase: CreationSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  particleRef: React.RefObject<ParticleHandle | null>;
  isActive: boolean;
  selectedStyleId: string | null;
  userName: string;
}

const STYLE_ICONS: Record<string, string> = {
  "tarot-classic": "Sun",
  "watercolor-dream": "Droplets",
  celestial: "Star",
  botanical: "Leaf",
  "abstract-mystic": "Shapes",
  "dark-gothic": "Moon",
  "art-nouveau": "Flower",
  "ethereal-light": "Sparkles",
};

export function CreationPhase({
  subPhase,
  dispatch,
  particleRef,
  isActive,
  selectedStyleId,
  userName,
}: CreationPhaseProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const previewCards = useMemo(() => {
    const all = getAllCards();
    // Pick 5 cards for preview
    return all.slice(0, 5);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) return;
    clearTimers();

    if (subPhase === "intro") {
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "cards_appearing" });
      }, 2000);
      timersRef.current.push(t);
    } else if (subPhase === "cards_appearing") {
      const t = setTimeout(() => {
        dispatch({ type: "SET_SUB_PHASE", subPhase: "style_select" });
      }, 2500);
      timersRef.current.push(t);
    } else if (subPhase === "style_chosen") {
      const t = setTimeout(() => {
        dispatch({ type: "START_BREATH_PAUSE" });
        const t2 = setTimeout(() => {
          dispatch({ type: "ADVANCE_PHASE" });
          dispatch({ type: "END_BREATH_PAUSE" });
        }, TIMING.breathPause + 300);
        timersRef.current.push(t2);
      }, 1500);
      timersRef.current.push(t);
    }

    return clearTimers;
  }, [subPhase, isActive, dispatch, clearTimers]);

  const handleStyleSelect = useCallback(
    (styleId: string) => {
      dispatch({ type: "SELECT_STYLE", styleId });
      dispatch({ type: "SET_SUB_PHASE", subPhase: "style_chosen" });
    },
    [dispatch]
  );

  const showIntro = subPhase === "intro";
  const showCards = subPhase === "cards_appearing" || subPhase === "style_select" || subPhase === "style_chosen";
  const showStyleGrid = subPhase === "style_select";
  const showStyleChosen = subPhase === "style_chosen";

  const chosenStyle = selectedStyleId
    ? MOCK_ART_STYLES.find((s) => s.id === selectedStyleId)
    : null;

  return (
    <motion.div
      className="flex flex-col items-center flex-1 px-4 min-h-0 overflow-hidden"
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Lyra's intro text */}
      <ContentMaterializer
        visible={showIntro}
        particleRef={particleRef}
        className="text-center max-w-md mx-auto pt-4 pb-6 shrink-0"
        id="creation-intro"
      >
        <p className="font-serif text-lg sm:text-xl leading-relaxed" style={{ color: LYRA.text }}>
          The threads of your story are ready to be woven into cards,{" "}
          <span style={{ color: LYRA.gold }}>{userName || "seeker"}</span>.
          Let us choose a visual language for your deck.
        </p>
      </ContentMaterializer>

      {/* Card preview strip */}
      <motion.div
        className="flex gap-2 sm:gap-3 justify-center shrink-0 py-3"
        animate={{
          opacity: showCards ? 1 : 0,
          height: showCards ? "auto" : 0,
        }}
        transition={SPRING}
      >
        {previewCards.map((card, i) => (
          <CardPreview key={card.id} card={card} index={i} visible={showCards} />
        ))}
      </motion.div>

      {/* Style selection grid */}
      <motion.div
        className="flex-1 min-h-0 overflow-y-auto w-full max-w-lg mx-auto py-3"
        animate={{
          opacity: showStyleGrid || showStyleChosen ? 1 : 0,
          y: showStyleGrid || showStyleChosen ? 0 : 20,
        }}
        transition={SPRING}
        style={{ pointerEvents: showStyleGrid ? "auto" : "none" }}
      >
        {showStyleGrid && (
          <>
            <p
              className="text-center text-sm mb-3 tracking-widest uppercase"
              style={{ color: LYRA.textDim }}
            >
              Choose an art style
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOCK_ART_STYLES.map((style) => (
                <motion.button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors min-h-[44px]"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.06)",
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                  whileHover={{
                    borderColor: LYRA.borderGold,
                    background: "rgba(201, 169, 78, 0.05)",
                    scale: 1.03,
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${style.gradient} flex items-center justify-center`}
                  >
                    <span className="text-white text-sm font-medium">
                      {style.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: LYRA.textDim }}>
                    {style.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {showStyleChosen && chosenStyle && (
          <motion.div
            className="text-center py-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING}
          >
            <div
              className={`w-16 h-16 rounded-2xl ${chosenStyle.gradient} mx-auto mb-4 flex items-center justify-center`}
            >
              <span className="text-white text-2xl font-serif">
                {chosenStyle.name.charAt(0)}
              </span>
            </div>
            <p className="font-serif text-lg" style={{ color: LYRA.gold }}>
              {chosenStyle.name}
            </p>
            <p className="text-sm mt-1" style={{ color: LYRA.textDim }}>
              A perfect choice. The cards will take shape...
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Card Preview ────────────────────────────────────────────────────

function CardPreview({
  card,
  index,
  visible,
}: {
  card: MockFullCard;
  index: number;
  visible: boolean;
}) {
  return (
    <motion.div
      className="rounded-lg overflow-hidden border"
      style={{
        width: "clamp(48px, 12vw, 72px)",
        aspectRatio: "2/3",
        borderColor: "rgba(255, 255, 255, 0.08)",
        background: "rgba(255, 255, 255, 0.03)",
      }}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 20,
        scale: visible ? 1 : 0.8,
      }}
      transition={{
        ...SPRING_GENTLE,
        delay: index * 0.15,
      }}
    >
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${LYRA.surface}, ${LYRA.bg})` }}
        >
          <span className="text-[8px]" style={{ color: LYRA.goldDim }}>
            {card.title.charAt(0)}
          </span>
        </div>
      )}
    </motion.div>
  );
}
