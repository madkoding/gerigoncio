import { useRef } from 'react'

/**
 * Sticky control bar containing the search input and (rendered by the parent)
 * the category filters. The search field is fully controlled.
 */
export default function SearchBar({ query, onQueryChange, onClearQuery }) {
  const inputRef = useRef(null)

  const handleClear = () => {
    onClearQuery()
    inputRef.current?.focus()
  }

  return (
    <div className="relative max-w-[700px] mx-auto mb-6">
      <svg
        className="absolute left-6 top-1/2 -translate-y-1/2 text-gold w-5 h-5 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Buscar término, definición o ejemplo..."
        autoComplete="off"
        spellCheck="false"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        aria-label="Buscar en el diccionario"
      />

      <button
        type="button"
        className={`absolute right-4 top-1/2 -translate-y-1/2 bg-ink-100 border-none text-parchment-dim w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-gold-dark hover:text-ink ${
          query ? 'flex' : 'hidden'
        }`}
        onClick={handleClear}
        aria-label="Limpiar búsqueda"
      >
        ✕
      </button>
    </div>
  )
}
