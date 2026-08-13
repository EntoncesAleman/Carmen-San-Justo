# GAMEPLAY_AUDIT.md

Auditoría de sistemas de juego jugando la app real (2026-08-13, post-FASE
20). Complementa `VISUAL_AUDIT.md`. Base para priorizar FASE 21.

## Loop principal — comparado contra el pedido

Pedido: `NOMBRE → OFICINA → REPORTE → CASO → INVESTIGACIÓN → PISTAS →
CONEXIONES → VIAJE → EXPEDIENTE → CRIME COMPUTER → SOSPECHOSO → ORDEN →
PERSECUCIÓN → CAPTURA → RESULTADO → RANGO → NUEVO REPORTE`

Loop real verificado jugando de punta a punta (los 3 casos fijos y un
caso generado, esta sesión):

`MainMenu → Nueva Partida → ReportScene (reporte automático, SIN elegir
misión) → briefing (diálogo con Bracamonte) → CityMapScene → LocationScene
→ hablar con informantes → pistas → Pizarrón (reconstruir ruta con pistas
YA conseguidas, no a ciegas) → viajar (solo a zonas conectadas, cuesta
tiempo real) → Sistema de Inteligencia Criminal (identikit, filtra
sospechosos) → Orden de Captura (solo con 1 match real) → confrontación
(bloqueada sin orden) → arresto → EndingScene (rango, casos resueltos) →
Siguiente caso (automático)`

**Coincide en estructura** con el pedido — no hay pantalla de "elegir
misión" (eliminada a propósito, ver `docs/GAME_DESIGN.md` → Loop
principal), el caso llega solo, las pistas son necesarias (no
decorativas, invariante de test permanente), viajar cuesta tiempo y está
limitado por conexiones, la orden de captura es un gate real verificado
(no se puede confrontar sin ella), el tiempo es real y puede hacer perder
el caso (`banda_escapa`).

**Falta contra el pedido**:

| Sistema | Estado actual | Pedido | Gap |
|---|---|---|---|
| Nombre del detective | `NameEntryScene` (FASE 21), input real por teclado antes del primer reporte | Ingresar nombre, usado en todo el juego | ✅ hecho (FASE 21) |
| Identidad del jugador en textos | Aparece en ReportScene/CaseFileScene/CrimeComputerScene/EndingScene como campo "DETECTIVE:" | "Detective X, tiene un reporte" | 🟡 hecho en pantallas de sistema; falta integrarlo en las LÍNEAS de diálogo de los NPCs (los árboles de diálogo de los 3 casos fijos son texto estático escrito antes de que existiera el nombre) |
| Investigar (acción con sub-opciones de lugar) | Cada zona tiene UNA locación fija con NPCs fijos + "Explorar" (una tirada) | Elegir DÓNDE investigar dentro de la zona (estación/kiosco/bar) | 🟡 simplificación deliberada, no bug — el diseño actual usa 1 locación por zona en vez de 3-4 sub-lugares |
| Interrogar con menú de preguntas por tema | Cada NPC tiene un árbol de diálogo con 2-4 opciones fijas (preguntar/insistir/intimidar/etc., varía por NPC) | "¿A dónde fue? / ¿Cómo era? / ¿Qué transporte tomó?" como categorías fijas | 🟢 ya cumple el espíritu, con vocabulario propio en vez de esas 3 categorías fijas |
| Mapa de conexiones visual | Solo texto en el menú ("Viajar a San Telmo") | Mapa dibujado con nodos y líneas | 🔴 falta representación gráfica |
| Transporte como mecánica (ej. "colectivo 21") | No existe — viajar es abstracto (solo consume tiempo) | Pista de transporte específico a deducir | 🔴 no implementado, es una mecánica nueva pedida, no una regresión |
| Pistas con nivel de confianza visible | `CaseFileScene` muestra "(CONFIANZA: ALTA/MEDIA/BAJA)" por pista, derivado de `Clue.confiabilidad` (FASE 21) | "CONFIANZA: ALTA/MEDIA/BAJA" visible | ✅ hecho (FASE 21) |
| Cuaderno del detective (ver todo sin salir del caso) | Existe como 3 pantallas separadas (Expediente/Pizarrón/Inteligencia Criminal), no un cuaderno unificado | Un cuaderno con pistas+sospechosos+ubicaciones+transporte | 🟡 la información existe, repartida en 3 pantallas en vez de 1 |
| Sistema de guardado | `SaveSystem` con 3 slots, guarda caso completo (fijo o generado) + reputación + progreso + `detectiveName` (FASE 21) | Guardar nombre, rango, config | 🟡 nombre ya se guarda; falta preferencias de audio/velocidad de texto (no existen como configuración todavía) |
| Reanudar partida | `LoadGameScene` ya existe, lista los 3 slots | "¿Continuar expediente?" | 🟢 ya cumple el espíritu |
| Rangos | `RANKS` con progresión por casos resueltos, ya mostrado en EndingScene | Rookie→Cadete→Detective→Inspector→Jefe | ✅ ya existe, nombres a confirmar contra el pedido |
| Salón de la fama | No existe | Hall of Fame con historial | 🔴 falta |
| Dificultad progresiva por rango | El generador (`CaseGenerator`) no varía dificultad según rango/casos resueltos — todos los casos generados tienen la misma "forma" (3-4 paradas, 6 atributos) | Más pistas ambiguas / rutas más largas en rango alto | 🔴 no implementado |
| Controles de teclado (ENTER/ESC/atajos) | Solo mouse, salvo backtick para debug | ENTER/ESC/atajos de letra | 🔴 falta |
| Sonido de tecleo en el typewriter | `TypewriterText` no reproduce sonido por carácter | Sonido de máquina de escribir | 🔴 falta |

## Verificación de invariantes de diseño (ya cubiertas por tests automáticos)

Estas partes del pedido YA están garantizadas por tests permanentes, no
solo "parecen funcionar":

- Ninguna pista sola resuelve el identikit (`assertIdentikitSolvableAndNotTrivial`).
- Toda ruta (fija o generada) es un camino real sobre el grafo de
  conexiones — no se puede viajar directo a cualquier zona.
- Para cada salto de ruta existe al menos una pista real que lo respalda
  en el Pizarrón — no se puede reconstruir la ruta a fuerza bruta sin
  evidencia (bug real encontrado y cerrado en FASE 19).
- Todo caso (fijo o generado) es matemáticamente ganable dentro de su
  deadline jugando óptimo, con margen (`deadlineMinutos >=
  estimateOptimalMinutos(caso) * 1.4`).

## Conclusión

El ESQUELETO del loop (reporte automático → investigación → pistas →
ruta → identikit → orden → captura → rango → siguiente caso) ya cumple
la estructura pedida y está reforzado con tests que otros cambios no
pueden romper en silencio. Las brechas reales más grandes son: identidad
del jugador (nombre, inexistente), representación visual del mapa de
viaje (solo texto), y la mecánica de transporte específico (colectivo,
tren) como capa de deducción adicional sobre el viaje ya existente.
