import type { ReactNode } from "react";

export const slides: ReactNode[] = [
  <article key="s1" style={{ display: "grid", gap: "0.5rem" }}>
    <h2 style={{ margin: 0 }}>__DECK_TITLE__</h2>
    <p style={{ margin: 0 }}>
      Build responsive, code-first decks with remote control and configurable navigation.
    </p>
  </article>,
  <article key="s2" style={{ display: "grid", gap: "0.5rem" }}>
    <h2 style={{ margin: 0 }}>Image Strategy</h2>
    <ul style={{ margin: 0 }}>
      <li>Reuse local repository images first.</li>
      <li>Reference external image URLs already in project content.</li>
      <li>Fill missing assets with AI generation.</li>
      <li>Compose with code-as-image product visuals.</li>
    </ul>
  </article>,
  <article key="s3" style={{ display: "grid", gap: "0.75rem" }}>
    <h2 style={{ margin: 0 }}>Code-as-Image Dashboard</h2>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "0.5rem",
      }}
    >
      <div style={panelStyle}>+38% Activation</div>
      <div style={panelStyle}>2.4s TTI</div>
      <div style={panelStyle}>91 NPS</div>
    </div>
    <div
      role="img"
      aria-label="Sample chart"
      style={{
        borderRadius: "0.75rem",
        minHeight: "160px",
        background:
          "linear-gradient(to top, #5fa7f5 0%, #5fa7f5 22%, #8ec7ff 22%, #8ec7ff 48%, #c8e5ff 48%, #c8e5ff 100%)",
      }}
    />
  </article>,
];

const panelStyle = {
  borderRadius: "0.75rem",
  border: "1px solid #dbe2f3",
  background: "#f6f9ff",
  padding: "0.75rem",
};
