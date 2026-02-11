import { useEffect, useMemo, useRef, useState } from "react";

function isValidIsoDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(iso + "T00:00:00");
  return dt.getFullYear() === y && dt.getMonth() + 1 === m && dt.getDate() === d;
}

function brToIso(br) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(br)) return null;
  const [dd, mm, yyyy] = br.split("/").map(Number);
  const iso = `${String(yyyy).padStart(4, "0")}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  return isValidIsoDate(iso) ? iso : null;
}

function diffDaysFromIso(isoPrevista, isoEntrega) {
  const a = new Date(isoPrevista + "T00:00:00");
  const b = new Date(isoEntrega + "T00:00:00");
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const ms = b - a;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function maskBrDate(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);

  let out = dd;
  if (mm.length) out += `/${mm}`;
  if (yyyy.length) out += `/${yyyy}`;
  return out;
}

function formatBrDateTime(isoString) {
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return "";

  // Horário oficial de Brasília (uso prático: America/Sao_Paulo)
  const s = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dt);

  // em alguns ambientes pode vir com vírgula: "11/02/2026, 14:56"
  return s.replace(",", "").replace(/\s+/g, " ").trim();
}

export default function App() {
  const [nf, setNf] = useState("");
  const [previstaBr, setPrevistaBr] = useState("");
  const [entregaBr, setEntregaBr] = useState("");
  const [historico, setHistorico] = useState([]);

  const nfRef = useRef(null);
  const previstaRef = useRef(null);
  const entregaRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("sla_historico");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistorico(parsed);
      } catch {
        // ignora
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sla_historico", JSON.stringify(historico));
  }, [historico]);

  useEffect(() => {
    nfRef.current?.focus();
  }, []);

  function onLimparHistorico() {
    if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
      setHistorico([]);
      setTimeout(() => nfRef.current?.focus(), 0);
    }
  }

  function statusDetalhado(variacao) {
    if (variacao < 0) return `${Math.abs(variacao)} dia(s) antes do prazo`;
    if (variacao === 0) return `Entregue no prazo (no dia previsto)`;
    return `${variacao} dia(s) de atraso`;
  }

  const resultado = useMemo(() => {
    const isoPrev = brToIso(previstaBr);
    const isoEnt = brToIso(entregaBr);
    if (!isoPrev || !isoEnt) return null;

    const variacao = diffDaysFromIso(isoPrev, isoEnt);
    const situacao =
      variacao < 0 ? "Antecipado" : variacao === 0 ? "No prazo" : "Atrasado";

    return { variacao, situacao };
  }, [previstaBr, entregaBr]);

  function onCalcular() {
    if (!nf.trim()) {
      alert("Preencha a NF.");
      nfRef.current?.focus();
      return;
    }
    if (nf.trim().length !== 6) {
      alert("A NF deve ter 6 dígitos.");
      nfRef.current?.focus();
      return;
    }

    const isoPrev = brToIso(previstaBr);
    if (!isoPrev) {
      alert("Data prevista inválida. Use dd/mm/aaaa.");
      previstaRef.current?.focus();
      return;
    }

    const isoEnt = brToIso(entregaBr);
    if (!isoEnt) {
      alert("Data de entrega inválida. Use dd/mm/aaaa.");
      entregaRef.current?.focus();
      return;
    }

    const variacao = diffDaysFromIso(isoPrev, isoEnt);
    const situacao =
      variacao < 0 ? "Antecipado" : variacao === 0 ? "No prazo" : "Atrasado";

    setHistorico((old) => [
      {
        id: crypto.randomUUID(),
        nf,
        prevista: previstaBr,
        entrega: entregaBr,
        situacao,
        variacao,
        criadoEm: new Date().toISOString(),
      },
      ...old,
    ]);

    setNf("");
    setPrevistaBr("");
    setEntregaBr("");
    setTimeout(() => nfRef.current?.focus(), 0);
  }

  function onLimparCampos() {
    setNf("");
    setPrevistaBr("");
    setEntregaBr("");
    setTimeout(() => nfRef.current?.focus(), 0);
  }

  function onRemover(id) {
    setHistorico((old) => old.filter((x) => x.id !== id));
  }

  function escapeCsv(value) {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  }

  function onExportarCsv() {
    if (historico.length === 0) {
      alert("Não há registros para exportar.");
      return;
    }

    const header = [
      "nf",
      "prevista",
      "entrega",
      "situacao",
      "variacao_dias",
      "status_texto",
      "consultado_em", // ✅ novo nome da coluna
    ];

    const rows = historico.map((r) => [
      r.nf,
      r.prevista,
      r.entrega,
      r.situacao,
      r.variacao,
      statusDetalhado(r.variacao),
      formatBrDateTime(r.criadoEm), // ✅ formato BR + fuso Brasília
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

  function badgeColor(situacao) {
    if (situacao === "Atrasado") return { background: "#FEE2E2", color: "#991B1B" };
    if (situacao === "Antecipado") return { background: "#DBEAFE", color: "#1D4ED8" };
    return { background: "#DCFCE7", color: "#166534" };
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B1220", color: "#E5E7EB" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
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
              onCalcular();
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
                      ...badgeColor(resultado.situacao),
                    }}
                  >
                    {resultado.situacao}
                  </span>

                  <span style={{ color: "#9CA3AF" }}>{statusDetalhado(resultado.variacao)}</span>
                </div>
              ) : (
                <div style={{ color: "#9CA3AF", fontSize: 13 }}>
                  Preencha as datas para ver o resultado.
                </div>
              )}
            </div>
          </form>
        </section>

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
      </div>
    </div>
  );
}
