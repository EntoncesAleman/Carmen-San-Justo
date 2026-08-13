# VISUAL_AUDIT.md

Auditoría visual honesta del estado actual (2026-08-13, post-FASE 20),
jugando la app real (no leyendo el código) — capturas revisadas a mano en
`carmen-san-justo.vercel.app` y en local. Sirve de base para priorizar la
FASE 21 (reconstrucción más profunda pedida por el usuario, ver
`docs/ROADMAP.md`).

## Matriz de comparación

| Elemento | App actual | Objetivo | Estado |
|---|---|---|---|
| Pantalla inicial | Logo + retrato fijo del protagonista + 3 botones, negro/ámbar, VT323 | Entrada a agencia de detectives, terminal, sonido | 🟡 parcial — paleta/tipografía ya correctas, falta identidad del jugador y ambientación de "agencia" |
| Nombre del detective | `NameEntryScene` (FASE 21): terminal con input por teclado, se guarda en `gameState.detectiveName` y se muestra en Reporte/Expediente/Inteligencia Criminal/Final | Ingreso de nombre, usado en todo el juego | ✅ hecho (FASE 21) — pendiente: usarlo también dentro de las líneas de diálogo de los NPCs, hoy solo aparece en las pantallas "de sistema" |
| Tipografía | VT323 (pixel/terminal, self-hosted) en toda la interfaz | Retro/detectivesca | ✅ hecho (FASE 19) |
| Tamaño de letra | 13-22px según panel, legible | Grande y legible | 🟢 aceptable, no auditado en 1920×1080 |
| División de pantalla | Columna izquierda (arte+texto) / columna derecha (menú numerado) | Panelizada | ✅ hecho (FASE 20) |
| Imagen principal | Fondo de zona o retrato de NPC, pixel art, ocupa toda la columna izquierda arriba | Gran ilustración | ✅ hecho, pero solo 4 fondos de zona de 21 tienen arte propio (el resto usa el panel negro sin imagen) |
| Panel de información | Panel de texto compartido debajo del arte | Compacto | ✅ hecho (FASE 20) |
| Menú | Menú numerado único a la derecha | Integrado | ✅ hecho (FASE 20) |
| Texto | `TypewriterText` con velocidad configurable, sonido de tecleo (`type_char`, cada 3er carácter) y skip por click | Máquina de escribir | ✅ ya existía (FASE anteriores) |
| Pistas | Lista en Expediente + Pizarrón, con `confiabilidad` numérica interna (no mostrada al jugador) | Expediente | 🟡 el dato existe pero no se muestra como "CONFIANZA: ALTA/MEDIA/BAJA" en pantalla |
| Mapa | No hay mapa visual — el menú de acciones lista "Viajar a X" como texto, sin representación gráfica del territorio | Mapa retro | 🔴 falta — el pedido explícito de un mapa dibujado (nodos/líneas) no está implementado, solo texto |
| Computadora (Crime Computer) | Pantalla propia, fondo negro/verde tipo terminal, filtra sospechosos por atributo | Terminal policial | ✅ hecho, coherente con el resto |
| Sonido | `AudioManager` sintetiza con Web Audio API (osciladores) — sin assets externos | Retro | 🟡 funcional pero no es MIDI ni tiene identidad melódica propia, es más "beep genérico" que banda sonora |
| Música | Sintetizada por estado (investigación/persecución/peligro), no archivos MIDI | MIDI | 🔴 no es MIDI real, es síntesis simple |
| Pasos | Sí, 3 pasos espaciados al entrar a una locación, mismo sonido siempre | Sí, con variación | 🟡 existe pero sin variación por tipo de piso/escenario |
| Animaciones | Ninguna (sprites estáticos, sin idle/parpadeo) | Sí | 🔴 falta |
| Transiciones | Ninguna — `scene.start()` corta seco entre escenas | Retro (wipe, flicker) | 🔴 falta |
| Colores | Paleta centralizada (`COLORS`/`COLORS_CSS`), negro + ámbar | Coherente | ✅ hecho, con una excepción: `ReportScene` todavía usa un panel azul-oscuro (`#1b1f2a`-ish) en vez del negro (`COLORS.PANEL`) del resto — inconsistencia real encontrada en esta auditoría |
| Cursor | Cursor por defecto del navegador (con `useHandCursor` en elementos clickeables) | Cursor propio de videojuego | 🔴 falta |
| Objetos interactivos en escena | No — cada locación es un fondo estático + lista de NPCs, no hay objetos investigables aparte de "Explorar" (una sola tirada, no varios objetos elegibles) | 3-6 objetos investigables por escena | 🔴 falta, es una simplificación deliberada del diseño original, no un bug |

## Hallazgos adicionales (no estaban en la lista pero importan)

1. ~~Inconsistencia de paleta en `ReportScene`~~ — **corregida en FASE 21**:
   usaba un rectángulo hardcodeado (`0x11141c`) en vez de `COLORS.PANEL`.
2. **17 de 21 zonas no tienen fondo ilustrado propio** — el panel de arte
   queda negro sin imagen en la mayoría de las locaciones. Esto es más
   notorio ahora que el panel de arte ocupa mucho más espacio (FASE 20)
   que antes.
3. **12 de 28 NPCs no tienen retrato** — mismo problema, más notorio con
   el panel de retrato agrandado en `DialogueScene`.
4. **No hay mapa gráfico real** — "viajar" es una línea de texto en el
   menú ("Viajar a San Telmo"), no una representación visual del
   territorio con nodos y conexiones dibujadas. Es la brecha visual más
   grande respecto del pedido del usuario después del nombre del
   detective.
5. **Sin animación ni parpadeo en portraits/fondos** — todo estático,
   nada de vida ambiental (luces titilando, humo, gente caminando).

## Conclusión

El layout estructural (columnas, menú numerado, tipografía, paleta) ya
está resuelto (FASE 19-20) y es fiel al pedido. Lo que falta para la
transformación completa pedida es, en orden de impacto visual/jugable:
identidad del detective (nombre), mapa gráfico de viaje, arte de zona
faltante (17/21), MIDI real, animación/transiciones, y pulido de
inconsistencias puntuales (ReportScene).
