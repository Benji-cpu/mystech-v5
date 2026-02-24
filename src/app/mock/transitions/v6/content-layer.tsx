"use client";

import { useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import type { ViewId } from "./types";
import { ViewContent } from "./views";

export interface ContentLayerHandle {
  /** Get outgoing element ref for GSAP */
  getOutgoingEl: () => HTMLDivElement | null;
  /** Get incoming element ref for GSAP */
  getIncomingEl: () => HTMLDivElement | null;
  /** Prepare a transition: set incoming view and reset opacities */
  prepareTransition: (targetView: ViewId) => void;
  /** Finalize transition: swap layers, enable stagger animations */
  finalizeTransition: () => void;
}

interface ContentLayerProps {
  initialView: ViewId;
  filterUrl: string;
}

export const ContentLayer = forwardRef<ContentLayerHandle, ContentLayerProps>(
  function ContentLayer({ initialView, filterUrl }, ref) {
    const outgoingRef = useRef<HTMLDivElement>(null);
    const incomingRef = useRef<HTMLDivElement>(null);
    // Use a ref to avoid stale closure in GSAP callbacks
    const pendingViewRef = useRef<ViewId | null>(null);

    const [activeView, setActiveView] = useState<ViewId>(initialView);
    const [pendingView, setPendingView] = useState<ViewId | null>(null);
    const [animateActive, setAnimateActive] = useState(true);
    const [animateIncoming, setAnimateIncoming] = useState(false);

    useImperativeHandle(ref, () => ({
      getOutgoingEl: () => outgoingRef.current,
      getIncomingEl: () => incomingRef.current,

      prepareTransition: (targetView: ViewId) => {
        pendingViewRef.current = targetView;
        setPendingView(targetView);
        setAnimateIncoming(false);
        // Reset incoming opacity (GSAP will handle the actual animation)
        if (incomingRef.current) {
          incomingRef.current.style.opacity = "0";
        }
        if (outgoingRef.current) {
          outgoingRef.current.style.opacity = "1";
        }
      },

      finalizeTransition: () => {
        // Use ref to get current pending view (avoids stale closure)
        const target = pendingViewRef.current;
        if (target) {
          // Briefly disable then re-enable to re-trigger stagger animations
          setAnimateActive(false);
          setActiveView(target);
          setPendingView(null);
          setAnimateIncoming(false);
          pendingViewRef.current = null;
          // Re-enable stagger on next frame
          requestAnimationFrame(() => setAnimateActive(true));
        }
        // Reset opacities for next transition
        if (outgoingRef.current) {
          outgoingRef.current.style.opacity = "1";
        }
        if (incomingRef.current) {
          incomingRef.current.style.opacity = "0";
        }
      },
    }));

    // When finalizeTransition fires, we want the stagger to re-trigger
    // by flipping animateActive off then on — but that happens via state updates above

    const currentFilterUrl = filterUrl;

    return (
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ filter: currentFilterUrl ? currentFilterUrl : undefined }}
      >
        {/* Outgoing (active) layer */}
        <div
          ref={outgoingRef}
          className="absolute inset-0 overflow-y-auto"
        >
          <ViewContent viewId={activeView} animate={animateActive} />
        </div>

        {/* Incoming (pending) layer */}
        <div
          ref={incomingRef}
          className="absolute inset-0 overflow-y-auto"
          style={{ opacity: 0 }}
        >
          {pendingView && (
            <ViewContent viewId={pendingView} animate={animateIncoming} />
          )}
        </div>
      </div>
    );
  },
);
