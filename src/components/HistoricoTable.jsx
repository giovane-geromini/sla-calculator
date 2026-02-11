export default function HistoricoTable({ historico, badgeColor, statusDetalhado, onRemover }) {
  return (
    <section style={{ marginTop: 18 }}>
      <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Histórico</h2>

      <div
        style={{
          background: "#111827",
          border: "1px solid #1F2937",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0B1220", color: "#9CA3AF", fontSize: 12 }}>
              <th style={{ textAlign: "left", padding: 12 }}>NF</th>
              <th style={{ textAlign: "left", padding: 12 }}>Prevista</th>
              <th style={{ textAlign: "left", padding: 12 }}>Entrega</th>
              <th style={{ textAlign: "left", padding: 12 }}>Situação</th>
              <th style={{ textAlign: "left", padding: 12 }}>Variação (dias)</th>
              <th style={{ textAlign: "left", padding: 12 }}>Status</th>
              <th style={{ textAlign: "right", padding: 12 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {historico.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 14, color: "#9CA3AF" }}>
                  Nenhum registro ainda.
                </td>
              </tr>
            ) : (
              historico.map((row) => (
                <tr key={row.id} style={{ borderTop: "1px solid #1F2937" }}>
                  <td style={{ padding: 12 }}>{row.nf}</td>
                  <td style={{ padding: 12 }}>{row.prevista}</td>
                  <td style={{ padding: 12 }}>{row.entrega}</td>
                  <td style={{ padding: 12 }}>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        ...badgeColor(row.situacao),
                      }}
                    >
                      {row.situacao}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{row.variacao}</td>
                  <td style={{ padding: 12, color: "#9CA3AF" }}>
                    {statusDetalhado(row.variacao)}
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    <button
                      onClick={() => onRemover(row.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #374151",
                        background: "transparent",
                        color: "#E5E7EB",
                        cursor: "pointer",
                      }}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
