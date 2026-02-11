export function isValidIsoDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(iso + "T00:00:00");
  return dt.getFullYear() === y && dt.getMonth() + 1 === m && dt.getDate() === d;
}

export function brToIso(br) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(br)) return null;
  const [dd, mm, yyyy] = br.split("/").map(Number);
  const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  return isValidIsoDate(iso) ? iso : null;
}

export function diffDaysFromIso(isoPrevista, isoEntrega) {
  const a = new Date(isoPrevista + "T00:00:00");
  const b = new Date(isoEntrega + "T00:00:00");
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function maskBrDate(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);

  let out = dd;
  if (mm.length) out += `/${mm}`;
  if (yyyy.length) out += `/${yyyy}`;
  return out;
}

export function formatBrDateTime(isoString) {
  const dt = new Date(isoString);
  if (isNaN(dt)) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(dt)
    .replace(",", "");
}
