/**
 * Escapes user-controlled strings before injecting them into a `dangerouslySetInnerHTML`
 * payload, to keep the highlight feature XSS-safe.
 */
const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

/**
 * Returns a regex-safe version of the user query (case-insensitive, global).
 */
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Wraps every case-insensitive occurrence of `query` in `text` with a `<mark>` tag.
 * Output is HTML-safe: the source text is escaped first, so injecting user input
 * cannot lead to XSS via the highlight markup.
 *
 * If `query` is empty, returns the escaped text unchanged.
 */
export function highlight(text, query) {
  const safeText = escapeHtml(text)
  const trimmed = (query ?? '').trim()
  if (!trimmed) return safeText

  const pattern = new RegExp(escapeRegex(trimmed), 'gi')
  return safeText.replace(pattern, (match) => `<mark>${match}</mark>`)
}
