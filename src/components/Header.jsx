export default function Header({ totalTerms, totalCategories }) {
  return (
    <header className="pt-16 pb-8 text-center border-b border-ink-200">
      <span className="eyebrow">Edición no autorizada · 2026</span>
      <h1 className="font-display font-black italic leading-[0.95] tracking-[-0.02em] mb-6 title-gradient text-[clamp(3rem,8vw,6rem)]">
        Gerigoncio
        <br />
        de Gerentes
      </h1>
      <p className="text-[1.1rem] text-parchment-dim max-w-[600px] mx-auto mb-8 leading-relaxed">
        El diccionario de <em className="text-gold-light not-italic font-semibold">traducción corporativa</em>{' '}
        para quienes alguna vez escucharon
        &ldquo;hagamos un quick sync para alinear el trade-off del delivery&rdquo; y
        fingieron entender. Spoiler: nadie entendió.
      </p>

      <div className="flex justify-center flex-wrap gap-12 mt-10">
        <div className="text-center">
          <span className="font-display font-bold text-[2.5rem] text-gold block leading-none">
            {totalTerms}
          </span>
          <div className="text-xs text-parchment-mute uppercase tracking-[0.15em] mt-2">
            Términos
          </div>
        </div>
        <div className="text-center">
          <span className="font-display font-bold text-[2.5rem] text-gold block leading-none">
            {totalCategories}
          </span>
          <div className="text-xs text-parchment-mute uppercase tracking-[0.15em] mt-2">
            Categorías
          </div>
        </div>
        <div className="text-center">
          <span className="font-display font-bold text-[2.5rem] text-gold block leading-none">
            ∞
          </span>
          <div className="text-xs text-parchment-mute uppercase tracking-[0.15em] mt-2">
            Reuniones evitables
          </div>
        </div>
        <div className="text-center">
          <span className="font-display font-bold text-[2.5rem] text-gold block leading-none">
            0
          </span>
          <div className="text-xs text-parchment-mute uppercase tracking-[0.15em] mt-2">
            Decisiones tomadas
          </div>
        </div>
      </div>
    </header>
  )
}
