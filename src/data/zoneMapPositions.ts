// Posiciones (x,y) de cada zona en el mapa gráfico de viaje
// (`TravelMapScene`) — pedido explícito: "viajar" no puede ser solo una
// línea de texto en un menú, tiene que sentirse como un mapa de verdad.
//
// Las posiciones siguen, a grandes rasgos, la geografía real del AMBA que
// inspira a cada zona (norte arriba, sur abajo, oeste a la izquierda, el
// río a la derecha) — no son coordenadas exactas ni a escala, es una
// disposición legible pensada para que las líneas de conexión no se
// crucen demasiado, igual que un mapa esquemático de subte.
export interface ZoneMapPosition {
    x: number;
    y: number;
}

export const ZONE_MAP_POSITIONS: Record<string, ZoneMapPosition> = {
    el_delta: { x: 520, y: 40 }, // Tigre
    barranca_norte: { x: 620, y: 75 }, // San Isidro
    km_20: { x: 380, y: 95 }, // San Martín
    terminal_norte: { x: 680, y: 140 }, // Retiro
    costa_alta: { x: 610, y: 165 }, // Núñez
    palo_alto: { x: 500, y: 195 }, // Palermo
    villa_quieta: { x: 320, y: 215 }, // Villa Devoto
    manzana_fria: { x: 630, y: 235 }, // Microcentro
    la_feria: { x: 450, y: 255 }, // Once
    oeste_profundo: { x: 200, y: 265 }, // Morón
    feria_usados: { x: 290, y: 300 }, // Liniers
    villa_flor: { x: 410, y: 305 }, // Flores
    casco_antiguo: { x: 590, y: 305 }, // San Telmo
    terminal_sur: { x: 520, y: 335 }, // Constitución
    parque_obrero: { x: 450, y: 365 }, // Parque Patricios
    barrio_fabrica: { x: 560, y: 375 }, // Barracas
    la_ribera: { x: 600, y: 415 }, // La Boca
    puente_sur: { x: 620, y: 455 }, // Avellaneda
    el_cruce: { x: 540, y: 475 }, // Lanús
    lomas_bajas: { x: 450, y: 495 }, // Lomas de Zamora
    la_cervecera: { x: 580, y: 525 }, // Quilmes
};

export function getZoneMapPosition(zoneId: string): ZoneMapPosition | undefined {
    return ZONE_MAP_POSITIONS[zoneId];
}
