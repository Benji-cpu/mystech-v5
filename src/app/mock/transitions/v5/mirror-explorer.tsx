"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { MirrorScene } from "./mirror-scene";
import { ControlPanel } from "./control-panel";
import { renderContentToTexture } from "./content-renderer";
import { MIRROR_STYLES, TRANSITIONS, CONTENT_TYPES } from "./theme";

export function MirrorExplorer() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMirror, setSelectedMirror] = useState(MIRROR_STYLES[0].id);
  const [selectedTransition, setSelectedTransition] = useState(TRANSITIONS[0].id);
  const [selectedContent, setSelectedContent] = useState(CONTENT_TYPES[0].id);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [desktopPanelOpen, setDesktopPanelOpen] = useState(true);

  const texARef = useRef<THREE.Texture | null>(null);
  const texBRef = useRef<THREE.Texture | null>(null);
  const [texA, setTexA] = useState<THREE.Texture | null>(null);
  const [texB, setTexB] = useState<THREE.Texture | null>(null);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Render initial content texture
  useEffect(() => {
    const tex = renderContentToTexture(selectedContent, { isMobile });
    texARef.current = tex;
    setTexA(tex);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get transition index from id
  const getTransitionIndex = useCallback((id: string): number => {
    const idx = TRANSITIONS.findIndex(t => t.id === id);
    return idx >= 0 ? idx : 0;
  }, []);

  // Handle content change — instant swap, no transition
  const handleContentChange = useCallback((contentId: string) => {
    if (isTransitioning) return;
    setSelectedContent(contentId);
    const tex = renderContentToTexture(contentId, { isMobile });
    const oldA = texARef.current;
    texARef.current = tex;
    setTexA(tex);
    if (oldA) oldA.dispose();
  }, [isTransitioning, isMobile]);

  // Handle trigger — transition from current content to next content type
  const handleTrigger = useCallback(() => {
    if (isTransitioning) return;
    const nextId = getNextContent(selectedContent);
    const newTex = renderContentToTexture(nextId, { isMobile });
    texBRef.current = newTex;
    setTexB(newTex);
    setSelectedContent(nextId);
    setIsTransitioning(true);
  }, [isTransitioning, selectedContent, isMobile]);

  // Handle randomize — randomize all three selectors and auto-play
  const handleRandomize = useCallback(() => {
    if (isTransitioning) return;
    const newMirror = getRandomDifferent(MIRROR_STYLES, selectedMirror);
    setSelectedMirror(newMirror);
    const newTransition = getRandomDifferent(TRANSITIONS, selectedTransition);
    setSelectedTransition(newTransition);
    const newContent = getRandomDifferent(CONTENT_TYPES, selectedContent);
    const newTex = renderContentToTexture(newContent, { isMobile });
    texBRef.current = newTex;
    setTexB(newTex);
    setSelectedContent(newContent);
    setIsTransitioning(true);
  }, [isTransitioning, selectedMirror, selectedTransition, selectedContent, isMobile]);

  // Handle transition complete — swap textures
  const handleTransitionComplete = useCallback(() => {
    // Swap: texB becomes new texA
    const oldA = texARef.current;
    texARef.current = texBRef.current;
    texBRef.current = null;
    setTexA(texARef.current);
    setTexB(null);
    setIsTransitioning(false);

    // Dispose old texture
    if (oldA) oldA.dispose();
  }, []);

  // Desktop: offset the scene to center the mirror when panel is open
  const sceneStyle: React.CSSProperties = !isMobile && desktopPanelOpen
    ? { paddingRight: 280 }
    : {};

  return (
    <div className="w-full h-dvh overflow-hidden bg-[#050012]">
      {isMobile ? (
        /* ─── Mobile: flex column, scene on top, controls on bottom ─── */
        <div className="flex flex-col h-full">
          {/* Title */}
          <div className="shrink-0 px-4 pt-3 pb-1">
            <h1 className="text-white/30 text-[10px] font-medium tracking-widest uppercase">
              Scrying Mirror
            </h1>
          </div>

          {/* Mirror scene — takes remaining space above controls */}
          <div className="flex-1 min-h-0">
            <MirrorScene
              mirrorStyleId={selectedMirror}
              transitionType={getTransitionIndex(selectedTransition)}
              texA={texA}
              texB={texB}
              isTransitioning={isTransitioning}
              onTransitionComplete={handleTransitionComplete}
              isMobile={isMobile}
            />
          </div>

          {/* Controls — fixed height at bottom, no overlap */}
          <div className="shrink-0">
            <ControlPanel
              selectedMirror={selectedMirror}
              selectedTransition={selectedTransition}
              selectedContent={selectedContent}
              onMirrorChange={setSelectedMirror}
              onTransitionChange={setSelectedTransition}
              onContentChange={handleContentChange}
              onTrigger={handleTrigger}
              onRandomize={handleRandomize}
              isTransitioning={isTransitioning}
              isMobile={isMobile}
            />
          </div>
        </div>
      ) : (
        /* ─── Desktop: full-screen scene with side panel ─── */
        <div className="relative w-full h-full">
          {/* Title */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <h1 className="text-white/30 text-xs font-medium tracking-widest uppercase">
              Scrying Mirror
            </h1>
          </div>

          {/* Mirror scene — offset to center when panel is open */}
          <div className="w-full h-full" style={sceneStyle}>
            <MirrorScene
              mirrorStyleId={selectedMirror}
              transitionType={getTransitionIndex(selectedTransition)}
              texA={texA}
              texB={texB}
              isTransitioning={isTransitioning}
              onTransitionComplete={handleTransitionComplete}
              isMobile={isMobile}
            />
          </div>

          {/* Side panel */}
          <ControlPanel
            selectedMirror={selectedMirror}
            selectedTransition={selectedTransition}
            selectedContent={selectedContent}
            onMirrorChange={setSelectedMirror}
            onTransitionChange={setSelectedTransition}
            onContentChange={handleContentChange}
            onTrigger={handleTrigger}
            onRandomize={handleRandomize}
            isTransitioning={isTransitioning}
            isMobile={isMobile}
            onDesktopPanelToggle={setDesktopPanelOpen}
          />
        </div>
      )}
    </div>
  );
}

// Helper: get next content type in cycle
function getNextContent(current: string): string {
  const idx = CONTENT_TYPES.findIndex(c => c.id === current);
  const next = (idx + 1) % CONTENT_TYPES.length;
  return CONTENT_TYPES[next].id;
}

// Helper: get random item different from current
function getRandomDifferent<T extends { id: string }>(items: T[], currentId: string): string {
  const others = items.filter(i => i.id !== currentId);
  return others[Math.floor(Math.random() * others.length)].id;
}
