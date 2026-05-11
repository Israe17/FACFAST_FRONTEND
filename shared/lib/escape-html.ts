const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
};

const HTML_ESCAPE_RE = /[&<>"'/]/g;

/**
 * Escape an untrusted string for safe inclusion in HTML markup.
 *
 * Use this only when you actually need to compose HTML strings (rare in a
 * React/Next codebase — React already escapes children automatically).
 * For DOM that we own directly (e.g. Leaflet popups) prefer
 * `element.textContent = value` instead of building markup with this helper.
 */
export function escapeHtml(input: string): string {
  return input.replace(HTML_ESCAPE_RE, (ch) => HTML_ESCAPES[ch] ?? ch);
}
