import { getYjsValue, syncedStore } from "@syncedstore/core";
import {
  DocTypeDescription,
  MappedTypeDescription,
} from "@syncedstore/core/types/doc";
import { useSyncedStore } from "@syncedstore/react";
import { createContext, useContext, useEffect, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

// Create a document that syncs automatically using Y-WebRTC
export const store = syncedStore({ sourceCode: "text" });

interface YjsStoreContext<T extends DocTypeDescription> {
  doc: ReturnType<typeof getYjsValue>;
  store: MappedTypeDescription<T>;
  provider: WebsocketProvider | null;
  undoManager: Y.UndoManager | null;
}

function initYjs<T extends DocTypeDescription>(
  store: MappedTypeDescription<T>
) {
  const yjsStoreContext = createContext<YjsStoreContext<T> | null>(null);
  function YjsStoreProvider(props: {
    children: React.ReactNode;
    roomId: string;
    websocketUrl?: string;
  }) {
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null);
    const [doc, setDoc] = useState<ReturnType<typeof getYjsValue>>();

    useEffect(() => {
      const _doc = getYjsValue(store);
      const _websocketProvider = new WebsocketProvider(
        props.websocketUrl || "wss://sailwind-server.up.railway.app/",
        "test",
        _doc as any
      );
      const _undoManager = new Y.UndoManager(store.sourceCode as any);

      setDoc(_doc);
      setProvider(_websocketProvider);
      setUndoManager(_undoManager);

      return () => {
        _websocketProvider.destroy();
      };
    }, [props.roomId]);

    return (
      <yjsStoreContext.Provider value={{ provider, doc, store, undoManager }}>
        {props.children}
      </yjsStoreContext.Provider>
    );
  }
  function useStore() {
    const context = useContext(yjsStoreContext);
    if (!context) {
      throw new Error("useYjsStore must be used within a SyncedStoreProvider");
    }
    const state = useSyncedStore(context.store);
    return { ...context, state };
  }
  return {
    Provider: YjsStoreProvider,
    useStore,
  };
}

export const yjs = initYjs(store);
