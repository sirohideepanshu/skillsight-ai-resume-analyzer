import { useEffect, useState } from "react";

/*
 * Listens for the lifecycle events emitted by services/api.js while the Render
 * free-tier backend cold-starts. Shows a friendly, non-blocking banner instead
 * of letting individual pages render a misleading "server down" error.
 */
export default function ServerWakeBanner() {
  // "idle" | "waking" | "down"
  const [state, setState] = useState("idle");

  useEffect(() => {
    const onWaking = () => setState("waking");
    const onAwake = () => setState("idle");
    const onDown = () => setState("down");

    window.addEventListener("server:waking", onWaking);
    window.addEventListener("server:awake", onAwake);
    window.addEventListener("server:down", onDown);

    return () => {
      window.removeEventListener("server:waking", onWaking);
      window.removeEventListener("server:awake", onAwake);
      window.removeEventListener("server:down", onDown);
    };
  }, []);

  if (state === "idle") return null;

  const isDown = state === "down";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        padding: "0.6rem 1rem",
        fontSize: "0.9rem",
        fontWeight: 500,
        color: "#fff",
        background: isDown ? "#b91c1c" : "#2563eb",
        boxShadow: "0 1px 6px rgba(0,0,0,0.2)",
      }}
    >
      {!isDown && (
        <span
          style={{
            width: "1rem",
            height: "1rem",
            border: "2px solid rgba(255,255,255,0.4)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "ss-spin 0.8s linear infinite",
            display: "inline-block",
          }}
        />
      )}
      <span>
        {isDown
          ? "Can't reach the server. Please check your connection and retry."
          : "Waking up the server… this can take up to a minute on first load."}
      </span>
      <style>{`@keyframes ss-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
