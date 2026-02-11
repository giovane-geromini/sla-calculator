export function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export function downloadCsv({ filename, header, rows }) {
  const csv =
    [header, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n") + "\n";

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
