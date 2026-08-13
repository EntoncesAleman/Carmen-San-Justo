import { NPC } from './types';

export const NPCS: NPC[] = [
    {
        id: 'aldo_reissig', nombre: 'Aldo Reissig', apodo: 'El Zorro Gris', edadAproximada: 61,
        personalidad: 'Veterano, cansado, sabe más de lo que dice.', apariencia: 'Uniforme siempre impecable, bigote gris prolijo.',
        vozConceptual: 'Habla despacio, deja silencios incómodos a propósito.', relacionProtagonista: 'Compañero de mil operativos; confía en Fierro pero no lo dice.',
        zoneId: 'manzana_fria', infoQueConoce: 'La hora real en que terminó el operativo.', infoQueOculta: 'Que él mismo alteró el libro de guardia para cubrir a un superior.',
        puedeMentir: true,
    },
    {
        id: 'marina_ithurbide', nombre: 'Marina Ithurbide', apodo: 'La Cadete de Hierro', edadAproximada: 29,
        personalidad: 'Intachable, desconfía de los atajos.', apariencia: 'Uniforme perfecto, libreta siempre a mano.',
        vozConceptual: 'Tono formal, respuestas cortas y precisas.', relacionProtagonista: 'Desconfía de Fierro desde el primer día.',
        zoneId: 'manzana_fria', infoQueConoce: 'El movimiento real de patrulleros esa noche.', infoQueOculta: 'Sospecha de Reissig pero no tiene pruebas.',
        puedeMentir: false,
    },
    {
        id: 'hugo_bracamonte', nombre: 'Hugo Bracamonte', apodo: 'El Comisario', edadAproximada: 55,
        personalidad: 'Presiona por resultados, recibe sobres de todos lados.', apariencia: 'Traje que le queda ajustado, anillo grande.',
        vozConceptual: 'Tono de jefe que nunca tiene tiempo.', relacionProtagonista: 'Jefe directo de Fierro; le asigna el caso.',
        zoneId: 'manzana_fria', infoQueConoce: 'El contexto político incómodo del caso.', infoQueOculta: 'Un vínculo familiar con "El Ingeniero" Contreras.',
        puedeMentir: true,
    },
    {
        id: 'nazareno_quiroga', nombre: 'Nazareno Quiroga', apodo: 'Naza', edadAproximada: 38,
        personalidad: 'Periodista paranoico, cree que todo es un operativo encubierto.', apariencia: 'Campera con demasiados bolsillos, grabador viejo.',
        vozConceptual: 'Habla rápido, encadena teorías sin parar.', relacionProtagonista: 'Le debe una nota a Fierro; se la cobra en información.',
        zoneId: 'terminal_norte', infoQueConoce: 'Vio una camioneta blanca la noche del operativo.', infoQueOculta: 'La camioneta era de un catering, no de la banda.',
        puedeMentir: false,
    },
    {
        id: 'simon_achaval', nombre: 'Simón Achával', apodo: 'Don Simón', edadAproximada: 68,
        personalidad: 'Filósofo de kiosco, habla en parábolas.', apariencia: 'Guardapolvo gris, anteojos de aumento.',
        vozConceptual: 'Nunca responde directo, pero nunca miente.', relacionProtagonista: 'Le vende cigarrillos a Fierro desde hace veinte años.',
        zoneId: 'terminal_sur', infoQueConoce: 'Contreras compró tres docenas de medialunas esa noche.', infoQueOculta: 'Nada; simplemente disfruta hacer esperar la respuesta.',
        puedeMentir: false,
    },
    {
        id: 'beba_corvalan', nombre: 'Beba Corvalán', apodo: 'Beba', edadAproximada: 50,
        personalidad: 'Taxista que sabe todo, negocia con dureza.', apariencia: 'Campera de jean, mate en el portavasos.',
        vozConceptual: 'Directa, sin vueltas, cobra por adelantado.', relacionProtagonista: 'Le debe favores a Fierro por infracciones perdonadas.',
        zoneId: 'terminal_sur', infoQueConoce: 'Rumores de pasajeros sobre movimientos raros en el Delta.', infoQueOculta: 'Nada relevante; es puro relleno de color.',
        puedeMentir: false,
    },
    {
        id: 'federico_salaberry', nombre: 'Federico Salaberry', apodo: 'El Doctor Servicios', edadAproximada: 45,
        personalidad: 'Abogado sospechoso, elegante, esquiva.', apariencia: 'Traje impecable, portafolio de cuero.',
        vozConceptual: 'Formal hasta la exageración, nunca da un nombre.', relacionProtagonista: 'Rivalidad cordial con Fierro.',
        zoneId: 'palo_alto', infoQueConoce: 'Representa a "clientes que prefieren no dar nombre".', infoQueOculta: 'Uno de esos clientes es Los Administradores.',
        puedeMentir: true,
    },
    {
        id: 'hombre_de_las_palomas', nombre: 'Desconocido', apodo: 'El Hombre de las Palomas', edadAproximada: 70,
        personalidad: 'Informante que nunca responde directo, habla en acertijos.', apariencia: 'Impermeable gastado, migas de pan en los bolsillos.',
        vozConceptual: 'Todo lo dice a través de metáforas sobre palomas.', relacionProtagonista: 'Nadie sabe cómo empezó esta relación, pero funciona.',
        zoneId: 'parque_obrero', infoQueConoce: 'Movimientos nocturnos alrededor de la banda.', infoQueOculta: 'Su acertijo favorito es, literalmente, la solución del caso.',
        puedeMentir: false,
    },
    {
        id: 'marta_yulis', nombre: 'Marta Yulis', apodo: 'Marta', edadAproximada: 52,
        personalidad: 'Empleada municipal obsesionada con los sellos.', apariencia: 'Cardigan, uñas pintadas, ventanilla número 3.',
        vozConceptual: 'Repite frases de manual de atención al público.', relacionProtagonista: 'Le hizo un trámite a Fierro hace años; se acuerda.',
        zoneId: 'villa_quieta', infoQueConoce: 'Archivó por error un documento clave del caso.', infoQueOculta: 'No sabe que lo tiene; hay que ayudarla a encontrarlo.',
        puedeMentir: false,
    },
    {
        id: 'armando_petrocelli', nombre: 'Armando Petrocelli', apodo: 'El Fantasma del Bandoneón', edadAproximada: 64,
        personalidad: 'Cantante de bar, inventa tangos sobre casos viejos.', apariencia: 'Traje brillante gastado, bandoneón bajo el brazo.',
        vozConceptual: 'Canta más de lo que habla.', relacionProtagonista: 'Fierro le paga tragos a cambio de tangos con información.',
        zoneId: 'casco_antiguo', infoQueConoce: 'Un tango sobre "una lancha que no vuelve".', infoQueOculta: 'No sabe que su canción es literal, no metafórica.',
        puedeMentir: false,
    },
    {
        id: 'cacho_domenech', nombre: 'Cacho Domenech', apodo: 'Cacho', edadAproximada: 47,
        personalidad: 'Remisero, central de información barrial.', apariencia: 'Buzo del club, mate frío en el auto.',
        vozConceptual: 'Cuenta todo como si fuera un partido de fútbol.', relacionProtagonista: 'Compañero de la infancia de Fierro.',
        zoneId: 'oeste_profundo', infoQueConoce: 'Llevó a "Pampa" Ledesma hasta el Muelle La Anguila esa noche.', infoQueOculta: 'Le pagaron el doble por "no acordarse" de nada.',
        puedeMentir: true,
    },
    {
        id: 'pipo_escanciano', nombre: 'Pipo Escanciano', apodo: 'Pipo', edadAproximada: 58,
        personalidad: 'Dueño de parrilla clandestina para policías.', apariencia: 'Delantal manchado, cuchillo siempre en la mano.',
        vozConceptual: 'Habla de todo en términos de cortes de carne.', relacionProtagonista: 'Le fía las cuentas a Fierro desde hace años.',
        zoneId: 'parque_obrero', infoQueConoce: 'Rumores de quién comió ahí la noche del operativo.', infoQueOculta: 'Nada grave; protege a sus clientes por principio.',
        puedeMentir: false,
    },
    {
        id: 'perla_sagasti', nombre: 'Perla Sagasti', apodo: 'Inspectora Sagasti', edadAproximada: 41,
        personalidad: 'Detective rival, compite por resolver el caso primero.', apariencia: 'Impecable, libreta de cuero, nunca despeinada.',
        vozConceptual: 'Tono competitivo pero nunca cruel.', relacionProtagonista: 'Rivalidad profesional histórica con Fierro.',
        zoneId: 'puente_sur', infoQueConoce: 'Va un paso adelante o atrás según las decisiones del jugador.', infoQueOculta: 'También sospecha del Delta, pero no lo va a admitir.',
        puedeMentir: true,
    },
    {
        id: 'media_cuadra_ibanez', nombre: 'Ibáñez', apodo: 'Media Cuadra', edadAproximada: 33,
        personalidad: 'Delincuente mediocre, nunca llegó lejos robando nada.', apariencia: 'Buzo con capucha, siempre nervioso.',
        vozConceptual: 'Habla rápido y se contradice solo.', relacionProtagonista: 'Fierro lo arrestó tres veces; ya casi son amigos.',
        zoneId: 'el_cruce', infoQueConoce: 'Detalles sueltos de la logística de Los Administradores.', infoQueOculta: 'Le tiene miedo a "El Escribano".',
        puedeMentir: true,
    },
    {
        id: 'el_ingeniero_contreras', nombre: 'Contreras', apodo: 'El Ingeniero', edadAproximada: 44,
        personalidad: 'Narco caricaturesco; se hace llamar ingeniero sin haber terminado el secundario.', apariencia: 'Camisa de golf, reloj demasiado grande.',
        vozConceptual: 'Usa palabras técnicas mal usadas para sonar importante.', relacionProtagonista: 'Es el sospechoso/víctima del caso 1.',
        zoneId: 'el_delta', infoQueConoce: 'Por qué se escapó de la banda.', infoQueOculta: 'Que Los Administradores lo iban a "auditar" a él primero.',
        puedeMentir: true,
    },
    {
        id: 'yamila_cospito', nombre: 'Yamila Cospito', apodo: 'Root', edadAproximada: 26,
        personalidad: 'Hacker porteña, ayuda a cambio de favores chicos.', apariencia: 'Campera con parches, notebook llena de stickers.',
        vozConceptual: 'Jerga técnica mezclada con sarcasmo.', relacionProtagonista: 'Fierro le debe perdonar una multa de tránsito.',
        zoneId: 'costa_alta', infoQueConoce: 'Movimientos digitales sueltos de la banda.', infoQueOculta: 'Nada crítico para el caso 1; personaje para casos futuros.',
        puedeMentir: false,
    },
    {
        id: 'egidio_paz', nombre: 'Egidio Paz', apodo: 'Don Egidio', edadAproximada: 79,
        personalidad: 'Jubilado observador, anota patentes desde 1987.', apariencia: 'Boina, banco de plaza fijo, termo bajo el brazo.',
        vozConceptual: 'Cuenta todo con fechas exactas, aunque nadie se las pida.', relacionProtagonista: 'Ninguna previa; hay que ganarse su confianza.',
        zoneId: 'lomas_bajas', infoQueConoce: 'Un dato que solo importa para el final secreto.', infoQueOculta: 'No oculta nada, solo hay que escucharlo entero.',
        puedeMentir: false,
    },
    {
        id: 'manteca_ruiz', nombre: 'Ruiz', apodo: 'Manteca', edadAproximada: 36,
        personalidad: 'Vendedor ambulante, vende de todo y a veces información.', apariencia: 'Carrito con paraguas, pilas y linternas.',
        vozConceptual: 'Vende cada frase como si fuera una oferta.', relacionProtagonista: 'Le vendió un paraguas a Fierro que nunca funcionó.',
        zoneId: 'villa_flor', infoQueConoce: 'Rumores de la calle, en su mayoría irrelevantes.', infoQueOculta: 'Nada; es puro color para el mundo.',
        puedeMentir: false,
    },
    {
        id: 'walter_chiodi', nombre: 'Walter Chiodi', apodo: 'Walter', edadAproximada: 60,
        personalidad: 'Vecino conspiranoico, cree que las palomas son cámaras.', apariencia: 'Piyama a toda hora, gorro de aluminio "por si acaso".',
        vozConceptual: 'Todo es un complot, hasta el clima.', relacionProtagonista: 'Le hace denuncias falsas a Fierro cada semana.',
        zoneId: 'villa_quieta', infoQueConoce: 'Tiene razón sobre una cosa, de pura casualidad.', infoQueOculta: 'No sabe distinguir lo real de lo inventado.',
        puedeMentir: false,
    },
    {
        id: 'gustavo_salerno', nombre: 'Gustavo Salerno', apodo: 'Salerno', edadAproximada: 53,
        personalidad: 'Empresario turbio, vende departamentos inexistentes.', apariencia: 'Traje caro, reloj más caro, sonrisa de vendedor.',
        vozConceptual: 'Todo suena a folleto inmobiliario.', relacionProtagonista: 'Le "regaló" un almuerzo a Fierro una vez; se lo recuerda seguido.',
        zoneId: 'palo_alto', infoQueConoce: 'Lava plata sin admitirlo del todo.', infoQueOculta: 'Una cuenta compartida con Los Administradores.',
        puedeMentir: true,
    },
    {
        id: 'camionero_catering', nombre: 'Néstor Ayala', apodo: 'El de la Camioneta Blanca', edadAproximada: 39,
        personalidad: 'Camionero de una empresa de catering, ajeno por completo al caso.', apariencia: 'Uniforme de la empresa, gorra con logo desteñido.',
        vozConceptual: 'Confundido, cada vez más indignado.', relacionProtagonista: 'Ninguna; está en el lugar equivocado en el momento equivocado.',
        zoneId: 'km_20', infoQueConoce: 'Nada del caso. Reparte facturas para un evento en San Martín.', infoQueOculta: 'Nada; simplemente no tiene nada que ver.',
        puedeMentir: false,
    },
    // NPCs del Caso 2 ("El Contador Que Faltaba"). chiche_molina ya existe
    // como referencia narrativa en data/gang.ts; acá se define su versión
    // jugable/confrontable, con ficha completa como cualquier otro NPC.
    {
        id: 'chiche_molina', nombre: 'Chiche Molina', apodo: 'El Contador', edadAproximada: 51,
        personalidad: 'Obsesivo con los números, aterrado por primera vez en su vida.', apariencia: 'Traje gastado, calculadora de bolsillo, corbata torcida.',
        vozConceptual: 'Habla en cifras y porcentajes incluso cuando tiene miedo.', relacionProtagonista: 'Ninguna previa; es la figura desaparecida del Caso 2.',
        zoneId: 'la_cervecera', infoQueConoce: 'Encontró un faltante grande en los libros de Los Administradores.', infoQueOculta: 'No sabe si el faltante es un error o un robo, ni de quién.',
        puedeMentir: true,
    },
    {
        id: 'pescador_aguirre', nombre: 'Bruno Aguirre', apodo: 'El Pescador', edadAproximada: 58,
        personalidad: 'Tranquilo, ajeno por completo a cualquier caso.', apariencia: 'Botas de goma, caña de pescar, gorro gastado por el sol.',
        vozConceptual: 'Habla despacio, como si el tiempo no le importara demasiado.', relacionProtagonista: 'Ninguna; está en el lugar equivocado en el momento equivocado, otra vez.',
        zoneId: 'el_delta', infoQueConoce: 'Nada del caso; conoce cada recoveco del río.', infoQueOculta: 'Nada.',
        puedeMentir: false,
    },
    // NPCs del Caso 3 ("El Robo del Trofeo del Club").
    {
        id: 'toto_ferradas', nombre: 'Toto Ferradas', apodo: 'Toto', edadAproximada: 49,
        personalidad: 'Vendedor de autos usados, hincha fanático del club, indignado por el robo.', apariencia: 'Camisa a cuadros, birome siempre en la oreja.',
        vozConceptual: 'Habla del robo como si fuera un partido perdido en el último minuto.', relacionProtagonista: 'Ninguna previa; es testigo del Caso 3.',
        zoneId: 'feria_usados', infoQueConoce: 'Vio subir al ladrón a un colectivo de la línea 21 con un bulto sospechoso.', infoQueOculta: 'Nada; lo cuenta todo con gusto, varias veces.',
        puedeMentir: false,
    },
    {
        id: 'bocha_ferreyra', nombre: '"Bocha" Ferreyra', apodo: 'El Bocha', edadAproximada: 34,
        personalidad: 'Utilero del club, jugador de truco compulsivo, se cree más vivo de lo que es.', apariencia: 'Buzo del club gastado, gorra al revés, siempre masticando algo.',
        vozConceptual: 'Fanfarrón, se contradice cada dos frases.', relacionProtagonista: 'Ninguna previa; es el sospechoso/víctima del Caso 3.',
        zoneId: 'casco_antiguo', infoQueConoce: 'Por qué se llevó la copa y a quién se la iba a vender.', infoQueOculta: 'Que le debe plata de truco a gente de Los Administradores.',
        puedeMentir: true,
    },
    {
        id: 'turco_almada', nombre: 'Almada', apodo: 'El Turco Almada', edadAproximada: 44,
        personalidad: 'Vendedor ambulante de la feria, ajeno por completo al caso.', apariencia: 'Mesa plegable, relojes y anteojos de sol falsificados.',
        vozConceptual: 'Todo se lo vende a todos, incluida su inocencia.', relacionProtagonista: 'Ninguna; está en el lugar equivocado en el momento equivocado, de nuevo.',
        zoneId: 'la_feria', infoQueConoce: 'Nada del caso; conoce todos los precios de la feria de memoria.', infoQueOculta: 'Nada.',
        puedeMentir: false,
    },
    // Operativos nuevos, solo para el generador de casos procedural (ver
    // data/generator/operatives.ts) — no tienen un caso fijo propio, la
    // confrontación se arma genérica en CaseGenerator.
    {
        id: 'colorada_benitez', nombre: 'Benítez', apodo: '"La Colorada" Benítez', edadAproximada: 42,
        personalidad: 'Peluquera de barrio, sabe todo de todos y no puede evitar contarlo.', apariencia: 'Guardapolvo con manchas de tintura, rulos imposibles.',
        vozConceptual: 'Habla en confianza aunque acabe de conocerte.', relacionProtagonista: 'Ninguna previa; operativo ocasional de Los Administradores.',
        zoneId: 'villa_flor', infoQueConoce: 'Depende del caso.', infoQueOculta: 'Depende del caso.',
        puedeMentir: true,
    },
    {
        id: 'media_lengua_vidal', nombre: 'Vidal', apodo: '"Media Lengua" Vidal', edadAproximada: 37,
        personalidad: 'Locutor de radio de barrio, trucho, habla como si lo escuchara mucha gente.', apariencia: 'Auriculares colgando del cuello siempre, aunque no haya micrófono cerca.',
        vozConceptual: 'Todo lo dice como si fuera una promo radial.', relacionProtagonista: 'Ninguna previa; operativo ocasional de Los Administradores.',
        zoneId: 'terminal_norte', infoQueConoce: 'Depende del caso.', infoQueOculta: 'Depende del caso.',
        puedeMentir: true,
    },
    {
        id: 'tuerto_ibarra', nombre: 'Ibarra', apodo: '"El Tuerto" Ibarra', edadAproximada: 51,
        personalidad: 'Chapista de confianza de medio barrio, parche en un ojo, nadie sabe bien por qué.', apariencia: 'Overol manchado de pintura, olor a soldadura permanente.',
        vozConceptual: 'Corto, directo, no repite las cosas dos veces.', relacionProtagonista: 'Ninguna previa; operativo ocasional de Los Administradores.',
        zoneId: 'puente_sur', infoQueConoce: 'Depende del caso.', infoQueOculta: 'Depende del caso.',
        puedeMentir: true,
    },
];

export function getNpc(id: string): NPC | undefined {
    return NPCS.find((n) => n.id === id);
}
