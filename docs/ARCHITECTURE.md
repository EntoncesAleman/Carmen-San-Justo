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

`Boot` → `Preloader` → `MainMenu` → (`NewGame`/`LoadGame`) → `CaseIntro` →
`CityMap` ⇄ `LocationScene` ⇄ `DialogueScene` | `SuspectBoardScene` |
`CaseFileScene` → `EndingScene`. `DebugScene` es un overlay disponible desde
cualquier punto.

## Guardado

`SaveSystem` serializa un subconjunto plano de `GameState` (ver
`core/SaveSystem.ts` → `SaveData`) a JSON en `localStorage`, con 3 slots
(`save-slot-0/1/2`). Incluye versión de esquema para poder migrar si el
modelo de datos cambia.

## Testing

Ver `docs/TESTING.md`.
