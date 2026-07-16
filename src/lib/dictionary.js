import { TERMS } from '../data/terms.js'

// Re-export the raw dataset so consumers can import everything from one place.
export { TERMS }

/**
 * Returns the unique, ordered list of categories present in the dataset.
 * "Todas" (All) is prepended so the filter UI can render it as the default option.
 */
export const CATEGORIES = ['Todas', ...Array.from(new Set(TERMS.map((t) => t.c)))]

/**
 * Counts how many terms belong to a given category.
 * For "Todas" returns the total number of terms.
 */
export function countByCategory(category) {
  if (category === 'Todas') return TERMS.length
  return TERMS.filter((t) => t.c === category).length
}

/**
 * Filters a list of terms by category and free-text query.
 * Matches against the term (`t`), definition (`d`) and example (`e`).
 * Comparison is case-insensitive.
 */
export function filterTerms(terms, { query, category }) {
  const q = (query ?? '').toLowerCase().trim()
  return terms.filter((t) => {
    const matchCategory = category === 'Todas' || t.c === category
    if (!matchCategory) return false
    if (!q) return true
    return (
      t.t.toLowerCase().includes(q) ||
      t.d.toLowerCase().includes(q) ||
      (t.e && t.e.toLowerCase().includes(q))
    )
  })
}

/**
 * Returns the human-readable label for the active category.
 */
export function labelForCategory(category) {
  return category === 'Todas' ? 'Todas las categorías' : category
}
