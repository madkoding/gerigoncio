import TermCard from './TermCard.jsx'

/**
 * Empty state shown when the current filter combination yields no results.
 * Lives inside the grid (so it spans the full width) and is keyboard-focusable
 * so screen readers can announce it cleanly.
 */
function EmptyState() {
  return (
    <div className="col-span-full text-center py-24 px-8" role="status">
      <div className="text-6xl mb-4 opacity-50" aria-hidden="true">
        🔍
      </div>
      <h3 className="font-display italic text-[1.8rem] text-gold-light mb-2">
        Ningún término encontrado
      </h3>
      <p className="text-parchment-mute">
        Prueba con otra palabra o cambia la categoría. A veces el corporativés es
        más raro de lo que crees.
      </p>
    </div>
  )
}

export default function TermGrid({ terms, query }) {
  if (terms.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      className="grid gap-6 py-8 pb-24"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}
    >
      {terms.map((term, index) => (
        <TermCard key={term.t} term={term} query={query} index={index} />
      ))}
    </div>
  )
}
