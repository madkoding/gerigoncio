// Neutralises the dataset: removes voseo (Argentine "vos" forms), regional
// slang, and any other regionalism that would feel foreign to a generic
// Spanish reader. English jargon is kept on purpose (the dictionary IS the
// jargon). We never touch the term name (`t`) because that IS the entry.
//
// Each replacement is whole-word, case-insensitive, and preserves the
// original casing of the matched token (uppercase / titlecase / lowercase).
import { readFileSync, writeFileSync } from 'node:fs'

// Single-word replacements. These are case-insensitive whole-word matches.
const WORDS = [
  // ---- Argentine voseo present-tense ----
  ['tenés', 'tienes'],
  ['tenes', 'tienes'],
  ['sabés', 'sabes'],
  ['querés', 'quieres'],
  ['queres', 'quieres'],
  ['podés', 'puedes'],
  ['podes', 'puedes'],
  ['decís', 'dices'],
  ['decis', 'dices'],
  ['entendés', 'entiendes'],
  ['entendes', 'entiendes'],
  ['sentís', 'sientes'],
  ['sentis', 'sientes'],
  ['creés', 'crees'],
  ['crees', 'crees'],
  ['andás', 'andas'],
  ['andas', 'andas'],
  ['sos', 'eres'],
  ['mirás', 'miras'],
  ['miras', 'miras'],
  ['llegás', 'llegas'],
  ['avisás', 'avisas'],
  ['empezás', 'empiezas'],
  ['armás', 'armas'],
  ['pasás', 'pasas'],
  ['mandás', 'mandas'],
  ['dejás', 'dejas'],
  ['pedís', 'pides'],
  ['volvés', 'vuelves'],
  ['traés', 'traes'],
  ['llevás', 'llevas'],
  ['ponés', 'pones'],
  ['sacás', 'sacas'],
  ['limpiás', 'limpias'],
  ['contás', 'cuentas'],
  ['hablás', 'hablas'],
  ['usás', 'usas'],
  ['tomás', 'tomas'],
  ['anotás', 'anotas'],
  ['llamás', 'llamas'],
  ['revisás', 'revisas'],
  ['tirás', 'tiras'],
  ['quedás', 'quedas'],
  ['dás', 'das'],
  ['dás', 'das'],
  ['vas', 'vas'],
  ['venís', 'vienes'],
  ['venis', 'vienes'],
  ['salís', 'sales'],
  ['salis', 'sales'],
  ['entrás', 'entras'],
  ['entras', 'entras'],
  ['ves', 'ves'],
  ['oís', 'oyes'],
  ['ois', 'oyes'],
  ['agendás', 'agendas'],
  ['agendas', 'agendas'],
  ['avisás', 'avisas'],
  ['empezás', 'empiezas'],
  ['empiezas', 'empiezas'],
  ['entendés', 'entiendes'],
  ['llegás', 'llegas'],
  ['mandás', 'mandas'],
  ['mirá', 'mira'],
  ['volvé', 'vuelve'],
  ['pensá', 'piensa'],
  ['decí', 'di'],
  ['dale', 'vale'],
  ['mirá', 'mira'],
  ['meté', 'mete'],
  ['recomendás', 'recomiendas'],
  ['tenés', 'tienes'],
  ['ponés', 'pones'],
  ['sacás', 'sacas'],
  ['tirás', 'tiras'],
  ['llegás', 'llegas'],
  ['mirás', 'miras'],
  ['pará', 'para'],
  ['buscá', 'busca'],
  ['fijate', 'fíjate'],
  ['fijáte', 'fíjate'],
  ['probá', 'prueba'],
  ['sentate', 'siéntate'],
  ['acordate', 'acuérdate'],
  ['olvidate', 'olvídate'],
  ['preocupate', 'preocúpate'],
  ['quedate', 'quédate'],
  ['mandá', 'manda'],
  ['mandame', 'mándame'],
  ['mandale', 'mándale'],
  ['mandales', 'mándales'],
  ['avisá', 'avisa'],
  ['avisame', 'avísame'],
  ['avisale', 'avísale'],
  ['avisales', 'avísales'],
  ['pasá', 'pasa'],
  ['pasame', 'pásame'],
  ['tirá', 'tira'],
  ['tomá', 'toma'],
  ['anotá', 'anota'],
  ['andá', 'anda'],
  ['empezá', 'empieza'],
  ['llamá', 'llama'],
  ['dejá', 'deja'],
  ['contá', 'cuenta'],
  ['hablá', 'habla'],
  ['pedí', 'pide'],
  ['sacá', 'saca'],
  ['usá', 'usa'],
  ['armá', 'arma'],
  ['revisá', 'revisa'],
  ['mirá', 'mira'],
  ['decí', 'di'],
  ['decime', 'dime'],
  ['decile', 'dile'],
  ['deciles', 'diles'],
  ['hacé', 'haz'],
  ['hacélo', 'hazlo'],
  ['hacelo', 'hazlo'],
  ['hacéle', 'hazle'],
  ['tené', 'ten'],
  ['tenelo', 'tenlo'],
  ['tenéle', 'tenle'],
  ['poné', 'pon'],
  ['ponelo', 'ponlo'],
  ['ponéle', 'ponle'],
  ['traé', 'trae'],
  ['traeme', 'tráeme'],
  ['traelo', 'tráelo'],
  ['llevá', 'lleva'],
  ['sacame', 'sácame'],
  ['llegá', 'llega'],
  ['limpiá', 'limpia'],
  ['inventá', 'inventa'],
  ['demostramelo', 'demuéstramelo'],
  ['agregame', 'agrégame'],
  ['tirá', 'tira'],
  ['mandame', 'mándame'],
  ['tirá', 'tira'],
  ['platicá', 'platica'],
  // ---- Argentine "vos" pronoun -> "tú" ----
  ['vos', 'tú'],
  // ---- Prepositions with vos ----
  ['a vos', 'a ti'],
  ['de vos', 'de ti'],
  ['por vos', 'por ti'],
  ['con vos', 'contigo'],
  ['para vos', 'para ti'],
  ['sobre vos', 'sobre ti'],
  ['sin vos', 'sin ti'],
  // ---- Regional slang (Argentina) ----
  ['guita', 'dinero'],
  ['fierro', 'hierro'],
  ['boludo', 'tonto'],
  ['boluda', 'tonta'],
  ['boludos', 'tontos'],
  ['boludas', 'tontas'],
  ['boludez', 'tontería'],
  ['boludeces', 'tonterías'],
  ['chabón', 'tipo'],
  ['chabona', 'tipa'],
  ['chabones', 'tipos'],
  ['chabonas', 'tipas'],
  ['chamuyo', 'labia'],
  ['chamuyero', 'convincente'],
  ['pibe', 'chico'],
  ['piba', 'chica'],
  ['pibes', 'chicos'],
  ['pibas', 'chicas'],
  ['garca', 'tramposo'],
  ['garcas', 'tramposos'],
  ['trucho', 'falso'],
  ['trucha', 'falsa'],
  ['truchos', 'falsos'],
  ['truchas', 'falsas'],
  ['posta', 'de verdad'],
  ['joya', 'perfecto'],
  ['re piola', 'muy astuto'],
  ['piola', 'astuto'],
  ['copado', 'agradable'],
  ['copada', 'agradable'],
  ['copados', 'agradables'],
  ['copadas', 'agradables'],
  ['bárbaro', 'estupendo'],
  ['bárbara', 'estupenda'],
  ['plata', 'dinero'],
  ['aguante', 'resistencia'],
  ['aguantar', 'resistir'],
  ['aguantás', 'resistes'],
  ['aguantamos', 'resistimos'],
  ['aguantó', 'resistió'],
  ['morfar', 'comer'],
  ['morfás', 'comes'],
  ['morfaste', 'comiste'],
  ['morfar', 'comer'],
  ['morfás', 'comes'],
  // ---- Mexican slang ----
  ['güey', 'amigo'],
  ['chido', 'genial'],
  ['chida', 'genial'],
  ['chidos', 'geniales'],
  ['chidas', 'geniales'],
  ['padre', 'genial'],
  ['padrísimo', 'excelente'],
  ['neta', 'la verdad'],
  // ---- Spain slang ----
  ['curro', 'trabajo'],
  ['coche', 'automóvil'],
  ['ordenador', 'computadora'],
  ['móvil', 'teléfono'],
  ['chaval', 'chico'],
  ['chavales', 'chicos'],
  ['mola', 'gusta'],
  ['flipar', 'sorprenderse'],
  ['flipas', 'te sorprendes'],
]

// Multi-word phrase replacements. These are matched before single words, in
// case a single word inside the phrase would otherwise be replaced first.
const PHRASES = [
  ['si podés', 'si puedes'],
  ['no podés', 'no puedes'],
  ['lo podés', 'lo puedes'],
  ['la podés', 'la puedes'],
  ['te podés', 'te puedes'],
  ['me podés', 'me puedes'],
  ['se podés', 'se puede'],
  ['vos no existís', 'tú no existes'],
  ['vos no existis', 'tú no existes'],
  ['preocúpate por vos', 'preocúpate por ti'],
  ['me preocupo por vos', 'me preocupo por ti'],
  ['traducción: ‘me da fiaca', 'traducción: «me da pereza'],
  ['traducción: “me da fiaca', 'traducción: «me da pereza'],
  ['me da fiaca', 'me da pereza'],
  ['te loopeo', 'te incluyo'],
  ['loopeo', 'incluyo'],
  ['te loopeo en', 'te incluyo en'],
  ['vos estás', 'tú estás'],
  ['vos sos', 'tú eres'],
  ['vos tenés', 'tú tienes'],
  ['vos querés', 'tú quieres'],
  ['vos podés', 'tú puedes'],
  ['vos sabés', 'tú sabes'],
  ['vos decís', 'tú dices'],
  ['vos hacés', 'tú haces'],
  ['vos entendés', 'tú entiendes'],
  ['vos creés', 'tú crees'],
  ['vos andás', 'tú andas'],
  ['vos sentís', 'tú sientes'],
  ['vos mirás', 'tú miras'],
  ['vos llegás', 'tú llegas'],
  ['vos avisás', 'tú avisas'],
  ['vos empezás', 'tú empiezas'],
  ['vos armás', 'tú armas'],
  ['vos hacés', 'tú haces'],
  ['vos pasás', 'tú pasas'],
  ['vos mandás', 'tú mandas'],
  ['vos dejas', 'tú dejas'],
  ['vos pedís', 'tú pides'],
  ['vos volvés', 'tú vuelves'],
  ['vos traés', 'tú traes'],
  ['vos llevás', 'tú llevas'],
  ['vos decís', 'tú dices'],
  ['vos ponés', 'tú pones'],
  ['vos sacás', 'tú sacas'],
  ['vos limpiás', 'tú limpias'],
  ['vos contás', 'tú cuentas'],
  ['vos hablás', 'tú hablas'],
  ['vos usás', 'tú usas'],
  ['vos tomás', 'tú tomas'],
  ['vos anotás', 'tú anotas'],
  ['vos llamás', 'tú llamas'],
  ['vos revisás', 'tú revisas'],
  ['vos tirá', 'tú tiras'],
  ['vos quedás', 'tú quedas'],
  ['vos te quedás', 'tú te quedas'],
  ['vos te sentás', 'tú te sientas'],
  ['vos te acordás', 'tú te acuerdas'],
  ['vos te olvidás', 'tú te olvidas'],
  ['vos te preocupás', 'tú te preocupas'],
  ['vos te das', 'tú te das'],
  ['vos das cuenta', 'tú das cuenta'],
  ['vos das', 'tú das'],
  ['vos vas', 'tú vas'],
  ['vos venís', 'tú vienes'],
  ['vos venis', 'tú vienes'],
  ['vos salís', 'tú sales'],
  ['vos salis', 'tú sales'],
  ['vos entrás', 'tú entras'],
  ['vos ves', 'tú ves'],
  ['vos oís', 'tú oyes'],
  ['vos ois', 'tú oyes'],
  ['vos mirás', 'tú miras'],
  // "vos" as direct object (already in WORDS too, but explicit phrases are clearer)
  ['a vos', 'a ti'],
  ['de vos', 'de ti'],
  ['por vos', 'por ti'],
  ['con vos', 'contigo'],
  // "vos" at the end of a sentence: handled by whole-word replacement,
  // capitalization fix is applied afterwards.
  // Other common constructions
  ['en qué andás', 'en qué andas'],
  ['qué andás', 'qué andas'],
  ['cómo andás', 'cómo andas'],
  ['cómo estás vos', 'cómo estás tú'],
  ['vos no', 'tú no'],
  ['vos sí', 'tú sí'],
  // Dije/dijiste voseo
  ['me dijiste', 'me dijiste'],
  // "te enterás" -> "te enteras"
  ['te enterás', 'te enteras'],
  ['te enteras', 'te enteras'],
  ['te das cuenta', 'te das cuenta'],
  // "vos" alone replacement
  ['sin vos', 'sin ti'],
]

// Phrases that include "vos" as the subject. We need a "vos + verb ending in
// -ás/-és/-ís" matcher that handles inflection.
// We do this with a regex-based pass to cover the many verb forms.
const VOSEO_VERB_REGEX = /\bvos (\w+[áéí])(?:[a-záéíóú]*)\b/gi
const VOSEO_SUBJECT_MAP = new Map()
function buildVoseoMap() {
  const verbMap = {
    'agendás': 'agendas', 'avisás': 'avisas',
    'armás': 'armas', 'asignás': 'asignas', 'buscás': 'buscas',
    'cerrás': 'cierras', 'contás': 'cuentas', 'dás': 'das',
    'dejás': 'dejas', 'decís': 'dices', 'empezás': 'empiezas',
    'empezás': 'empiezas', 'empezás': 'empiezas',
    'empiezas': 'empiezas',
    'entendés': 'entiendes', 'entrás': 'entras',
    'enviás': 'envías', 'estás': 'estás',
    'hablás': 'hablas', 'hacés': 'haces',
    'hacés': 'haces', 'inventás': 'inventas', 'lanzás': 'lanzas',
    'levantás': 'levantas', 'llegás': 'llegas', 'llevás': 'llevas',
    'llamás': 'llamas', 'mandás': 'mandas', 'marcás': 'marcas',
    'mirás': 'miras', 'molás': 'moles',
    'notás': 'notas', 'oís': 'oyes',
    'olvidás': 'olvidas', 'pagás': 'pagas',
    'parás': 'paras', 'pasás': 'pasas', 'pedís': 'pides',
    'pensás': 'piensas', 'perdés': 'pierdes',
    'ponés': 'pones', 'preguntás': 'preguntas',
    'preparás': 'preparas', 'probás': 'pruebas',
    'quedás': 'quedas', 'revisás': 'revisas',
    'sacás': 'sacas', 'salís': 'sales', 'sentís': 'sientes',
    'sirvés': 'sirves', 'subís': 'subes',
    'tenés': 'tienes', 'tirás': 'tiras', 'tomás': 'tomas',
    'trabajás': 'trabajas', 'traés': 'traes',
    'usás': 'usas', 'vas': 'vas', 'venís': 'vienes',
    'ves': 'ves', 'volvés': 'vuelves', 'armás': 'armas',
    'comés': 'comes', 'creés': 'crees', 'decís': 'dices',
    'empezás': 'empiezas', 'empezás': 'empiezas',
    'entendés': 'entiendes', 'leés': 'lees', 'metés': 'metes',
    'movés': 'mueves', 'oís': 'oyes', 'perdés': 'pierdes',
    'ponés': 'pones', 'recibís': 'recibes', 'sabés': 'sabes',
    'sentís': 'sientes', 'sentís': 'sientes',
    'tenés': 'tienes', 'vendés': 'vendes',
    'renunciás': 'renuncias',
    'ajustás': 'ajustas',
    'recordás': 'recordas',
    'mudás': 'mudas',
    'mudás': 'mudas',
    'mudás': 'mudas',
    'mudás': 'mudas',
    'avisás': 'avisas', 'avisame': 'avísame', 'avisá': 'avisa',
    'avisale': 'avísale', 'avisales': 'avísales',
    'agendá': 'agenda', 'agendame': 'agéndame',
    'buscá': 'busca', 'cambiá': 'cambia', 'cerrá': 'cierra',
    'charlá': 'charla', 'chequeá': 'chequea', 'colgá': 'cuelga',
    'completá': 'completa', 'contestá': 'contesta', 'copiá': 'copia',
    'dejame': 'déjame', 'descargá': 'descarga', 'encontrá': 'encuentra',
    'enviá': 'envía', 'esperá': 'espera', 'fijate': 'fíjate',
    'guardá': 'guarda', 'imaginá': 'imagina',
    'imprimí': 'imprime', 'ingresá': 'ingresa', 'juntá': 'junta',
    'lavá': 'lava', 'leé': 'lee', 'limpiá': 'limpia',
    'mandá': 'manda', 'mirá': 'mira', 'mojá': 'moja',
    'mové': 'mueve', 'olvidá': 'olvida', 'organizá': 'organiza',
    'pagar': 'pagar', 'pará': 'para', 'pintá': 'pinta',
    'platicá': 'platica', 'preguntá': 'pregunta',
    'preocupate': 'preocúpate', 'prepará': 'prepara',
    'probá': 'prueba', 'publicá': 'publica', 'quedá': 'queda',
    'quedate': 'quédate', 'quitá': 'quita', 'recordá': 'recuerda',
    'revisá': 'revisa', 'sacá': 'saca', 'salí': 'sal',
    'sentá': 'sienta', 'sentate': 'siéntate', 'tirá': 'tira',
    'tocá': 'toca', 'tomá': 'toma', 'trabajá': 'trabaja',
    'usá': 'usa', 'volvé': 'vuelve', 'aceptá': 'acepta',
    'agregame': 'agrégame', 'armá': 'arma', 'avisame': 'avísame',
    'chequeá': 'chequea', 'cortá': 'corta', 'demostramelo': 'demuéstramelo',
    'escribí': 'escribe', 'estirá': 'estira', 'firmá': 'firma',
    'hablá': 'habla', 'inventá': 'inventa', 'llegá': 'llega',
    'mandame': 'mándame', 'marchá': 'marcha', 'matate': 'mátate',
    'meté': 'mete', 'mojá': 'moja', 'olvidate': 'olvídate',
    'pagá': 'paga', 'pasame': 'pásame', 'pasá': 'pasa',
    'platicá': 'platica', 'poné': 'pon', 'recomendá': 'recomienda',
    'reí': 'ríe', 'sacame': 'sácame', 'sentate': 'siéntate',
    'sirvá': 'sirva', 'subí': 'sube', 'tirá': 'tira', 'traé': 'trae',
    'vendé': 'vende', 'acomodá': 'acomoda', 'andá': 'anda',
    'apretá': 'aprieta', 'armá': 'arma', 'arreglá': 'arregla',
    'avisá': 'avisa', 'bajá': 'baja', 'bañá': 'baña',
    'bebé': 'bebe', 'buscá': 'busca', 'cambiá': 'cambia',
    'caminá': 'camina', 'cantá': 'canta', 'cerrá': 'cierra',
    'charlá': 'charla', 'comenzá': 'comienza', 'compartí': 'comparte',
    'conectá': 'conecta', 'contá': 'cuenta', 'contestá': 'contesta',
    'copiá': 'copia', 'cortá': 'corta', 'creá': 'crea',
    'crecé': 'crece', 'dale': 'vale', 'decí': 'di',
    'decidí': 'decide', 'decile': 'dile', 'deciles': 'diles',
    'decime': 'dime', 'dejá': 'deja', 'descansá': 'descansa',
    'descargá': 'descarga', 'desconectá': 'desconecta',
    'devolvé': 'devuelve', 'dibujá': 'dibuja', 'dormí': 'duerme',
    'empezá': 'empieza', 'empujá': 'empuja', 'encontrá': 'encuentra',
    'entregá': 'entrega', 'entrá': 'entra', 'enviá': 'envía',
    'escuchá': 'escucha', 'escribí': 'escribe', 'esperá': 'espera',
    'estirá': 'estira', 'estudiá': 'estudia', 'explicá': 'explica',
    'fijate': 'fíjate', 'firmá': 'firma', 'ganá': 'gana',
    'grabá': 'graba', 'guardá': 'guarda', 'hablá': 'habla',
    'hacé': 'haz', 'imaginá': 'imagina', 'imprimí': 'imprime',
    'imprimí': 'imprime', 'ingresá': 'ingresa', 'inscribite': 'inscríbete',
    'inventá': 'inventa', 'juntá': 'junta', 'lavá': 'lava',
    'leé': 'lee', 'levantá': 'levanta', 'liberá': 'libera',
    'limpiá': 'limpia', 'llegá': 'llega', 'llamá': 'llama',
    'llená': 'llena', 'llevá': 'lleva', 'lográ': 'logra',
    'mandá': 'manda', 'marchá': 'marcha', 'matá': 'mata',
    'meté': 'mete', 'mirame': 'mírame', 'mirá': 'mira',
    'mojá': 'moja', 'molestá': 'molesta', 'mostrá': 'muestra',
    'mové': 'mueve', 'narrá': 'narra', 'notá': 'nota',
    'obtené': 'obtén', 'olvidá': 'olvida', 'olvidate': 'olvídate',
    'oprimí': 'oprime', 'ordená': 'ordena', 'organizá': 'organiza',
    'pagá': 'paga', 'pará': 'para', 'participá': 'participa',
    'pasá': 'pasa', 'pasame': 'pásame', 'pedí': 'pide',
    'pensá': 'piensa', 'perdés': 'pierde', 'perdoná': 'perdona',
    'platicá': 'platica', 'poblá': 'pobla', 'poné': 'pon',
    'preguntá': 'pregunta', 'preocupate': 'preocúpate',
    'prepará': 'prepara', 'presentá': 'presenta',
    'presioná': 'presiona', 'probá': 'prueba', 'publicá': 'publica',
    'quedá': 'queda', 'quedate': 'quédate', 'quemás': 'quemas',
    'quitá': 'quita', 'recomendá': 'recomienda', 'recordá': 'recuerda',
    'reí': 'ríe', 'revisá': 'revisa', 'rompé': 'rompe',
    'sacá': 'saca', 'sacame': 'sácame', 'salí': 'sal',
    'saltá': 'salta', 'salvá': 'salva', 'seguí': 'sigue',
    'sentá': 'sienta', 'sentate': 'siéntate', 'separá': 'separa',
    'sirvá': 'sirva', 'subí': 'sube', 'subite': 'súbete',
    'tirame': 'tírame', 'tirá': 'tira', 'tocá': 'toca',
    'tomá': 'toma', 'trabajá': 'trabaja', 'traé': 'trae',
    'usá': 'usa', 'vendé': 'vende', 'verificá': 'verifica',
    'volvé': 'vuelve', 'votá': 'vota',
  }
  for (const [from, to] of Object.entries(verbMap)) {
    VOSEO_SUBJECT_MAP.set(from.toLowerCase(), to.toLowerCase())
  }
}
buildVoseoMap()

function findWordIndex(haystack, needle, fromIndex) {
  const lc = haystack.toLowerCase()
  const ln = needle.toLowerCase()
  let i = fromIndex || 0
  while (i <= lc.length - ln.length) {
    const idx = lc.indexOf(ln, i)
    if (idx === -1) return -1
    const before = idx === 0 ? '' : haystack[idx - 1]
    const after = idx + ln.length >= haystack.length ? '' : haystack[idx + ln.length]
    const isWordBefore = /[a-záéíóúñü]/i.test(before)
    const isWordAfter = /[a-záéíóúñü]/i.test(after)
    if (!isWordBefore && !isWordAfter) return idx
    i = idx + 1
  }
  return -1
}

function applyCasing(original, replacement) {
  if (!original || !replacement) return replacement
  // ALL UPPER
  if (original.length > 1 && original === original.toUpperCase() && original !== original.toLowerCase()) {
    return replacement.toUpperCase()
  }
  // Title case
  if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1)
  }
  // Lowercase (default)
  return replacement
}

function replaceWord(text, from, to) {
  let out = text
  let idx = 0
  while (true) {
    const found = findWordIndex(out, from, idx)
    if (found === -1) break
    const original = out.slice(found, found + from.length)
    const replacement = applyCasing(original, to)
    out = out.slice(0, found) + replacement + out.slice(found + from.length)
    idx = found + replacement.length
  }
  return out
}

function replacePhrase(text, from, to) {
  // Phrase replacement is case-insensitive but preserves first-letter case.
  let out = text
  let lc = out.toLowerCase()
  let idx = 0
  while (true) {
    const lf = from.toLowerCase()
    const found = lc.indexOf(lf, idx)
    if (found === -1) break
    const original = out.slice(found, found + from.length)
    const replacement = applyCasing(original, to)
    out = out.slice(0, found) + replacement + out.slice(found + from.length)
    lc = out.toLowerCase()
    idx = found + replacement.length
  }
  return out
}

function neutralizeVoseoSubject(text) {
  // Replace "vos <verb-in-voseo>" -> "tú <neutral-verb>"
  return text.replace(/\bvos ([a-záéíóúñü]+)\b/gi, (m, verb) => {
    const key = verb.toLowerCase()
    const neutral = VOSEO_SUBJECT_MAP.get(key)
    if (neutral) {
      // Preserve original casing of the verb
      return applyCasing('vos ' + verb, 'tú ' + neutral)
    }
    return m
  })
}

function neutralizeVoseoVerbs(text) {
  // Replace standalone voseo verb forms (anywhere in the text) with their
  // neutral counterparts. We do this as a separate pass because the verbs
  // often appear without an explicit "vos" subject.
  let out = text
  const sorted = [...VOSEO_SUBJECT_MAP.entries()].sort((a, b) => b[0].length - a[0].length)
  for (const [from, to] of sorted) {
    out = replaceWord(out, from, to)
  }
  return out
}

function neutralize(text) {
  if (typeof text !== 'string') return text
  let out = text
  // 1) Phrases first (case-insensitive).
  for (const [from, to] of PHRASES) {
    out = replacePhrase(out, from, to)
  }
  // 2) "vos <verb>" subject.
  out = neutralizeVoseoSubject(out)
  // 3) Standalone voseo verbs.
  out = neutralizeVoseoVerbs(out)
  // 4) Single-word replacements.
  const sorted = [...WORDS].sort((a, b) => b[0].length - a[0].length)
  for (const [from, to] of sorted) {
    out = replaceWord(out, from, to)
  }
  return out
}

const src = readFileSync('src/data/terms.js', 'utf8')
const arr = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf('];') + 1))

let changed = 0
const changes = []
for (const item of arr) {
  for (const key of ['d', 'e']) {
    if (typeof item[key] === 'string') {
      const before = item[key]
      const after = neutralize(before)
      if (before !== after) {
        item[key] = after
        changed++
        if (changes.length < 200) {
          changes.push(`[${key}]\n  - ${before}\n  + ${after}`)
        }
      }
    }
  }
}

const out = `// Gerigoncio de Gerentes — dictionary dataset
// ${arr.length} curated terms (neutralised to español neutro)
export const TERMS = ${JSON.stringify(arr, null, 2)};
`
writeFileSync('src/data/terms.js', out)
console.log('terms:', arr.length, 'changed fields:', changed)
console.log('--- sample changes ---')
changes.slice(0, 60).forEach((c) => console.log(c))
