# TESTING.md

## Verificación mínima antes de dar por buena cualquier tarea

```bash
npm run typecheck   # tsc --noEmit, cero errores
npm run build        # build de producción sin warnings de módulos rotos
npm run dev           # arranque manual, ver consola del navegador sin errores
```

## Checklist funcional (auditoría periódica, ver sección "Control de calidad")

- [ ] El juego arranca (`npm run dev`, carga sin errores en consola).
- [ ] Se puede empezar una partida nueva desde el menú.
- [ ] El jugador tiene un objetivo claro al empezar el caso 1.
- [ ] Se puede hablar con al menos un NPC y recibir una pista.
- [ ] Se puede viajar entre zonas y el tiempo avanza.
- [ ] Se puede armar una hipótesis en el pizarrón de sospechosos.
- [ ] El caso se puede ganar (final "resuelto correctamente").
- [ ] El caso se puede perder/resolver mal (al menos un final alternativo).
- [ ] Se puede guardar y cargar (3 slots).
- [ ] El modo debug abre y sus acciones (agregar pista, cambiar hora,
      teletransportar, completar caso) funcionan.
- [ ] La UI es legible en 1280x720 y no se corta contenido.

## Modo debug

Tecla: `Constants.DEBUG.TOGGLE_KEY` (por defecto `` ` ``, backtick). Abre un
overlay con:
- Agregar pista por id
- Cambiar hora del reloj del caso
- Teletransportar a cualquier zona
- Marcar caso como resuelto/perdido
- Modificar cualquier variable de reputación
- Ver el `GameState` completo en JSON

El modo debug nunca se remueve del build durante desarrollo. Se puede
ocultar del build final con un flag de `Constants.ts` (`DEBUG.ENABLED`) el
día que haya un release público, pero no antes.

## Pruebas automatizadas

Dado que el motor es Phaser sobre Canvas (no DOM testeable con selectores
convencionales), las pruebas automatizadas se apoyan en dos niveles:

### 1. Unit tests de sistemas puros

```bash
npm test
```

Corre con el test runner nativo de Node (`node --test`) + `tsx` para poder
importar TypeScript directamente, sin paso de build. Cubren
`ClueManager`, `DeductionSystem`, `ReputationSystem`, `TimeSystem`,
`CaseManager`, `SaveSystem` y, exhaustivamente, los **7 finales** de
`EndingResolver` (cada branch de la lógica de finales tiene un test propio
que fija el `GameState` directamente y verifica el resultado — más
confiable que jugarlos manualmente en el navegador). 42 tests en total.

Importante: `core/EventBus.ts` usa un `EventEmitter` propio (no
`Phaser.Events.EventEmitter`) precisamente para que `data/` y `systems/`
se puedan importar en Node sin arrastrar Phaser, que asume `window` al
evaluarse y rompe fuera del navegador. Si algún sistema nuevo necesita
emitir eventos, debe seguir usando `EventBus`, nunca importar `phaser`
directamente fuera de `scenes/`/`ui/`.

`SaveSystem.test.ts` define un shim mínimo de `localStorage` en memoria
(Node no lo expone globalmente) — está contenido en el archivo de test,
no se usa en producción.

### 2. Smoke test end-to-end con Playwright

`tools/e2e_smoke_test.py` — no usa `npm test` (necesita Python + Playwright,
ver instrucciones en la cabecera del archivo). Levanta un navegador
headless real, hace click en coordenadas del canvas (Phaser no expone
botones como elementos DOM, hay que sumar el offset de
`canvas.getBoundingClientRect()`) y verifica sin errores de consola:

```bash
npm run dev &
.venv-e2e/bin/python tools/e2e_smoke_test.py
```

Cubre: arranque, flujo menú → diálogo → pista → expediente, y 3 de los 7
finales jugados de punta a punta (`resuelto_correcto`,
`sospechoso_equivocado`, `banda_escapa`). Usar esto después de cambios
grandes de escenas o de `EventBus`/`GameState`, ya que los unit tests no
cubren la capa visual.

## Reglas de no regresión

Antes de modificar un sistema: leerlo entero y entender su rol en el flujo
(`docs/ARCHITECTURE.md`). Después de modificarlo: correr `typecheck` +
`build`, y si el cambio toca gameplay, jugar manualmente el flujo afectado.
Nunca comentar/desactivar un sistema para esconder un error — reproducir,
diagnosticar la causa raíz, corregir.
