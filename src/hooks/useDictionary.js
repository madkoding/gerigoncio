import { useCallback, useMemo, useState } from 'react'
import { TERMS, CATEGORIES, filterTerms, countByCategory, labelForCategory } from '../lib/dictionary.js'

/**
 * Centralised state container for the dictionary page.
 *
 * Holds the current search query and active category, and exposes derived data
 * (filtered terms, total counts, per-category counts, current category label)
 * that every section of the page can consume independently.
 */
export function useDictionary() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')

  const filtered = useMemo(
    () => filterTerms(TERMS, { query, category }),
    [query, category],
  )

  const totalTerms = TERMS.length
  const totalCategories = CATEGORIES.length - 1 // exclude "Todas"

  const categoryCounts = useMemo(() => {
    const map = new Map()
    for (const cat of CATEGORIES) {
      map.set(cat, countByCategory(cat))
    }
    return map
  }, [])

  const filterLabel = labelForCategory(category)

  const clearQuery = useCallback(() => setQuery(''), [])
  const selectCategory = useCallback((next) => setCategory(next), [])

  return {
    // raw state
    query,
    category,
    // derived
    filtered,
    totalTerms,
    totalCategories,
    categoryCounts,
    filterLabel,
    CATEGORIES,
    // actions
    setQuery,
    clearQuery,
    selectCategory,
  }
}
