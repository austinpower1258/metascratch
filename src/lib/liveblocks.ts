import type { LiveList, LiveObject } from "@liveblocks/client";
import { createClient } from "@liveblocks/client";

const client = createClient({
  publicApiKey: import.meta.env.VITE_LIVE_BLOCKS_PUBLIC_KEY,
});

type Storage = {
  objectPosition: LiveObject<{ x: number; y: number; z: number }>;
  //sourceCode: LiveList<string>;
  // variables: LiveObject<{
  //   [key: string]: LiveObject<{}>
  // }>
  // functions: 
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
