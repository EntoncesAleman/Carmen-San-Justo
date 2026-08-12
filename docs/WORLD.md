# WORLD.md — El Cinturón

La acción transcurre en una versión ficticia y reinterpretada de una gran
ciudad rioplatense y su conurbano, llamada colectivamente **"El Cinturón"**
en la jerga policial del juego. Ningún nombre de zona coincide con un barrio
real; cada uno está inspirado libremente en la "sensación" de un barrio real
sin copiar su nombre, mapa ni geografía exacta.

## Zonas jugables

| Zona ficticia | Inspiración conceptual | Identidad |
|---|---|---|
| **Manzana Fría** | Microcentro | Oficinas, bancos, gente que camina rápido, ruido de bocinas |
| **Terminal Sur** | Constitución | Terminal de larga distancia, caos, kiosqueros, gente de paso |
| **Palo Alto** | Palermo | Bares de diseño, plantas colgantes, gente que "emprende" |
| **Barrio Fábrica** | Barracas | Galpones, murales, algún taller clandestino |
| **La Ribera** | La Boca | Casas de colores, turistas, un club de barrio muy sospechoso |
| **Villa Flor** | Flores | Ferias, mercados, templos de todas las religiones en tres cuadras |
| **La Feria** | Once | Textiles al por mayor, mayoristas, ruido constante |
| **Terminal Norte** | Retiro | Trenes, micros, gente esperando algo que no llega |
| **Parque Obrero** | Parque Patricios | Clubes de fútbol, hospitales, casas bajas |
| **Villa Quieta** | Villa Devoto | Casas con jardín, silencio sospechoso, vecinos que vigilan |
| **Costa Alta** | Núñez | Cerca del río, estadios, edificios nuevos |
| **El Casco Antiguo** | San Telmo | Anticuarios, empedrado, fantasmas de utilería |
| **Puente Sur** | Avellaneda | Puente, humo industrial, hinchadas |
| **El Cruce** | Lanús | Estación de tren, quioscos 24 horas |
| **La Cervecera** | Quilmes | Fábrica enorme, olor a lúpulo, calles tranquilas |
| **El Oeste Profundo** | Morón | Suburbio extenso, aeroclub viejo, calles que se repiten |
| **Km 20** | San Martín | Zona industrial, galpones de logística |
| **El Delta** | Tigre | Ríos, islas, lanchas, gente que "no vive en ningún lado" |
| **La Barranca Norte** | San Isidro | Casonas, clubes de remo, apellidos largos |
| **Las Lomas Bajas** | Lomas de Zamora | Barrio residencial, canchas de básquet, quintas |

Cada zona tiene: 1–2 NPCs propios, un lugar visitable con identidad, al menos
una pista disponible y una descripción ambiental distinta (usada en textos,
no en arte definitivo por ahora — ver `ART_DIRECTION.md`).

## Lugares bizarros (implementados o planificados)

- **Comisaría 0** — nadie sabe quién está de guardia; el libro de guardia
  tiene páginas arrancadas. (Manzana Fría)
- **Kiosco de Simón** — funciona como centro de inteligencia del barrio; Don
  Simón sabe todo lo que pasa a diez cuadras. (Terminal Sur)
- **Lo de Pipo** — parrilla clandestina para policías fuera de servicio.
  (Parque Obrero)
- **Inmobiliaria Salerno & Hijos** — vende departamentos que no existen.
  (Palo Alto)
- **Peluquería Unisex "El Bochín"** — sabe todos los rumores del barrio antes
  que nadie. (Villa Flor)
- **Estación Fantasma de El Cruce** — andén abandonado, usado como punto de
  entrega. (El Cruce)
- **Club Social y Deportivo La Ribera** — un club de barrio sospechosamente
  bien equipado para lo que dice ser. (La Ribera)
- **Galpón de los Televisores** — depósito lleno de televisores viejos que
  nadie sabe de dónde salieron. (Km 20)
- **Delegación Municipal de Villa Quieta** — todos están tomando mate,
  ningún trámite avanza nunca. (Villa Quieta)
- **Lavadero "Brillo Total"** — lavadero de autos que sabe demasiado sobre
  quién pasó por ahí. (Puente Sur)
- **Central Cacho (remisería)** — usada como central de información barrial.
  (El Oeste Profundo)
- **Boliche Marejada** — tiene una pista escondida en el guardarropas.
  (Costa Alta)
- **Depósito de Objetos Confiscados N.º 3** — cajas de evidencia mal
  archivadas desde 1998. (Manzana Fría)
- **Bar El Fantasma del Bandoneón** — todos conocen a Fierro ahí, para bien y
  para mal. (El Casco Antiguo)
- **Muelle de Botes "La Anguila"** — punto de acceso a El Delta, alquiler de
  lanchas sin preguntas. (El Delta)

Se pueden agregar más lugares a medida que se necesiten para nuevos casos;
deben registrarse en `src/data/locations.ts`.

## Reglas de worldbuilding

- Ningún personaje representa a una persona real, viva o muerta.
- La criminalidad (narcotráfico, estafas) es siempre contexto narrativo, sin
  detalle operativo real.
- El humor sale de la situación y los personajes, no de la jerga forzada.
