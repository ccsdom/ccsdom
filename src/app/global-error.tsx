"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { getFriendlyFirebaseErrorMessage } from "@/firebase/errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const friendlyMessage = getFriendlyFirebaseErrorMessage(error);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#f8fafc",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              border: "1px solid #e2e8f0",
              borderRadius: 28,
              background: "white",
              padding: 32,
              textAlign: "center",
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                margin: "0 auto",
                borderRadius: 999,
                background: "#fef3c7",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <h2 style={{ marginTop: 20, fontSize: 24, fontWeight: 900 }}>
              Une action n'a pas abouti
            </h2>
            <p style={{ marginTop: 12, color: "#475569", lineHeight: 1.7 }}>
              {friendlyMessage}
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: 24,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: 0,
                borderRadius: 14,
                background: "#0f172a",
                color: "white",
                padding: "10px 16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} />
              Recharger
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
