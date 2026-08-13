# GAME_DESIGN.md — El Último Procedimiento

## Premisa

Un policía de dudosa reputación investiga a una banda criminal ficticia y
absurda a través de una versión ficticia y caricaturesca de CABA y el
conurbano ("El Cinturón"). Género: persecución / investigación / deducción,
en la tradición de los juegos clásicos de perseguir a un criminal por un
mapa combinando pistas — pero argentinizado y con contenido 100% original.
Vista 2D, jugable en navegador.

Todo el contenido (personajes, lugares, la banda) es 100% original. No se
representa a personas reales ni se copian mapas, textos, personajes, arte ni
código de ninguna franquicia existente. La inspiración se limita a la
ESTRUCTURA del género: el jugador no elige una misión, un caso le llega
solo; sigue a un criminal en fuga a través de una ruta de varias paradas,
recolectando pistas para reconstruir el próximo paso; y usa esas pistas para
armar un identikit que finalmente permite emitir una orden de captura.

## Prioridad de desarrollo

`FUNCIONALIDAD > ESTABILIDAD > JUGABILIDAD > ARTE > POLISH`

## Loop principal

El jugador **nunca elige un caso**. El caso le llega automáticamente al
arrancar (o al resolver el anterior), como un llamado de guardia real:

```
DESPERTAR / REPORTE (ReportScene) → BRIEFING DEL JEFE → ESCENA DEL HECHO
    → INVESTIGAR EL LUGAR (hablar con NPCs, explorar) → CONSEGUIR PISTAS
    → PIZARRÓN: reconstruir la PRÓXIMA parada de la ruta del caco
      (no el destino final — es una ruta de varias paradas, RouteSystem)
    → VIAJAR a esa parada → nuevas pistas → repetir hasta la parada final
    → SISTEMA DE INTELIGENCIA CRIMINAL: armar el identikit del sospechoso
      combinando los atributos revelados por las pistas (cabello, ojos,
      vehículo, profesión, hobby, comida) hasta acorralar a un único
      sospechoso coincidente
    → EMITIR ORDEN DE CAPTURA (obligatoria — sin orden no se puede confrontar)
    → CONFRONTAR / CAPTURAR en la parada final
    → FINAL DEL CASO → sube de RANGO → SIGUIENTE CASO (automático, de nuevo)
```

El jugador nunca recibe instrucciones explícitas del tipo "andá a tal lugar".
Recibe pistas ambiguas (algunas falsas) y tiene que decidir tanto la próxima
parada de la ruta como, más adelante, qué atributos del identikit ya
conoce. Puede equivocarse, perder tiempo, o confrontar a un señuelo sin
tener la orden de captura correcta — el juego sigue siendo "completable" en
todos los casos, solo que no todos los finales son buenos.

## Sistemas principales

### Pistas (`docs/WORLD.md` tiene el detalle de contenido; el modelo vive en
`src/data/clues.ts` y se procesa en `src/systems/ClueManager.ts`)

Cada pista tiene: `id`, `descripcion`, `ubicacion`, `personajeId`,
`categoria` (geografica | temporal | cultural | visual | economica |
criminal | absurda | falsa | contradictoria), `confiabilidad` (0–100),
`destinosPosibles[]`. Las pistas falsas siempre tienen una contradicción
verificable con otra pista real (una fecha que no cierra, una zona
incompatible con un horario) para que el jugador pueda descartarlas por
deducción, no por azar. Opcionalmente, una pista puede tener
`revealsAttribute: { key, value }` — revela un atributo del identikit del
sospechoso (ver Sistema de Inteligencia Criminal más abajo). Las pistas
falsas nunca revelan atributos (corromperían el identikit sin dar ninguna
pista de que algo anda mal).

Dos formas de conseguir una pista, ambas reales (ninguna es decorativa):
hablándole a un NPC (`npcId` presente, vía diálogo) o **explorando** el
lugar sin hablar con nadie (`npcId` ausente — `systems/ExploreSystem.ts`
encuentra la primera pista sin recolectar de la zona actual cuando se
aprieta "Explorar" en `LocationScene`, antes de caer al evento decorativo
de siempre).

### Persecución por ruta (RouteSystem)

El caco (criminal) no salta directo a un destino final: se mueve por una
**ruta de varias paradas** (`CaseDefinition.ruta: string[]`, mínimo 2,
empieza en la zona del hecho y termina en el destino correcto). En el
"Pizarrón" (`SuspectBoardScene`) el jugador no elige el destino final de
entrada: reconstruye la ruta **parada por parada**, adivinando cuál es la
PRÓXIMA zona con las pistas que ya tiene. Acertar una parada intermedia
avanza `gameState.rutaProgresoIndex` y traslada al jugador ahí a seguir
investigando; acertar la parada final habilita la confrontación (una vez
emitida la orden de captura). Adivinar un destino falso conocido da
"sospechoso equivocado"; cualquier otra cosa es "no concluyente". Esto es
deliberadamente genérico: cualquier caso con un `ruta` de N zonas funciona
sin tocar el motor (`src/systems/RouteSystem.ts`).

### Sistema de Inteligencia Criminal (Crime Computer / identikit)

Aparte de la ruta geográfica, el jugador arma un **identikit** del
sospechoso: seis atributos (cabello, ojos, vehículo, profesión, hobby,
comida), cada uno revelado por una pista distinta. La base de sospechosos
(`src/data/suspects.ts`) incluye señuelos que comparten uno o más atributos
con el caco real a propósito, para que hagan falta VARIAS pistas de
atributo — nunca una sola — antes de acorralar a un único sospechoso
coincidente (`src/systems/CrimeComputerSystem.ts`). Solo cuando queda
exactamente un sospechoso, y es el real, se puede **emitir la orden de
captura** (`gameState.ordenCapturaEmitida`) — sin orden, `LocationScene`
bloquea la opción de confrontar aunque el sospechoso esté físicamente ahí.

### Rangos

Resolver un caso con éxito incrementa `gameState.casosResueltos`, que
determina el rango actual (`src/data/ranks.ts`, 7 niveles, de "Cadete de
Guardia" a "Leyenda de El Cinturón"). El rango se muestra en el reporte de
cada caso nuevo y en la pantalla de final. Es progreso de carrera: no se
resetea entre casos, solo con "Nueva Partida" (`gameState.resetCareer()`).

### Interrogación

Diálogos ramificados. Acciones disponibles: `preguntar`, `insistir`,
`intimidar`, `bromear`, `mentir`, `mostrar evidencia`, `ofrecer favor`,
`retirarse`. Cada una modifica `confianza` (con ese NPC), `sospecha` (del
NPC hacia el jugador) y las estadísticas globales de reputación. Un NPC con
`confianza` baja no entrega su pista principal aunque se le pregunte bien.

### Tiempo

Cada acción tiene un costo en minutos (ver `Constants.ts` → `TIME_COSTS`).
El caso tiene un `deadline`. Pasado cierto umbral de tiempo restante ocurren
eventos negativos (una pista desaparece, un sospechoso cambia de destino, la
banda avanza un paso). Esto crea presión sin ser un timer en tiempo real:
todo avanza por turnos de acción del jugador.

### Reputación

Cinco variables globales: `reputacionPolicial`, `reputacionCallejera`,
`corrupcion`, `confianzaNpcsPromedio` (derivada), `sospecha`. Decisiones en
diálogos e interrogatorios las modifican. Algunas ramas de diálogo y algunos
finales están condicionados por umbrales de estas variables.

### Casos como datos

Un caso (`src/data/cases/*.ts`) es un objeto de datos: id, título,
descripción, objeto robado, víctima, fecha/hora del hecho, sospechoso,
zona inicial, `ruta[]` (la persecución completa), destino correcto,
destinos falsos, pistas (reales y falsas, algunas con `revealsAttribute`),
pistas requeridas para resolverlo, deadline y tabla de finales posibles.
Los primeros `CASES.length` casos de la carrera son estos 3 casos escritos
a mano — la "apertura" del juego. De ahí en más, ver Generador de casos.

### Generador de casos (por qué el juego no se repite)

Con solo un puñado de casos fijos, ciclar sobre ellos hace que la tercera
partida ya se sienta igual a la primera — el problema real que Carmen
Sandiego resuelve componiendo cada partida a partir de piezas sueltas
(quién es el criminal, por dónde escapa, quién da cada pista) en vez de
tener "casos" escritos de punta a punta. `CaseGenerator`
(`src/systems/CaseGenerator.ts`) hace lo mismo acá: arma un
`CaseDefinition` nuevo combinando, al azar, piezas que ya existen en el
mundo:

- **Operativo** (el caco): uno al azar de `data/generator/operatives.ts`
  (6 identidades) — reutiliza identidades ya jugables (con retrato,
  atributos fijos de identikit y escena de confrontación) en vez de
  inventar personajes sin cara. Narrativamente: no siempre manda "Los
  Administradores" al mismo tipo al mismo trabajo.
- **Ruta**: un camino al azar por el mapa de 21 zonas, pero solo sobre
  zonas DIRECTAMENTE CONECTADAS entre sí (ver "Red de conexiones entre
  zonas" más abajo) — no cualquier combinación de 21 zonas, un camino real
  y recorrible por el mapa. Las paradas intermedias (todas menos la
  última) se eligen solo entre zonas que tienen al menos un informante
  viviendo ahí — si no, nadie podría darte la pista de por dónde sigue el
  caco. La parada final puede ser cualquier zona, incluidas las que no
  tienen NPCs estáticos (mismo patrón que "El Delta"/"Km 20" en los casos
  fijos). Si no encuentra un camino conectado con la longitud preferida
  (3-4 paradas), reintenta con longitudes más cortas antes de fallar —
  ver `CaseGenerator.buildRuta`.
- **Informantes**: `data/generator/informants.ts` (19 NPCs civiles, ni
  operativos ni señuelos ni el jefe) — se les asigna al azar quién da la
  pista de la próxima parada y quién revela cada uno de los 6 atributos
  del identikit. Un mismo informante puede terminar con más de una pista
  para dar (se fusionan en un solo árbol de diálogo, igual que en los
  casos fijos). El diálogo se arma con bancos de frases variadas
  (`data/generator/dialogueTemplates.ts`), no siempre la misma línea para
  el mismo dato.
- **Sospechoso falso** y **excusa del crimen** (qué se robaron, a quién):
  también al azar, de pools chicos (`bystanders.ts`, `crimeFlavors.ts`)
  deliberadamente distintos del contenido de los 3 casos fijos.

El objeto resultante es un `CaseDefinition` idéntico en forma al de un
caso escrito a mano — ningún system ni scene sabe (ni necesita saber) si
el caso activo es fijo o generado. `CaseManager.startNextCaseInSequence()`
usa los fijos mientras alcancen y generador de ahí en más; los casos
generados se cachean en memoria y, si el jugador guarda la partida, se
persiste su contenido completo en el save (ver `SaveData.generatedCase`)
para poder reconstruirlos al cargar.

Verificado con fuzzing (300 casos generados con seeds distintos, ver
`src/tests/CaseGenerator.test.ts`) contra las mismas invariantes de
integridad, de "ninguna pista sola resuelve el identikit" y de "la ruta es
un camino conectado y se puede ganar antes del deadline" que los casos
fijos — no es una demo, tiene la misma vara de calidad.

## Red de conexiones entre zonas

Reclamo del jugador: "viajo para todos lados sin perder" — el mapa
mostraba SIEMPRE las 21 zonas del mundo como destino posible desde
cualquier lado, así que en la práctica no había límite real de movimiento
más allá del reloj. Eso también rompía la fidelidad visual al formato
clásico: en Carmen Sandiego original, desde cada ciudad solo se ve una
lista corta de ciudades CONECTADAS ("ver conexiones"), no el mapa entero.

`src/data/zoneConnections.ts` define un grafo de adyacencia fijo y
simétrico entre las 21 zonas (si A conecta con B, B conecta con A — como
una red de trenes, no calles de un solo sentido), verificado conexo
completo (cualquier zona es alcanzable desde cualquier otra) y compatible
con las `ruta` de los 3 casos fijos (ver `src/tests/ZoneConnections.test.ts`).
El menú numerado de acciones (`ui/ActionMenuPanel.ts`, ver "Pantalla
dividida" más abajo) usa este grafo: lista "Viajar a X" solo para las
zonas conectadas a la actual — igual que la pantalla de "ver conexiones"
clásica.

Efecto en el gameplay: los informantes de atributo del identikit (elegidos
al azar entre 19 NPCs, en cualquier zona) ya no están todos "a un click" —
llegar hasta ellos puede necesitar varios saltos reales por el grafo, y
cada salto cuesta `TIME_COSTS.VIAJAR_MINUTOS` (45 min) contra el deadline
del caso. Recorrer un caso de punta a punta jugando perfecto (sin errores,
sin pistas falsas) ya no es gratis: hay una tensión real entre explorar
todo y llegar a tiempo.

Como el menú de acciones no lista la zona en la que estás parado (solo
sus vecinas), `CityMapScene` agrega "Quedarme e investigar acá" como
primer ítem del menú, para entrar a `LocationScene` sin viajar y sin
costo de tiempo.

### Mapa gráfico de viaje

Pedido explícito (FASE 21): "viajar" no podía ser solo una línea de texto
en el menú ("Viajar a San Telmo") — tenía que sentirse como un mapa de
verdad. `TravelMapScene` dibuja las 21 zonas como nodos (posiciones
hand-authored en `data/zoneMapPositions.ts`, siguiendo a grandes rasgos
la geografía real del AMBA — norte arriba, sur abajo, el río a la
derecha) conectados por líneas según `zoneConnections.ts`. La zona actual
se resalta en ámbar, sus conexiones directas en verde y son clickeables
(disparan la misma función `travelTo` que ya usa el menú de texto — mismo
costo de tiempo, mismo respeto por el grafo), el resto queda atenuado
solo para dar contexto geográfico. Se abre con "Ver el mapa" desde el
menú de acciones de `CityMapScene`/`LocationScene`; es una forma
ALTERNATIVA de disparar el viaje, no reemplaza la lista de texto (que
sigue existiendo para quien prefiera no usar el mapa).

### Deadline calibrado, no fijo

Con la red de conexiones, el costo real de resolver un caso depende de
DÓNDE caen sus informantes respecto de la ruta principal — un
`deadlineMinutos` fijo (720 para todos) le sobraba tiempo a algunos casos y
directamente hacía IMPOSIBLE ganar otros incluso jugando perfecto (los 3
casos fijos necesitaban 725-745 min óptimos contra un deadline de 720).
`src/systems/timeEstimate.ts` resuelve esto:

- `estimateOptimalMinutos(caso)`: cuánto necesita, como mínimo, un jugador
  perfecto — heurística de vecino más cercano (tipo "vendedor viajante")
  sobre las zonas con informante, más diálogo y exploración, usando BFS
  sobre el grafo de conexiones para la distancia entre zonas.
- `calibrateDeadlineMinutos(caso)`: ese óptimo con un margen del 40%
  (suficiente para alguna vuelta de más, seguir la pista falsa antes de
  descartarla, o esperar una vez — sin volver a sentirse "sin límite"),
  redondeado a múltiplos de 15 minutos.

`CaseGenerator` calcula el deadline de cada caso generado dinámicamente con
`calibrateDeadlineMinutos`. Los 3 casos fijos tienen su `deadlineMinutos`
recalculado a mano con la misma fórmula (1050 / 1020 / 1035). La invariante
`deadlineMinutos >= estimateOptimalMinutos(caso)` se verifica en
`tests/helpers/caseInvariants.ts` para TODO caso, fijo o generado (incluidos
los 300 del fuzzing) — un caso imposible de ganar es, directamente, un bug.

## Pantalla dividida

La estructura del loop (reporte automático, ruta, identikit) coincidía con
el formato clásico de persecución desde la FASE 14, pero la PRESENTACIÓN
visual seguía siendo genérica (paneles centrados, botones de texto). Pedido
explícito, dos veces: primero "igual, pero argentinizado" (FASE 17), y
después, con referencias visuales concretas del juego original de 1985,
"visualmente tiene que ser igual" (FASE 20) — el layout de FASE 17 tenía
la idea correcta pero no calcaba la estructura real: gráfico+texto a la
izquierda, un ÚNICO menú de acciones numerado a la derecha, no una lista
de destinos separada de una barra de íconos separada de un panel de
contenido.

`CityMapScene`, `LocationScene` y `DialogueScene` comparten un mismo frame
(coordenadas centralizadas en `src/ui/frameLayout.ts`, para que navegar
entre las tres se sienta como "la misma pantalla" cambiando de contenido,
no tres pantallas distintas):

- **Columna izquierda, arriba**: gráfico grande (`ui/LocationArtPanel.ts`
  en CityMap/Location — arte de la zona actual; retrato de con quién
  hablás en Dialogue, ver `DialogueScene.renderPortrait`). Mismo lugar,
  mismo tamaño, sea cual sea el contenido.
- **Columna izquierda, abajo**: panel de texto (`ui/DescriptionTextPanel.ts`
  en CityMap/Location — descripción del caso o del lugar; globo de
  diálogo en Dialogue). Calca el "gráfico arriba + texto de descripción y
  pistas abajo" del formato clásico.
- **Columna derecha**: UN SOLO menú vertical NUMERADO de acciones
  (`ui/ActionMenuPanel.ts`) — viajar a una zona conectada, hablar con
  alguien, explorar, pizarrón, expediente, inteligencia criminal, o las
  opciones de una conversación (DialogueScene arma sus propias filas
  numeradas con el mismo criterio visual). Reemplaza la lista de destinos
  + barra de íconos + panel de contenido que antes vivían en tres lugares
  separados — calca el "1. Depart / 2. Show Connections / 3. Investigate /
  4. Visit Interpol" del formato clásico, con las acciones propias del
  juego en vez de esas cuatro fijas.

`SuspectBoardScene`, `CrimeComputerScene`, `CaseFileScene` y `EndingScene`
NO forman parte de este frame a propósito — son "pantallas de computadora"
aparte (con su propia estética terminal, ver FASE 14), accesibles desde el
menú de acciones pero visualmente distintas, igual que en el juego clásico
el identikit y el mapa de rutas se ven claramente como interfaces
distintas de la pantalla principal de investigación.

## Finales (mínimo 7, ver `docs/STORY.md` para el detalle narrativo)

1. Caso resuelto correctamente.
2. La banda escapa.
3. Se arrestó al sospechoso equivocado.
4. El protagonista queda involucrado en el escándalo.
5. Final absurdo.
6. Final secreto (requiere una combinación no obvia de reputación + pistas).
7. Final perfecto (todas las pistas correctas, reputación alta, sin
   corrupción excesiva).

## Modo debug

Ver `docs/TESTING.md`. Tecla configurable en `Constants.ts`, disponible
siempre durante el desarrollo.
