# CHANGELOG.md

Formato: fecha, qué se hizo, por qué. Más reciente arriba.

## 2026-08-13 (continuación — FASE 17, pantalla dividida)

Pedido explícito tras ver el juego deployado: la fidelidad visual con
Carmen Sandiego tenía que ser real (mismo layout), no solo de tono. Se
mostró una captura del original — mapa de destinos + arte del lugar a la
izquierda, retrato + globo de diálogo a la derecha, barra de íconos abajo
— como referencia directa.

- Nuevo frame de pantalla dividida compartido entre `CityMapScene`,
  `LocationScene` y `DialogueScene` (`ui/frameLayout.ts` +
  `DestinationListPanel.ts` + `LocationArtPanel.ts` + `IconToolbar.ts`):
  lista de destinos y arte de la zona siempre visibles a la izquierda,
  contenido específico de cada escena a la derecha, barra de íconos fija
  abajo. `SuspectBoardScene`/`CrimeComputerScene`/`CaseFileScene`/
  `EndingScene` quedan fuera a propósito (son "pantallas de computadora"
  aparte, mismo criterio que el juego original).
- **Bug real encontrado y corregido** (mismo patrón que el de
  `EndingScene` de FASE 15): los botones de `DebugScene` que saltan de
  caso nunca paraban la escena de juego anterior, que quedaba dibujada
  ENCIMA de `ReportScene` con datos viejos — invisible antes del
  rediseño (los paneles no mostraban datos "en vivo"), pero evidente
  ahora. Corregido con un helper compartido (`ui/sceneCleanup.ts`) usado
  por `EndingScene` y `ReportScene` por igual.
- Los 4 scripts de regresión de Playwright reescritos con coordenadas
  nuevas, centralizadas en `tools/frame_coords.py` — el cambio de layout
  las volvió obsoletas a todas a la vez.
- Verificado en navegador con capturas revisadas a mano en cada paso (el
  bug de arriba no daba ningún error de consola, solo contenido visual
  incorrecto — "sin errores" no alcanza como prueba). `npm run
  typecheck`, `npm test` (164/164) y `npm run build` limpios.

## 2026-08-12 (continuación — FASE 16, más operativos + arreglo del sistema de exploración)

Dos pedidos en un mismo mensaje: sumar más identidades al generador, y una
pregunta directa sobre si el sistema de recolección de pruebas funciona
bien. Lo segundo llevó a una auditoría real, no una respuesta de memoria.

- Pool de operativos del generador ampliado de 3 a 6: "La Colorada"
  Benítez, "Media Lengua" Vidal, "El Tuerto" Ibarra — cada uno con NPC,
  retrato generado y perfil de identikit diseñado con el mismo cuidado que
  los anteriores (ningún atributo nuevo queda único en la base sin un
  señuelo que lo comparta). Confirmado con el fuzzing de 300 casos.
- **Hallazgo real auditando la recolección de pruebas**: el botón
  "Explorar", presente en todas las locaciones, nunca tuvo efecto
  mecánico — solo mostraba flavor text al azar. El campo
  `Location.exploreClueId` existía en el tipo desde el arranque del
  proyecto pero jamás se implementó ni se usó: cero de las 27 pistas
  originales pasaban por ahí, y la capa era la equivocada (`Location` es
  dato de mundo compartido entre casos; qué se encuentra explorando es
  específico de cada caso).
- Reemplazado por un mecanismo real: una pista sin `npcId` (el campo ya
  era opcional) significa "se encuentra explorando". Nuevo
  `systems/ExploreSystem.ts`, cableado en `LocationScene.explore()` con
  prioridad sobre el evento decorativo. Campo `exploreClueId` eliminado
  (dato muerto). Agregada una pista real explorable a cada uno de los 3
  casos fijos y al generador de casos.
- **Segundo hallazgo**: ninguna pista de ningún caso validaba que su
  `ubicacionZoneId` fuera una zona real ni que su `npcId` (si lo tiene)
  fuera un NPC real — un typo hubiera dejado una pista inalcanzable sin
  que ningún test lo detectara. Agregado a `DataIntegrity.test.ts` y a
  `tests/helpers/caseInvariants.ts` (por lo tanto también al fuzzing).
- 14 tests nuevos (`ExploreSystem.test.ts` + las validaciones de zona/NPC
  agregadas a los existentes). Total: 164 tests. Verificado en navegador
  (`tools/e2e_explore_test.py`): explorar otorga la pista una vez, no se
  repite, después cae al evento decorativo de siempre. `npm run
  typecheck`, `npm test` (164/164) y `npm run build` limpios; regresión
  completa de los 3 casos fijos y el generador sin cambios de
  comportamiento.

## 2026-08-12 (continuación — FASE 15, generador de casos procedural)

Pedido explícito: "no te puede aburrir en la tercera partida" — con 3
casos fijos, el ciclo se sentía igual desde la cuarta. Se construyó un
generador que arma cada caso combinando piezas del mundo existente en vez
de agregar casos escritos a mano indefinidamente (no escala). Mismo
mecanismo de fondo que usa Carmen Sandiego: criminal al azar, ruta al
azar, testigos al azar — ver detalle completo en `docs/GAME_DESIGN.md` →
"Generador de casos" y `docs/ROADMAP.md` → FASE 15.

- Nuevo `systems/CaseGenerator.ts` + pools en `data/generator/`
  (operativos, señuelos, informantes, excusas de crimen, plantillas de
  diálogo). Arma un `CaseDefinition` completo: operativo, ruta, sospechoso
  falso y quién da cada pista, todo al azar mezclando NPCs/zonas ya
  existentes en el mundo — no NPCs ni zonas nuevas por generación. El
  resultado es indistinguible, para el resto del motor, de un caso escrito
  a mano.
- `CaseManager`: los primeros `CASES.length` casos de la carrera son los
  fijos; de ahí en más cada caso se genera. `SaveSystem` gana un campo
  `generatedCase` para poder persistir/reconstruir un caso generado activo
  (no vive en el registro estático de casos).
- **Bug real encontrado y corregido** jugando el generador en el
  navegador: `EndingScene` no paraba `DialogueScene` al llegar a la
  pantalla de final por un atajo de debug (con un diálogo sin cerrar de
  por medio) — esa escena quedaba activa y, al pasar al siguiente caso, se
  renderizaba encima del reporte nuevo (está registrada después que
  `ReportScene` en `main.ts`, mismo tipo de bug de compositing entre
  escenas ya documentado para HUD/CityMap/Location, en un camino menos
  obvio). Corregido con una lista de limpieza exhaustiva.
- 6 tests nuevos en `src/tests/CaseGenerator.test.ts`, incluido un
  **fuzzing de 300 casos generados** contra las mismas invariantes de
  integridad y de "ninguna pista sola resuelve el identikit" que ya
  corrían sobre los casos fijos (invariantes extraídas a
  `src/tests/helpers/caseInvariants.ts` para reutilizarlas), más un test
  de round-trip guardar/cargar un caso generado. Total: 150 tests.
- Nuevo botón en `DebugScene`: "Generar caso nuevo (forzar)". Nuevo script
  de regresión `tools/e2e_generated_case_test.py`.
- Verificado de punta a punta en navegador: reporte generado → briefing →
  mapa (zona inicial de esa corrida) → locación con informante reutilizado
  → atajo de debug para completar el caso → final correcto → rango
  actualizado → "Siguiente caso" genera uno distinto. `npm run typecheck`,
  `npm test` (150/150) y `npm run build` limpios; regresión completa de
  los 3 casos fijos (`tools/e2e_smoke_test.py` + el test dedicado del
  Caso 3) sigue pasando sin cambios de comportamiento.

## 2026-08-12 (continuación — FASE 14, arte del Caso 3)

- Generados con Pollinations.ai (mismo pipeline y estilo que el primer
  lote — `tools/generate_art.py`) los 3 retratos y el fondo que le
  faltaban al Caso 3: Toto Ferradas, "Bocha" Ferreyra, Turco Almada, y el
  fondo de "Concesionaria El Rebusque". Registrados en
  `data/portraits.ts` y precargados automáticamente por `Preloader.ts`
  (dato, no código — ningún archivo de escena cambió). Verificado en
  navegador que el retrato de Toto y el fondo de la concesionaria se ven
  con el mismo estilo cel-shaded ya establecido.
- Sigue pendiente el resto del backlog de arte previo a esta sesión (12
  NPCs y 16 fondos de los Casos 1 y 2, banda criminal, íconos de HUD) —
  no formaba parte de lo pedido para el Caso 3, ver ROADMAP.
- `npm run typecheck`, `npm test` (144/144) y `npm run build` limpios.

## 2026-08-12 (continuación — FASE 14, pasada de UI terminal)

- Aplicada la estética "terminal" (ya usada en `ReportScene` y
  `CrimeComputerScene`) al resto de las escenas de juego:
  `CityMapScene`, `LocationScene`, `SuspectBoardScene`, `CaseFileScene` y
  `EndingScene`, que hasta ahora seguían con el estilo "Georgia serif"
  original. Cambio de bajo riesgo a propósito: solo tipografía
  (`FONTS.MONO` en vez de `'Georgia, serif'`) y una línea divisoria fina
  bajo cada título (`ui/TerminalDivider.ts`, nuevo), sin tocar ninguna
  coordenada, lógica ni el layout ya probado — incluido el workaround
  documentado del bug de compositing HUD/y<40 en `SuspectBoardScene`, que
  se dejó intacto.
- `createButton` (`ui/Button.ts`) gana un `fontFamily` opcional (default
  `'Georgia, serif'`, sin cambios para `MainMenu`/`DialogueScene`, que no
  forman parte de esta pasada) para poder pedir botones monospace en las
  escenas rediseñadas sin duplicar el componente.
- **Bug encontrado en el propio smoke test, no en el juego**: al revisar
  la captura de `CaseFileScene` para verificar el cambio, se notó que
  mostraba el overlay de "Explorar" de `LocationScene` en vez del
  expediente — el test clickeaba las coordenadas de "Expediente" (de
  `CityMapScene`) sin haber vuelto antes al mapa, y esas mismas
  coordenadas caen dentro del botón "Explorar" de la escena en la que
  realmente estaba parado. Sin error de consola, sin fallo del assert:
  un falso positivo silencioso que solo se vio revisando la imagen.
  Corregido agregando el paso de "Volver al mapa" que faltaba.
- Verificado en navegador (Playwright, capturas de las 5 escenas
  rediseñadas + regresión completa de ambos scripts de smoke test):
  sin errores de consola, sin solapamientos. `npm run typecheck`,
  `npm test` (144/144) y `npm run build` limpios.

## 2026-08-12 (continuación — FASE 14, Caso 3 y corrección de deducciones triviales)

- Implementado el Caso 3, "El Robo del Trofeo del Club" — el caso de
  ejemplo pedido originalmente (arranca en una zona inspirada en Liniers,
  con una pista sobre subirse a un colectivo de la línea 21, deduciendo
  la ruta hacia el resto de "El Cinturón"). Se construyó como un caso
  original más, no como una recreación literal: nueva zona "La Feria del
  Usado" (`feria_usados`), nueva locación, 3 NPCs nuevos (Toto Ferradas,
  testigo; "Bocha" Ferreyra, el caco, utilero de un club de barrio; Turco
  Almada, falso sospechoso), y una ruta de 3 paradas
  (feria_usados → palo_alto → casco_antiguo) que reutiliza varios NPCs ya
  existentes (Salerno, Salaberry, Petrocelli, Walter Chiodi, Naza, Egidio,
  Manteca) con diálogo enteramente nuevo propio de este caso. Motivo:
  con 2 casos, el ciclo automático de casos se repetía en la tercera
  partida — pedido explícito del usuario ("más cacos que atrapar").
- **Bug de diseño encontrado y corregido, dos veces, de forma retroactiva**:
  auditando los atributos del identikit de Bocha para que ningún atributo
  fuera "resolvible con una sola pista", se encontró que esa misma falla
  ya existía sin detectar en los casos anteriores: `profesion: 'Ingeniero
  trucho'` (Caso 1) y `vehiculo: 'Fiat Duna'` (Caso 2) eran, cada una,
  valores únicos en toda la base de sospechosos — cualquiera de esas dos
  pistas, sola, ya alcanzaba para emitir la orden de captura sin combinar
  nada. Corregido agregando 2 señuelos nuevos a `data/suspects.ts`
  (`senuelo_utilero_rival`, que también tapa el vehículo/profesión de
  Bocha, y `senuelo_ingeniero_trucho_2`, que tapa retroactivamente las de
  Contreras y Molina).
- Nuevo test genérico en `CrimeComputerSystem.test.ts`: para cada pista
  real que revela un atributo, en cualquier caso registrado, esa pista
  *sola* no debe alcanzar para acorralar a un único sospechoso. Sin este
  test, la falla de diseño de los Casos 1 y 2 hubiera seguido sin
  detectarse. Total: 25 tests solo en `CrimeComputerSystem.test.ts`,
  144 tests en todo el proyecto.
- Nuevo botón permanente en `DebugScene`: "Saltar a Caso N" por cada caso
  registrado (antes solo se podía reiniciar el caso actual) — necesario
  para poder probar el Caso 3 en el navegador sin jugar los dos
  anteriores primero, y útil en general para testear cualquier caso
  nuevo que se agregue de acá en adelante.
- Verificado de punta a punta en navegador (Playwright, saltando al Caso 3
  vía el nuevo botón de debug): reporte → briefing → colectivo 21 → 2
  saltos de ruta reconstruidos correctamente ("La Feria del Usado → Palo
  Alto → El Casco Antiguo") → identikit resuelto con 2 pistas (ojos +
  vehículo) → orden de captura → "⚠ Confrontar a El Bocha" → arresto →
  final "Procedimiento perfecto". Regresión completa de
  `tools/e2e_smoke_test.py` (Casos 1 y 2) sigue pasando sin cambios.
  `npm run typecheck`, `npm test` (169/169) y `npm run build` limpios.

## 2026-08-12 (continuación — FASE 14, audio: ambiente + estados dinámicos)

- `AudioManager` gana una segunda capa de audio (`ambientGain`, separada de
  `musicGain`) para sonidos de ambiente que suenan en simultáneo con la
  música, no en su lugar: `playAmbient(id)`/`stopAmbient()`, mismo
  mecanismo de loop por `setInterval` que `playMusic`/`stopMusic` pero con
  drones mucho más graves y silenciosos (gain ~0.05).
- Nuevo `data/ambient.ts`: mapea zona → ambiente (`urbano` por defecto,
  `agua` para las costeras/ribereñas — La Ribera, Costa Alta, El Delta,
  Barranca Norte, Puente Sur). `LocationScene` lo dispara al entrar a
  cualquier locación.
- 3 estados de música nuevos en `tracks.ts`: `reporte` (ReportScene, tono
  más solemne que el menú), `peligro` y `captura`. `peligro` reemplaza a
  investigación/interrogatorio automáticamente en cuanto se cruza el
  umbral de advertencia de deadline — y es genuinamente persistente, no
  solo un blip: `CityMapScene`/`LocationScene` chequean
  `gameState.deadlineWarningEmitted` en cada `create()`, así que la música
  de peligro se mantiene aunque el jugador siga navegando después del
  aviso. `captura` suena en `EndingScene` únicamente en finales exitosos
  (nuevo `CaseManager.isEndingExitoso()`, reutiliza el mismo set que ya
  decidía si sube de rango).
- Verificado: `npm run typecheck`, `npm test` (101/101), `npm run build` y
  regresión completa de `tools/e2e_smoke_test.py` sin cambios de
  comportamiento visual (el audio no tiene aserciones automatizadas propias
  — se revisó a mano que las llamadas nuevas no rompen ninguna escena).

## 2026-08-12 (continuación — FASE 14, transformación Carmen-AR)

Reforma estructural pedida explícitamente para acercar el loop del juego al
género clásico de persecución-por-mapa (sin copiar nada de ninguna
franquicia: solo la estructura). Detalle completo en `docs/ROADMAP.md` →
FASE 14 y `docs/GAME_DESIGN.md` → Loop principal.

- Eliminada la selección manual de caso: nueva `ReportScene` (reporte
  policial automático, con tipeo progresivo) reemplaza a
  `CaseSelectScene`/`CaseIntroScene` (borradas). Los casos se asignan en
  secuencia cíclica sobre `CASES`, nunca a mano.
- Nuevo `RouteSystem`: la persecución del caco pasó de un salto directo al
  destino final a una **ruta de varias paradas** reconstruida una por una
  en el pizarrón. Esto dejó a `DeductionSystem` sin ningún uso en
  producción — se eliminó junto con su test dedicado.
- Nuevo Sistema de Inteligencia Criminal (`CrimeComputerSystem` +
  `data/suspects.ts` + `CrimeComputerScene`): identikit de 6 atributos
  armado con pistas, más una **orden de captura obligatoria** antes de
  poder confrontar al sospechoso (bloqueado en `LocationScene` si no está
  emitida). **Bug de diseño propio encontrado y corregido**: el primer
  identikit era resoluble con una sola pista porque un señuelo no
  compartía ningún atributo con el sospechoso real; se ajustó para que
  compartan `comida`, exigiendo una segunda pista distinta.
- Nuevo sistema de rangos (`data/ranks.ts`, 7 niveles) ligado a
  `gameState.casosResueltos`, progreso de carrera persistente entre casos.
- Caso 1 y Caso 2 migrados a la estructura nueva (`ruta`, `objetoRobado`,
  `victima`, `fechaHoraDelHecho`, `revealsAttribute` en las pistas
  relevantes, pistas/diálogos nuevos donde hacía falta un atributo más).
- Texto progresivo tipo terminal (`TypewriterText`, salteable con click,
  con sonido de tecleo sutil) en diálogos y reportes; pasos placeholder al
  entrar a una locación.
- **Bug real encontrado y corregido durante la verificación**:
  `ReportScene` calculaba la posición Y de cada línea con una altura fija,
  sin contar que el texto de "objeto sustraído" podía envolver a 2 líneas
  — la línea "VÍCTIMA" quedaba superpuesta encima. Corregido midiendo la
  altura real del objeto de texto renderizado (`obj.height`) para avanzar
  el cursor Y, en vez de asumir una sola línea.
- `tools/e2e_smoke_test.py` reescrito de punta a punta para el nuevo flujo
  (antes probaba selección de caso y persecución de un solo salto, ambos
  ya inexistentes). Durante la escritura del script se encontró y corrigió
  un error de coordenadas propio (un click a la altura equivocada del
  botón "Emitir orden de captura" dejaba el resto del test corriendo en
  blanco sobre la misma pantalla sin fallar — un falso positivo silencioso
  que solo se detectó comparando capturas de pantalla, no logs).
- 23 tests nuevos: `RouteSystem.test.ts`, `CrimeComputerSystem.test.ts`
  (incluye un chequeo genérico que corre sobre todos los casos
  registrados, no solo el caso 1), `Ranks.test.ts`, y extensión de
  `DataIntegrity.test.ts` con validación de `ruta` y de que el identikit
  completo de cada caso identifique únicamente al sospechoso real. Total:
  101 tests, todos verdes.
- Verificado de punta a punta en navegador (Playwright): reporte sin
  selección de caso → briefing → pista → ruta reconstruida en 2 saltos →
  identikit armado con 2 pistas → orden de captura → confrontación
  desbloqueada → captura → final "Procedimiento perfecto" con rango →
  "Siguiente caso" carga el Caso 2 automáticamente, de nuevo sin pantalla
  de selección. `npm run typecheck`, `npm test` (101/101) y `npm run build`
  limpios en cada paso.
- Pendiente (documentado en ROADMAP FASE 14, no bloqueante): pasada de UI
  tipo terminal para el resto de las escenas (hoy solo `ReportScene` y
  `CrimeComputerScene` la tienen), sonidos ambiente por zona y estados de
  música dinámica adicionales, Caso 3 diseñado ya sobre la estructura
  nueva.

## 2026-08-12 (continuación — FASE 8, primer lote de arte)

- Intentado Higgsfield para el arte definitivo: el `get_cost` preflight no
  advertía ningún problema, pero el envío real de la generación falló con
  `Requires basic plan or higher` en los 4 pedidos del primer lote. Por
  indicación del usuario, se cambió a **Pollinations.ai** (gratuito, sin
  cuenta ni API key).
- Encontrado el estilo visual viable a través de iteración de prompt: el
  backend real servido por Pollinations (`sana`, no `flux` pese a pedirlo)
  tiende a un look fotorrealista por default; forzando "flat cel shaded /
  thick outlines / stylized caricature" en el prompt se logró una
  ilustración 3D-caricaturesca con luz de sodio amarilla consistente con
  la paleta ya documentada del juego (`#e8b84b` sobre `#1b1f2a`).
- Generado el primer lote: 10 retratos (protagonista + Bracamonte, Simón,
  Reissig, Petrocelli, Naza, Ithurbide, Contreras, el camionero, Chiche
  Molina) + 3 fondos (Kiosco de Simón, Muelle La Anguila, Comisaría 0).
  Guardados en `public/assets/characters/` y `public/assets/backgrounds/`.
- Nuevo `src/data/portraits.ts` (mapa npcId/locationId → clave de
  textura), `Preloader.ts` ahora precarga estas imágenes, y
  `DialogueScene`/`MainMenu`/`LocationScene` las muestran cuando existen
  sin romper nada cuando no existen (el resto del elenco sigue sin
  retrato, contenido pendiente, no un bug).
- Pipeline guardado en `tools/generate_art.py` para generar el resto sin
  costo. Nota técnica: usar `curl` vía `subprocess`, no `urllib` de
  Python — falla por certificados SSL del sistema en este macOS.
- Verificado en navegador (Playwright): menú, briefing y diálogo con
  retrato se ven correctamente, sin solapamientos ni errores de consola.
  Regresión completa de ambos casos (`tools/e2e_smoke_test.py`) sigue
  pasando. `npm run typecheck`, `npm test` (78/78) y `npm run build`
  limpios (build final: 2.0 MB incluyendo los 13 assets de arte).

## 2026-08-12 (continuación — FASE 12/13, auditoría y build final)

- Auditoría de calidad completa (checklist de TESTING.md, ver informe en
  ROADMAP.md). Encontrado y corregido: el flujo de guardado nunca se
  había probado jugado de punta a punta a través de la UI real (guardar
  → cerrar el juego → "Continuar" desde el menú → elegir slot → cargar) —
  se probó y funciona correctamente.
- `npm audit`: 0 vulnerabilidades. Build final: 1.4 MB totales, de los
  cuales el código propio del juego pesa 88 KB (el resto es Phaser) —
  tamaño razonable para deploy estático.
- Estado final de esta sesión: `npm run typecheck`, `npm test` (78/78) y
  `npm run build` limpios en cada paso, sin excepciones.

## 2026-08-12 (continuación — FASE 10, Caso 2)

- Implementado el Caso 2, "El Contador Que Faltaba" (`caso2_contador.ts` +
  `caso2_dialogues.ts`): Chiche Molina desaparece tras encontrar un
  faltante en los libros de Los Administradores. 4 pistas reales + 1
  falsa, reutilizando NPCs existentes (Pipo, Sagasti, Yamila, Egidio,
  Naza) y sumando 2 nuevos (Chiche Molina, Bruno Aguirre "El Pescador").
- Antes de escribir el caso 2 se corrigieron dos deudas de arquitectura
  que lo hubieran roto en silencio (ningún test las detectaba porque solo
  existía un caso para probar contra):
  1. `EndingResolver` tenía hardcodeados los nombres de flag del Caso 1
     (`contreras_arrestado`, etc.) — renombrados a genéricos
     (`sospechoso_arrestado/soborno/intimidado/liberado`).
  2. **Bug real corregido**: `LocationScene` mostraba a los NPCs "de rol
     especial" (sospechoso real y falso) desde una lista estática por
     locación. Esto permitía confrontar/arrestar al falso sospechoso SIN
     haber presentado ninguna hipótesis en el pizarrón — y en ese caso el
     final quedaba mal etiquetado como "resuelto_correcto" en vez de
     "sospechoso_equivocado". Ahora la aparición de ambos roles depende
     exclusivamente de `CaseDefinition` + `hypothesisDestinoZoneId`, nunca
     de datos estáticos de la locación. Verificado con un test dedicado
     (jugado en navegador: ir directo a Km 20 sin pizarrón ya no muestra
     al camionero).
- Nueva pantalla `CaseSelectScene` (Menú → "Nueva Partida" → elegir caso)
  — aparece automáticamente en cuanto hay más de un caso registrado, sin
  tocar el resto del flujo.
- Corregido: `CaseIntroScene` mostraba el texto fijo "CASO 1" sin importar
  qué caso se haya elegido. Ahora calcula el número real.
- `DataIntegrity.test.ts` y `EndingResolver.test.ts` se generalizaron para
  correr sobre **todos** los casos registrados (antes solo cubrían el
  caso 1) — de haber existido antes, hubieran detectado el bug de
  `LocationScene` mencionado arriba. Total: 78 tests, todos verdes.
- Verificado en navegador (Playwright): flujo completo de ambos casos,
  briefing correcto por caso, pista real obtenida y reflejada en el
  expediente del caso 2, sin errores de consola. `npm run typecheck`,
  `npm test` y `npm run build` limpios.

## 2026-08-12 (continuación — FASE 9, audio)

- Implementado `AudioManager` (`src/audio/`) con música y SFX sintetizados
  vía Web Audio API — sin depender de archivos de audio ni de
  herramientas de generación externas, siguiendo la regla de no bloquear
  el desarrollo esperando audio definitivo.
- 4 tracks musicales por contexto (menú, investigación, interrogatorio,
  persecución) y 6 sonidos de UI (click, diálogo abierto, pista
  conseguida, viaje, advertencia de tiempo, error). Los SFX reactivos a
  pistas/tiempo se conectan directo al `EventBus`, sin tocar las escenas
  que ya emitían esos eventos.
- `core/` y `data/` siguen sin depender de Web APIs de browser: el
  `AudioManager` vive en `src/audio/`, separado a propósito para no
  romper los unit tests de Node.
- Botón de mute agregado al HUD.
- Verificado en navegador (Playwright): flujo completo + toggle de mute,
  sin errores de consola. `npm run typecheck`, `npm test` (55/55) y
  `npm run build` limpios.

## 2026-08-12 (continuación — FASE 3 completa)

- Escritos árboles de diálogo completos para los 12 NPCs que usaban el
  fallback genérico (federico_salaberry, hombre_de_las_palomas,
  marta_yulis, pipo_escanciano, perla_sagasti, media_cuadra_ibanez,
  yamila_cospito, egidio_paz, manteca_ruiz, walter_chiodi,
  gustavo_salerno, beba_corvalan). Los 21 NPCs del caso 1 tienen diálogo
  propio.
- Agregadas 4 pistas opcionales (no requeridas para resolver el caso) que
  completan las categorías de pista que faltaban en el diseño: visual
  (Egidio Paz), económica (Salerno), absurda (el Hombre de las Palomas) y
  contradictoria (Walter Chiodi — contradice, a propósito, la pista de las
  palomas real).
- Refactor: los diálogos del caso 1 se movieron a
  `src/data/cases/caso1_dialogues.ts` (el archivo del caso había crecido
  demasiado mezclando pistas + 18 árboles de diálogo).
- Nuevo `src/tests/DataIntegrity.test.ts` (13 tests): valida que todo NPC,
  pista y zona referenciada desde diálogos/locaciones exista realmente —
  pensado para explotar rápido ante un id mal tipeado al agregar
  contenido. Total: 55 tests, todos verdes.
- Verificado sin regresiones: typecheck, build, y los NPCs nuevos jugados
  en navegador (Villa Quieta → Marta Yulis / Walter Chiodi).

## 2026-08-12 (continuación — FASE 11, testing)

- Agregado `npm test` (Node `--test` nativo + `tsx`, sin dependencias de
  test runner externas) con 42 unit tests sobre `ClueManager`,
  `DeductionSystem`, `ReputationSystem`, `TimeSystem`, `CaseManager` y
  `SaveSystem`.
- Cobertura exhaustiva de los **7 finales** en
  `src/tests/EndingResolver.test.ts`: cada condición de `EndingResolver`
  se verifica fijando el `GameState` directamente, en vez de depender de
  jugar manualmente la secuencia exacta de decisiones que la produce.
- Corregido un bloqueante real para poder testear: `core/EventBus.ts`
  usaba `Phaser.Events.EventEmitter`, y el bundle de Phaser 4 asume
  `window` al evaluarse — cualquier import de `systems/`/`core/` fallaba
  en Node puro. Se reemplazó por un `EventEmitter` propio de ~20 líneas
  (mismo `on`/`off`/`emit` que se usaba, sin soporte de `context` porque
  no se usaba en ningún lado del código). `core/` y `data/` ahora no
  dependen de Phaser en absoluto — mejora también de arquitectura, no solo
  de testability.
  Verificado sin regresiones: `npm run typecheck`, `npm run build`, y el
  flujo completo en navegador (menú → diálogo → pistas → expediente →
  pizarrón → los 3 finales jugables) siguen funcionando igual que antes.
- Guardado `tools/e2e_smoke_test.py`: consolida en un script versionado
  (antes vivía como archivos sueltos en el scratchpad de la sesión) el
  smoke test de Playwright que juega el flujo principal y 3 de los 7
  finales de punta a punta en un navegador real.

## 2026-08-12 (continuación — FASE 1 a 7)

- Implementada la arquitectura completa: `core/` (EventBus, GameState,
  Constants, TimeSystem, SaveSystem), `data/` (zones, locations, npcs,
  gang, randomEvents, cases/), `systems/` (CaseManager, ClueManager,
  DialogueEngine, DeductionSystem, ReputationSystem, EventSystem,
  EndingResolver), `scenes/` (Boot, Preloader, MainMenu, LoadGameScene,
  CaseIntroScene, CityMapScene, LocationScene, DialogueScene,
  SuspectBoardScene, CaseFileScene, EndingScene, HUDScene, DebugScene).
- Cargado el mundo completo: 19 zonas, 19 locaciones (13 lugares bizarros +
  6 genéricos), 21 NPCs (20 + el camionero de catering del final
  "sospechoso equivocado"), banda "Los Administradores" (8 miembros).
- Primer caso "El Operativo de las Medialunas" jugable de punta a punta:
  briefing → mapa → interrogatorios → pistas → pizarrón de sospechosos →
  confrontación → 7 finales posibles.
- Corregido: Phaser 4 no expone `export default` en su build ESM — todos
  los imports se cambiaron a `import * as Phaser from 'phaser'`.
- Corregido: el campo `data` de `DialogueScene` colisionaba con
  `Phaser.Scene.data` (DataManager nativo) — renombrado a `sceneData`.
- Corregido: el HUD (y a veces CityMap/Location) quedaba visualmente
  encimado sobre `EndingScene` cuando el final se disparaba desde una
  escena superpuesta (DebugScene). Causa: parar otras escenas desde
  `create()` en el mismo tick en que el propio `EndingScene` es procesado
  por el `SceneManager` de Phaser podía perderse. Solución: diferir esos
  `scene.stop(...)` con `this.time.delayedCall(0, …)`.
- Corregido: el final "sospechoso equivocado" no era alcanzable jugando
  (Km 20 no tenía a nadie para arrestar por error). Se agregó el NPC
  `camionero_catering` y un `falsoSospechosoDialogue` en el caso.
- Ajustado el texto del HUD (se solapaba con el botón "Guardar").
- Verificado con Playwright headless (sin errores de consola): flujo
  completo nueva partida → diálogo → pistas → expediente → pizarrón;
  guardado en localStorage; los 3 finales jugables manualmente
  (`resuelto_correcto`, `sospechoso_equivocado`, `banda_escapa`).
- `npm run typecheck` y `npm run build` limpios.

## 2026-08-12

- Diagnóstico inicial: repositorio vacío. Se eligió Phaser 3 + TypeScript +
  Vite (scaffold oficial `phaserjs/template-vite-ts`) por ser el stack más
  simple y estándar para un juego 2D en navegador, sin motor preexistente
  que respetar.
- Se removió el script de telemetría (`log.js`) del template y se
  simplificaron los scripts de `package.json`.
- `npm audit fix` aplicado: 5 vulnerabilidades altas (cadena de
  vite/rollup/postcss/nanoid/picomatch, todas de dev-tooling) resueltas sin
  cambios breaking.
- Creados `AGENTS.md` y toda la documentación base en `/docs`
  (GAME_DESIGN, ARCHITECTURE, ROADMAP, WORLD, CHARACTERS, STORY,
  ART_DIRECTION, TESTING, CHANGELOG).
- Definido el mundo ficticio ("El Cinturón", 19 zonas inspiradas en
  CABA/AMBA con nombres 100% originales), el protagonista (Inspector
  Ezequiel "Fierro" Farías), 20 NPCs, la banda "Los Administradores" (8
  miembros) y el primer caso jugable ("El Operativo de las Medialunas") con
  su cadena de pistas y 7 finales.
