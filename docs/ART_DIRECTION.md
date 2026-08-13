# ART_DIRECTION.md

## Dirección

Pixel art 16-bit, alto contraste, colores saturados — la estética de
juego de PC/consola de principios de los 90 (aventura de investigación
tipo terminal policial), NO ilustración digital moderna suave. Pedido
explícito del usuario: el parecido visual con el género tiene que ser
fuerte ("visualmente tiene que ser igual... si no, no se retrotrae al
juego"), pero sin copiar diseño de personajes, logos ni texto de ninguna
obra existente — arte, nombres y contenido 100% propios, con la tipografía
y la técnica de un juego de esa época.

## Paleta

Negro casi puro + ámbar, como un monitor de fósforo de terminal policial
de PC vieja — no un panel plano de UI moderna (ver FASE 18/19 en
CHANGELOG). Cada ventana se distingue por su BORDE, no por un tono de
fondo distinto.

- Fondo general y de paneles: `#050505` / `#0a0a0a` (negro casi puro)
- Acento principal (bordes de ventana, UI, resaltados, luz de sodio):
  `#e8b84b` (ámbar) — también la firma visual del arte generado (luz
  cálida de farol callejero contra fondos oscuros)
- Alerta / sospecha / tiempo crítico: `#c0392b`
- Confianza / éxito: `#4caf7d`
- Texto principal: `#f2ede3` (hueso)

## Tipografía

`VT323` (Google Fonts, licencia OFL, self-hosted vía `@fontsource/vt323`
— sin llamadas a un CDN externo en runtime). Es una tipografía de
terminal/VGA genérica, de dominio del género, no asociada a ningún juego
puntual — el tipo de fuente bitmap de PC de principios de los 90 que
define visualmente la "aventura de investigación retro" sin copiar el
diseño de letra de nada específico. Se usa en TODA la interfaz (antes:
`monospace` genérico + `Georgia, serif` en menú/HUD — una mezcla que no
se sentía retro en ningún lado). `Preloader` espera a
`document.fonts.ready` antes de mostrar el menú, para evitar el bug real
ya visto una vez (pedir una fuente no cargada todavía hace que Phaser
caiga a un fallback con glifos rotos en Chromium headless).

## Proporciones y perspectiva

- Vista de exploración: 2D top-down estilizado por lugar (una "escena" fija
  por locación, no un mundo continuo).
- Retratos de diálogo: bustos, formato cuadrado, mostrados en un panel a la
  derecha del texto de diálogo (`DialogueScene.renderPortrait`).
- Fondos de locación: panorámica atenuada (alpha ~0.55 + overlay negro) para
  no competir con el texto/HUD encima.
- Mapa: esquemático, no realista — nodos conectados por líneas de viaje (sin
  arte definitivo todavía, ver TODO_ASSET).

## Arte generado

Higgsfield (herramienta originalmente evaluada) requiere plan pago y
rechazó la generación real (el `get_cost` no lo advertía, pero el envío sí
lo bloqueó: `Requires basic plan or higher`). Por indicación del usuario se
usó **Pollinations.ai** en su lugar — gratuito, sin cuenta ni API key.

**Pixel art forzado algorítmicamente, no por prompt (FASE 19)**: pedirle
al modelo "pixel art" como palabra de estilo no funciona — probado varias
veces, devuelve una ilustración semi-fotorrealista igual, el modelo no
respeta esa palabra clave. La solución no es pelear con el prompt: se le
pide una ilustración PLANA, de ALTO CONTRASTE y colores SATURADOS (ahí sí
responde bien), y el look de pixel art de verdad se aplica DESPUÉS,
algorítmicamente, con `pixelate()` en `tools/generate_art.py` — downscale
a baja resolución (bloques de 8-10px), cuantización de paleta a ~24-32
colores (`Image.quantize`, sin dithering), reescalado de vuelta con
`NEAREST` (sin antialiasing). Es el mismo truco que usan generadores de
pixel art reales: la cuantización GARANTIZA el resultado, el texto del
prompt no. Requiere Pillow (`pip install Pillow`, o usar el intérprete de
`.venv-e2e` que ya lo tiene si existe).

**Pipeline reproducible**: `tools/generate_art.py` — define el prompt de
estilo compartido (`STYLE` / `BG_STYLE`) + una lista de personajes/fondos,
descarga con `curl` (no usar `urllib` de Python: falla por certificados
SSL del sistema en macOS) y pixela cada imagen al bajarla. Correr con
`python3 tools/generate_art.py` (necesita `curl` + Pillow).

**Integración** (`src/data/portraits.ts` mapea npcId/locationId → clave de
textura; `Preloader.ts` los precarga; `DialogueScene`, `MainMenu` y
`LocationScene` los muestran si existen, sin romper nada si no existen —
un NPC o locación sin entrada en `portraits.ts` simplemente no muestra
imagen todavía, no es un error).

## TODO_ASSET (placeholders pendientes de reemplazo)

| nombre | tipo | estado | prioridad |
|---|---|---|---|
| Los 16 retratos y 4 fondos existentes | retrato/fondo | ✅ regenerados en pixel art (FASE 19) | — |
| npc_*_portrait — resto del elenco (12 NPCs sin retrato: Beba, Salaberry, Hombre de las Palomas, Marta, Pipo, Cacho, Sagasti, Media Cuadra, Yamila, Egidio, Manteca, Walter, Salerno, Pescador Aguirre) | retrato | pendiente, mismo pipeline pixel art | alta |
| location_*_background — resto de las 21 zonas (17 sin fondo propio) | fondo | pendiente, mismo pipeline pixel art | alta |
| gang_*_portrait (8, "Los Administradores") | retrato | pendiente | media |
| character_police_main_idle/walk (animaciones/expresiones) | sprite | pendiente — Pollinations no genera spritesheets, requiere otro enfoque (frames sueltos + código de animación) | media |
| icon_* (pistas, sospecha, tiempo, reputación) | ícono UI | pendiente | media |
| menu_background, map_overview | fondo | pendiente | baja |

Para generar el resto: agregar entradas a `CHARACTERS`/`BACKGROUNDS` en
`tools/generate_art.py` (reutilizando `STYLE`/`BG_STYLE` para mantener
consistencia) y correrlo — después sumar la clave a
`src/data/portraits.ts`. No hace falta tocar `Preloader.ts` ni las escenas
más que eso.

## Audio (implementado, ver `src/audio/`)

El audio, a diferencia del arte visual, ya está resuelto con placeholders
**funcionales y suficientes para jugar** — no requiere assets externos ni
herramientas de generación: `AudioManager` sintetiza música y sonidos con
la Web Audio API (osciladores). Ver `docs/ROADMAP.md` → FASE 9 y
`docs/TESTING.md`.
