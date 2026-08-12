import { AmbientId } from '../audio/tracks';

// Zonas costeras/ribereñas de El Cinturón: llevan el ambiente "agua" en vez
// del ambiente urbano por defecto. Lista chica y explícita a propósito —
// más simple que derivar esto de otro campo de Zone.
const ZONAS_DE_AGUA = new Set(['la_ribera', 'costa_alta', 'el_delta', 'barranca_norte', 'puente_sur']);

export function getAmbientForZone(zoneId: string): AmbientId {
    return ZONAS_DE_AGUA.has(zoneId) ? 'agua' : 'urbano';
}
