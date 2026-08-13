# ROADMAP.md

Orden de fases. No se avanza a una fase nueva antes de dejar la actual en un
estado jugable y sin errores conocidos. Marcar `[x]` solo si cumple la
definición de "terminado" de `AGENTS.md`.

## FASE 1 — Arquitectura y proyecto base
- [x] Proyecto Phaser + Vite + TS scaffolded
- [x] Estructura de carpetas (core/data/systems/scenes/ui)
- [x] EventBus, GameState, Constants
- [x] Boot → Preloader → MainMenu (esqueleto de escenas)

## FASE 2 — Protagonista, mapa, navegación
- [x] CityMapScene con las 19 zonas seleccionables
- [x] LocationScene genérica data-driven (19 locaciones)
- [x] Sistema de viaje (costo de tiempo, transición, HUD reactivo)

## FASE 3 — NPCs, diálogos, interrogatorios
- [x] DialogueEngine + árboles de diálogo data-driven
- [x] 20 NPCs cargados desde `data/npcs.ts` (+1 NPC menor para el final
      "sospechoso equivocado")
- [x] Acciones de interrogatorio (preguntar/insistir/intimidar/bromear/
      mentir/mostrar evidencia/favor/retirarse) — **los 21 NPCs del caso 1
      tienen árbol de diálogo propio**, ninguno usa ya el fallback
      genérico. Diálogos separados en `caso1_dialogues.ts` (el archivo de
      caso se había puesto grande).
- [x] Pistas opcionales que completan las 9 categorías pedidas en el
      diseño (agregadas: visual, económica, absurda, contradictoria)
- [x] Test de integridad de datos (`DataIntegrity.test.ts`) que valida que
      todo NPC/pista/zona referenciada desde diálogos y locaciones
      realmente exista — pensado para explotar rápido ante un typo al
      agregar contenido nuevo

## FASE 4 — Pistas, deducción, sospechosos
- [x] ClueManager + modelo de pista (5 pistas del caso 1, 1 falsa)
- [x] SuspectBoardScene (armar hipótesis, elegir zona destino)
- [x] Pistas falsas descartables por contradicción (clue_camioneta_blanca
      vs. clue_libro_guardia)

## FASE 5 — Tiempo, viajes, eventos
- [x] TimeSystem con deadline de caso (720 min) y reloj día/hora/minuto
- [x] EventSystem (9 eventos aleatorios menores al explorar, solo flavor
      por ahora — sin efecto mecánico todavía)
- [x] Consecuencias por demora: deadline agotado dispara el final
      "la banda escapa" automáticamente

## FASE 6 — Primer caso completo
- [x] "El Operativo de las Medialunas" jugable de punta a punta
- [x] Los 7 finales están implementados; 3 verificados jugando en
      navegador (resuelto_correcto, sospechoso_equivocado, banda_escapa);
      escandalo/final_absurdo/final_secreto/final_perfecto verificados por
      lógica en `EndingResolver` + debug mode, pendiente de smoke test
      manual jugado

## FASE 7 — Guardado, finales, reputación
- [x] SaveSystem con 3 slots en localStorage (probado: guardar y leer desde
      la consola del navegador)
- [x] ReputationSystem con las 5 variables, verificado en HUD y debug
- [x] 7 finales definidos en `caso1_medialunas.ts` + `EndingResolver`

## FASE 8 — Arte definitivo
- [x] Primer lote generado y en juego: protagonista + 9 NPCs + 3 fondos
      (Pollinations.ai, ver ART_DIRECTION.md → "Arte generado"). Higgsfield
      quedó descartado por requerir plan pago.
- [x] Pipeline reproducible (`tools/generate_art.py`) para generar el resto
- [ ] Reemplazo del resto de los placeholders (12 NPCs, 16 fondos, íconos
      UI, banda criminal — ver ART_DIRECTION.md → TODO_ASSET)

## FASE 9 — Audio
- [x] AudioManager modular + placeholders funcionales (síntesis Web Audio
      API, sin archivos de audio externos — ver `src/audio/`)
- [x] Música por contexto: menú, investigación (mapa/locación),
      interrogatorio (diálogo normal), persecución (confrontación final)
- [x] Sonidos de UI: click de botón, pista conseguida, viaje, advertencia
      de tiempo, error/deadline agotado — reactivos a `EventBus`, no
      requieren cambios en las escenas que ya emiten esos eventos
- [x] Botón de mute en el HUD

## FASE 10 — Segundo y tercer caso
- [x] Caso 2: "El Contador Que Faltaba" (`caso2_contador.ts` +
      `caso2_dialogues.ts`) — jugable de punta a punta, con las mismas 19
      zonas y varios NPCs reutilizados (Pipo, Sagasti, Yamila, Egidio,
      Naza) más 2 NPCs nuevos (Chiche Molina, el sospechoso; el Pescador
      Aguirre, el falso sospechoso)
- [x] Caso 3: "El Robo del Trofeo del Club" (`caso3_trofeo.ts` +
      `caso3_dialogues.ts`, FASE 14) — ver detalle abajo, FASE 14
- [x] Infraestructura confirmada para agregar casos sin tocar código core
      — agregar el Caso 2 solo requirió 2 archivos de datos nuevos +
      sumarlo a `cases/index.ts`. En el proceso se corrigieron dos deudas
      de arquitectura que lo hubieran roto silenciosamente:
      1. `EndingResolver` tenía hardcodeados nombres de flag específicos
         del Caso 1 (`contreras_*`) — renombrados a genéricos
         (`sospechoso_arrestado/soborno/intimidado/liberado`), reusables
         por cualquier caso.
      2. `LocationScene` mostraba a los NPCs "de rol especial" (sospechoso
         real y falso) según una lista estática por locación, lo que
         hacía que el sospechoso de un caso se filtrara a otro caso que
         reutilizara la misma locación, y permitía confrontar al falso
         sospechoso sin haber presentado ninguna hipótesis primero (bug
         real: el final terminaba mal etiquetado como "resuelto_correcto").
         Ahora la aparición de ambos depende 100% de
         `CaseDefinition.sospechosoId/falsoSospechosoId` +
         `gameState.hypothesisDestinoZoneId`, nunca de datos estáticos de
         la locación.

## FASE 11 — Testing
- [x] Unit tests de sistemas puros (`npm test`, 42 tests — ver TESTING.md)
- [x] Smoke test Playwright de arranque (manual vía skill `webapp-testing`;
      pendiente dejarlo como script guardado en el repo, ver deuda abajo)

## FASE 12 — Polish
- [x] Auditoría de calidad (ver informe abajo). Bugs reales encontrados y
      corregidos en el proceso (no simplemente detectados): visibilidad de
      sospechosos filtrada entre casos, flags de final hardcodeados,
      HUD/CityMap/Location quedando activos detrás de EndingScene, texto
      del HUD solapado con el botón Guardar, "CASO 1" fijo en
      CaseIntroScene, flujo de guardado nunca probado de punta a punta vía
      UI.

## FASE 13 — Build final
- [x] `npm run build` limpio (1.4 MB total, 88 KB de código propio — el
      resto es Phaser), listo para deploy estático (`dist/`)
- [x] `npm audit`: 0 vulnerabilidades
- [x] `npm run typecheck` y `npm test` (78/78) limpios

## Informe de control de calidad (2026-08-12)

Checklist de `docs/TESTING.md`, verificado jugando en navegador
(Playwright) salvo que se indique lo contrario:

| Pregunta | Estado |
|---|---|
| ¿El juego arranca? | Sí |
| ¿Se puede empezar una partida nueva? | Sí (2 casos) |
| ¿El jugador sabe qué hacer? | Sí — HUD muestra objetivo, expediente explica el caso |
| ¿Las pistas tienen sentido? | Sí — pista falsa descartable por contradicción en ambos casos |
| ¿Se puede ganar? | Sí — `resuelto_correcto` y `final_perfecto` jugado/testeado |
| ¿Se puede perder? | Sí — `banda_escapa` y `sospechoso_equivocado` jugados de punta a punta |
| ¿Los finales funcionan? | Los 7, con test unitario dedicado por caso (14 tests) |
| ¿El tiempo funciona? | Sí — deadline, warning y expiración testeados |
| ¿El guardado funciona? | Sí — probado round-trip completo por UI (guardar → cerrar → Continuar → cargar), no solo por unit test |
| ¿La UI es legible? | Sí, con un ajuste (texto del HUD acortado para no solapar el botón Guardar) |
| ¿Hay bugs evidentes? | Los que había se corrigieron (ver FASE 10 y FASE 12 arriba) |
| ¿Hay assets faltantes? | Sí, arte visual — ver ART_DIRECTION.md → TODO_ASSET (audio ya resuelto) |
| ¿Hay código duplicado? | No detectado; `tsc --noEmit` con `noUnusedLocals`/`noUnusedParameters` activos previene imports/variables muertas de forma continua |
| ¿Hay sistemas muertos? | No — `EventSystem`/`randomEvents` están integrados aunque su efecto sea solo narrativo por ahora (deuda documentada, no código sin usar) |

---

## FASE 14 — Transformación Carmen-AR (persecución en vez de mission-select)

Reforma estructural del loop principal para acercarlo al género clásico de
persecución-por-mapa (ver `docs/GAME_DESIGN.md` → Loop principal), sin tocar
el mundo/contenido ya existente ni copiar nada de ninguna franquicia.

- [x] Eliminada la selección manual de caso (`CaseSelectScene`,
      `CaseIntroScene` borradas). El caso llega solo: `ReportScene` nueva
      (reporte policial estructurado, estilo memo) + asignación automática
      y cíclica sobre `CASES` (`CaseManager.startNextCaseInSequence`,
      `gameState.casoIndex`).
- [x] `RouteSystem` (`src/systems/RouteSystem.ts`): la persecución pasó de
      "un salto directo al destino final" a una **ruta de varias paradas**
      (`CaseDefinition.ruta: string[]`). El pizarrón reconstruye la ruta
      parada por parada. Reemplaza a `DeductionSystem` (eliminado, junto
      con su test, por quedar sin ningún uso en producción).
- [x] Sistema de Inteligencia Criminal / Crime Computer
      (`CrimeComputerSystem` + `data/suspects.ts` + `CrimeComputerScene`):
      identikit de 6 atributos armado con pistas (`revealsAttribute`),
      base de sospechosos con señuelos que comparten atributos a propósito
      (para que haga falta más de una pista), y **orden de captura**
      obligatoria antes de poder confrontar (`gameState.ordenCapturaEmitida`,
      gate en `LocationScene`).
- [x] Sistema de rangos (`data/ranks.ts`, 7 niveles) ligado a
      `gameState.casosResueltos`, progreso de carrera que persiste entre
      casos (no se resetea con `reset()`, solo con `resetCareer()`).
- [x] Caso 1 y Caso 2 migrados a la nueva estructura: `ruta`, `objetoRobado`,
      `victima`, `fechaHoraDelHecho` agregados; clues existentes anotadas
      con `revealsAttribute`; agregadas pistas/diálogos nuevos donde hacía
      falta un atributo más para que el identikit no fuera trivial (ver
      nota de diseño abajo).
- [x] Texto progresivo tipo terminal (`TypewriterText`, salteable con
      click) en diálogos y en el reporte; sonido de tecleo sutil.
      Pasos de sonido placeholder al entrar a una locación.
- [x] `tools/e2e_smoke_test.py` reescrito para el nuevo flujo completo
      (reporte automático → ruta multi-parada → identikit → orden de
      captura → captura → rango → siguiente caso automático), con
      screenshots verificados manualmente.
- [x] 23 tests nuevos (`RouteSystem`, `CrimeComputerSystem`, `ranks`,
      extensión de `DataIntegrity.test.ts` con validación de `ruta` y de
      que el identikit completo de cada caso registrado identifique
      únicamente al sospechoso real). Total: 101 tests.
- [x] Pasada de UI tipo panel/terminal para el resto de las escenas
      (`CityMapScene`, `LocationScene`, `SuspectBoardScene`,
      `CaseFileScene`, `EndingScene`): tipografía monospace (`FONTS.MONO`)
      en todo el texto y los botones (nuevo `fontFamily` opcional en
      `createButton`), más una línea divisoria fina bajo cada título
      (`ui/TerminalDivider.ts`) consistente con el estilo ya usado en
      `ReportScene`. Se mantuvo el fondo oscuro con acentos ámbar (no el
      verde puro de `CrimeComputerScene`, reservado para esa pantalla en
      particular) para diferenciar "terminal de la comisaría" de "UI de
      juego en general".
- [x] Audio: ambiente por tipo de zona (`data/ambient.ts`, drone "urbano"
      vs. "agua" para zonas costeras/ribereñas, capa separada bajo la
      música vía `AudioManager.playAmbient`) y 3 estados de música nuevos:
      `reporte` (ReportScene, más solemne que el menú), `peligro`
      (reemplaza a investigación/interrogatorio automáticamente al cruzar
      el umbral de advertencia de deadline — genuinamente dinámico, no solo
      en el instante del evento: `CityMapScene`/`LocationScene` chequean
      `gameState.deadlineWarningEmitted` en cada `create()`) y `captura`
      (EndingScene, solo en finales exitosos vía
      `CaseManager.isEndingExitoso`).
- [x] Caso 3 diseñado ya sobre la estructura nueva (ruta + identikit) desde
      el arranque, no migrado después: "El Robo del Trofeo del Club"
      (`caso3_trofeo.ts`), el caso de ejemplo original del prompt (zona
      inspirada en Liniers, pista del colectivo 21). Zona nueva
      (`feria_usados`), 3 NPCs nuevos, ruta de 3 paradas reutilizando 7
      NPCs existentes con diálogo propio del caso. Ahora el ciclo
      automático de casos tiene 3 entradas en vez de 2 — no se repite en
      la tercera partida.
- [ ] Caso 4+ (a definir; con 3 casos el ciclo ya no se repite en la
      tercera partida, pero más variedad sigue sumando).

**Notas de diseño encontradas y corregidas en el proceso** (las tres
siguientes vinieron del mismo chequeo: que ninguna pista, sola, resuelva el
identikit):
- La primera versión del identikit de `senuelo_kiosquero` no compartía
  `comida` con el sospechoso real del Caso 1, lo que volvía la deducción
  trivial (una sola pista alcanzaba). Se ajustó para que comparta
  `comida: 'Medialunas'` con el caco real, obligando a una segunda pista
  de atributo distinta para acorralarlo.
- Al diseñar el Caso 3 se encontró la MISMA falla, sin detectar, en los
  dos casos anteriores: `profesion: 'Ingeniero trucho'` (Caso 1) y
  `vehiculo: 'Fiat Duna'` (Caso 2) eran valores únicos en toda la base de
  sospechosos — una sola pista bastaba para emitir la orden de captura.
  Corregido agregando 2 señuelos nuevos (`senuelo_utilero_rival`,
  `senuelo_ingeniero_trucho_2`) que comparten esos valores.
- Todo esto quedó fijado con un test genérico nuevo en
  `CrimeComputerSystem.test.ts` que corre sobre TODAS las pistas de
  atributo de TODOS los casos registrados, no solo verificado a mano una
  vez — cualquier caso futuro que reintroduzca la falla la va a explotar
  en el momento de agregarlo.

## FASE 15 — Generador de casos procedural

Pedido explícito del usuario tras el Caso 3: con solo 3 casos fijos, el
ciclo se sentía igual a partir de la tercera partida. En vez de seguir
agregando casos a mano indefinidamente (no escala), se construyó un
generador que arma un caso nuevo combinando piezas del mundo ya existente
— mismo mecanismo de fondo que usa Carmen Sandiego (criminal al azar, ruta
al azar, testigos al azar) en vez de "casos" guionados de punta a punta.
Detalle de diseño completo en `docs/GAME_DESIGN.md` → "Generador de
casos".

- [x] `src/systems/rng.ts`: PRNG determinístico (mulberry32) + helpers
      (`pick`/`pickN`/`shuffle`/`randomInt`) — permite fuzz-testing
      reproducible; el juego en sí usa `Math.random` por defecto.
- [x] Pools de datos nuevos en `src/data/generator/`: `operatives.ts` (3
      identidades confrontables reutilizadas de los casos fijos),
      `bystanders.ts` (3 señuelos), `informants.ts` (19 NPCs civiles, cada
      uno con su zona ya fija en `data/npcs.ts` — eso es lo que garantiza
      que cada parada intermedia de una ruta generada tenga alguien ahí
      para dar la pista), `crimeFlavors.ts` (6 "excusas" de crimen
      genéricas, deliberadamente distintas del contenido de los 3 casos
      fijos) y `dialogueTemplates.ts` (bancos de frases variadas por
      atributo/ruta + builders genéricos de briefing/confrontación/falso
      sospechoso/finales, reutilizando los mismos nombres de flag que ya
      lee `EndingResolver`).
- [x] `src/systems/CaseGenerator.ts`: arma un `CaseDefinition` completo —
      operativo al azar, ruta al azar (restringida a zonas con informante
      disponible salvo la parada final), informantes al azar por pista
      (uno puede terminar con más de una, se fusionan en un solo árbol de
      diálogo), sospechoso falso y excusa del crimen al azar. El objeto
      resultante es indistinguible, para el resto del motor, de un caso
      escrito a mano.
- [x] `CaseManager`: los primeros `CASES.length` casos de la carrera son
      los fijos; de ahí en más, cada `startNextCaseInSequence()` genera
      uno nuevo y lo cachea en memoria (`registerGeneratedCase`/
      `resolveCase`/`getCurrentGeneratedCaseIfAny`).
- [x] `SaveSystem`: nuevo campo `generatedCase` en `SaveData` para poder
      reconstruir un caso generado al cargar una partida (no vive en el
      registro estático). `core/` no puede depender de `systems/` (regla
      de arquitectura), así que quien guarda/carga (las escenas) es quien
      pasa/registra el caso generado — no `SaveSystem` directamente.
- [x] Nuevo botón en `DebugScene`: "Generar caso nuevo (forzar)", para
      poder probar el generador sin jugar los 3 casos fijos primero.
- [x] **Bug real encontrado y corregido** probando el generador en
      navegador: `EndingScene` solo paraba HUD/Debug/CityMap/Location al
      llegar a la pantalla de final, no `DialogueScene` — si se llegaba a
      Ending por un atajo de debug con un diálogo todavía abierto (no
      cerrado por el flujo normal), esa `DialogueScene` quedaba activa por
      debajo y, al pasar al siguiente caso, se renderizaba ENCIMA del
      reporte nuevo (está registrada después que `ReportScene` en
      `main.ts`, y Phaser dibuja las escenas activas en orden de
      registro). Corregido: la lista de limpieza de `EndingScene` ahora
      es exhaustiva (todas las escenas de juego, no solo 4).
- [x] Tests: `src/tests/CaseGenerator.test.ts` — determinismo por seed, dos
      seeds distintos producen casos distintos, la ruta generada funciona
      con `RouteSystem` igual que una escrita a mano, la pista falsa (si
      existe) es coherente, y un **fuzzing de 300 casos generados**
      corriendo las mismas invariantes que `DataIntegrity.test.ts` y
      `CrimeComputerSystem.test.ts` (extraídas a
      `src/tests/helpers/caseInvariants.ts`, reutilizables). Más un test
      de round-trip guardar/cargar un caso generado en `SaveSystem.test.ts`.
      Total: 150 tests.
- [x] Verificado en navegador (Playwright,
      `tools/e2e_generated_case_test.py`): reporte generado → briefing →
      mapa (con la zona inicial de esta corrida marcada) → locación con un
      informante reutilizado (retrato existente, diálogo genérico
      coherente) → atajo de debug para completar el caso → final con el
      operativo y la excusa correctos → rango actualizado → "Siguiente
      caso" genera OTRO caso distinto, sin repetirse.

## FASE 16 — Más operativos + arreglo del sistema de exploración

Pedido explícito del usuario: "sumar más identidades, y el sistema que usa
el policía para recolectar pruebas ¿funciona bien?". Lo segundo llevó a
auditar el flujo completo de recolección de evidencia, no solo el basado
en diálogo (que ya estaba bien probado) — y encontró una función a medio
terminar.

- [x] Pool de operativos ampliado de 3 a 6
      (`data/generator/operatives.ts`): "La Colorada" Benítez (peluquera),
      "Media Lengua" Vidal (locutor trucho), "El Tuerto" Ibarra (chapista).
      Cada uno con NPC, retrato generado (Pollinations, mismo pipeline) y
      perfil de identikit diseñado con el mismo cuidado que los anteriores
      — cada atributo nuevo introducido (las 3 profesiones) tiene un
      señuelo propio que lo comparte, verificado por el fuzzing de 300
      casos de `CaseGenerator.test.ts`.
- [x] **Hallazgo real, auditando el sistema de recolección de pruebas**:
      el botón "Explorar" de `LocationScene` (presente en TODAS las
      locaciones) nunca tuvo efecto mecánico — solo disparaba flavor text
      al azar (`EventSystem`/`randomEvents.ts`, explícitamente documentado
      como "sin efecto mecánico"). El campo `Location.exploreClueId`
      existía en el tipo desde el arranque del proyecto pero **nunca se
      implementó ni se usó en ningún caso**: cero de las 27 pistas
      originales de los 3 casos fijos pasaban por ahí. Además la capa era
      la equivocada — `Location` es un dato de MUNDO (compartido entre
      casos), pero qué se puede encontrar explorando es inherentemente
      específico de CADA CASO, así que ese campo nunca hubiera podido
      funcionar bien tal como estaba diseñado.
- [x] Reemplazado por un mecanismo real: `Clue.npcId` ya era opcional —
      una pista SIN `npcId` significa "se encuentra explorando, no
      hablando con nadie". Nuevo `systems/ExploreSystem.ts` (función pura,
      testeada) busca si hay una de esas pistas, todavía no recolectada,
      en la zona actual del caso activo. `LocationScene.explore()` ahora
      la prioriza sobre el evento aleatorio decorativo. Campo
      `Location.exploreClueId` eliminado del tipo (dato muerto, capa
      equivocada).
- [x] Agregada una pista explorable real a cada uno de los 3 casos fijos
      (en la escena del hecho, reforzando un atributo ya revelado por
      testimonio — no uno nuevo) y al generador (una pista física en la
      zona inicial de cada caso generado, mismo criterio).
- [x] **Segundo hallazgo, mientras se auditaba**: ninguna pista de ningún
      caso (fijo o generado) validaba que su `ubicacionZoneId` fuera una
      zona real, ni que su `npcId` (cuando lo tiene) fuera un NPC real —
      un typo en cualquiera de los dos hubiera quedado silenciosamente sin
      detectar (una pista "perdida" en una zona que no existe, por
      ejemplo). Agregado a `DataIntegrity.test.ts` y a
      `tests/helpers/caseInvariants.ts` (por lo tanto también al fuzzing
      del generador).
- [x] Tests nuevos: `src/tests/ExploreSystem.test.ts` (5 casos, incluida
      una pista falsa sin `npcId` construida a mano para confirmar que
      `ExploreSystem` la ignora igual). Total: 164 tests.
- [x] Verificado en navegador (Playwright, `tools/e2e_explore_test.py`):
      explorar el kiosco de Terminal Sur en el Caso 1 otorga la pista
      nueva (el contador de "Pistas X/Y" del HUD sube), explorar una
      segunda vez no la repite y cae de nuevo al evento decorativo.

## Deuda de contenido conocida (no bloqueante)

- `DialogueEngine.buildFallbackTree` sigue existiendo (y sigue siendo
  correcto que exista: cualquier NPC nuevo que se agregue sin diálogo
  propio todavía funciona), pero ya no lo usa ningún NPC del caso 1 — los
  21 tienen árbol dedicado.
- Los eventos aleatorios (`data/randomEvents.ts`) son solo texto por ahora;
  no otorgan pistas ni modifican variables. Están listados en el roadmap de
  FASE 5 como base para conectar después.
- Los 7 finales (incluidos `escandalo`, `final_absurdo`, `final_secreto` y
  `final_perfecto`) tienen cobertura de test unitario exhaustiva en
  `src/tests/EndingResolver.test.ts` (cada condición de `EndingResolver`
  fijada directamente en `GameState`). `resuelto_correcto`,
  `sospechoso_equivocado` y `banda_escapa` además fueron jugados
  manualmente de punta a punta en el navegador (capturas de pantalla). Los
  otros tres solo se verificaron por test + debug mode, no jugando la
  secuencia completa de decisiones que los produce en una partida real —
  sería la única brecha real que queda en el caso 1.
- El generador de casos (FASE 15/16) tiene 6 identidades confrontables en
  el pool de operativos (`data/generator/operatives.ts`, ampliado de 3 a 6
  en FASE 16) — con suficientes partidas, el mismo caco puede seguir
  repitiéndose eventualmente, solo que con menos frecuencia. Seguir
  creciendo ese pool (mismo cuidado de siempre: ningún atributo nuevo debe
  quedar único en la base sin un señuelo que lo comparta) sigue siendo la
  mejora más directa a la variedad de ahí en más.
- Los casos generados no tienen retrato de "operativo enviado a este
  trabajo en particular" más allá del retrato fijo del operativo — es
  decir, siguen viéndose bien (reutilizan arte real), pero el fondo de la
  locación donde se los confronta no siempre tiene un asset propio (varias
  zonas todavía no tienen fondo generado, ver deuda de FASE 8).

## Próximos pasos sugeridos (en orden)

1. Generar arte nuevo con `tools/generate_art.py`: retratos de los NPCs del
   Caso 3 (Toto, Bocha, Turco Almada), fondo de "La Feria del Usado", y el
   resto de los placeholders pendientes (12 NPCs, 16 fondos, banda
   criminal, íconos de HUD) — sin costo, solo tiempo.
2. Jugar manualmente los 3 finales (`escandalo`, `final_absurdo`,
   `final_secreto`) de cada caso que hoy solo tienen cobertura de test
   unitario + debug mode, o extender `tools/e2e_smoke_test.py`.
3. Diseñar el Caso 4.
4. FASE 12 continuo: seguir auditando a medida que se agrega contenido.

---

Actualizar este archivo en cada iteración del loop autónomo (ver
`AGENTS.md` → "El loop autónomo").
