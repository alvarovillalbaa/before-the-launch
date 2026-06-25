import { useEffect, useMemo, useState } from "react";
import { createRemoteBridge, type RemoteCommand } from "../lib/remote";

interface RemoteControlProps {
  deckId?: string;
  totalSlides: number;
  wsUrl?: string;
}

const DEFAULT_DECK_ID = "__DECK_ID__";

export function RemoteControl({
  deckId = DEFAULT_DECK_ID,
  totalSlides,
  wsUrl,
}: RemoteControlProps) {
  const [current, setCurrent] = useState(0);
  const [target, setTarget] = useState(1);

  const sender = useMemo(() => `remote-${Math.random().toString(36).slice(2, 8)}`, []);
  const bridge = useMemo(() => createRemoteBridge(deckId, sender, "remote", wsUrl), [deckId, sender, wsUrl]);

  useEffect(() => {
    const unsubscribe = bridge.subscribe((envelope) => {
      if (!envelope || envelope.deckId !== deckId || envelope.sender === sender) {
        return;
      }
      if (envelope.command === "state" && Number.isInteger(envelope.index)) {
        const next = clamp(envelope.index || 0, totalSlides);
        setCurrent(next);
        setTarget(next + 1);
      }
    });

    return () => {
      unsubscribe();
      bridge.close();
    };
  }, [bridge, deckId, sender, totalSlides]);

  const send = (command: RemoteCommand, index?: number) => {
    bridge.send({
      deckId,
      sender,
      role: "remote",
      command,
      index,
      timestamp: Date.now(),
    });
  };

  return (
    <section className="remote-panel" aria-label="Remote controller">
      <h2>Remote Controller</h2>
      <p>
        Slide {current + 1} / {totalSlides}
      </p>
      <div className="remote-grid">
        <button type="button" onClick={() => send("first")}>First</button>
        <button type="button" onClick={() => send("prev")}>Prev</button>
        <button type="button" onClick={() => send("next")}>Next</button>
        <button type="button" onClick={() => send("last")}>Last</button>
      </div>
      <div className="remote-go-row">
        <input
          type="number"
          min={1}
          max={Math.max(totalSlides, 1)}
          value={target}
          onChange={(event) => setTarget(Number.parseInt(event.target.value, 10) || 1)}
        />
        <button type="button" onClick={() => send("goto", clamp(target - 1, totalSlides))}>
          Go
        </button>
      </div>
    </section>
  );
}

function clamp(value: number, total: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > total - 1) {
    return total - 1;
  }
  return value;
}
