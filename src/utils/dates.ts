export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
}

export function formatDateShort(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${parseInt(month)}/${parseInt(day)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
