"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SpotlightTooltip } from "./spotlight-tooltip";
import { useOnboarding } from "./onboarding-provider";
import { useImmersive } from "@/components/immersive/immersive-provider";

type TutorialStep = "idle" | "orb" | "radial" | "done";

/**
 * Multi-step nav tutorial — walks users through the floating orb navigation.
 *
 * Step 1 (orb):   Spotlight on orb, "Tap your compass" — clicks pass through to orb
 * Step 2 (radial): Radial nav is open, spotlight expands to cover nav items
 * Step 3 (done):  Mark milestone, disappear
 */
export function NavTutorial() {
  const { hasMilestone, completeMilestone, stage, isLoaded, setNavTutorialActive } =
    useOnboarding();
  const { state: immersiveState } = useImmersive();
  const { isOrbExpanded } = immersiveState;

  const [step, setStep] = useState<TutorialStep>("idle");
  const [orbRect, setOrbRect] = useState<DOMRect | null>(null);
  const prevExpanded = useRef(isOrbExpanded);

  // Determine if we should show the tutorial at all
  const shouldShow =
    isLoaded &&
    stage >= 1 &&
    !hasMilestone("nav_tutorial_seen") &&
    hasMilestone("initiation_complete") &&
    !hasMilestone("dashboard_tour_seen");

  // Step: idle → orb (after 2s delay)
  useEffect(() => {
    if (!shouldShow || step !== "idle") return;

    const timer = setTimeout(() => {
      const orbButton = document.querySelector(
        'button[aria-label="Open navigation"], button[aria-label="Close navigation"]'
      );
      if (orbButton) {
        setOrbRect(orbButton.getBoundingClientRect());
        setStep("orb");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [shouldShow, step]);

  // Watch isOrbExpanded for step transitions
  useEffect(() => {
    // orb → radial: user tapped the orb (expanded became true)
    if (step === "orb" && !prevExpanded.current && isOrbExpanded) {
      // Re-measure the orb position for the expanded spotlight
      const orbButton = document.querySelector(
        'button[aria-label="Close navigation"]'
      );
      if (orbButton) {
        setOrbRect(orbButton.getBoundingClientRect());
      }
      setStep("radial");
    }

    // radial → done: user closed the radial nav (expanded became false)
    if (step === "radial" && prevExpanded.current && !isOrbExpanded) {
      setStep("done");
    }

    prevExpanded.current = isOrbExpanded;
  }, [isOrbExpanded, step]);

  // Sync navTutorialActive flag for RadialNav label visibility
  useEffect(() => {
    setNavTutorialActive(step === "radial");
    return () => setNavTutorialActive(false);
  }, [step, setNavTutorialActive]);

  // Complete milestone when done
  useEffect(() => {
    if (step === "done") {
      completeMilestone("nav_tutorial_seen");
    }
  }, [step, completeMilestone]);

  // Skip handler — user doesn't want the tour
  const handleSkip = useCallback(() => {
    setStep("done");
  }, []);

  // Don't render anything if tutorial shouldn't show or is complete
  if (!shouldShow || step === "idle" || step === "done") return null;

  if (step === "orb") {
    return (
      <SpotlightTooltip
        targetRect={orbRect}
        message="This is your compass — it's how you move through MysTech. Tap it now."
        onDismiss={handleSkip}
        passthrough
        actionLabel="Skip"
        onAction={handleSkip}
      />
    );
  }

  if (step === "radial") {
    // Expand the target rect to encompass the radial nav items
    const radialRect = orbRect
      ? expandRectForRadialNav(orbRect)
      : null;

    return (
      <SpotlightTooltip
        targetRect={radialRect}
        message="Your decks, readings, and paths — all a tap away. Try one now, or close to continue."
        onDismiss={handleSkip}
        passthrough
        actionLabel="Skip"
        onAction={handleSkip}
      />
    );
  }

  return null;
}

/**
 * Expand the orb's rect outward to encompass the radial nav items.
 * The radial nav has items at radius ~90px with 48px item size,
 * so we expand ~130px in all directions from the orb center.
 */
function expandRectForRadialNav(orbRect: DOMRect): DOMRect {
  const centerX = orbRect.x + orbRect.width / 2;
  const centerY = orbRect.y + orbRect.height / 2;
  const expand = 130;

  return new DOMRect(
    centerX - expand,
    centerY - expand,
    expand * 2,
    expand * 2
  );
}
