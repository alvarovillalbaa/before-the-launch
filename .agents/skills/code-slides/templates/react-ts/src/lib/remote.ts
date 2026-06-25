export type RemoteCommand = "next" | "prev" | "goto" | "first" | "last" | "state";

export interface RemoteEnvelope {
  deckId: string;
  sender: string;
  role: "screen" | "remote";
  command: RemoteCommand;
  index?: number;
  timestamp: number;
}

interface RemoteBridge {
  send: (envelope: RemoteEnvelope) => void;
  subscribe: (handler: (envelope: RemoteEnvelope) => void) => () => void;
  close: () => void;
}

export function createRemoteBridge(
  deckId: string,
  sender: string,
  role: "screen" | "remote",
  wsUrl?: string
): RemoteBridge {
  const listeners = new Set<(envelope: RemoteEnvelope) => void>();
  const channel = new BroadcastChannel(`code-slides:${deckId}`);
  let socket: WebSocket | null = null;

  const dispatch = (envelope: RemoteEnvelope): void => {
    listeners.forEach((listener) => listener(envelope));
  };

  channel.addEventListener("message", (event: MessageEvent<RemoteEnvelope>) => {
    dispatch(event.data);
  });

  if (wsUrl) {
    try {
      socket = new WebSocket(wsUrl);
      socket.addEventListener("open", () => {
        socket?.send(
          JSON.stringify({
            type: "join",
            deckId,
            sender,
            role,
          })
        );
      });
      socket.addEventListener("message", (event: MessageEvent<string>) => {
        try {
          const parsed = JSON.parse(event.data) as RemoteEnvelope;
          dispatch(parsed);
        } catch {
          // Ignore malformed payloads.
        }
      });
    } catch {
      socket = null;
    }
  }

  return {
    send(envelope: RemoteEnvelope) {
      channel.postMessage(envelope);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(envelope));
      }
    },
    subscribe(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    close() {
      listeners.clear();
      channel.close();
      socket?.close();
    },
  };
}
