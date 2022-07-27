import { syncedStore, getYjsValue } from "@syncedstore/core";
import { DocTypeDescription } from "@syncedstore/core/types/doc";
import { WebsocketProvider } from "y-websocket";
import * as Y from 'yjs';

// (optional, define types for TypeScript)
type Todo = { completed: boolean, title: string };

// Create your SyncedStore store
interface SyncedStore extends DocTypeDescription {
  sourceCode: "text";
}
export const store = syncedStore({ sourceCode: new Y.Text('asdasdsa') });

// Create a document that syncs automatically using Y-WebRTC
const doc = getYjsValue(store);
export const websocketProvider = new WebsocketProvider("ws://sailwind-server.up.railway.app/", "syncedstore-todos", doc as any);

export const disconnect = () => websocketProvider.disconnect();
export const connect = () => websocketProvider.connect();
