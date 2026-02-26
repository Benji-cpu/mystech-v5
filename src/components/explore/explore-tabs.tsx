"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StyleCard } from "@/components/art-styles/style-card";
import { SectionHeader } from "@/components/ui/section-header";
import { PublicDeckCard } from "./public-deck-card";
import type { ArtStyle, DeckWithOwner } from "@/types";

interface ExploreTabsProps {
  publicDecks: DeckWithOwner[];
  artStyles: {
    presets: ArtStyle[];
    custom: ArtStyle[];
    shared: ArtStyle[];
  };
  currentUserId: string;
}

export function ExploreTabs({
  publicDecks,
  artStyles,
  currentUserId,
}: ExploreTabsProps) {
  return (
    <Tabs defaultValue="decks">
      <TabsList className="bg-white/5 border border-white/10">
        <TabsTrigger
          value="decks"
          className="data-[state=active]:bg-[#c9a94e]/10 data-[state=active]:text-[#c9a94e]"
        >
          Public Decks
        </TabsTrigger>
        <TabsTrigger
          value="styles"
          className="data-[state=active]:bg-[#c9a94e]/10 data-[state=active]:text-[#c9a94e]"
        >
          Art Styles
        </TabsTrigger>
      </TabsList>

      <TabsContent value="decks">
        {publicDecks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">No public decks available yet.</p>
            <p className="text-sm mt-1 text-white/40">
              Share your decks to be the first!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {publicDecks.map((deck) => (
              <PublicDeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="styles" className="space-y-8">
        {/* Presets */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <SectionHeader>Preset Styles</SectionHeader>
            <Button asChild size="sm" variant="outline">
              <Link href="/explore/styles/new">
                <Plus className="h-4 w-4" />
                Create Custom
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {artStyles.presets.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </section>

        {/* Custom */}
        {artStyles.custom.length > 0 && (
          <section>
            <SectionHeader className="mb-4">Custom Styles</SectionHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {artStyles.custom.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Shared */}
        {artStyles.shared.length > 0 && (
          <section>
            <SectionHeader className="mb-4">Shared With You</SectionHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {artStyles.shared.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </section>
        )}
      </TabsContent>
    </Tabs>
  );
}
