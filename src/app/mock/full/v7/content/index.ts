import type { ContentRegistry } from "../mirror-types";

import { SingleCard } from "./single-card";
import { DeckOverview } from "./deck-overview";
import { ReadingText } from "./reading-text";
import { CardSpread } from "./card-spread";
import { UserProfile } from "./user-profile";
import { ArtStylePreview } from "./art-style-preview";
import { ActivityFeed } from "./activity-feed";
import { StatsDashboard } from "./stats-dashboard";
import { CardGallery } from "./card-gallery";
import { DeckCollection } from "./deck-collection";

export const contentRegistry: ContentRegistry = {
  "single-card": SingleCard,
  "deck-overview": DeckOverview,
  "reading-text": ReadingText,
  "card-spread": CardSpread,
  "user-profile": UserProfile,
  "art-style-preview": ArtStylePreview,
  "activity-feed": ActivityFeed,
  "stats-dashboard": StatsDashboard,
  "card-gallery": CardGallery,
  "deck-collection": DeckCollection,
};
