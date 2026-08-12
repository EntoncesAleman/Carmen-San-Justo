# CHANGELOG.md

Formato: fecha, qué se hizo, por qué. Más reciente arriba.

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
