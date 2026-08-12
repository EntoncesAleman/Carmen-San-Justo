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

- **Operativo** (el caco): uno al azar de `data/generator/operatives.ts` —
  reutiliza identidades ya jugables (con retrato, atributos fijos de
  identikit y escena de confrontación) en vez de inventar personajes sin
  cara. Narrativamente: no siempre manda "Los Administradores" al mismo
  tipo al mismo trabajo.
- **Ruta**: un camino al azar por el mapa de 21 zonas. Las paradas
  intermedias (todas menos la última) se eligen solo entre zonas que
  tienen al menos un informante viviendo ahí — si no, nadie podría darte
  la pista de por dónde sigue el caco. La parada final y el destino falso
  pueden ser cualquier zona, incluidas las que no tienen NPCs estáticos
  (mismo patrón que "El Delta"/"Km 20" en los casos fijos).
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
integridad y de "ninguna pista sola resuelve el identikit" que los casos
fijos — no es una demo, tiene la misma vara de calidad.

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
