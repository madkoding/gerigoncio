import { highlight } from '../lib/highlight.js'

/**
 * Renders the language origin badge for a term.
 * `en` -> EN, `es` -> ES, anything else (e.g. "mix") -> MX.
 */
function OriginPill({ origin }) {
  const label = origin === 'en' ? 'EN' : origin === 'es' ? 'ES' : 'MX'
  return (
    <span className="origin-pill" data-origin={origin}>
      {label}
    </span>
  )
}

export default function TermCard({ term, query, index }) {
  // Stagger the entrance animation for the first ~25 cards so the grid feels alive
  // without delaying the rest of the list. Caps at 0.5s to avoid huge delays on long lists.
  const animationDelay = `${Math.min(index * 0.02, 0.5)}s`

  return (
    <article
      className="term-card"
      style={{ animationDelay }}
      aria-label={`${term.t} — ${term.c}`}
    >
      <div className="flex justify-between items-start mb-4 gap-4">
        <h2
          className="font-display font-bold italic text-[1.5rem] text-gold-light leading-[1.2]"
          dangerouslySetInnerHTML={{ __html: highlight(term.t, query) }}
        />
        <OriginPill origin={term.o} />
      </div>

      <p
        className="definition text-parchment-dim leading-relaxed text-[0.95rem] mb-4"
        dangerouslySetInnerHTML={{ __html: highlight(term.d, query) }}
      />

      {term.e ? (
        <blockquote
          className="example-quote"
          dangerouslySetInnerHTML={{ __html: highlight(term.e, query) }}
        />
      ) : null}

      <div className="category-tag">{term.c}</div>
    </article>
  )
}
