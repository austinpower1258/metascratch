import type { LiveList, LiveObject } from "@liveblocks/client";
import { createClient } from "@liveblocks/client";

console.log("heyo",import.meta.env.VITE_LIVE_BLOCKS_PUBLIC_KEY);
const client = createClient({
  publicApiKey: import.meta.env.VITE_LIVE_BLOCKS_PUBLIC_KEY,
});

type Storage = {
  objectPosition: LiveObject<{ x: number; y: number; z: number }>;
};

type Presence = {
  // cursor: { x: number, y: number } | null,
  // ...
};

import { createRoomContext } from "@liveblocks/react";
export const {
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
  useObject,
  useList,
} = createRoomContext<Presence, Storage>(client);
