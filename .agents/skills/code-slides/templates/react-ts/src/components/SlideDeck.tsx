import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createRemoteBridge, type RemoteEnvelope } from "../lib/remote";
import "../styles/slide-deck.css";

const COMPONENT_LIBRARY = "__COMPONENT_LIBRARY__";

type NavPosition = "right" | "bottom";

interface SlideDeckProps {
  slides: ReactNode[];
  deckId?: string;
  title?: string;
  navPosition?: NavPosition;
  wsUrl?: string;
}

const DEFAULT_TITLE = "__DECK_TITLE__";
const DEFAULT_DECK_ID = "__DECK_ID__";
const DEFAULT_NAV_POSITION = "__NAV_POSITION__" as NavPosition;

export function SlideDeck({
  slides,
  deckId = DEFAULT_DECK_ID,
  title = DEFAULT_TITLE,
  navPosition = DEFAULT_NAV_POSITION,
  wsUrl,
}: SlideDeckProps) {
  const [index, setIndex] = useState(0);
  const sender = useMemo(() => `screen-${Math.random().toString(36).slice(2, 8)}`, []);
  const bridge = useMemo(() => createRemoteBridge(deckId, sender, "screen", wsUrl), [deckId, sender, wsUrl]);

  useEffect(() => {
    const unsubscribe = bridge.subscribe((envelope) => {
      if (!envelope || envelope.deckId !== deckId || envelope.sender === sender) {
        return;
      }
      setIndex((current) => applyCommand(current, slides.length, envelope));
    });
    return () => {
      unsubscribe();
      bridge.close();
    };
  }, [bridge, deckId, sender, slides.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowRight", "PageDown"].includes(event.key)) {
        setIndex((current) => clamp(current + 1, slides.length));
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        setIndex((current) => clamp(current - 1, slides.length));
      } else if (event.key === "Home") {
        setIndex(0);
      } else if (event.key === "End") {
        setIndex(slides.length - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slides.length]);

  useEffect(() => {
    bridge.send({
      deckId,
      sender,
      role: "screen",
      command: "state",
      index,
      timestamp: Date.now(),
    });
  }, [bridge, deckId, index, sender]);

  const go = (command: RemoteEnvelope["command"], nextIndex?: number) => {
    const envelope: RemoteEnvelope = {
      deckId,
      sender,
      role: "screen",
      command,
      index: nextIndex,
      timestamp: Date.now(),
    };

    setIndex((current) => applyCommand(current, slides.length, envelope));
  };

  return (
    <section className={`slide-deck nav-${navPosition}`}>
      <header className="slide-header">
        <h1>{title}</h1>
        <p>
          Remote deck ID: <code>{deckId}</code> | Control style: <code>{COMPONENT_LIBRARY}</code>
        </p>
      </header>

      <main className="slide-stage" aria-live="polite">
        {slides[index]}
      </main>

      <nav className="slide-nav" aria-label="Slide navigation">
        <ControlButton onClick={() => go("first")}>First</ControlButton>
        <ControlButton onClick={() => go("prev")}>Prev</ControlButton>
        <span className="slide-status">
          Slide {index + 1} / {slides.length}
        </span>
        <ControlButton onClick={() => go("next")}>Next</ControlButton>
        <ControlButton onClick={() => go("last")}>Last</ControlButton>
      </nav>
    </section>
  );
}

function ControlButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  // Replace with project primitives (shadcn/radix/headless) when explicitly requested.
  return (
    <button type="button" className={`slide-btn lib-${COMPONENT_LIBRARY}`} onClick={onClick}>
      {children}
    </button>
  );
}

function applyCommand(current: number, total: number, envelope: RemoteEnvelope): number {
  if (envelope.command === "next") {
    return clamp(current + 1, total);
  }
  if (envelope.command === "prev") {
    return clamp(current - 1, total);
  }
  if (envelope.command === "first") {
    return 0;
  }
  if (envelope.command === "last") {
    return total - 1;
  }
  if (envelope.command === "goto" && Number.isInteger(envelope.index)) {
    return clamp(envelope.index || 0, total);
  }
  if (envelope.command === "state" && Number.isInteger(envelope.index)) {
    return clamp(envelope.index || 0, total);
  }
  return current;
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
