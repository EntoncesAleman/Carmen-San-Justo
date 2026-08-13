import { CaseDefinition } from '../data/types';
import { getConnections } from '../data/zoneConnections';
import { getNpc } from '../data/npcs';
import { TIME_COSTS } from '../core/Constants';

function bfsDistance(from: string, to: string): number {
    if (from === to) return 0;
    const visited = new Set([from]);
    const queue: [string, number][] = [[from, 0]];
    while (queue.length > 0) {
        const [current, dist] = queue.shift()!;
        for (const next of getConnections(current)) {
            if (next === to) return dist + 1;
            if (!visited.has(next)) {
                visited.add(next);
                queue.push([next, dist + 1]);
            }
        }
    }
    return Infinity;
}

// Estima cuántos minutos necesita, COMO MÍNIMO, un jugador perfecto que
// nunca se equivoca de camino: recorre cada zona con un informante real
// (heurística de vecino más cercano, tipo "vendedor viajante") y termina
// en el destino correcto. Es el piso contra el que se calibra
// `deadlineMinutos` de cada caso — ver CaseGenerator.ts y
// `tests/helpers/caseInvariants.ts` → assertDeadlineIsWinnable. Antes de
// la red de conexiones entre zonas (ver data/zoneConnections.ts) esto no
// hacía falta: viajar a cualquier zona costaba siempre lo mismo, así que
// el orden de visita no importaba. Ahora sí, y por eso un
// `deadlineMinutos` fijo por caso puede quedar corto según dónde caigan
// los informantes de atributo.
export function estimateOptimalMinutos(caso: Pick<CaseDefinition, 'zonaInicial' | 'destinoCorrectoZoneId' | 'clues'>): number {
    const stopZones = new Set(caso.clues.filter((c) => c.npcId).map((c) => getNpc(c.npcId!)!.zoneId));
    stopZones.delete(caso.zonaInicial);

    let current = caso.zonaInicial;
    let hops = 0;
    const remaining = new Set(stopZones);
    while (remaining.size > 0) {
        let nearest: string | null = null;
        let nearestDist = Infinity;
        remaining.forEach((zoneId) => {
            const dist = bfsDistance(current, zoneId);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = zoneId;
            }
        });
        hops += nearestDist;
        current = nearest!;
        remaining.delete(nearest!);
    }
    hops += bfsDistance(current, caso.destinoCorrectoZoneId);

    const cluesConNpc = caso.clues.filter((c) => c.npcId).length;
    return hops * TIME_COSTS.VIAJAR_MINUTOS + cluesConNpc * TIME_COSTS.ACCION_DIALOGO_MINUTOS + TIME_COSTS.EXPLORAR_MINUTOS;
}

// Cuánto margen le damos al jugador por arriba del óptimo: suficiente para
// alguna vuelta de más, seguir la pista falsa antes de descartarla o
// esperar una vez, pero no tanto como para volver a sentirse "sin límite"
// (ver el reclamo original: "viajo para todos lados sin perder"). Es el
// default para los 3 casos fijos y para un jugador recién llegado; los
// casos generados lo achican a medida que sube de rango (ver
// difficultyTier() en CaseGenerator.ts) — mismo piso de "se puede ganar
// jugando perfecto" (BUFFER > 1), pero cada vez con menos margen de error.
const BUFFER = 1.4;

export function calibrateDeadlineMinutos(
    caso: Pick<CaseDefinition, 'zonaInicial' | 'destinoCorrectoZoneId' | 'clues'>,
    buffer: number = BUFFER,
): number {
    const optimo = estimateOptimalMinutos(caso);
    const conMargen = Math.ceil((optimo * buffer) / 15) * 15;
    return Math.min(1200, Math.max(480, conMargen));
}
