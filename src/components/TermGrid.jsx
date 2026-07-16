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

// Card sizing — 300px minimum width keeps the grid at 2 columns even on
// 640-800px viewports while still feeling comfortable on desktop.
const CARD_MIN_WIDTH = 300
const CARD_HEIGHT = 300
const GAP_X = 24 // matches tailwind `gap-6` (1.5rem)
const GAP_Y = 24

/**
 * Compute the column count that fits in `width` so each card lands at
 * CARD_MIN_WIDTH (or slightly wider on big screens) and the trailing
 * GAP_X is NOT counted as an extra column.
 *
 * Example with CARD_MIN_WIDTH=340, GAP_X=24, width=1200:
 *   1200 / (340 + 24) = 3.29 → floor = 3 columns
 *   column width = 1200 / 3 = 400px  (the last GAP_X is implicit, no
 *   extra 24px to subtract, so columns fit perfectly).
 */
function computeColumns(width) {
  if (width <= 0) return 1
  return Math.max(1, Math.floor(width / (CARD_MIN_WIDTH + GAP_X)))
}

/**
 * Cell renderer for the virtualized grid. react-window reuses the same
 * component instance across rows/columns, so we read position from the
 * `columnIndex` / `rowIndex` props and pluck the matching term.
 *
 * The outer cell is the full `rowHeight x columnWidth` rectangle (e.g.
 * 324 x 405 on desktop). The card itself is `CARD_HEIGHT` tall and sits
 * at the top of the cell, leaving `GAP_Y` px of empty space below for
 * the vertical gap between rows. Horizontally, the cell is `columnWidth`
 * wide and the card is `columnWidth - GAP_X` wide (right padding eats
 * the gap). This gives a clean, consistent grid with no half-pixel
 * drift and no margin-collapse surprises.
 */
function Cell({ columnIndex, rowIndex, style, data }) {
  const { items, columns, query } = data
  const index = rowIndex * columns + columnIndex
  const term = items[index]
  if (!term) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: style.left,
        top: style.top,
        width: style.width,
        height: style.height,
        boxSizing: 'border-box',
      }}
    >
      <TermCard
        term={term}
        query={query}
        index={index}
        style={{
          // Card lives in the top-left corner; width trims GAP_X on the
          // right (so consecutive cards have a consistent gap), height
          // stays at CARD_HEIGHT (the remaining GAP_Y px in the cell is
          // the row gap).
          width: style.width - GAP_X,
          height: CARD_HEIGHT,
        }}
      />
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

  const columns = computeColumns(width)
  const rows = Math.ceil(terms.length / columns)
  // Each column is `width / columns` wide. react-window handles fractional
  // widths OK, but we floor to whole pixels to keep card widths identical
  // (otherwise the last cell could end up half-a-pixel wider due to FP).
  const columnWidth = width / columns
  // Bound the viewport between 480px and 1100px so the scroll surface
  // feels substantial but never dominates the page.
  const height = Math.max(480, Math.min(1100, viewportHeight - 320))

  return (
    <div ref={hostRef} className="py-8 pb-24">
      {width > 0 && (
        <Grid
          columnCount={columns}
          rowCount={rows}
          columnWidth={columnWidth}
          rowHeight={CARD_HEIGHT + GAP_Y}
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
