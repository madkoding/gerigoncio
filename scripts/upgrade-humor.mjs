// Upgrades a curated set of terms with sharper, funnier definitions + examples,
// and appends a brand-new "Horrores" category of 100% comedic jargon.
//
// We match terms by their `t` field; the dataset is small enough (611) that
// a straight JSON.parse / stringify roundtrip is fine.
import { readFileSync, writeFileSync } from 'node:fs'

// ---- 1) Curated replacements (term -> { d, e, optionally o, c }) ----
// Each rewrite is a sharper, more sarcastic version of the same jargon.
// Keeping the original categories and origins to stay faithful.
const REWRITES = {
  // === Reuniones ===
  'Meeting':           { d: "Reunión con pretensiones internacionales. Se usa para que suene a que no estás perdiendo el día en una sala con mal café.", e: "Agendemos un meeting para hablar de la reunión de la semana pasada sobre la reunión de hoy." },
  'Call':              { d: "Videollamada donde la mitad se queda con la cámara apagada y la otra mitad está muteada por accidente. 90% podrían ser un email.", e: "Te hago una call rápida —spoiler: no será rápida— a las 4." },
  'Quick sync':        { d: "Mentira corporativa en formato reunión. Promete 5 minutos, entrega 45 y termina con 12 action items que nadie va a leer.", e: "Hagamos un quick sync, ¿a las 11? Bueno, en realidad son 11:45 y todavía no arrancó." },
  'Stand-up':          { d: "Reunión de pie (en teoría) donde todos repiten lo que hicieron ayer. En la práctica: sentados, mirando el celular, esperando.", e: "El stand-up de las 9 es sagrado. Como el sufrimiento." },
  'Brainstorming':     { d: "Lluvia de ideas donde el jefe ya decidió ayer y vos estás ahí haciendo decoración con post-its.", e: "Mañana hay brainstorming. Traé ideas. (Mentira, traé que sí a todo.)" },
  'One-on-one':        { d: "Reunión semanal con tu jefe. 50% coaching, 50% amenaza velada disfrazada de feedback.", e: "Mi 1:1 con mi manager es los jueves. Siempre 'pido feedback' y siempre termino actualizando el LinkedIn." },
  'All-hands':         { d: "Reunión masiva donde el CEO habla 40 minutos y nadie se atreve a hacer la pregunta obvia.", e: "El all-hands del viernes se movió al lunes. Otra vez. Nadie sabe por qué." },
  'Town hall':         { d: "All-hands pero con producción cinematográfica. PowerPoint Slides, slide de Q&A incómodas al final y el obligatorio ‘agradezco la pregunta’.", e: "En el town hall, alguien preguntó por los recortes. La respuesta fue un 'buen punto' y un silencio incómodo." },
  'Check-in':          { d: "Reunión disfrazada de ‘me preocupo por vos’ para saber en qué andás sin pedirte un reporte.", e: "Hagamos un check-in el viernes —traducción: necesito saber si vas a entregar algo." },
  'Debrief':           { d: "Reunión post-mortem para analizar quién se comió el proyecto. Culpa compartida, ninguno asume.", e: "Hagamos un debrief del lanzamiento. Spoiler: 'hubo learnings'." },
  'Retro / Retrospectiva': { d: "Reunión al final del sprint donde el equipo se queja. La semana que viene, se queja otra vez de lo mismo.", e: "En la retro salió el tema del servidor. También la semana pasada. Y la anterior." },
  'Kick-off':          { d: "Reunión inicial de un proyecto. Gantt de 4 colores, slides bonitas, ilusión de control. El primer deadline se romperá a las 2 semanas.", e: "El kick-off es el lunes. Hoy es viernes y todavía no tenemos el brief." },
  'Follow-up':         { d: "Email recordatorio que manda tu jefe porque nadie hizo lo que se acordó en la última reunión.", e: "Te mando un follow-up —adjunto: el email con lo que acordamos hace 3 semanas." },
  'Deep dive':         { d: "Reunión donde se profundiza tanto en un tema que se termina ahogando en un Excel de 200 filas. Café, obligatorio.", e: "Necesitamos un deep dive del churn. Traé el café doble." },
  'Working session':   { d: "Reunión disfrazada de taller donde todos trabajan ‘juntos’, pero en realidad cada uno está en su cabeza.", e: "No es una reunión, es una working session. (Es una reunión.)" },
  'War room':          { d: "Sala (física o virtual) donde se manda a la gente cuando algo se rompió. Nadie sabe bien quién manda, todos mandan.", e: "Todos a la war room, se cayó el sitio. Especialmente los que no saben qué es la war room." },
  'Action items':      { d: "Lista de tareas que salen de una reunión. El 50% las hace otro. El otro 50% las lee y se ríe.", e: "Te paso los action items por Slack. Adjunto: la nada misma." },
  'Parking lot':       { d: "Cementerio corporativo de temas incómodos. Se habla de ellos una vez, nunca se resuelve.", e: "Lo dejamos en el parking lot —traducción: ‘me da fiaca resolverlo, vos no existís’." },
  'Hard stop':         { d: "Código Morse corporativo: significa ‘esta reunión ya se extendió 30 minutos, por favor ten piedad’.", e: "Tengo hard stop a las 11 —dijo a las 11:47 mientras seguía hablando." },
  'Back-to-back':      { d: "Calendario sin huecos. Almorzar es opcional. Orinar es opcional. Existir es opcional.", e: "Tengo todo el día back-to-back. ¿Almorzás? —en Slack, sin esperar respuesta." },
  'Blocker':           { d: "Excusa oficial para no entregar a tiempo. Si no tenés uno, inventalo. Si tenés uno, amplificálo.", e: "Tengo un blocker con legal. Spoiler: el blocker soy yo que no empecé." },
  'Circle back':       { d: "Diplomacia corporativa para decir ‘nunca’. Si te dicen ‘vamos a circle back’, mandá tu CV.", e: "Hagamos circle back la próxima semana. La próxima semana, también. Y la otra." },
  'Take it offline':   { d: "Forma elegante de pedirte que te calles. Bonus track: lo van a ‘tomar offline’ en otra reunión sin vos.", e: "Eso lo tomamos offline. (Alivio temporario.)" },
  'Touch base':        { d: "Reunión de ‘ponerse al día’ donde nadie se pone al día de nada. Pura postal sonoro.", e: "Te hago un touch base mañana. (Pista: no se hace.)" },

  // === Comunicación ===
  'Brief':             { d: "Documento con las instrucciones iniciales. Llega tarde, incompleto y contradice el email anterior.", e: "El cliente aún no manda el brief. Pero ya pidió tres cambios." },
  'Feedback':          { d: "Opinión disfrazada de crítica constructiva. ‘Feedback’ cuando lo das vos, ‘ataque personal’ cuando te lo dan.", e: "Te mando feedback por email —a las 23:59 un viernes." },
  'Reply all':         { d: "Deporte extremo corporativo. ‘Please, remove me from this thread’ es el himno nacional.", e: "Por favor, no hagas reply all. Spoiler: lo hace." },
  'CC / BCC':          { d: "Copia visible vs. copia oculta. El BCC es el chisme institucionalizado: lo ven los que no deberían.", e: "Ponme en CC para estar al tanto —y a su jefe. Y al jefe del jefe." },
  'Thread':            { d: "Cadena de email de 87 respuestas. La persona que comenzó ya no trabaja en la empresa. Nadie se atreve a cerrarlo.", e: "Sigamos este tema en el thread —que ya tiene más respuestas que la Constitución." },
  'Slack / Teams':     { d: "Herramientas para trabajar. En la práctica: 80% memes, 15% ‘viste mi último mensaje?’, 5% trabajo.", e: "Te escribo por Slack. Se lee 6 horas después. El 1:1 que nunca fue." },
  'ASAP':              { d: "Pedido urgente disfrazado de ‘cuando puedas’. La verdad: ‘quiero esto para ayer y no me importa tu vida’.", e: "Lo necesito ASAP. (También: tu weekend.)" },
  'EOD / COB':         { d: "Frases que significan ‘ya’, pero con estilo. Bonus: el ‘EOD’ del jefe suele ser las 22:00.", e: "Mándamelo EOD —a las 18:01 mandó un follow-up preguntando dónde está." },
  'FYI':               { d: "Información que no pediste, pero ahora es tu problema. Recibir FYI es adoptar digitalmente un koala.", e: "FYI: cambió la política de vacaciones. (Adiós, año nuevo en la playa.)" },
  'TL;DR':             { d: "Manifiesto de quien no se va a leer tu email. Una insignia de honor para gente sin tiempo (o sin ganas).", e: "TL;DR: nos mudamos de oficina. (Adjunto: 14 páginas de croquis.)" },
  'Per my last email': { d: "El ‘como te dije antes’ institucionalizado. Combina con CC al jefe del jefe para efecto nuclear.", e: "Per my last email, el plazo era ayer. Adjunto: la última cadena de emails." },
  'Align / Alineados': { d: "Pintar la Mona Lisa con la cara de quien te firma el cheque. Todos asienten, nadie cree nada.", e: "Necesitamos estar alineados. —dijo el que va a hacer lo que siempre quiso." },
  'Bandwidth':         { d: "Capacidad de tiempo que nadie tiene. ‘No tengo bandwidth’ = ‘te tengo en visto dos semanas’.", e: "No tengo bandwidth para otro proyecto. (Tengo para memes, eso sí.)" },
  'Visibility':        { d: "Arte de que te vean trabajando. 1.000h en silencio < 10 min de All-hands mencionando tu nombre.", e: "Necesitas más visibility con los directivos. Bonus: ‘mándales más updates’." },
  'Narrative':         { d: "La historia oficial. Lo que se dice vs. lo que pasó. La distancia entre ambas es la política interna.", e: "Hay que cuidar la narrativa del lanzamiento. (La realidad la armamos después.)" },
  'Elevator pitch':    { d: "Discurso de 30 segundos para vender una idea. Como si los CEOs subieran 23 pisos en ascensor contigo.", e: "Prepara tu elevator pitch para el CEO. (Que subió 2 pisos.)" },
  'Deck':              { d: "PowerPoint lleno de gráficos que nadie entiende, con cero bullets útiles y un logo enorme en cada slide.", e: "Te paso el deck antes de la reunión. (Tiene 73 slides.)" },
  'Memo':              { d: "Comunicado interno. Trae malas noticias con formato de PDF corporativo. Bonus si dice ‘oportunidad’.", e: "Salió un memo de RRHH. (‘Oportunidades de mejora’ = despidos.)" },
  'Newsletter':        { d: "Boletín interno mensual que nadie lee. Lo redacta 1 persona y la reciben 2.000 que lo borran.", e: "Salió la newsletter del mes. 1.998 personas la archivaron sin abrir." },
  'Heads up':          { d: "Advertencia de tsunami. ‘Te aviso antes de que explote y, si podés, tirá a otro al agua’.", e: "Heads up: el cliente está molesto. (Pista: no solo está molesto, está en llamas.)" },

  // === Ágil ===
  'Agile':             { d: "Metodología de trabajo flexible. Todos dicen hacerla. Nadie la hace. Los consultores viven de eso.", e: "Somos una empresa agile. (El único ágil es el scrum master esquivando responsabilidad.)" },
  'Scrum':             { d: "Marco de trabajo con sprints, dailies y 4 reuniones obligatorias que nadie quiere.", e: "Usamos Scrum en el equipo. La retrospectiva también es ignorada, como el código de legacy." },
  'Sprint':            { d: "Período de 2 semanas donde se promete todo y se entrega la mitad. La ‘planificación’ es un acto de fe.", e: "Estamos en el sprint 14. ¿Qué es un sprint 14? No preguntar." },
  'Story points':      { d: "Unidad inventada por devs para no comprometerse con plazos reales. ‘Cuántos puntos?’ = ‘ni idea’.", e: "Esa historia son 8 story points. (Alguien dijo 5, alguien dijo 13. Promediaron: desastre.)" },
  'Burndown chart':    { d: "Gráfico que te dice lo que ya sabías: van mal. Sirve para generar culpa visual en la daily.", e: "El burndown no va bien. El burndown NUNCA va bien." },
  'Waterfall':         { d: "Metodología en cascada. Todos la critican en público. En privado, la usan cuando hay presión de entregar.", e: "Eso es más waterfall que agile. —mientras esconden el Gantt en la otra pestaña." },
  'Velocity':          { d: "Número mágico que mides, pero no entendés bien. Crece cuando ajustás cómo se mide. Magia.", e: "Nuestra velocity promedio es 40 puntos. (Variable: a quién le preguntes.)" },
  'Daily / Daily stand-up': { d: "Reunión de 15 min para sincronizar. Duración real: 30 min. Estado real: 80% improvisando.", e: "Nos vemos en la daily a las 9 —la mitad llega tarde, la otra mitad está en mute." },
  'Backlog grooming':  { d: "Refinamiento del backlog. Se reordenan tickets que nunca se van a hacer. Terapéutico.", e: "Hoy toca backlog grooming. Salen más tickets de los que entran." },

  // === Negocios / Finanzas ===
  'Synergy':           { d: "Cuando 1 + 1 = 3 según un PowerPoint. En la realidad, 1 + 1 = un comité nuevo.", e: "Buscamos sinergias entre áreas. (Reunión #2.847 del mes.)" },
  'Pivot':             { d: "Cambio radical de estrategia. También funciona como ‘reconocemos que la cagamos, pero con marca’.", e: "Tuvimos que pivotar el modelo. La startup se reinventa. Otra vez." },
  'Bootstrapping':     { d: "Emprender sin inversión. ‘No nos quisieron dar plata, así que decimos que lo hicimos a propósito’.", e: "Crecimos con bootstrapping. (Y con nuestras propias tarjetas de crédito.)" },
  'Runway':            { d: "Meses que le quedan a la startup antes de quedar en la calle. Nuevo hobby de CFOs: contar meses.", e: "Tenemos 12 meses de runway. CFO, 2 meses sin dormir." },
  'EBITDA':            { d: "Cifra favorita de los CFOs. Si la decís en una reunión, suena a que sabés de finanzas (no sabés).", e: "El EBITDA del trimestre fue positivo. CFO: ‘Ganamos’. Contador: ‘No exactamente…’" },
  'Cap table':         { d: "Documento sagrado que nadie quiere leer. Si la perdés, se desata un juicio de 6 años.", e: "Revisa la cap table. (Traducción: ‘hay gente enojada por la última ronda’.)" },
  'Layoff':            { d: "Despido masivo con PowerPoint empático. ‘Somos familia’ dijo el CEO antes del recorte.", e: "Layoff del 10% del equipo. (Hoy somos el 100% más tristes.)" },
  'Restructuring':     { d: "Eufemismo para ‘recortes’. Incluye slides con la palabra ‘futuro’ en cada página.", e: "Estamos en proceso de restructuring. (Decreto: despidos disfrazados de crecimiento.)" },
  'Cost cutting':      { d: "Reducción de costos, también conocida como ‘se acabaron los snacks gratis y la máquina de café’.", e: "Anunciaron cost cutting. (La fruta de la oficina duró dos días más.)" },
  'Burnout':           { d: "Estado en el que llegás a casa, mirás el techo y no recordás qué día es. Premiado con un ‘wellness webinar’.", e: "Estoy al borde del burnout. (La empresa respondió con un curso de mindfulness de 20 min.)" },

  // === RRHH / Liderazgo ===
  'Onboarding':        { d: "Proceso de bienvenida con 47 formularios, 3 vídeos institucionales y una ‘buddy’ que te dejó en visto.", e: "El onboarding dura 2 semanas. Día 1: laptop. Día 14: ansiedad." },
  'PIP':               { d: "Performance Improvement Plan. Documento donde te dicen ‘mejorá o te vas’, con cariño institucional.", e: "Me pusieron en PIP. (Compré champagne para celebrar la salida.)" },
  'Micromanagement':   { d: "Estilo de liderazgo donde tu jefe te pide un update cada 47 minutos. Suele disfrazarse de ‘involucrarse’.", e: "Mi jefe hace micromanagement. (Ahora me pregunta cada 20 min en vez de 30. Mejora.)" },
  'Quiet quitting':    { d: "Acto revolucionario de hacer solo lo que te pagan. Bonus: nadie se entera hasta el día que renunciás.", e: "Estoy en modo quiet quitting. (Traducción: ‘por fin, salud mental’.)" },
  'Loud quitting':     { d: "Cuando el quiet quitting no alcanza y empezás a decir las verdades en público. LinkedIn te lo agradece.", e: "Dejé el quiet quitting por loud quitting. (El jefe, ofendido. Yo, libre.)" },
  'Great resignation': { d: "Fenómeno global donde todos renuncian. El mercado laboral lo celebra, los CEOs lo lloran.", e: "Estamos en la great resignation. (Traducción: el mercado me busca, yo me dejo.)" },
  'Culture fit':       { d: "Excusa elegante para no contratar ‘a ese tipo raro’. El 90% de las veces significa ‘no me cae bien’.", e: "No fue culture fit. (Era culture feo.)" },
  'Boomerang employee':{ d: "Empleado que se fue y volvió. La empresa lo celebra con un mail. Los compañeros, con cara larga.", e: "Es un boomerang employee. (Otra vez él.)" },
  'Sabbatical':        { d: "Licencia larga pagada para ‘recargar energías’. Te la dan a los 15 años. Ya no quedan 15 años de ganas.", e: "Me dieron un sabbatical de 3 meses. (Otros: ‘eso existe?’)" },

  // === Tecnología ===
  'Tech debt':         { d: "Cosas que se rompieron, se parchearon, se olvidaron y ahora son el problema de todos. Herencia bendita.", e: "Tenemos mucho tech debt. (En otras palabras: ‘no lo vamos a tocar jamás’.)" },
  'Legacy':            { d: "Sistema antiguo que nadie entiende pero que sostiene el negocio. Tocar es un acto de valentía o locura.", e: "Ese sistema es legacy. (Tocar implica terapia.)" },
  'AI':                { d: "Palabra mágica que se le pone a todo en 2026. ‘Es AI’ = ‘no sé bien qué hace pero suena moderno’.", e: "Integramos AI en el producto. (Una API de OpenAI con prompt de 3 líneas.)" },
  'ML':                { d: "Subconjunto de ‘AI’ para gente que quiere sonar más técnica. Mismo resultado, distinto nombre.", e: "Usamos ML para predicciones. (Que un humano ya hacía en 10 minutos.)" },
  'DevOps':            { d: "Cultura que une desarrollo y operaciones. En la práctica: un equipo chico que arregla todo a las 3 AM.", e: "El equipo de DevOps automatizó todo. (Y nadie más sabe cómo funciona.)" },
  'Cloud':             { d: "La computadora de otro. Pagás por no tener la tuya. Si te quedás sin internet, no trabajás.", e: "Migramos todo al cloud. (Y pagamos más que en un data center, pero suena sexy.)" },
  'Blockchain':        { d: "Solución en busca de un problema. Mientras tanto, hacemos una ‘prueba de concepto’ con monos encriptados.", e: "Hicimos un PoC de blockchain. (Resultado: gastamos 80k para mover un Excel.)" },
  'MVP':               { d: "Minimum Viable Product. Lo que sale cuando no hay tiempo. También conocido como ‘beta eterno’.", e: "Lancemos un MVP primero. (5 años después, sigue siendo MVP.)" },
  'Demo':              { d: "Demostración del producto que SIEMPRE falla. El pánico es parte de la experiencia.", e: "Agenda una demo con el prospect. (Y un backup del backup.)" },
  'Cold call':         { d: "Llamar a un desconocido para venderle algo. La nueva versión de tocar timbre puerta a puerta, con peor café.", e: "Hago 50 cold calls al día. (0 me responden.)" },
  'Stealth mode':      { d: "Cuando tu startup no tiene producto, pero ya tiene nombre. Nadie sabe qué hacés, ni siquiera vos.", e: "Estamos en stealth mode. (No tenemos nada. Pero el logo ya está en LinkedIn.)" },
  'Disruptivo':        { d: "Adjetivo que se pone todo el mundo. Si decís ‘somos disruptivos’, probablemente vendés lo mismo que el resto.", e: "Tenemos una idea disruptiva. (Spoiler: una app de delivery.)" },
  'Moonshot':          { d: "Proyecto tan ambicioso que probablemente nunca vea la luz. Pero el nombre queda bien en slides.", e: "Ese es un moonshot project. (Status: ‘en roadmap para 2030’.)" },
}

// ---- 2) New ultra-comedic terms (extra category: "Horrores") ----
const NEW_TERMS = [
  { t: 'Reunión sin agenda', d: 'La forma más honesta de decir “no sabemos de qué hablar, pero queremos vernos las caras”.', e: '“Agenda pendiente” —el estado natural del 80% de las reuniones del martes.', c: 'Horrores', o: 'es' },
  { t: 'Disponible', d: 'Estado permanente del jefe en Slack. “Disponible” significa “te voy a interrumpir en 11 minutos”.', e: '“Estoy disponible” —dijo, y mandó 4 mensajes en 90 segundos.', c: 'Horrores', o: 'es' },
  { t: 'Friendly reminder', d: 'Recordatorio disfrazado de cordialidad. Es un email con tono de madre que no aguantás.', e: '“Friendly reminder: lo entregaste hace 3 semanas. :)” —el smiley duele más.', c: 'Horrores', o: 'en' },
  { t: 'Synergizar', d: 'Verbo que solo existe en LinkedIn. Nadie sabe conjugarlo. Todos lo usan mal.', e: '“Hay que sinergizar esfuerzos”. (El resto del equipo: ¿qué?)', c: 'Horrores', o: 'en' },
  { t: 'Win-win', d: 'Situación donde todos ganan, según el PowerPoint. En la realidad, alguien pierde y está por enterarse.', e: '“Es un win-win para todos” —dijo el área que se lleva el 80% del beneficio.', c: 'Horrores', o: 'en' },
  { t: 'Best practice', d: 'Lo que hacía tu ex-jefe y servía. Lo traés como si lo hubieras inventado vos.', e: '“Esto es best practice” —adjunto: 4 artículos de 2014.', c: 'Horrores', o: 'en' },
  { t: 'Quick win', d: 'Victoria rápida que se muestra en la próxima review. La mayoría son cosas que ya estaban hechas.', e: '“Tengo un quick win para mostrar” —será una macro de Excel.', c: 'Horrores', o: 'en' },
  { t: 'Bajo control', d: 'Mentira corporativa de nivel Dios. Nadie tiene nada bajo control. Pero todos lo repiten.', e: '“Está bajo control” —mientras el sistema cae a pedazos.', c: 'Horrores', o: 'es' },
  { t: 'Escalation', d: 'Subir un problema a alguien más arriba. Traducción: “yo no lo arreglo, que se joda otro”.', e: '“Hago escalation a su manager”. (Y me voy a tomar café.)', c: 'Horrores', o: 'en' },
  { t: 'Catch up', d: 'Reunión para ponerse al día, generalmente con alguien que llega de vacaciones. Duración: 2h.', e: '“Hagamos un catch up de las 2 semanas que no estuve”. (No.)', c: 'Horrores', o: 'en' },
  { t: 'Mango picker', d: 'CEO que no hace nada pero está en todas las fotos. Existe en todas las empresas con más de 200 empleados.', e: '“El CEO viene a visitarnos” —alarma general. ¿A qué viene? Nadie sabe.', c: 'Horrores', o: 'en' },
  { t: 'Corporate BS bingo', d: 'Bingo que se juega en cualquier reunión. Se gana al tercer “synergy” de la daily.', e: '“Let’s align, drive impact, leverage” —¡BINGO!', c: 'Horrores', o: 'en' },
  { t: 'I’ll loop you in', d: 'Promesa vaga de incluirte. La realidad: te agregan al thread 2 días después, ya cerrado.', e: '“Te loopeo en la conversación”. (Mentira. Te loopeo en otra que no tiene nada que ver.)', c: 'Horrores', o: 'en' },
  { t: 'Ping pong', d: 'Cuando un email se reenvía 14 veces entre áreas sin avanzar. Se llama así porque la pelota nunca cae.', e: 'El ticket lleva 3 semanas en ping pong entre Legal y Producto.', c: 'Horrores', o: 'es' },
  { t: 'Reunión post-mortem', d: 'Encuentro donde se analiza lo que salió mal. Nadie asume nada. Se repite el próximo trimestre.', e: '“Haremos un post-mortem”. El próximo incidente ya está ocurriendo.', c: 'Horrores', o: 'es' },
  { t: 'Dependencia emocional del roadmap', d: 'Cuando el roadmap es la Biblia y nadie se atreve a cambiarlo aunque ya no tenga sentido.', e: '“No puedo, no está en el roadmap”. (Ni los milagros, entonces.)', c: 'Horrores', o: 'es' },
  { t: 'Hacer un Excel', d: 'Forma pasivo-agresiva de pedirle a alguien que justifique su trabajo. Bonus si tiene tablas dinámicas.', e: '“Mandame un Excel con los números” —traducción: no te creo, demostramelo.', c: 'Horrores', o: 'es' },
  { t: 'Workstream', d: 'Una “corriente de trabajo” que nadie sabe dónde empieza ni dónde termina. Suena épico, no significa nada.', e: '“Abrimos un workstream nuevo” —hay 14, ninguno tiene dueño.', c: 'Horrores', o: 'en' },
  { t: 'Hacer un one-pager', d: 'Resumen de una página que termina ocupando 3. Lo mandás y nadie lo lee igual.', e: '“Necesito un one-pager sobre esto”. (Adjunto: 11 páginas de bullets.)', c: 'Horrores', o: 'es' },
  { t: 'Traer el tema a la mesa', d: 'Poner un tema sobre la mesa, sin decir quién va a resolverlo. Traducción: “alguien, hágalo”.', e: '“Lo traigo a la mesa para discutirlo”. (La mesa explota.)', c: 'Horrores', o: 'es' },
  { t: 'Traer la data', d: 'Pedir pruebas para sostener una opinión. A veces se pide después de perder la discusión.', e: '“Traé data que respalde eso” —alguien que ya perdió el debate.', c: 'Horrores', o: 'es' },
  { t: 'Reunión de alineación', d: 'Reunión cuyo único objetivo es que todos repitan lo mismo que dijo el jefe. No se decide nada.', e: '“Esto es una reunión de alineación” —todos repiten el mismo párrafo del CEO.', c: 'Horrores', o: 'es' },
  { t: 'Actualización semanal', d: 'Email de 12 párrafos que nadie lee. Lo mandás porque “hay que comunicar”.', e: 'Weekly update de Juan —archivado sin abrir, como cada viernes.', c: 'Horrores', o: 'es' },
  { t: 'Hand off', d: 'Pasarle la pelota a otro equipo. Arte de deshacerte del problema con elegancia burocrática.', e: '“Hacemos hand off a Customer Success”. (Adiós, problema.)', c: 'Horrores', o: 'en' },
  { t: 'Quick poll', d: 'Encuesta de 4 opciones donde todos votan lo mismo. Se hace para simular democracia.', e: '“Armemos un quick poll”. Resultado: 87% “ok con lo que digan”.', c: 'Horrores', o: 'en' },
  { t: 'Drinking from the firehose', d: 'Onboarding donde te avientan 1000 cosas al día. Después de la semana 1, pedís la renuncia.', e: '“Es como beber de una manguera contra incendios”. —manual de onboarding, página 3.', c: 'Horrores', o: 'en' },
  { t: 'Ser el quarterback', d: '“Ser quien orquesta todo”, en criollo: el que coordina 12 cosas y nadie le agradece.', e: '“Vos vas a ser el quarterback de esto” —yo no firmé para esto.', c: 'Horrores', o: 'en' },
  { t: 'Bear case / Bull case', d: 'Escenario pesimista vs. optimista. El CEO siempre presenta el bull. La realidad siempre gana el bear.', e: '“Bear case: 10% menos revenue”. CFO: “Eso no va a pasar”. (Pasó.)', c: 'Horrores', o: 'en' },
  { t: 'Tomémonos un café', d: 'Forma de pedir feedback negativo cara a cara. Nadie toma café. Nadie lo disfruta.', e: '“¿Te tomás un café?”. (En 14 años, 0 cafés reales.)', c: 'Horrores', o: 'es' },
  { t: 'Alineamiento planetario', d: 'Cuando por fin todos (área, jefe, área del jefe, área del área) están de acuerdo. Sucede 1 vez cada 5 años.', e: '“Por fin estamos alineados”. —el susurro, el brindis, la foto para el LinkedIn.', c: 'Horrores', o: 'es' },
]

// --- Apply ---
const src = readFileSync('src/data/terms.js', 'utf8')
// Strip the auto-generated header comments
const jsonStart = src.indexOf('export const TERMS = ')
const arr = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf('];') + 1))

let updated = 0
let added = 0
for (const item of arr) {
  if (REWRITES[item.t]) {
    const r = REWRITES[item.t]
    if (r.d !== undefined) item.d = r.d
    if (r.e !== undefined) item.e = r.e
    if (r.o !== undefined) item.o = r.o
    if (r.c !== undefined) item.c = r.c
    updated++
  }
}

// Avoid duplicates by term (case-insensitive)
const seen = new Set(arr.map((t) => t.t.toLowerCase()))
for (const t of NEW_TERMS) {
  if (seen.has(t.t.toLowerCase())) continue
  arr.push(t)
  seen.add(t.t.toLowerCase())
  added++
}

const out = `// Gerigoncio de Gerentes — dictionary dataset
// ${arr.length} curated terms (${updated} rewritten with sharper humour, ${added} new "Horrores" entries)
export const TERMS = ${JSON.stringify(arr, null, 2)};
`
writeFileSync('src/data/terms.js', out)
console.log('terms:', arr.length, 'updated:', updated, 'added:', added)
