# GAME_DESIGN.md — El Último Procedimiento

## Premisa

Un policía de dudosa reputación investiga a una banda criminal ficticia y
absurda a través de una versión ficticia y caricaturesca de CABA y el
conurbano. Género: detective / investigación / deducción / persecución. Vista
2D, jugable en navegador.

Todo el contenido (personajes, lugares, la banda) es 100% original. No se
representa a personas reales ni se copian mapas, textos o personajes de
ninguna franquicia existente. La inspiración se limita al concepto: pistas,
viajes, interrogatorios, deducción, persecución.

## Prioridad de desarrollo

`FUNCIONALIDAD > ESTABILIDAD > JUGABILIDAD > ARTE > POLISH`

## Loop principal

```
RECIBIR CASO → ANALIZAR INFORMACIÓN → VISITAR LUGAR → EXPLORAR →
HABLAR CON PERSONAJES → CONSEGUIR PISTAS → DEDUCIR DESTINO → VIAJAR →
NUEVAS PISTAS → IDENTIFICAR SOSPECHOSOS → PERSECUCIÓN → INTERCEPTAR →
RESOLVER EL CASO
```

El jugador nunca recibe instrucciones explícitas del tipo "andá a tal lugar".
Recibe pistas ambiguas (algunas falsas) y tiene que decidir. Puede
equivocarse, perder tiempo, y llegar a un final malo — el juego sigue siendo
"completable" en todos los casos, solo que no todos los finales son buenos.

## Sistemas principales

### Pistas (`docs/WORLD.md` tiene el detalle de contenido; el modelo vive en
`src/data/clues.ts` y se procesa en `src/systems/ClueManager.ts`)

Cada pista tiene: `id`, `descripcion`, `ubicacion`, `personajeId`,
`categoria` (geografica | temporal | cultural | visual | economica |
criminal | absurda | falsa | contradictoria), `confiabilidad` (0–100),
`destinosPosibles[]`. Las pistas falsas siempre tienen una contradicción
verificable con otra pista real (una fecha que no cierra, una zona
incompatible con un horario) para que el jugador pueda descartarlas por
deducción, no por azar.

### Deducción

El jugador arma una hipótesis en el "Pizarrón de sospechosos"
(`SuspectBoardScene`): combina pistas recolectadas y elige un destino/
sospechoso. Si la combinación de pistas confiables apunta a una zona, viajar
ahí avanza el caso. Si el jugador combina mal, no pierde instantáneamente:
recibe una pista de recuperación (un NPC le marca el error) pero pierde
tiempo, y el tiempo perdido tiene consecuencias (ver Tiempo).

### Interrogación

Diálogos ramificados. Acciones disponibles: `preguntar`, `insistir`,
`intimidar`, `bromear`, `mentir`, `mostrar evidencia`, `ofrecer favor`,
`retirarse`. Cada una modifica `confianza` (con ese NPC), `sospecha` (del
NPC hacia el jugador) y las estadísticas globales de reputación. Un NPC con
`confianza` baja no entrega su pista principal aunque se le pregunte bien.

### Tiempo

Cada acción tiene un costo en minutos (ver `Constants.ts` → `TIME_COSTS`).
El caso tiene un `deadline`. Pasado cierto umbral de tiempo restante ocurren
eventos negativos (una pista desaparece, un sospechoso cambia de destino, la
banda avanza un paso). Esto crea presión sin ser un timer en tiempo real:
todo avanza por turnos de acción del jugador.

### Reputación

Cinco variables globales: `reputacionPolicial`, `reputacionCallejera`,
`corrupcion`, `confianzaNpcsPromedio` (derivada), `sospecha`. Decisiones en
diálogos e interrogatorios las modifican. Algunas ramas de diálogo y algunos
finales están condicionados por umbrales de estas variables.

### Casos como datos

Un caso (`src/data/cases/*.ts`) es un objeto de datos: id, título,
descripción, sospechoso, ubicación inicial, ubicaciones posibles, pistas
(reales y falsas), pistas requeridas para resolverlo, eventos, deadline y
tabla de finales posibles. Agregar un caso nuevo no debería tocar ningún
sistema, solo agregar un archivo de datos y registrarlo en
`src/data/cases/index.ts`.

## Finales (mínimo 7, ver `docs/STORY.md` para el detalle narrativo)

1. Caso resuelto correctamente.
2. La banda escapa.
3. Se arrestó al sospechoso equivocado.
4. El protagonista queda involucrado en el escándalo.
5. Final absurdo.
6. Final secreto (requiere una combinación no obvia de reputación + pistas).
7. Final perfecto (todas las pistas correctas, reputación alta, sin
   corrupción excesiva).

## Modo debug

Ver `docs/TESTING.md`. Tecla configurable en `Constants.ts`, disponible
siempre durante el desarrollo.
