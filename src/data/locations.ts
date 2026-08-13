import { Location } from './types';

// Una locación principal por zona (mantiene la navegación simple: zona =
// lugar visitable). Los NPCs asignados viven acá.
export const LOCATIONS: Location[] = [
    { id: 'comisaria_0', zoneId: 'manzana_fria', nombre: 'Comisaría 0', descripcion: 'Nadie sabe bien quién está de guardia. El libro de guardia tiene páginas arrancadas.', npcIds: ['aldo_reissig', 'marina_ithurbide', 'hugo_bracamonte'] },
    { id: 'kiosco_simon', zoneId: 'terminal_sur', nombre: 'Kiosco de Simón', descripcion: 'Funciona como centro de inteligencia del barrio. Don Simón sabe todo lo que pasa a diez cuadras.', npcIds: ['simon_achaval', 'beba_corvalan'] },
    { id: 'inmobiliaria_salerno', zoneId: 'palo_alto', nombre: 'Inmobiliaria Salerno & Hijos', descripcion: 'Vende departamentos que, técnicamente, no existen.', npcIds: ['gustavo_salerno', 'federico_salaberry'] },
    { id: 'galpon_fabrica', zoneId: 'barrio_fabrica', nombre: 'Galpón sobre la vía', descripcion: 'Un galpón que cambió de dueño tantas veces que nadie sabe qué se guarda ahí.', npcIds: [] },
    { id: 'club_ribera', zoneId: 'la_ribera', nombre: 'Club Social y Deportivo La Boca', descripcion: 'Un club de barrio sospechosamente bien equipado para lo que dice ser.', npcIds: [] },
    { id: 'peluqueria_bochin', zoneId: 'villa_flor', nombre: 'Peluquería Unisex "El Bochín"', descripcion: 'Sabe todos los rumores del barrio antes que nadie, incluida la policía.', npcIds: ['manteca_ruiz'] },
    { id: 'galeria_feria', zoneId: 'la_feria', nombre: 'Galería La Feria', descripcion: 'Mayoristas gritando precios, cajas apiladas hasta el techo.', npcIds: [] },
    { id: 'anden_4', zoneId: 'terminal_norte', nombre: 'Andén 4 — Retiro', descripcion: 'Trenes que llegan cuando quieren. El lugar preferido de los que "vieron algo".', npcIds: ['nazareno_quiroga'] },
    { id: 'lo_de_pipo', zoneId: 'parque_obrero', nombre: 'Lo de Pipo', descripcion: 'Parrilla clandestina para policías fuera de servicio. La mejor información se comparte con achuras de por medio.', npcIds: ['pipo_escanciano', 'hombre_de_las_palomas'] },
    { id: 'delegacion_villa_quieta', zoneId: 'villa_quieta', nombre: 'Delegación Municipal de Villa Devoto', descripcion: 'Todos están tomando mate. Ningún trámite avanza nunca.', npcIds: ['marta_yulis', 'walter_chiodi'] },
    { id: 'boliche_marejada', zoneId: 'costa_alta', nombre: 'Boliche Marejada', descripcion: 'Tiene una pista escondida en el guardarropas, literalmente.', npcIds: ['yamila_cospito'] },
    { id: 'bar_fantasma', zoneId: 'casco_antiguo', nombre: 'Bar El Fantasma del Bandoneón', descripcion: 'Todos conocen a Fierro acá. Para bien y para mal.', npcIds: ['armando_petrocelli'] },
    { id: 'lavadero_brillo_total', zoneId: 'puente_sur', nombre: 'Lavadero "Brillo Total"', descripcion: 'Sabe demasiado sobre quién pasó por ahí y a qué hora.', npcIds: ['perla_sagasti'] },
    { id: 'estacion_fantasma', zoneId: 'el_cruce', nombre: 'Estación Fantasma de Lanús', descripcion: 'Andén abandonado, usado como punto de entrega de cosas que no deberían entregarse.', npcIds: ['media_cuadra_ibanez'] },
    { id: 'porton_cervecera', zoneId: 'la_cervecera', nombre: 'Portón de la Fábrica', descripcion: 'Olor a lúpulo permanente. Los camioneros lo saben todo y no dicen nada.', npcIds: [] },
    { id: 'central_cacho', zoneId: 'oeste_profundo', nombre: 'Central Cacho (remisería)', descripcion: 'Central de información barrial disfrazada de remisería.', npcIds: ['cacho_domenech'] },
    // Nota: los sospechosos (reales y falsos) de cada caso NO se listan acá
    // aunque aparezcan en este lugar en algún caso — su visibilidad depende
    // de la hipótesis presentada en el pizarrón, no de la locación (ver
    // LocationScene.ts). Listarlos acá los dejaría visibles siempre y en
    // cualquier caso que reutilice esta locación.
    { id: 'galpon_televisores', zoneId: 'km_20', nombre: 'Galpón de los Televisores', descripcion: 'Depósito lleno de televisores viejos que nadie sabe de dónde salieron.', npcIds: [] },
    { id: 'muelle_anguila', zoneId: 'el_delta', nombre: 'Muelle de Botes "La Anguila"', descripcion: 'Alquiler de lanchas sin preguntas. Punto de acceso a las islas.', npcIds: [] },
    { id: 'club_remo_barranca', zoneId: 'barranca_norte', nombre: 'Club de Remo San Isidro', descripcion: 'Apellidos largos, botes carísimos, silencio de club privado.', npcIds: [] },
    { id: 'plaza_lomas_bajas', zoneId: 'lomas_bajas', nombre: 'Plaza de Lomas de Zamora', descripcion: 'Un jubilado anota patentes de auto en un cuaderno desde 1987.', npcIds: ['egidio_paz'] },
    { id: 'concesionaria_el_rebusque', zoneId: 'feria_usados', nombre: 'Concesionaria "El Rebusque"', descripcion: 'Autos usados con el precio tapado por el sol. El dueño mira todo lo que pasa por la vereda de enfrente.', npcIds: ['toto_ferradas'] },
];

export function getLocationByZone(zoneId: string): Location | undefined {
    return LOCATIONS.find((l) => l.zoneId === zoneId);
}

export function getLocation(id: string): Location | undefined {
    return LOCATIONS.find((l) => l.id === id);
}
