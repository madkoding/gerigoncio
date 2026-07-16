import Header from './components/Header.jsx'
import SearchBar from './components/SearchBar.jsx'
import CategoryFilters from './components/CategoryFilters.jsx'
import ResultsInfo from './components/ResultsInfo.jsx'
import TermGrid from './components/TermGrid.jsx'
import Footer from './components/Footer.jsx'
import NoiseBackground from './components/NoiseBackground.jsx'
import { useDictionary } from './hooks/useDictionary.js'

/**
 * Top-level page. Composes the dictionary sections and owns the global
 * dictionary state via the `useDictionary` hook, so every section is purely
 * presentational and decoupled.
 */
export default function App() {
  const {
    query,
    category,
    filtered,
    totalTerms,
    totalCategories,
    categoryCounts,
    filterLabel,
    CATEGORIES,
    setQuery,
    clearQuery,
    selectCategory,
  } = useDictionary()

  return (
    <>
      <NoiseBackground />

      <div className="container-site">
        <Header totalTerms={totalTerms} totalCategories={totalCategories} />
      </div>

      <div
        className="sticky top-0 z-[100] py-8 bg-[rgba(15,14,12,0.85)] backdrop-blur-xl border-b border-ink-200"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="container-site">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onClearQuery={clearQuery}
          />
          <CategoryFilters
            categories={CATEGORIES}
            categoryCounts={categoryCounts}
            activeCategory={category}
            onSelect={selectCategory}
          />
        </div>
      </div>

      <div className="container-site">
        <ResultsInfo count={filtered.length} label={filterLabel} />
        <TermGrid terms={filtered} query={query} />
      </div>

      <div className="container-site">
        <Footer />
      </div>
    </>
  )
}
