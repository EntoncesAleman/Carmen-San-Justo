# AGENTS.md — Cómo trabajar en este proyecto

Este archivo explica cómo cualquier agente (o desarrollador) debe operar de forma
autónoma sobre este repositorio. Leelo antes de tocar código.

## Qué es esto

"El Último Procedimiento" — juego 2D de investigación/persecución ambientado en
una CABA/AMBA ficticia. Un policía turbio investiga casos, interroga NPCs,
sigue pistas, viaja entre zonas y persigue a una banda criminal caricaturesca.
Ver `/docs/GAME_DESIGN.md` para el diseño completo.

Todo el contenido (personajes, lugares, banda criminal) es original. No copiar
personajes, mapas, textos ni nombres de Carmen Sandiego ni de ninguna otra
franquicia. La inspiración es solo conceptual: investigación, pistas, viajes,
interrogatorios, deducción, persecución.

## Stack técnico

- **Motor**: Phaser 3 (paquete `phaser@4.x`, API Phaser 3)
- **Lenguaje**: TypeScript estricto
- **Bundler**: Vite
- **Persistencia**: `localStorage` (sin backend)
- **Sin frameworks de UI externos** — la UI se construye con Phaser (DOM overlay solo si es imprescindible)

Comandos:

```bash
npm install
npm run dev        # http://localhost:8080
npm run build       # build de producción en /dist
npm run preview     # sirve el build de producción
npm run typecheck   # tsc --noEmit
npm test             # unit tests (Node --test + tsx) de systems/ y core/
```

## Estructura de carpetas

```
src/
├── core/         EventBus, GameState, Constants, SaveSystem, TimeSystem
├── data/         Contenido como datos: zones.ts, locations.ts, npcs.ts,
│                 clues.ts, cases.ts, gang.ts, endings.ts — NUNCA hardcodear
│                 contenido narrativo dentro de una escena o sistema.
├── systems/      Lógica de gameplay sin estado visual: CaseManager,
│                 ClueManager, DialogueEngine, RouteSystem (ruta del caco,
│                 varias paradas), CrimeComputerSystem (identikit),
│                 CaseGenerator (casos procedurales, ver data/generator/),
│                 ReputationSystem, EventSystem (eventos aleatorios)
├── scenes/       Pantallas Phaser (Boot, Preloader, MainMenu, CityMap,
│                 LocationScene, DialogueScene, CaseFileScene, DebugScene…)
├── ui/           Componentes reutilizables (botones, HUD, paneles)
├── objects/      Entidades visuales (retratos, marcadores de mapa)
├── audio/        AudioManager y claves de sonido
└── tools/        Scripts de generación/validación de contenido

docs/             Documentación de diseño y proceso (ver abajo)
public/assets/    Assets estáticos (placeholders hasta que existan definitivos)
```

## Reglas de arquitectura (no negociables)

1. **EventBus único** (`core/EventBus.ts`) para toda comunicación entre escenas
   y sistemas. Nunca referenciar una escena desde otra directamente.
2. **GameState único** (`core/GameState.ts`) con `reset()`. Los sistemas leen
   el estado y lo mutan a través de métodos propios, no tocando campos sueltos
   desde cualquier lado.
3. **Constants.ts** — cualquier número mágico (costos de tiempo, umbrales de
   reputación, tamaños) va ahí.
4. **Contenido = datos**. Casos, pistas, NPCs, zonas y diálogos viven en
   `src/data/*.ts` como objetos tipados. Agregar un caso nuevo NO debería
   requerir tocar los sistemas ni las escenas.
5. Un archivo que crece demasiado se divide. Preferir muchos archivos chicos.

## El loop autónomo

Cada sesión de trabajo debe:

1. Leer este archivo, `docs/ROADMAP.md` y `docs/CHANGELOG.md` para saber en
   qué fase está el proyecto y qué falta.
2. Correr `npm run typecheck`, `npm test` y `npm run build` para confirmar
   que el estado actual compila y pasa los tests antes de tocar nada.
3. Elegir UNA tarea del roadmap (la de mayor prioridad según
   `docs/ROADMAP.md`), completa antes de pasar a la siguiente.
4. Implementarla siguiendo las reglas de arquitectura de arriba.
5. Probar: `npm run typecheck`, `npm run build`, y cuando aplique, correr el
   juego (`npm run dev`) y verificar manualmente (o con Playwright vía la
   skill `webapp-testing`) que el flujo funciona de punta a punta.
6. Si algo falla: reproducir, diagnosticar la causa raíz, corregir, volver a
   probar. Nunca comentar/desactivar un sistema para "esconder" un error.
7. Actualizar `docs/CHANGELOG.md` (qué se hizo, por qué) y marcar el ítem
   correspondiente en `docs/ROADMAP.md`.
8. Si falta un asset (arte/audio definitivo), usar un placeholder funcional
   (rectángulo de color, texto, tono generado) y registrar un TODO en
   `docs/ART_DIRECTION.md` bajo "Assets pendientes". No bloquearse esperando
   arte.
9. Elegir automáticamente la siguiente tarea y continuar. No parar solo
   porque una tarea terminó.

## Prioridad al elegir la siguiente tarea

```
1. Errores críticos / el juego no arranca
2. Gameplay roto (algo documentado como funcionando dejó de funcionar)
3. Sistemas incompletos de la fase actual del roadmap
4. Contenido faltante (casos, NPCs, pistas)
5. Assets faltantes (reemplazar placeholders)
6. UI
7. Audio
8. Polish
```

## Definición de "terminado"

Una feature está terminada solo si: existe, funciona, está integrada al loop
real del juego (no en un archivo aislado sin usar), se puede probar jugando,
no rompió nada que funcionaba antes, tiene feedback visual/interacción cuando
corresponde, y quedó documentada (ROADMAP + CHANGELOG).

## Modo debug

`src/scenes/DebugScene.ts` (o el overlay equivalente) debe mantenerse siempre
funcional durante el desarrollo. Se activa con la tecla configurada en
`Constants.ts` (`DEBUG.TOGGLE_KEY`). Nunca eliminarlo, solo extenderlo.

## Contenido sensible

- Personajes, bandas y lugares: 100% ficticios, sin representar personas
  reales. Ver `docs/CHARACTERS.md` y `docs/WORLD.md`.
- No se documentan procedimientos reales de delitos (narcotráfico, evasión,
  falsificación). Todo eso es solo contexto narrativo, nunca instructivo.
- Humor argentino sin caer en un chiste por línea ni en "che" en cada frase
  (ver `docs/STORY.md` → tono).
