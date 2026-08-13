// Medio de transporte específico por tramo de ruta (pedido explícito:
// "subió al colectivo 21" en vez de "un colectivo" genérico) — capa de
// sabor sobre el viaje que ya existía, no un sistema nuevo de viaje.
// Determinístico por PAR de zonas (no por caso ni por seed): el mismo
// tramo siempre lo mismo medio, como pasaría en la realidad con líneas de
// colectivo/tren fijas — y de paso, al no depender de la lista de
// conexiones (`ZONE_CONNECTIONS`), nunca queda desactualizado si el grafo
// cambia (cualquier par de zonas nuevo cae en el pool igual).
export interface TransportLine {
    tipo: 'colectivo' | 'tren' | 'lancha';
    nombre: string;
}

const POOL: TransportLine[] = [
    { tipo: 'colectivo', nombre: 'colectivo 21' },
    { tipo: 'colectivo', nombre: 'colectivo 60' },
    { tipo: 'colectivo', nombre: 'colectivo 168' },
    { tipo: 'colectivo', nombre: 'colectivo 8' },
    { tipo: 'colectivo', nombre: 'colectivo 96' },
    { tipo: 'colectivo', nombre: 'colectivo 152' },
    { tipo: 'colectivo', nombre: 'colectivo 176' },
    { tipo: 'tren', nombre: 'tren Sarmiento' },
    { tipo: 'tren', nombre: 'tren Mitre' },
    { tipo: 'tren', nombre: 'tren Roca' },
    { tipo: 'tren', nombre: 'tren San Martín' },
    { tipo: 'lancha', nombre: 'lancha de Tigre' },
];

function hashZonePair(zoneAId: string, zoneBId: string): number {
    const key = [zoneAId, zoneBId].sort().join('|');
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return hash;
}

export function getTransportLine(zoneAId: string, zoneBId: string): TransportLine {
    return POOL[hashZonePair(zoneAId, zoneBId) % POOL.length];
}
