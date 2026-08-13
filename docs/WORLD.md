# WORLD.md — El Cinturón

La acción transcurre en el AMBA real, llamado colectivamente **"El
Cinturón"** en la jerga policial del juego — pedido explícito: los lugares
tienen que ser barrios/partidos reales del AMBA, no inventados (ver FASE
19 en CHANGELOG.md). Los NPCs, casos, comercios y situaciones que pasan en
cada zona siguen siendo 100% ficticios.

## Zonas jugables

| Zona | Identidad |
|---|---|
| **Microcentro** | Oficinas, bancos, gente que camina rápido, ruido de bocinas |
| **Constitución** | Terminal de larga distancia, caos, kiosqueros, gente de paso |
| **Palermo** | Bares de diseño, plantas colgantes, gente que "emprende" |
| **Barracas** | Galpones, murales, algún taller clandestino |
| **La Boca** | Casas de colores, turistas, un club de barrio muy sospechoso |
| **Flores** | Ferias, mercados, templos de todas las religiones en tres cuadras |
| **Once** | Textiles al por mayor, mayoristas, ruido constante |
| **Retiro** | Trenes, micros, gente esperando algo que no llega |
| **Parque Patricios** | Clubes de fútbol, hospitales, casas bajas |
| **Villa Devoto** | Casas con jardín, silencio sospechoso, vecinos que vigilan |
| **Núñez** | Cerca del río, estadios, edificios nuevos |
| **San Telmo** | Anticuarios, empedrado, fantasmas de utilería |
| **Avellaneda** | Puente, humo industrial, hinchadas |
| **Lanús** | Estación de tren, quioscos 24 horas |
| **Quilmes** | Fábrica enorme, olor a lúpulo, calles tranquilas |
| **Morón** | Suburbio extenso, aeroclub viejo, calles que se repiten |
| **San Martín** | Zona industrial, galpones de logística |
| **Tigre** | Ríos, islas, lanchas, gente que "no vive en ningún lado" |
| **San Isidro** | Casonas, clubes de remo, apellidos largos |
| **Lomas de Zamora** | Barrio residencial, canchas de básquet, quintas |

Cada zona tiene: 1–2 NPCs propios, un lugar visitable con identidad, al menos
una pista disponible y una descripción ambiental distinta (usada en textos,
no en arte definitivo por ahora — ver `ART_DIRECTION.md`).

## Lugares bizarros (implementados o planificados)

- **Comisaría 0** — nadie sabe quién está de guardia; el libro de guardia
  tiene páginas arrancadas. (Microcentro)
- **Kiosco de Simón** — funciona como centro de inteligencia del barrio; Don
  Simón sabe todo lo que pasa a diez cuadras. (Constitución)
- **Lo de Pipo** — parrilla clandestina para policías fuera de servicio.
  (Parque Patricios)
- **Inmobiliaria Salerno & Hijos** — vende departamentos que no existen.
  (Palermo)
- **Peluquería Unisex "El Bochín"** — sabe todos los rumores del barrio antes
  que nadie. (Flores)
- **Estación Fantasma de Lanús** — andén abandonado, usado como punto de
  entrega. (Lanús)
- **Club Social y Deportivo La Boca** — un club de barrio sospechosamente
  bien equipado para lo que dice ser. (La Boca)
- **Galpón de los Televisores** — depósito lleno de televisores viejos que
  nadie sabe de dónde salieron. (San Martín)
- **Delegación Municipal de Villa Devoto** — todos están tomando mate,
  ningún trámite avanza nunca. (Villa Devoto)
- **Lavadero "Brillo Total"** — lavadero de autos que sabe demasiado sobre
  quién pasó por ahí. (Avellaneda)
- **Central Cacho (remisería)** — usada como central de información barrial.
  (Morón)
- **Boliche Marejada** — tiene una pista escondida en el guardarropas.
  (Núñez)
- **Depósito de Objetos Confiscados N.º 3** — cajas de evidencia mal
  archivadas desde 1998. (Microcentro)
- **Bar El Fantasma del Bandoneón** — todos conocen a Fierro ahí, para bien y
  para mal. (San Telmo)
- **Muelle de Botes "La Anguila"** — punto de acceso a Tigre, alquiler de
  lanchas sin preguntas. (Tigre)

Se pueden agregar más lugares a medida que se necesiten para nuevos casos;
deben registrarse en `src/data/locations.ts`.

## Reglas de worldbuilding

- Ningún personaje representa a una persona real, viva o muerta.
- La criminalidad (narcotráfico, estafas) es siempre contexto narrativo, sin
  detalle operativo real.
- El humor sale de la situación y los personajes, no de la jerga forzada.
