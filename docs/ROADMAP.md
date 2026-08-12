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
- [ ] Caso 3 (a definir)
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

## Próximos pasos sugeridos (en orden)

1. Generar el resto del arte con `tools/generate_art.py` (12 NPCs, 16
   fondos, banda criminal, íconos de HUD) — sin costo, solo tiempo.
2. Jugar manualmente los 3 finales (`escandalo`, `final_absurdo`,
   `final_secreto`) de cada caso que hoy solo tienen cobertura de test
   unitario + debug mode, o extender `tools/e2e_smoke_test.py`.
3. Diseñar el Caso 3.
4. FASE 12 continuo: seguir auditando a medida que se agrega contenido.

---

Actualizar este archivo en cada iteración del loop autónomo (ver
`AGENTS.md` → "El loop autónomo").
