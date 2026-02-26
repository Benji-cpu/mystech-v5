"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useCallback, useMemo } from "react";
import { ReadingInterpretationSchema } from "@/lib/ai/prompts/reading-interpretation";

const SECTION_READY_THRESHOLD = 20; // chars before we consider a section "ready"

/**
 * AI streaming orchestrator for the card-by-card reading presentation.
 * Wraps useObject() and exposes section-readiness tracking so the
 * flow shell can coordinate card reveals with AI output.
 */
export function useReadingPresentation() {
  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/ai/reading",
    schema: ReadingInterpretationSchema,
  });

  const startStreaming = useCallback(
    (readingId: string) => {
      submit({ readingId });
    },
    [submit]
  );

  const isSectionReady = useCallback(
    (index: number): boolean => {
      if (!object?.cardSections) return false;
      const section = object.cardSections[index];
      return !!section?.text && section.text.length >= SECTION_READY_THRESHOLD;
    },
    [object]
  );

  const readySectionCount = useMemo(() => {
    if (!object?.cardSections) return 0;
    return object.cardSections.filter(
      (s) => s?.text && s.text.length >= SECTION_READY_THRESHOLD
    ).length;
  }, [object]);

  const hasSynthesis = useMemo(
    () => !!object?.synthesis && object.synthesis.length > 0,
    [object?.synthesis]
  );

  const hasReflectiveQuestion = useMemo(
    () => !!object?.reflectiveQuestion && object.reflectiveQuestion.length > 0,
    [object?.reflectiveQuestion]
  );

  return useMemo(
    () => ({
      object,
      isStreaming: isLoading,
      error,
      startStreaming,
      stop,
      isSectionReady,
      readySectionCount,
      hasSynthesis,
      hasReflectiveQuestion,
    }),
    [
      object,
      isLoading,
      error,
      startStreaming,
      stop,
      isSectionReady,
      readySectionCount,
      hasSynthesis,
      hasReflectiveQuestion,
    ]
  );
}
