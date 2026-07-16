/**
 * Results summary line: how many terms match the current filter + which
 * category is active. Pure presentational, fully controlled.
 */
export default function ResultsInfo({ count, label }) {
  return (
    <div className="flex justify-between items-center py-4 text-parchment-mute text-[0.9rem] border-b border-ink-200">
      <span>
        Mostrando{' '}
        <span className="font-mono text-gold">{count}</span>{' '}
        {count === 1 ? 'término' : 'términos'}
      </span>
      <span>{label}</span>
    </div>
  )
}
