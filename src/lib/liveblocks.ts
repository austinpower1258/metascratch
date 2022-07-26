import type { LiveList, LiveObject } from "@liveblocks/client";
import { createClient } from "@liveblocks/client";

const client = createClient({
  publicApiKey: "pk_test_LsTqRI8SV9SYRE03JDx88nJG",
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
