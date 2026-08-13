// Red de conexiones entre zonas — cada zona solo "ve" un puñado de otras
// para viajar directo, no las 21 siempre disponibles. Calca la pantalla
// de "conexiones" del formato clásico de persecución (desde una ciudad
// solo se listan las ciudades conectadas, no el mapa entero) — sin esto,
// el mapa se sentía como "ir a cualquier lado sin límite real" aunque el
// reloj/deadline ya existiera. Ver LocationScene/CityMapScene/
// DialogueScene → `renderDestinationListPanel`.
//
// Simétrico a propósito (si A conecta con B, B conecta con A — como una
// red de trenes/colectivos, no calles de un solo sentido). Verificado que
// el grafo completo es conexo (cualquier zona es alcanzable desde
// cualquier otra dando suficientes saltos) y que las `ruta` de los 3
// casos fijos son caminos válidos acá — ver
// `src/tests/ZoneConnections.test.ts`.
export const ZONE_CONNECTIONS: Record<string, string[]> = {
    manzana_fria: ['casco_antiguo', 'terminal_norte', 'la_feria', 'palo_alto'],
    terminal_sur: ['casco_antiguo', 'barrio_fabrica', 'la_feria', 'oeste_profundo'],
    palo_alto: ['manzana_fria', 'costa_alta', 'villa_quieta', 'feria_usados', 'casco_antiguo'],
    barrio_fabrica: ['terminal_sur', 'la_ribera', 'parque_obrero', 'puente_sur'],
    la_ribera: ['barrio_fabrica', 'casco_antiguo'],
    villa_flor: ['la_feria', 'parque_obrero', 'feria_usados', 'villa_quieta'],
    la_feria: ['manzana_fria', 'terminal_sur', 'villa_flor', 'terminal_norte'],
    terminal_norte: ['manzana_fria', 'la_feria', 'barranca_norte', 'km_20'],
    parque_obrero: ['barrio_fabrica', 'villa_flor', 'el_cruce', 'costa_alta'],
    villa_quieta: ['villa_flor', 'palo_alto', 'oeste_profundo', 'feria_usados'],
    costa_alta: ['palo_alto', 'barranca_norte', 'parque_obrero', 'la_cervecera'],
    casco_antiguo: ['manzana_fria', 'terminal_sur', 'la_ribera', 'palo_alto'],
    puente_sur: ['barrio_fabrica', 'el_cruce', 'la_cervecera'],
    el_cruce: ['puente_sur', 'parque_obrero', 'lomas_bajas'],
    la_cervecera: ['puente_sur', 'costa_alta', 'lomas_bajas'],
    oeste_profundo: ['villa_quieta', 'feria_usados', 'km_20', 'el_delta', 'terminal_sur'],
    km_20: ['terminal_norte', 'oeste_profundo', 'el_delta'],
    el_delta: ['km_20', 'barranca_norte', 'oeste_profundo'],
    barranca_norte: ['costa_alta', 'terminal_norte', 'el_delta'],
    lomas_bajas: ['el_cruce', 'la_cervecera'],
    feria_usados: ['villa_flor', 'villa_quieta', 'oeste_profundo', 'palo_alto'],
};

export function getConnections(zoneId: string): string[] {
    return ZONE_CONNECTIONS[zoneId] ?? [];
}
