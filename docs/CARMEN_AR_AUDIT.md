# CARMEN_AR_AUDIT.md

Auditoría del estado del proyecto antes de la reforma hacia el formato
clásico de persecución (LOOP MAESTRO — "Copia argentinizada de Carmen
Sandiego"). Fecha: 2026-08-12.

## Estado técnico de base

`npm run typecheck`, `npm test` (78/78) y `npm run build` limpios antes de
empezar esta reforma. Phaser 3 + TypeScript + Vite, sin dependencias
externas de UI. Ver `docs/ARCHITECTURE.md` para el detalle de capas
(`core/ data/ systems/ scenes/ ui/ audio/`), que se mantiene: la reforma es
de **diseño de gameplay**, no de arquitectura técnica base.

## Flujo actual (ANTES de esta reforma)

```
MainMenu → "Nueva Partida" → CaseSelectScene (el jugador ELIGE el caso)
  → CaseIntroScene (título + descripción + un botón "Ir a la comisaría")
  → DialogueScene (briefing del jefe, texto instantáneo, sin tipeo)
  → CityMapScene (mapa de 19 zonas, todas accesibles desde el arranque)
  → LocationScene (hablar con NPCs / explorar)
  → SuspectBoardScene (el jugador presenta UNA hipótesis de destino final,
    de un solo salto — no hay ruta de varias paradas)
  → LocationScene en el destino (confrontación directa, sin identikit ni
    orden de captura previa)
  → EndingScene (7 finales posibles) → MainMenu
```

## Comparación contra el flujo pedido

| Elemento pedido | ¿Existe? | Detalle |
|---|---|---|
| Reporte automático (sin elegir misión) | ❌ | Hay `CaseSelectScene` — el jugador elige el caso explícitamente |
| Escena del crimen investigable | ⚠️ parcial | La zona inicial existe y tiene NPCs, pero no está encuadrada narrativamente como "escena del crimen" ni tiene objetos/evidencia física propios |
| Persecución de varias paradas ("ruta del caco") | ❌ | `SuspectBoardScene` resuelve el caso en un solo salto: pizarrón → destino final directo. No hay paradas intermedias |
| Pistas de transporte (líneas de colectivo, etc.) | ❌ | Las categorías de pista existen (`geografica/temporal/cultural/visual/economica/criminal/absurda/falsa/contradictoria`) pero no hay una categoría/mecánica de transporte ligada a líneas |
| Crime Computer / identikit de sospechoso | ❌ | No existe. El sospechoso ya se conoce por nombre desde el brief; no hay que "armarlo" con atributos |
| Orden de captura previa a la captura | ❌ | La confrontación resuelve el caso directamente, sin paso de "generar orden" |
| Sistema de rangos | ❌ | No existe progresión entre partidas |
| Texto progresivo (tipeo carácter por carácter) | ❌ | Todo el texto de diálogo aparece instantáneo |
| Sonido de pasos / ambiente por zona | ❌ | `AudioManager` tiene música por contexto + SFX puntuales (click, pista, viaje, advertencia, error) pero no pasos ni ambiente continuo |
| Música dinámica por estado | ⚠️ parcial | Hay 4 tracks (menu/investigacion/interrogatorio/persecucion) sintetizados con Web Audio; faltan estados específicos (reporte, viaje, peligro, captura/derrota como distintos del resto) |
| UI tipo panel/terminal retro | ❌ | UI actual es genérica: rectángulos + botones centrados, sin composición por paneles ni estética de terminal |
| Tipografía monoespaciada para "computadora" | ❌ | Todo usa Georgia serif |
| Múltiples casos vía datos | ✅ | Ya implementado y es el punto más fuerte a conservar: `CaseDefinition` en `src/data/cases/*.ts`, agregar un caso es 100% datos |
| Guardado/carga | ✅ | 3 slots, probado de punta a punta por UI |

## Qué se conserva de la base actual

- Arquitectura de capas (`core/data/systems/scenes/ui/audio`).
- `EventBus`/`GameState` como singletons reactivos.
- Sistema de pistas (`Clue`, categorías, pistas falsas con contradicción).
- Sistema de reputación (5 variables).
- `EndingResolver` genérico (ya no depende de flags de un caso específico).
- `AudioManager` sintetizado (se extiende, no se reescribe).
- Los 2 casos existentes y su elenco de 23 NPCs (se migran a la nueva
  estructura de ruta, no se descartan).
- Suite de tests (`node --test`, 78 tests) — se extiende con tests de los
  sistemas nuevos.

## Qué se reemplaza/elimina

- `CaseSelectScene` — el jugador ya no elige caso. Se reemplaza por
  asignación automática secuencial (`gameState.casoIndex`, avanza al
  resolver un caso).
- `CaseIntroScene` como pantalla simple de título — se reemplaza por
  `ReportScene`, un reporte policial estructurado (qué/dónde/cuándo,
  primera pista, rango actual).
- `SuspectBoardScene` de un solo salto — se generaliza a un sistema de
  ruta de varias paradas (`RouteSystem` + `CaseDefinition.ruta`).
- Confrontación directa sin identikit — se agrega `CrimeComputerScene`
  (armar el perfil del sospechoso por atributos) + orden de captura
  obligatoria antes de poder capturar.

## Prioridad de esta reforma (según el prompt del usuario)

```
1. GAMEPLAY (fin de la selección manual de misión)
2. PERSECUCIÓN (ruta de varias paradas)
3. PISTAS (atributos de sospechoso + transporte)
4. CASOS (migrar caso 1 y 2 a la nueva estructura)
5. MAPA (sin cambios de fondo, ya es apto)
6. TIEMPO (ya existe, se reutiliza)
7. COMPUTADORA (Crime Computer + orden de captura)
8. UI (paneles/terminal — pasada parcial, prioridad media)
9. TEXTO (tipeo progresivo)
10. AUDIO (pasos + ambiente)
11. ARTE (sin cambios en este ciclo — ya hay un primer lote generado)
12. POLISH
```

Este documento no se vuelve a reescribir; el progreso contra esta lista se
registra en `docs/ROADMAP.md` y `docs/CHANGELOG.md` como en el resto del
proyecto.
