import { useEffect, useRef, useState } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
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
    <div className="text-center py-24 px-8" role="status">
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

/**
 * Measures the host element with ResizeObserver and reports its width.
 * Used to compute how many virtualized columns fit in the viewport.
 */
function useElementWidth(ref) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const update = () => {
      const next = node.getBoundingClientRect().width
      setWidth(next)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(node)
    return () => ro.disconnect()
  }, [ref])

  return width
}

/**
 * Tracks the current viewport height in state so we never read `window`
 * during render. Returns a sensible default on the server / pre-hydration.
 */
function useViewportHeight() {
  const [height, setHeight] = useState(800)

  useEffect(() => {
    const update = () => setHeight(window.innerHeight)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return height
}

// Card sizing — kept in sync with the original CSS grid breakpoint
// (`minmax(340px, 1fr)`) so visual layout doesn't shift on rollout.
const CARD_MIN_WIDTH = 340
const CARD_HEIGHT = 280
const GAP_X = 24 // matches tailwind `gap-6` (1.5rem)
const GAP_Y = 24

/**
 * Cell renderer for the virtualized grid. react-window reuses the same
 * component instance across rows/columns, so we read position from the
 * `columnIndex` / `rowIndex` props and pluck the matching term.
 */
function Cell({ columnIndex, rowIndex, style, data }) {
  const { items, columns, query } = data
  const index = rowIndex * columns + columnIndex
  const term = items[index]
  if (!term) return null

  // Inset the cell so the gap between cards is preserved (react-window gives
  // us a back-to-back layout, we add the visual breathing room here).
  const cellStyle = {
    ...style,
    left: (style.left ?? 0) + columnIndex * GAP_X,
    top: (style.top ?? 0) + rowIndex * GAP_Y,
    width: (style.width ?? 0) - GAP_X,
    height: (style.height ?? 0) - GAP_Y,
  }

  return (
    <div style={cellStyle}>
      <TermCard term={term} query={query} index={index} />
    </div>
  )
}

export default function TermGrid({ terms, query, category }) {
  const hostRef = useRef(null)
  const width = useElementWidth(hostRef)
  const viewportHeight = useViewportHeight()

  if (terms.length === 0) {
    return <EmptyState query={query} category={category} />
  }

  // How many columns fit in the available width using the same 340px
  // breakpoint as the original CSS grid. Stays in sync visually.
  const columns = width > 0 ? Math.max(1, Math.floor((width + GAP_X) / (CARD_MIN_WIDTH + GAP_X))) : 1
  const rows = Math.ceil(terms.length / columns)
  // Each column gets a share of the available width; we add one GAP_X to
  // the total so the last column doesn't get squeezed by the missing gap.
  const columnWidth = width > 0 ? (width + GAP_X) / columns : CARD_MIN_WIDTH
  // Bound the viewport between 480px (small scrollable area) and 1100px
  // (don't dominate the page on huge displays). Subtracts room for the
  // sticky header and footer chrome so the grid feels contained.
  const height = Math.max(480, Math.min(1100, viewportHeight - 320))

  return (
    <div ref={hostRef} className="py-8 pb-24">
      {width > 0 && (
        <Grid
          columnCount={columns}
          rowCount={rows}
          columnWidth={columnWidth}
          rowHeight={CARD_HEIGHT}
          width={width}
          height={height}
          itemData={{ items: terms, columns, query }}
          overscanRowCount={2}
        >
          {Cell}
        </Grid>
      )}
    </div>
  )
}
