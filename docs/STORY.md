# STORY.md

## Tono

Bizarro, satírico, oscuro pero absurdo, argentino, surrealista, humorístico.
El mundo se toma en serio a sí mismo aunque resulte absurdo para el jugador:
los personajes no saben que están en una comedia.

**Hacer:**
- Humor seco, contradicciones, personajes que esquivan preguntas.
- Corrupción caricaturesca (sobres, favores, trámites) sin bajada de línea
  política real.
- Situaciones inesperadas (ver `docs/GAME_DESIGN.md` → eventos aleatorios).

**Evitar:**
- Repetir "che" en cada línea.
- Convertir a todos los NPCs en generadores de chistes non-stop.
- Referencias a personas o partidos políticos reales.
- Explicar procedimientos reales de delitos.

## Caso 1 — "El Operativo de las Medialunas"

### Premisa

Un operativo policial de rutina en Terminal Sur sale mal: "El Ingeniero"
Contreras, un intermediario de poca monta ligado a Los Administradores,
desaparece en medio del operativo — junto con una caja de medialunas que,
por algún motivo, todos los testigos mencionan primero que cualquier otra
cosa. Bracamonte le asigna el caso a Fierro porque nadie más lo quiere
tocar: si Contreras aparece muerto, es un escándalo; si aparece vivo y
hablando, es peor.

### Información contradictoria inicial

- El libro de guardia de la Comisaría 0 dice que el operativo terminó a las
  02:14. Reissig jura que fue después de las 03:00.
- Naza Quiroga asegura que vio una camioneta blanca "que no era de la
  policía ni de la banda, una tercera cosa". Nadie más la vio.
- Simón, el kiosquero, recuerda que Contreras compró tres docenas de
  medialunas esa misma noche "para llevar a algún lado, porque él de
  desayuno no comía nada".

### Cadena de pistas (real, no exhaustiva — el detalle vive en
`src/data/cases/caso1_medialunas.ts`)

1. **Kiosco de Simón** (Terminal Sur): la compra de medialunas + un comentario
   de Contreras sobre "ir a ver a los del Delta antes de que se enfríen".
   → Pista geográfica hacia El Delta.
2. **Comisaría 0** (Manzana Fría): el libro de guardia adulterado (una
   página con la hora tachada) — Reissig lo confirma solo con confianza
   alta. → Pista temporal, permite descartar la hora falsa que da otro NPC.
3. **Bar El Fantasma del Bandoneón** (El Casco Antiguo): un tango
   improvisado de Petrocelli menciona "una lancha que no vuelve" — parece
   metáfora, es literal. → Pista cultural/geográfica, refuerza El Delta.
4. **Central Cacho** (El Oeste Profundo): Cacho recuerda haber llevado a
   "Pampa" Ledesma hasta el Muelle La Anguila esa noche. → Pista criminal,
   conecta a la banda con El Delta.
5. **Pista falsa**: Naza Quiroga insiste en que todo pasó en Km 20 por la
   camioneta blanca — la camioneta existe, pero es de una empresa de
   catering que nada tiene que ver (contradice el horario del libro de
   guardia una vez corregido). Se puede descartar cruzándola con la pista 2.

### Resolución

El destino correcto reconstruido por deducción es **El Delta**, Muelle La
Anguila. Ahí el jugador encuentra a Contreras (vivo, escondido, no
secuestrado — se escapó de la banda porque "Los Administradores" lo iban a
"auditar" a él primero) y debe decidir cómo proceder, lo cual determina el
final.

### Finales del caso 1

1. **Resuelto correctamente**: Fierro entrega a Contreras vivo y con
   pruebas contra La Directora. Requiere las 4 pistas reales y no haber
   acumulado `sospecha` excesiva.
2. **La banda escapa**: si el jugador tarda demasiado (tiempo agotado), Los
   Administradores mueven a Contreras antes de que Fierro llegue.
3. **Sospechoso equivocado**: si el jugador viaja a Km 20 siguiendo la pista
   falsa sin cruzarla, arresta a un camionero de catering inocente.
4. **Escándalo**: si `corrupcion` es muy alta, Fierro negocia con Contreras
   en vez de arrestarlo, y la prensa (Naza, justo él) lo descubre.
5. **Final absurdo**: si el jugador interroga con `bromear`/`intimidar` de
   forma errática y sube mucho `reputacionCallejera` mientras baja
   `reputacionPolicial`, el caso se resuelve por pura casualidad cuando
   Contreras se entrega solo, exhausto de esconderse en una isla sin wifi.
6. **Final secreto**: requiere reputación alta Y haber hablado con TODOS los
   NPCs opcionales (incluido Egidio Paz, el jubilado) — revela que "El
   Ingeniero" es en realidad el sobrino de Bracamonte, lo cual reencuadra
   todo el caso.
7. **Final perfecto**: como el 1, pero además con `corrupcion` baja y
   habiendo rechazado al menos un soborno durante el caso.

Este documento es la fuente narrativa; la implementación de datos vive en
`src/data/cases/caso1_medialunas.ts` y debe mantenerse sincronizada con esta
descripción.

## Caso 2 — "El Contador Que Faltaba"

### Premisa

Chiche Molina, "El Contador" de Los Administradores, encuentra un faltante
grande en los libros de la banda y desaparece esa misma semana. Nadie sabe
si La Directora lo mandó "reubicar" por encontrarlo, o si Molina se asustó
y se escondió por su cuenta con la diferencia. Bracamonte le pasa el caso a
Fierro porque, otra vez, es el único que no le debe plata a nadie
involucrado. Todavía.

### Cadena de pistas

1. **Lo de Pipo** (Parque Obrero): Molina estuvo ahí la noche anterior,
   nervioso, hablando de "guardar los libros en un lugar seguro". → Pista
   temporal.
2. **Puente Sur** (Perla Sagasti): intercepta un llamado de Molina a la
   línea interna de la fábrica La Cervecera, la madrugada de la
   desaparición. → Pista criminal, apunta a La Cervecera.
3. **Costa Alta** (Yamila Cospito): rastrea una transferencia de Los
   Administradores a un depósito en garantía a nombre de "C. Molina",
   hecha desde una IP de La Cervecera. → Pista económica.
4. **Las Lomas Bajas** (Egidio Paz): anotó el auto de Molina entrando a La
   Cervecera dos noches seguidas, fuera de horario. → Pista visual.
5. **Pista falsa** (Nazareno Quiroga, Terminal Norte): insiste en que
   Molina se fugó a El Delta con la plata — el mismo patrón que en el caso
   1. Se descarta cruzándola con la pista de la llamada a La Cervecera
   (los horarios no cierran).

### Resolución y finales

El destino correcto es **La Cervecera**, donde Molina se esconde entre
cajas vacías. La estructura de finales es la misma que en el caso 1
(resuelto/banda escapa/sospechoso equivocado — un pescador inocente en El
Delta/escándalo/absurdo/secreto — el "faltante" resulta ser un invento de
Bracamonte para tapar otra cosa/perfecto), reutilizando el mismo
`EndingResolver` genérico sin ningún cambio de código: agregar un caso
nuevo es enteramente una tarea de datos (ver `docs/ARCHITECTURE.md`).

Implementación: `src/data/cases/caso2_contador.ts` +
`caso2_dialogues.ts`.
