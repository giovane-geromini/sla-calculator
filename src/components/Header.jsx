export default function Header() {
  return (
    <header
      style={{
        marginBottom: 18,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 28 }}>SLA Calculator</h1>
        <p style={{ margin: "6px 0 0", color: "#9CA3AF" }}>
          Calcule atraso/antecipação e registre um histórico simples.
        </p>
      </div>

      <div style={{ fontWeight: 900, letterSpacing: 0.5, fontSize: 18, color: "#E5E7EB" }}>
        GeroCorp
      </div>
    </header>
  );
}
