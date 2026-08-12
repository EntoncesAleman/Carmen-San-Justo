import { Rank } from './types';

// Progresión de rango. Avanza al resolver un caso con éxito (ver
// CaseManager.registrarCasoResuelto). Nombres argentinos/bizarros a
// propósito, no una traducción literal de rangos policiales reales.
export const RANKS: Rank[] = [
    { id: 'cadete', titulo: 'Cadete de Guardia', casosRequeridos: 0 },
    { id: 'oficial', titulo: 'Oficial de Trámite', casosRequeridos: 1 },
    { id: 'detective', titulo: 'Detective de Turno Noche', casosRequeridos: 2 },
    { id: 'detective_senior', titulo: 'Detective con Contactos', casosRequeridos: 3 },
    { id: 'inspector', titulo: 'Inspector Extraoficial', casosRequeridos: 4 },
    { id: 'comisario', titulo: 'Comisario en las Sombras', casosRequeridos: 5 },
    { id: 'leyenda', titulo: 'Leyenda de El Cinturón', casosRequeridos: 6 },
];

export function getRankForCasosResueltos(casosResueltos: number): Rank {
    let current = RANKS[0];
    for (const rank of RANKS) {
        if (casosResueltos >= rank.casosRequeridos) current = rank;
    }
    return current;
}
