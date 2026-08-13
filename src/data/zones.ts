import { Zone } from './types';

// Los nombres son barrios/partidos REALES del AMBA (pedido explícito: la
// investigación tiene que sentirse geográficamente real, no una versión
// con nombres inventados) — hasta acá, `id` interno codificaba la idea
// ("manzana_fria") y `nombre` mostraba una versión ficcionalizada
// ("Manzana Fría"); ahora `nombre` es directamente el lugar real, `id` no
// cambia (nada más lo referencia).
export const ZONES: Zone[] = [
    { id: 'manzana_fria', nombre: 'Microcentro', descripcion: 'Oficinas, bancos y gente que camina como si llegara tarde a todos lados.' },
    { id: 'terminal_sur', nombre: 'Constitución', descripcion: 'Terminal de larga distancia, caos permanente, kiosqueros que lo saben todo.' },
    { id: 'palo_alto', nombre: 'Palermo', descripcion: 'Bares de diseño, plantas colgantes y gente que "emprende" con plata de otro.' },
    { id: 'barrio_fabrica', nombre: 'Barracas', descripcion: 'Galpones, murales y algún taller que nadie sabe bien qué produce.' },
    { id: 'la_ribera', nombre: 'La Boca', descripcion: 'Casas de colores, turistas despistados y un club de barrio demasiado bien equipado.' },
    { id: 'villa_flor', nombre: 'Flores', descripcion: 'Ferias, mercados y templos de tres religiones distintas en tres cuadras.' },
    { id: 'la_feria', nombre: 'Once', descripcion: 'Textiles al por mayor, mayoristas gritando precios, ruido constante.' },
    { id: 'terminal_norte', nombre: 'Retiro', descripcion: 'Trenes, micros y gente esperando algo que hace rato no llega.' },
    { id: 'parque_obrero', nombre: 'Parque Patricios', descripcion: 'Clubes de fútbol, hospitales y casas bajas con historia.' },
    { id: 'villa_quieta', nombre: 'Villa Devoto', descripcion: 'Casas con jardín, silencio sospechoso, vecinos que vigilan por las dudas.' },
    { id: 'costa_alta', nombre: 'Núñez', descripcion: 'Cerca del río, estadios enormes, edificios que crecen todos los años.' },
    { id: 'casco_antiguo', nombre: 'San Telmo', descripcion: 'Anticuarios, empedrado, y algún fantasma de utilería para los turistas.' },
    { id: 'puente_sur', nombre: 'Avellaneda', descripcion: 'Un puente enorme, humo industrial y dos hinchadas que se cruzan siempre.' },
    { id: 'el_cruce', nombre: 'Lanús', descripcion: 'Estación de tren y kioscos abiertos las 24 horas por las dudas.' },
    { id: 'la_cervecera', nombre: 'Quilmes', descripcion: 'Una fábrica enorme, olor a lúpulo y calles inusualmente tranquilas.' },
    { id: 'oeste_profundo', nombre: 'Morón', descripcion: 'Suburbio extenso, un aeroclub viejo y calles que se repiten sin avisar.' },
    { id: 'km_20', nombre: 'San Martín', descripcion: 'Zona industrial, galpones de logística y camiones a toda hora.' },
    { id: 'el_delta', nombre: 'Tigre', descripcion: 'Ríos, islas y lanchas. Gente que "no vive en ningún lado en particular".' },
    { id: 'barranca_norte', nombre: 'San Isidro', descripcion: 'Casonas, clubes de remo y apellidos que ocupan dos líneas.' },
    { id: 'lomas_bajas', nombre: 'Lomas de Zamora', descripcion: 'Barrio residencial, canchas de básquet y quintas de fin de semana.' },
    { id: 'feria_usados', nombre: 'Liniers', descripcion: 'Concesionarias de autos usados a lo largo de la avenida, banderines de gasolinera al viento y una terminal de colectivos que no para nunca.' },
];

export function getZone(id: string): Zone | undefined {
    return ZONES.find((z) => z.id === id);
}
