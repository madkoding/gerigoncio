/**
 * Horizontally-scrollable row of category filter pills.
 * Renders the count badge inside each pill (including the "Todas" total).
 */
export default function CategoryFilters({ categories, categoryCounts, activeCategory, onSelect }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
      role="tablist"
      aria-label="Filtro por categoría"
    >
      {categories.map((cat) => {
        const isActive = cat === activeCategory
        const count = categoryCounts.get(cat) ?? 0
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`filter-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelect(cat)}
          >
            {cat}
            <span className="filter-count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
