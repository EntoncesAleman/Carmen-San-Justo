# ART_DIRECTION.md

## Dirección

2D/ilustración estilizada, caricaturesca, urbana, exagerada. Colores
fuertes, iluminación dramática, personajes expresivos, fondos con detalle
ambiental. No se copia el estilo visual exacto de ninguna franquicia
existente.

## Paleta

- Fondo noche/investigación: `#1b1f2a` (azul muy oscuro)
- Acento principal (UI, resaltados, luz de sodio): `#e8b84b` (amarillo
  mostaza) — se volvió también la firma visual del arte generado (luz
  cálida de farol callejero contra fondos azul noche)
- Alerta / sospecha / tiempo crítico: `#c0392b`
- Confianza / éxito: `#4caf7d`
- Texto principal: `#f2ede3` (hueso)
- Paneles: `#262b3a` sobre fondo `#1b1f2a`

## Proporciones y perspectiva

- Vista de exploración: 2D top-down estilizado por lugar (una "escena" fija
  por locación, no un mundo continuo).
- Retratos de diálogo: bustos, formato cuadrado, mostrados en un panel a la
  derecha del texto de diálogo (`DialogueScene.renderPortrait`).
- Fondos de locación: panorámica atenuada (alpha ~0.55 + overlay negro) para
  no competir con el texto/HUD encima.
- Mapa: esquemático, no realista — nodos conectados por líneas de viaje (sin
  arte definitivo todavía, ver TODO_ASSET).

## Arte generado (FASE 8 — primer lote, 2026-08-12)

Higgsfield (herramienta originalmente evaluada) requiere plan pago y
rechazó la generación real (el `get_cost` no lo advertía, pero el envío sí
lo bloqueó: `Requires basic plan or higher`). Por indicación del usuario se
usó **Pollinations.ai** en su lugar — gratuito, sin cuenta ni API key.

Backend real usado por Pollinations al momento de generar: modelo `sana`
(el parámetro `model=flux` no cambió el resultado — el servicio solo estaba
sirviendo `sana`). Con prompting fuerte hacia "flat cel shaded / thick
outlines / stylized caricature" el resultado terminó siendo una ilustración
3D-caricaturesca con rim light amarillo consistente con la paleta del
juego — no el "cómic 2D plano" originalmente buscado, pero sí un estilo
cohesivo, distintivo y usable, mejor que aceptar cualquier resultado al
azar. Se documenta acá el resultado real, no el objetivo original, para que
quien retome esto sepa qué esperar del pipeline actual.

**Pipeline reproducible**: `tools/generate_art.py` — define el prompt de
estilo compartido (`STYLE` / `BG_STYLE`) + una lista de personajes/fondos,
y descarga con `curl` (no usar `urllib` de Python: falla por certificados
SSL del sistema en macOS). Correr con `python3 tools/generate_art.py`, sin
dependencias más allá de `curl`.

**Generado en este primer lote** (10 retratos + 3 fondos, en
`public/assets/characters/` y `public/assets/backgrounds/`):

- Protagonista (Fierro), Bracamonte, Simón Achával, Aldo Reissig, Armando
  Petrocelli, Nazareno Quiroga, Marina Ithurbide, "El Ingeniero" Contreras,
  el camionero de catering, Chiche Molina.
- Fondos: Kiosco de Simón, Muelle La Anguila, Comisaría 0.

**Integración** (`src/data/portraits.ts` mapea npcId/locationId → clave de
textura; `Preloader.ts` los precarga; `DialogueScene`, `MainMenu` y
`LocationScene` los muestran si existen, sin romper nada si no existen —
un NPC o locación sin entrada en `portraits.ts` simplemente no muestra
imagen todavía, no es un error).

## TODO_ASSET (placeholders pendientes de reemplazo)

| nombre | tipo | estado | prioridad |
|---|---|---|---|
| character_police_main_portrait | retrato | ✅ generado | — |
| npc_hugo_bracamonte/simon_achaval/aldo_reissig/armando_petrocelli/nazareno_quiroga/marina_ithurbide/el_ingeniero_contreras/camionero_catering/chiche_molina_portrait | retrato | ✅ generados (9) | — |
| npc_*_portrait — resto del elenco (12 NPCs: Beba, Salaberry, Hombre de las Palomas, Marta, Pipo, Cacho, Sagasti, Media Cuadra, Yamila, Egidio, Manteca, Walter, Salerno, Pescador Aguirre) | retrato | pendiente | alta |
| location_kiosco_simon/muelle_anguila/comisaria_0_background | fondo | ✅ generados (3) | — |
| location_*_background — resto de las 19 zonas | fondo | pendiente | media |
| gang_*_portrait (8, "Los Administradores") | retrato | pendiente | media |
| character_police_main_idle/walk (animaciones/expresiones) | sprite | pendiente — Pollinations no genera spritesheets, requiere otro enfoque (frames sueltos + código de animación, o pixel-art manual) | media |
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
