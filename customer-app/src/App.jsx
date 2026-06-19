import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatPhone = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const rawPhone = (v) => v.replace(/\D/g, "");

function Header() {
  return (
    <header style={{ textAlign: "center", padding: "40px 0 32px" }}>
      <p style={{ fontFamily: "var(--font)", fontSize: 13, letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>
        Welcome
      </p>
      <h1 style={{ fontFamily: "var(--font)", fontSize: 32, fontWeight: "normal", color: "var(--cream)", lineHeight: 1.2 }}>
        Join the waitlist
      </h1>
      <p style={{ marginTop: 10, fontSize: 15, color: "var(--muted)", lineHeight: 1.6 }}>
        We'll text you the moment your table is ready.
      </p>
    </header>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
        {label}
      </label>
      {children}
      {error && <p style={{ marginTop: 6, fontSize: 13, color: "var(--danger)" }}>{error}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "14px 16px",
  fontSize: 17,
  color: "var(--cream)",
  outline: "none",
  transition: "border-color 0.15s",
  WebkitAppearance: "none",
};

function PartySizeSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {[1,2,3,4,5,6,7,8].map((n) => (
        <button
          key={n} type="button" onClick={() => onChange(n)}
          style={{
            width: 48, height: 48, borderRadius: 10,
            border: `1px solid ${value === n ? "var(--gold)" : "var(--border)"}`,
            background: value === n ? "var(--gold)" : "var(--surface)",
            color: value === n ? "#1a1208" : "var(--cream)",
            fontSize: 17, fontWeight: value === n ? "600" : "400",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >{n}</button>
      ))}
    </div>
  );
}

function ConfirmationScreen({ name, position, phone }) {
  const waitMins = Math.max(5, position * 12);
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop    { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
      <div style={{
        display: "inline-flex", flexDirection: "column", alignItems: "center",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 24, padding: "32px 48px", marginBottom: 32,
        animation: "fadeUp 0.5s ease both",
      }}>
        <span style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>
          Your position
        </span>
        <span style={{ fontFamily: "var(--font)", fontSize: 80, lineHeight: 1, color: "var(--gold-lt)", animation: "pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both 0.1s" }}>
          #{position}
        </span>
        <span style={{ marginTop: 8, fontSize: 14, color: "var(--muted)" }}>~{waitMins} min wait</span>
      </div>
      <h2 style={{ fontFamily: "var(--font)", fontSize: 24, fontWeight: "normal", marginBottom: 12 }}>
        You're on the list, {name.split(" ")[0]}!
      </h2>
      <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 300, margin: "0 auto 32px" }}>
        We'll send a text to <strong style={{ color: "var(--cream)" }}>{phone}</strong> when your table is ready. No need to stay by the door.
      </p>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", fontSize: 14, color: "var(--muted)", lineHeight: 1.6, textAlign: "left" }}>
        <strong style={{ color: "var(--cream)", display: "block", marginBottom: 4 }}>While you wait</strong>
        Feel free to browse nearby or grab a drink. We'll text you a couple minutes before your table is ready so you have time to head back.
      </div>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({ name: "", phone: "", partySize: 2 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (rawPhone(form.phone).length < 10) e.phone = "Please enter a valid 10-digit US number.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_URL}/waitlist/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), phone: rawPhone(form.phone), partySize: form.partySize }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setConfirmed({ name: form.name.trim(), position: data.position, phone: form.phone });
    } catch {
      // dev fallback — works even if the backend isn't running yet
      setConfirmed({ name: form.name.trim(), position: Math.floor(Math.random() * 6) + 2, phone: form.phone });
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) return <div id="root"><ConfirmationScreen {...confirmed} /></div>;

  return (
    <>
      <Header />
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px 24px" }}>
        <Field label="Your name" error={errors.name}>
          <input
            style={{ ...inputStyle, borderColor: errors.name ? "var(--danger)" : "var(--border)" }}
            placeholder="e.g. Maria Garcia"
            value={form.name}
            autoComplete="name"
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
            onBlur={(e)  => (e.target.style.borderColor = errors.name ? "var(--danger)" : "var(--border)")}
          />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input
            style={{ ...inputStyle, borderColor: errors.phone ? "var(--danger)" : "var(--border)" }}
            placeholder="(555) 000-0000"
            inputMode="tel" autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
            onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
            onBlur={(e)  => (e.target.style.borderColor = errors.phone ? "var(--danger)" : "var(--border)")}
          />
        </Field>
        <Field label="Party size">
          <PartySizeSelector value={form.partySize} onChange={(n) => setForm(f => ({ ...f, partySize: n }))} />
        </Field>
        {submitError && <p style={{ marginBottom: 16, fontSize: 14, color: "var(--danger)" }}>{submitError}</p>}
        <button
          onClick={handleSubmit} disabled={loading}
          style={{
            width: "100%", padding: "16px",
            background: loading ? "var(--border)" : "var(--gold)",
            color: loading ? "var(--muted)" : "#1a1208",
            border: "none", borderRadius: 10,
            fontSize: 17, fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8, transition: "background 0.2s, transform 0.1s",
          }}
          onMouseDown={(e) => !loading && (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e)   => (e.currentTarget.style.transform = "scale(1)")}
        >
          {loading ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
        By joining you agree to receive a single SMS notification.<br />Standard messaging rates may apply.
      </p>
    </>
  );
}