(() => {
  const query = new URLSearchParams(window.location.search);
  const role =
    query.get("role") ||
    (window.location.pathname.endsWith("remote.html") ? "remote" : "screen");

  const CONFIG = {
    title: "__DECK_TITLE__",
    deckId: query.get("deck") || "__DECK_ID__",
    navPosition: query.get("nav") || "__NAV_POSITION__",
    role,
    wsUrl: window.SLIDES_REMOTE_WS || "",
  };

  const COMMANDS = {
    NEXT: "next",
    PREV: "prev",
    FIRST: "first",
    LAST: "last",
    GOTO: "goto",
    STATE: "state",
  };

  const SLIDES = [
    "./slides/slide-1.html",
    "./slides/slide-2.html",
    "./slides/slide-3.html",
  ];

  const clientId = `${CONFIG.role}-${Math.random().toString(36).slice(2, 8)}`;
  let currentIndex = 0;

  const frame = document.getElementById("slide-frame");
  const indicator = document.getElementById("slide-indicator") || document.getElementById("remote-indicator");
  const remoteStatus = document.getElementById("remote-status");

  const transport = createTransport(CONFIG.deckId, clientId, CONFIG.wsUrl, handleEnvelope);

  document.body.classList.remove("nav-right", "nav-bottom");
  document.body.classList.add(`nav-${CONFIG.navPosition === "bottom" ? "bottom" : "right"}`);

  if (CONFIG.role === "screen") {
    initScreenMode();
  } else {
    initRemoteMode();
  }

  window.addEventListener("beforeunload", () => {
    transport.close();
  });

  function initScreenMode() {
    if (!frame) {
      return;
    }

    const firstBtn = document.getElementById("first-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const lastBtn = document.getElementById("last-btn");
    const remoteLink = document.getElementById("open-remote");

    if (remoteLink) {
      const remoteUrl = new URL(remoteLink.getAttribute("href"), window.location.href);
      remoteUrl.searchParams.set("deck", CONFIG.deckId);
      remoteLink.setAttribute("href", remoteUrl.pathname + remoteUrl.search);
    }

    firstBtn?.addEventListener("click", () => applyCommand({ command: COMMANDS.FIRST }));
    prevBtn?.addEventListener("click", () => applyCommand({ command: COMMANDS.PREV }));
    nextBtn?.addEventListener("click", () => applyCommand({ command: COMMANDS.NEXT }));
    lastBtn?.addEventListener("click", () => applyCommand({ command: COMMANDS.LAST }));

    window.addEventListener("keydown", (event) => {
      if (["ArrowRight", "PageDown"].includes(event.key)) {
        applyCommand({ command: COMMANDS.NEXT });
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        applyCommand({ command: COMMANDS.PREV });
      } else if (event.key === "Home") {
        applyCommand({ command: COMMANDS.FIRST });
      } else if (event.key === "End") {
        applyCommand({ command: COMMANDS.LAST });
      }
    });

    renderSlide();
    publishState();
  }

  function initRemoteMode() {
    bindRemoteButton("remote-first", () => sendCommand(COMMANDS.FIRST));
    bindRemoteButton("remote-prev", () => sendCommand(COMMANDS.PREV));
    bindRemoteButton("remote-next", () => sendCommand(COMMANDS.NEXT));
    bindRemoteButton("remote-last", () => sendCommand(COMMANDS.LAST));

    const goButton = document.getElementById("remote-go");
    const indexInput = document.getElementById("remote-slide-index");

    goButton?.addEventListener("click", () => {
      const raw = indexInput?.value || "1";
      const parsed = Number.parseInt(raw, 10);
      const index = Number.isNaN(parsed) ? 0 : Math.max(0, parsed - 1);
      sendCommand(COMMANDS.GOTO, index);
    });

    updateIndicator();
  }

  function bindRemoteButton(id, fn) {
    const button = document.getElementById(id);
    button?.addEventListener("click", fn);
  }

  function sendCommand(command, index = null) {
    const envelope = {
      deckId: CONFIG.deckId,
      sender: clientId,
      role: CONFIG.role,
      command,
      index,
      timestamp: Date.now(),
    };
    transport.send(envelope);
  }

  function publishState() {
    sendCommand(COMMANDS.STATE, currentIndex);
  }

  function handleEnvelope(envelope) {
    if (!envelope || envelope.deckId !== CONFIG.deckId || envelope.sender === clientId) {
      return;
    }

    if (CONFIG.role === "screen") {
      applyCommand(envelope, false);
      return;
    }

    if (envelope.command === COMMANDS.STATE && Number.isInteger(envelope.index)) {
      currentIndex = clampIndex(envelope.index);
      updateIndicator();
    }
  }

  function applyCommand(envelope, shouldBroadcast = true) {
    const command = envelope.command;

    if (command === COMMANDS.NEXT) {
      currentIndex = clampIndex(currentIndex + 1);
    } else if (command === COMMANDS.PREV) {
      currentIndex = clampIndex(currentIndex - 1);
    } else if (command === COMMANDS.FIRST) {
      currentIndex = 0;
    } else if (command === COMMANDS.LAST) {
      currentIndex = SLIDES.length - 1;
    } else if (command === COMMANDS.GOTO && Number.isInteger(envelope.index)) {
      currentIndex = clampIndex(envelope.index);
    } else if (command === COMMANDS.STATE && Number.isInteger(envelope.index)) {
      currentIndex = clampIndex(envelope.index);
    }

    if (CONFIG.role === "screen") {
      renderSlide();
    }

    updateIndicator();

    if (shouldBroadcast) {
      publishState();
    }
  }

  function clampIndex(index) {
    if (index < 0) {
      return 0;
    }
    if (index >= SLIDES.length) {
      return SLIDES.length - 1;
    }
    return index;
  }

  function renderSlide() {
    if (frame) {
      frame.src = SLIDES[currentIndex];
    }
    updateIndicator();
  }

  function updateIndicator() {
    if (indicator) {
      indicator.textContent = `Slide ${currentIndex + 1} / ${SLIDES.length}`;
    }
  }

  function createTransport(deckId, senderId, wsUrl, onMessage) {
    const channel = new BroadcastChannel(`code-slides:${deckId}`);
    let ws = null;

    channel.addEventListener("message", (event) => {
      onMessage(event.data);
    });

    if (wsUrl) {
      try {
        ws = new WebSocket(wsUrl);
        ws.addEventListener("open", () => {
          ws.send(
            JSON.stringify({
              type: "join",
              deckId,
              sender: senderId,
              role,
            })
          );
          if (remoteStatus) {
            remoteStatus.textContent = "Connected via websocket relay.";
          }
        });
        ws.addEventListener("message", (event) => {
          try {
            const parsed = JSON.parse(event.data);
            onMessage(parsed);
          } catch {
            // Ignore malformed messages.
          }
        });
      } catch {
        // Keep BroadcastChannel-only mode.
      }
    }

    return {
      send(envelope) {
        channel.postMessage(envelope);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(envelope));
        }
      },
      close() {
        channel.close();
        if (ws) {
          ws.close();
        }
      },
    };
  }
})();
