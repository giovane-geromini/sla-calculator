import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import SlaForm from "./components/SlaForm";
import HistoricoTable from "./components/HistoricoTable";
import { brToIso, diffDaysFromIso, formatBrDateTime } from "./utils/dateUtils";
import { downloadCsv } from "./utils/csvUtils";

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

  function statusDetalhado(variacao) {
    if (variacao < 0) return `${Math.abs(variacao)} dia(s) antes do prazo`;
    if (variacao === 0) return "Entregue no prazo (no dia previsto)";
    return `${variacao} dia(s) de atraso`;
  }

  function badgeColor(situacao) {
    if (situacao === "Atrasado") return { background: "#FEE2E2", color: "#991B1B" };
    if (situacao === "Antecipado") return { background: "#DBEAFE", color: "#1D4ED8" };
    return { background: "#DCFCE7", color: "#166534" };
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
    if (!nf.trim() || nf.trim().length !== 6) {
      alert("NF deve ter 6 dígitos.");
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

  function onLimparHistorico() {
    if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
      setHistorico([]);
      setTimeout(() => nfRef.current?.focus(), 0);
    }
  }

  function onExportarCsv() {
    if (historico.length === 0) {
      alert("Não há registros para exportar.");
      return;
    }

    downloadCsv({
      filename: `sla-historico-${new Date().toISOString().slice(0, 10)}.csv`,
      header: [
        "nf",
        "prevista",
        "entrega",
        "situacao",
        "variacao_dias",
        "status_texto",
        "consultado_em",
      ],
      rows: historico.map((r) => [
        r.nf,
        r.prevista,
        r.entrega,
        r.situacao,
        r.variacao,
        statusDetalhado(r.variacao),
        formatBrDateTime(r.criadoEm),
      ]),
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B1220", color: "#E5E7EB" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
        <Header />

        <SlaForm
          nf={nf}
          previstaBr={previstaBr}
          entregaBr={entregaBr}
          nfRef={nfRef}
          previstaRef={previstaRef}
          entregaRef={entregaRef}
          setNf={setNf}
          setPrevistaBr={setPrevistaBr}
          setEntregaBr={setEntregaBr}
          onSubmit={onCalcular}
          onLimparCampos={onLimparCampos}
          onExportarCsv={onExportarCsv}
          onLimparHistorico={onLimparHistorico}
        />

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
                  ...badgeColor(resultado.situacao),
                }}
              >
                {resultado.situacao}
              </span>

              <span style={{ color: "#9CA3AF" }}>
                {statusDetalhado(resultado.variacao)}
              </span>
            </div>
          ) : (
            <div style={{ color: "#9CA3AF", fontSize: 13, marginTop: 14 }}>
              Preencha as datas para ver o resultado.
            </div>
          )}
        </div>

        <HistoricoTable
          historico={historico}
          badgeColor={badgeColor}
          statusDetalhado={statusDetalhado}
          onRemover={onRemover}
        />
      </div>
    </div>
  );
}
