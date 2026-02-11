import { maskBrDate } from "../utils/dateUtils";

export default function SlaForm({
  nf,
  previstaBr,
  entregaBr,
  nfRef,
  previstaRef,
  entregaRef,
  setNf,
  setPrevistaBr,
  setEntregaBr,
  onSubmit,
  onLimparCampos,
  onExportarCsv,
  onLimparHistorico,
}) {
  return (
    <section
      style={{
        background: "#111827",
        border: "1px solid #1F2937",
        borderRadius: 14,
        padding: 16,
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>NF (6 dígitos)</span>
            <input
              ref={nfRef}
              type="text"
              inputMode="numeric"
              placeholder="Ex: 123456"
              value={nf}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
                setNf(onlyDigits);
                if (onlyDigits.length === 6) {
                  previstaRef.current?.focus();
                }
              }}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#0B1220",
                color: "#E5E7EB",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>Data prevista</span>
            <input
              ref={previstaRef}
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={previstaBr}
              onChange={(e) => setPrevistaBr(maskBrDate(e.target.value))}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#0B1220",
                color: "#E5E7EB",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>Data de entrega</span>
            <input
              ref={entregaRef}
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={entregaBr}
              onChange={(e) => setEntregaBr(maskBrDate(e.target.value))}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#0B1220",
                color: "#E5E7EB",
              }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #2563EB",
              background: "#2563EB",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Calcular & salvar
          </button>

          <button
            type="button"
            onClick={onLimparCampos}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #374151",
              background: "transparent",
              color: "#E5E7EB",
              cursor: "pointer",
            }}
          >
            Limpar campos
          </button>

          <button
            type="button"
            onClick={onExportarCsv}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #374151",
              background: "transparent",
              color: "#E5E7EB",
              cursor: "pointer",
            }}
          >
            Exportar CSV
          </button>

          <button
            type="button"
            onClick={onLimparHistorico}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #374151",
              background: "transparent",
              color: "#E5E7EB",
              cursor: "pointer",
            }}
          >
            Limpar histórico
          </button>
        </div>
      </form>
    </section>
  );
}
