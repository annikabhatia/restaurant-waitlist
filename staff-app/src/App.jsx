import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ── mock data so the UI works before backend is fixed ── */
const MOCK_QUEUE = [
  { id: "1", name: "Maria Garcia", phone: "5551234567", party_size: 3, joined_at: Date.now() - 1000 * 60 * 22 },
  { id: "2", name: "James Chen", phone: "5559876543", party_size: 2, joined_at: Date.now() - 1000 * 60 * 14 },
  { id: "3", name: "Aisha Patel", phone: "5552223333", party_size: 5, joined_at: Date.now() - 1000 * 60 * 6 },
];

function formatPhone(p) {
  const d = p.replace(/\D/g, "");
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}

function waitingFor(joinedAt) {
  const mins = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min";
  return `${mins} min`;
}

function Header({ count }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Waitlist</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Rosario's &middot; Front of house</p>
      </div>
      <div style={{
        background: "var(--primary)", color: "white",
        borderRadius: 999, padding: "6px 14px",
        fontSize: 14, fontWeight: 600,
      }}>
        {count} waiting
      </div>
    </header>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: "center", padding: "64px 20px",
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
    }}>
      <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>No one's waiting</p>
      <p style={{ fontSize: 14, color: "var(--muted)" }}>New parties will appear here as they join.</p>
    </div>
  );
}

function ActionButton({ label, onClick, variant = "default", disabled }) {
  const variants = {
    default: { bg: "var(--surface)", color: "var(--text)", border: "var(--border)" },
    primary: { bg: "var(--surface)", color: "var(--primary)", border: "var(--primary)" },
    success: { bg: "var(--success)", color: "white", border: "var(--success)" },
    danger:  { bg: "var(--surface)", color: "var(--danger)", border: "var(--border)" },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: "10px 0",
        borderRadius: 8,
        border: `1px solid ${v.border}`,
        background: v.bg,
        color: v.color,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s, transform 0.1s",
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {label}
    </button>
  );
}

function QueueRow({ entry, index, onSeat, onNotify, onRemove, busy }) {
  const isLongWait = (Date.now() - new Date(entry.joined_at).getTime()) / 60000 > 20;

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "16px 18px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "#eef2ff", color: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            {index + 1}
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{entry.name}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              {formatPhone(entry.phone)} &middot; Party of {entry.party_size}
            </p>
          </div>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 600, padding: "4px 9px", borderRadius: 6,
          background: isLongWait ? "var(--warn-bg)" : "#f1f3f5",
          color: isLongWait ? "var(--warn-text)" : "var(--muted)",
          whiteSpace: "nowrap",
        }}>
          {waitingFor(entry.joined_at)}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <ActionButton label="Notify" variant="primary" disabled={busy} onClick={() => onNotify(entry.id)} />
        <ActionButton label="Seat" variant="success" disabled={busy} onClick={() => onSeat(entry.id)} />
        <ActionButton label="Remove" variant="danger" disabled={busy} onClick={() => onRemove(entry.id)} />
      </div>
    </div>
  );
}

export default function App() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/waitlist`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQueue(data);
      setUsingMock(false);
    } catch {
      setQueue(MOCK_QUEUE);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleAction = async (id, action) => {
    setBusyId(id);
    try {
      if (action === "seat") {
        await fetch(`${API_URL}/waitlist/${id}/seat`, { method: "PATCH" });
        setQueue((q) => q.filter((e) => e.id !== id));
      } else if (action === "remove") {
        await fetch(`${API_URL}/waitlist/${id}`, { method: "DELETE" });
        setQueue((q) => q.filter((e) => e.id !== id));
      } else if (action === "notify") {
        await fetch(`${API_URL}/waitlist/${id}/notify`, { method: "POST" });
      }
    } catch {
      // backend not connected yet — simulate locally so UI stays usable
      if (action !== "notify") {
        setQueue((q) => q.filter((e) => e.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div id="root"><p style={{ textAlign: "center", color: "var(--muted)", padding: 60 }}>Loading queue…</p></div>;
  }

  return (
    <div id="root">
      <Header count={queue.length} />

      {usingMock && (
        <div style={{
          background: "var(--warn-bg)", color: "var(--warn-text)",
          fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: 16,
        }}>
          Backend not connected — showing sample data for preview.
        </div>
      )}

      {queue.length === 0 ? (
        <EmptyState />
      ) : (
        queue.map((entry, i) => (
          <QueueRow
            key={entry.id}
            entry={entry}
            index={i}
            busy={busyId === entry.id}
            onSeat={(id) => handleAction(id, "seat")}
            onRemove={(id) => handleAction(id, "remove")}
            onNotify={(id) => handleAction(id, "notify")}
          />
        ))
      )}
    </div>
  );
}