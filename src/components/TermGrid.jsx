import TermCard from './TermCard.jsx'

/**
 * Empty state shown when the current filter combination yields no results.
 * Lives inside the grid (so it spans the full width) and is announced to
 * assistive tech via role="status". The copy itself adapts to whether the
 * user is searching, filtering by category, or both.
 */
function EmptyState({ query, category }) {
  const hasQuery = Boolean(query && query.trim())
  const hasCategory = category && category !== 'Todas'

  let title = 'Ningún término encontrado'
  let body = 'Probá con otra palabra o cambiá la categoría. A veces el corporativés es más raro de lo que creés.'

  if (hasQuery && hasCategory) {
    title = 'Acá no hay nada, lo juramos'
    body = `Ni "${query}" ni la categoría "${category}" se cruzan en este diccionario. Spoiler: probablemente ese término tampoco existe en el mundo real.`
  } else if (hasQuery) {
    title = 'Eso no existe (al menos, acá)'
    body = `"${query}" no aparece en ninguna definición. Puede que sea invento tuyo o que los gerentes todavía no lo adoptaron.`
  } else if (hasCategory) {
    title = 'Categoría vacía'
    body = `La categoría "${category}" está más vacía que la nevera de la oficina un viernes a las 18.`
  }

  return (
    <div className="col-span-full text-center py-24 px-8" role="status">
      <div className="text-6xl mb-4 opacity-50" aria-hidden="true">
        🔍
      </div>
      <h3 className="font-display italic text-[1.8rem] text-gold-light mb-2">
        {title}
      </h3>
      <p className="text-parchment-mute max-w-[480px] mx-auto">
        {body}
      </p>
    </div>
  )
}

export default function TermGrid({ terms, query, category }) {
  if (terms.length === 0) {
    return <EmptyState query={query} category={category} />
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
