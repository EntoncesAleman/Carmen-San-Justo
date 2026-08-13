# ARCHITECTURE.md

## Stack

- Phaser 3 (paquete `phaser`) + TypeScript + Vite.
- Sin backend. Persistencia en `localStorage`.
- Sin frameworks de UI externos: la UI se construye con objetos de Phaser
  (`Text`, `Rectangle`, `Container`) para minimizar dependencias.

## Capas

```
data        →  contenido puro (sin lógica): zonas, lugares, NPCs, pistas,
                casos, banda, finales. Todo tipado con interfaces en
                data/types.ts.
systems     →  lógica de gameplay sin representación visual: maneja
                GameState, no conoce Phaser.Scene salvo para emitir eventos.
scenes      →  Phaser.Scene: solo presentación + input. Delegan toda
                decisión a systems/ vía EventBus.
ui          →  componentes visuales reutilizables (botones, paneles, HUD).
core        →  EventBus, GameState, Constants, SaveSystem, TimeSystem.
```

Regla de dependencia: `data` no depende de nada. `systems` depende de `data`
y `core`. `scenes`/`ui` dependen de `systems`, `core` y `data`, nunca al
revés.

## Flujo de una acción típica (ejemplo: hablar con un NPC)

1. `LocationScene` detecta click en un NPC → emite
   `EventBus.emit(Events.DIALOGUE_REQUESTED, { npcId })`.
2. `DialogueScene` se lanza, pide el árbol de diálogo a
   `DialogueEngine.getTree(npcId)` (en `systems/`), que lee de
   `data/npcs.ts`.
3. El jugador elige una opción → `DialogueEngine.resolveChoice(...)` muta
   `GameState` (confianza, sospecha, reputación) y devuelve el siguiente
   nodo.
4. Si la opción entrega una pista, `DialogueEngine` llama a
   `ClueManager.addClue(clueId)`, que emite `Events.CLUE_ADDED`.
5. `TimeSystem.advance(minutes)` se llama para toda acción con costo de
   tiempo; si cruza un umbral, emite `Events.DEADLINE_TICK` y
   `EventSystem` decide si dispara un evento aleatorio o de caso.
6. Al cerrar el diálogo, la escena vuelve a `LocationScene`/`CityMapScene`.

## Escenas (orden de arranque)

`Boot` → `Preloader` → `MainMenu` → (`NewGame`/`LoadGame`) → `ReportScene`
(reporte automático del caso — no hay pantalla de elegir caso) →
briefing del jefe (`DialogueScene`) → `CityMap` ⇄ `LocationScene` ⇄
`DialogueScene` | `SuspectBoardScene` (pizarrón, ruta del caco) |
`CrimeComputerScene` (identikit + orden de captura) | `CaseFileScene` →
`EndingScene` → `ReportScene` del siguiente caso (automático: los primeros
`CASES.length` casos son fijos, de ahí en más cada uno se arma con
`CaseGenerator`, ver GAME_DESIGN.md → "Generador de casos" — nunca vuelve a
repetir el caso 1). `DebugScene` es un overlay disponible desde cualquier
punto.

`EndingScene` y `ReportScene` paran exhaustivamente cualquier escena de
juego que pueda haber quedado activa (`ui/sceneCleanup.ts` →
`stopAllGameplayScenesExcept`) antes de mostrarse — necesario porque se
puede llegar a cualquiera de las dos por atajos de debug que no pasan por
el cierre normal de la escena anterior. Bug real encontrado dos veces por
este motivo: una vez con `DialogueScene` sin cerrar renderizada encima del
reporte del siguiente caso, y de nuevo con `CityMapScene` del caso
anterior encima de un `ReportScene` recién generado — ambas veces porque
Phaser dibuja las escenas activas en el orden en que están registradas en
`main.ts`, y ninguna de las dos estaba en la lista de limpieza.

`CityMapScene`, `LocationScene` y `DialogueScene` comparten un mismo frame
de pantalla dividida (`ui/frameLayout.ts` + `ui/LocationArtPanel.ts` +
`ui/DescriptionTextPanel.ts` + `ui/ActionMenuPanel.ts`) — ver
`docs/GAME_DESIGN.md` → "Pantalla dividida". `SuspectBoardScene`/
`CrimeComputerScene`/`CaseFileScene`/`EndingScene` no forman parte de ese
frame, mantienen su propio layout centrado de siempre.

Columna izquierda = arte arriba + texto abajo (zona/lugar en CityMap y
Location, retrato + diálogo en DialogueScene). Columna derecha = un único
menú vertical NUMERADO de acciones (`ActionMenuPanel.renderActionMenu`) —
viajar a una zona CONECTADA (`data/zoneConnections.ts`, grafo de
adyacencia fijo entre las 21 zonas, no viaje libre a cualquier zona del
mundo), hablar con alguien, explorar, pizarrón, expediente, inteligencia
criminal. La zona actual no es un ítem del menú (solo sus conexiones); la
forma de "entrar" a la locación en la que ya estás parado sin viajar es
el primer ítem del menú de `CityMapScene` ("Quedarme e investigar acá").

`CaseSelectScene`/`CaseIntroScene` (selección manual de misión) fueron
eliminadas a propósito: el jugador nunca elige qué caso investigar, ver
`docs/GAME_DESIGN.md` → Loop principal.

## Guardado

`SaveSystem` serializa un subconjunto plano de `GameState` (ver
`core/SaveSystem.ts` → `SaveData`) a JSON en `localStorage`, con 3 slots
(`save-slot-0/1/2`). Incluye versión de esquema para poder migrar si el
modelo de datos cambia.

Caso especial: un caso GENERADO (ver Generador de casos) no vive en el
registro estático de `data/cases/`, así que no alcanza con guardar su id —
`SaveData.generatedCase` guarda el `CaseDefinition` completo (es un objeto
de datos puro, 100% serializable). `SaveSystem` vive en `core/` y no puede
depender de `systems/CaseManager` (regla de dependencia de arriba), así
que quien llama a `save()`/`load()` (las escenas) es responsable de pasar
el caso generado activo al guardar (`CaseManager.getCurrentGeneratedCaseIfAny()`)
y de volver a registrarlo (`CaseManager.registerGeneratedCase(...)`) antes
de cargar.

## Testing

Ver `docs/TESTING.md`.
