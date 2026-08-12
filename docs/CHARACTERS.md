# CHARACTERS.md

Todos los personajes son ficticios y originales. Ninguno representa a una
persona real. Esta lista es la fuente de verdad narrativa; el contenido
jugable equivalente vive en `src/data/npcs.ts` y `src/data/gang.ts`.

## Protagonista

### Inspector Ezequiel Farías — "Fierro"

- **Edad**: 47
- **Personalidad**: sarcástico, oportunista, cansado, medio corrupto,
  sorprendentemente bueno atando cabos cuando le conviene. No es un héroe:
  acepta sobres, pero tiene un límite que ni él sabe bien dónde está.
- **Apariencia**: campera de cuero gastada, camisa siempre arrugada, anteojos
  de sol incluso de noche "porque los perdí en algún lado y estos me los
  prestaron".
- **Voz conceptual**: tono seco, respuestas cortas, comentarios al margen que
  nadie le pidió.
- **Historia personal**: veterano de la fuerza a dos años de jubilarse,
  arrastra una investigación interna por "extravío" de dinero de un
  operativo de 2019 que nunca se cerró. Lo asignan a este caso porque es
  políticamente incómodo y porque tiene contactos que ningún policía
  "correcto" tendría.
- **Contactos**: medio Cinturón le debe un favor o le desconfía; no hay
  término medio.

## NPCs (20)

1. **Comisario Aldo Reissig — "El Zorro Gris"** (policía veterano, Comisaría
   0, Manzana Fría). Sabe más de lo que dice. Ayuda a Fierro si la
   `confianza` es alta; si no, lo manda a "seguir el reglamento" a propósito
   para hacerlo perder tiempo.
2. **Oficial Marina Ithurbide — "La Cadete de Hierro"** (policía intachable,
   Comisaría 0). Desconfía de Fierro desde el día uno. Tiene una pista real
   pero solo la da si `reputacionPolicial` es alta.
3. **Nazareno "Naza" Quiroga** (periodista paranoico, Terminal Norte). Cree
   que todo es un operativo encubierto. El 70% de lo que dice es ruido; el
   30% restante es la mejor pista del caso.
4. **Don Simón Achával** (kiosquero filósofo, Kiosco de Simón, Terminal
   Sur). Habla en parábolas. Nunca miente, pero nunca responde directo.
5. **"Beba" Corvalán** (taxista que sabe todo, recorre varias zonas). Vende
   información a cambio de que Fierro le perdone una infracción.
6. **Dr. Federico Salaberry — "El Doctor Servicios"** (abogado sospechoso,
   Palo Alto). Representa a "clientes que prefieren no dar nombre". Miente
   con mucha elegancia.
7. **El Hombre de las Palomas** (informante, nombre desconocido, Parque
   Obrero). Nunca responde una pregunta directamente; solo con acertijos
   sobre palomas que, decodificados, son la pista.
8. **Marta Yulis** (empleada municipal, Delegación de Villa Quieta).
   Obsesionada con los sellos. No avanza ningún trámite, pero archivó por
   error un documento clave.
9. **Armando Petrocelli — "El Fantasma del Bandoneón"** (cantante de bar,
   Bar El Fantasma, El Casco Antiguo). Canta tangos inventados sobre casos
   viejos; uno de ellos es, sin que él lo sepa, sobre este caso.
10. **Cacho Domenech** (remisero, Central Cacho, El Oeste Profundo). Central
    de información barrial. Todo el mundo pasó por su auto alguna vez.
11. **"Pipo" Escanciano** (dueño de parrilla clandestina, Lo de Pipo, Parque
    Obrero). Le cocina a medio departamento de policía fuera de horario.
12. **Inspectora Perla Sagasti** (detective rival, Comisaría de Puente Sur).
    Compite con Fierro por resolver el caso primero. No es mala persona,
    solo insufrible.
13. **"Media Cuadra" Ibáñez** (delincuente mediocre, El Cruce). Le dicen así
    porque nunca llegó lejos robando nada. Sabe cosas de la banda por pura
    casualidad.
14. **"El Ingeniero" Contreras** (narco caricaturesco, independiente de Los
    Administradores). Se hace llamar ingeniero; no terminó la secundaria. Es
    la persona desaparecida en el primer caso.
15. **Yamila Cospito — "Root"** (hacker porteña, Costa Alta). Ayuda a Fierro
    a cambio de que la deje en paz con una multa de tránsito de 2021.
16. **Don Egidio Paz** (jubilado observador, plaza de Las Lomas Bajas). Anota
    patentes de auto en un cuaderno desde 1987. Tiene TODO archivado, pero
    su sistema de clasificación solo lo entiende él.
17. **"Manteca" Ruiz** (vendedor ambulante, se mueve entre zonas). Vende de
    todo: paraguas, pilas, y a veces información.
18. **Walter Chiodi** (vecino conspiranoico, Villa Quieta). Cree que las
    palomas son cámaras del gobierno. Tiene razón sobre una cosa, por
    accidente.
19. **Gustavo Salerno** (empresario turbio, Inmobiliaria Salerno & Hijos,
    Palo Alto). Vende departamentos inexistentes; lava plata sin saberlo del
    todo, o haciéndose el que no sabe.
20. **Comisario Hugo Bracamonte** (jefe directo de Fierro, Comisaría 0).
    Presiona por resultados rápidos y a la vez recibe sobres de todos lados.
    Da los casos y evalúa el final según cómo quedó él parado políticamente.

## NPCs del Caso 2

21. **Chiche Molina — "El Contador"** (La Cervecera). Ver
    `docs/CHARACTERS.md` → banda criminal para su rol en "Los
    Administradores"; en el caso 2 es la figura desaparecida, no un
    villano — encontró un faltante en los libros y no sabe si es un error
    o un robo, ni de quién.
22. **Bruno Aguirre — "El Pescador"** (El Delta). Ajeno por completo al
    caso; el sospechoso equivocado del caso 2 si el jugador sigue la pista
    falsa de Naza sin cruzarla.

## Banda criminal: "Los Administradores"

Banda absurda organizada como si fuera una oficina pública: todo con
memos, sellos, horarios de almuerzo y un libro de actas.

- **Delia Robirosa — "La Directora"** (líder). Dirige la banda como si fuera
  una gerencia de organismo público. Todo pasa por "el formulario
  correspondiente".
- **Renato Uzal — "El Escribano"** (segundo al mando). Frío, preciso, cita
  reglamentos internos de la banda como si fueran ley.
- **Chiche Molina — "El Contador"** (especialista financiero). Obsesionado
  con las facturas. Una vez auditó a la propia banda y encontró un faltante.
- **"Pampa" Ledesma** (conductor). Ex taxista, conoce cada atajo del
  Cinturón. El único con sentido común del grupo.
- **Osvaldo Pais — "El Loro"** (informante). Habla tanto que ya no se sabe
  qué información es real y cuál inventó para sonar importante.
- **"Tinta" Robledo** (falsificador ficticio de sellos y membretes). Su
  trabajo es believable solo porque nadie mira los papeles con atención.
- **"GPS" Herrera** (organiza rutas). Memorizó cada calle del Cinturón; no
  memorizó, en cambio, ningún nombre de persona.
- **"Bocha" Fernández** (el incompetente, primo de La Directora). Está en la
  banda por parentesco, no por mérito. Arruina un plan por capítulo.

Ninguna instrucción de delito real se describe en diálogos ni en datos: la
banda es un vehículo narrativo y cómico, no un manual.
