import { useEffect, useMemo, useState } from "react";


function diffDays(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  // zera horas pra não dar diferença por fuso/horário
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const ms = b - a;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function App() {
  const [prevista, setPrevista] = useState("");
  const [entrega, setEntrega] = useState("");
  const [historico, setHistorico] = useState([]);

  // 1) Carrega do LocalStorage quando o app abre
useEffect(() => {
  const saved = localStorage.getItem("sla_historico");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setHistorico(parsed);
    } catch {
      // se der erro, ignora
    }
  }
}, []);

function onLimparHistorico() {
  if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
    setHistorico([]);
  }
}


// 2) Salva no LocalStorage sempre que o histórico mudar
useEffect(() => {
  localStorage.setItem("sla_historico", JSON.stringify(historico));
}, [historico]);


  const resultado = useMemo(() => {
    if (!prevista || !entrega) return null;
    const atraso = diffDays(prevista, entrega);
    const status = atraso > 0 ? "Atrasado" : "No prazo";
    return { atraso, status };
  }, [prevista, entrega]);

  function onCalcular() {
  if (!prevista || !entrega) {
    alert("Preencha as duas datas.");
    return;
  }

  const atraso = diffDays(prevista, entrega);

  // entrega antes da prevista (não faz sentido pra SLA)
  if (atraso < 0) {
    alert("A data de entrega não pode ser ANTES da data prevista.");
    return;
  }

  const status = atraso > 0 ? "Atrasado" : "No prazo";

  setHistorico((old) => [
    {
      id: crypto.randomUUID(),
      prevista,
      entrega,
      status,
      atraso,
      criadoEm: new Date().toISOString(),
    },
    ...old,
  ]);
}


  function onLimpar() {
    setPrevista("");
    setEntrega("");
  }

  function onRemover(id) {
    setHistorico((old) => old.filter((x) => x.id !== id));
  }

function escapeCsv(value) {
  const s = String(value ?? "");
  // coloca aspas se tiver vírgula, aspas ou quebra de linha
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function onExportarCsv() {
  if (historico.length === 0) {
    alert("Não há registros para exportar.");
    return;
  }

  const header = ["prevista", "entrega", "status", "atraso_dias", "criado_em"];
  const rows = historico.map((r) => [
    r.prevista,
    r.entrega,
    r.status,
    r.atraso,
    r.criadoEm,
  ]);

  const csv =
    [header, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n") + "\n";

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `sla-historico-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}



  function badgeColor(status) {
    return status === "Atrasado"
      ? { background: "#FEE2E2", color: "#991B1B" }
      : { background: "#DCFCE7", color: "#166534" };
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B1220", color: "#E5E7EB" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
        <header style={{ marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>SLA Calculator</h1>
          <p style={{ margin: "6px 0 0", color: "#9CA3AF" }}>
            Calcule atraso e registre um histórico simples.
          </p>
        </header>

        {/* Card do formulário */}
        <section
          style={{
            background: "#111827",
            border: "1px solid #1F2937",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#9CA3AF" }}>Data prevista</span>
              <input
                type="date"
                value={prevista}
                onChange={(e) => setPrevista(e.target.value)}
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
                type="date"
                value={entrega}
                onChange={(e) => setEntrega(e.target.value)}
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

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              onClick={onCalcular}
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
              onClick={onLimpar}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #374151",
                background: "transparent",
                color: "#E5E7EB",
                cursor: "pointer",
              }}
            >
              Limpar datas
            </button>


            <button
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


          {/* Resultado */}
          <div style={{ marginTop: 14 }}>
            {resultado ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #1F2937",
                  background: "#0B1220",
                }}
              >
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    ...badgeColor(resultado.status),
                  }}
                >
                  {resultado.status}
                </span>

                <span style={{ color: "#9CA3AF" }}>
                  {resultado.status === "Atrasado"
                    ? `Atraso: ${Math.max(0, resultado.atraso)} dia(s)`
                    : "Entrega dentro do prazo"}
                </span>
              </div>
            ) : (
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>
                Preencha as datas para ver o resultado.
              </div>
            )}
          </div>
        </section>

        {/* Histórico */}
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
                  <th style={{ textAlign: "left", padding: 12 }}>Prevista</th>
                  <th style={{ textAlign: "left", padding: 12 }}>Entrega</th>
                  <th style={{ textAlign: "left", padding: 12 }}>Status</th>
                  <th style={{ textAlign: "left", padding: 12 }}>Atraso (dias)</th>
                  <th style={{ textAlign: "right", padding: 12 }}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {historico.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 14, color: "#9CA3AF" }}>
                      Nenhum registro ainda.
                    </td>
                  </tr>
                ) : (
                  historico.map((row) => (
                    <tr key={row.id} style={{ borderTop: "1px solid #1F2937" }}>
                      <td style={{ padding: 12 }}>{row.prevista}</td>
                      <td style={{ padding: 12 }}>{row.entrega}</td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            ...badgeColor(row.status),
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>{row.atraso}</td>
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
      </div>
    </div>
  );
}
