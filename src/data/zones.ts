import { Zone } from './types';

export const ZONES: Zone[] = [
    { id: 'manzana_fria', nombre: 'Manzana Fría', inspiracionConceptual: 'Microcentro', descripcion: 'Oficinas, bancos y gente que camina como si llegara tarde a todos lados.' },
    { id: 'terminal_sur', nombre: 'Terminal Sur', inspiracionConceptual: 'Constitución', descripcion: 'Terminal de larga distancia, caos permanente, kiosqueros que lo saben todo.' },
    { id: 'palo_alto', nombre: 'Palo Alto', inspiracionConceptual: 'Palermo', descripcion: 'Bares de diseño, plantas colgantes y gente que "emprende" con plata de otro.' },
    { id: 'barrio_fabrica', nombre: 'Barrio Fábrica', inspiracionConceptual: 'Barracas', descripcion: 'Galpones, murales y algún taller que nadie sabe bien qué produce.' },
    { id: 'la_ribera', nombre: 'La Ribera', inspiracionConceptual: 'La Boca', descripcion: 'Casas de colores, turistas despistados y un club de barrio demasiado bien equipado.' },
    { id: 'villa_flor', nombre: 'Villa Flor', inspiracionConceptual: 'Flores', descripcion: 'Ferias, mercados y templos de tres religiones distintas en tres cuadras.' },
    { id: 'la_feria', nombre: 'La Feria', inspiracionConceptual: 'Once', descripcion: 'Textiles al por mayor, mayoristas gritando precios, ruido constante.' },
    { id: 'terminal_norte', nombre: 'Terminal Norte', inspiracionConceptual: 'Retiro', descripcion: 'Trenes, micros y gente esperando algo que hace rato no llega.' },
    { id: 'parque_obrero', nombre: 'Parque Obrero', inspiracionConceptual: 'Parque Patricios', descripcion: 'Clubes de fútbol, hospitales y casas bajas con historia.' },
    { id: 'villa_quieta', nombre: 'Villa Quieta', inspiracionConceptual: 'Villa Devoto', descripcion: 'Casas con jardín, silencio sospechoso, vecinos que vigilan por las dudas.' },
    { id: 'costa_alta', nombre: 'Costa Alta', inspiracionConceptual: 'Núñez', descripcion: 'Cerca del río, estadios enormes, edificios que crecen todos los años.' },
    { id: 'casco_antiguo', nombre: 'El Casco Antiguo', inspiracionConceptual: 'San Telmo', descripcion: 'Anticuarios, empedrado, y algún fantasma de utilería para los turistas.' },
    { id: 'puente_sur', nombre: 'Puente Sur', inspiracionConceptual: 'Avellaneda', descripcion: 'Un puente enorme, humo industrial y dos hinchadas que se cruzan siempre.' },
    { id: 'el_cruce', nombre: 'El Cruce', inspiracionConceptual: 'Lanús', descripcion: 'Estación de tren y kioscos abiertos las 24 horas por las dudas.' },
    { id: 'la_cervecera', nombre: 'La Cervecera', inspiracionConceptual: 'Quilmes', descripcion: 'Una fábrica enorme, olor a lúpulo y calles inusualmente tranquilas.' },
    { id: 'oeste_profundo', nombre: 'El Oeste Profundo', inspiracionConceptual: 'Morón', descripcion: 'Suburbio extenso, un aeroclub viejo y calles que se repiten sin avisar.' },
    { id: 'km_20', nombre: 'Km 20', inspiracionConceptual: 'San Martín', descripcion: 'Zona industrial, galpones de logística y camiones a toda hora.' },
    { id: 'el_delta', nombre: 'El Delta', inspiracionConceptual: 'Tigre', descripcion: 'Ríos, islas y lanchas. Gente que "no vive en ningún lado en particular".' },
    { id: 'barranca_norte', nombre: 'La Barranca Norte', inspiracionConceptual: 'San Isidro', descripcion: 'Casonas, clubes de remo y apellidos que ocupan dos líneas.' },
    { id: 'lomas_bajas', nombre: 'Las Lomas Bajas', inspiracionConceptual: 'Lomas de Zamora', descripcion: 'Barrio residencial, canchas de básquet y quintas de fin de semana.' },
];

export function getZone(id: string): Zone | undefined {
    return ZONES.find((z) => z.id === id);
}
