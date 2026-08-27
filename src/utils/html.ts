const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

export function safeColor(v: unknown): string {
  return typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : '#00e5ff';
}
