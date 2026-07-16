/**
 * Results summary line: how many terms match the current filter + which
 * category is active. Pure presentational, fully controlled. Includes a
 * small flavour response that scales with the number of matches.
 */
export default function ResultsInfo({ count, label }) {
  const getCountFlavor = (n) => {
    if (n === 0) return 'nada (cero absoluto)'
    if (n === 1) return 'un solo término, casi un unicornio corporativo'
    if (n < 5) return 'pocos, pero bien elegidos'
    if (n < 20) return 'varios. Pick your fighter'
    if (n < 100) return 'un buen puñado'
    return 'la colección completa. Cuidado con la sobreexposición'
  }

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-4 text-parchment-mute text-[0.9rem] border-b border-ink-200">
      <span>
        Mostrando{' '}
        <span className="font-mono text-gold">{count}</span>{' '}
        {count === 1 ? 'término' : 'términos'}{' '}
        <span className="text-parchment-mute/70 italic">— {getCountFlavor(count)}</span>
      </span>
      <span className="font-mono text-[0.8rem] text-parchment-mute/80">
        Filtro: <span className="text-gold/80">{label}</span>
      </span>
    </div>
  )
}
