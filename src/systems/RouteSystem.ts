import { EventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { CaseDefinition } from '../data/types';

export type RouteGuessResult = 'correcto_intermedio' | 'correcto_final' | 'sospechoso_equivocado' | 'no_concluyente';

// La persecución del caco es una ruta de varias paradas (no un salto directo
// al destino final). El jugador va reconstruyéndola parada por parada en el
// Pizarrón: cada acierto avanza `gameState.rutaProgresoIndex` una posición.
// Genérico: cualquier CaseDefinition con un `ruta` de 2 o más zonas funciona
// sin tocar este archivo.
export class RouteSystem {
    static getNextExpectedZoneId(def: CaseDefinition): string | null {
        const idx = gameState.rutaProgresoIndex;
        if (idx + 1 >= def.ruta.length) return null;
        return def.ruta[idx + 1];
    }

    static isFinalHopReached(def: CaseDefinition): boolean {
        return gameState.rutaProgresoIndex >= def.ruta.length - 1;
    }

    static getProgresoTexto(def: CaseDefinition): string {
        return def.ruta
            .map((zoneId, i) => (i <= gameState.rutaProgresoIndex ? zoneId : '???'))
            .join(' → ');
    }

    static submitGuess(def: CaseDefinition, zoneId: string): RouteGuessResult {
        gameState.hypothesisSubmitted = true;
        gameState.hypothesisDestinoZoneId = zoneId;

        const expected = this.getNextExpectedZoneId(def);

        if (expected && zoneId === expected) {
            gameState.rutaProgresoIndex += 1;
            const result: RouteGuessResult = this.isFinalHopReached(def) ? 'correcto_final' : 'correcto_intermedio';
            EventBus.emit(Events.HYPOTHESIS_RESULT, { destinoZoneId: zoneId, result });
            return result;
        }

        if (def.destinosFalsosZoneIds.includes(zoneId)) {
            EventBus.emit(Events.HYPOTHESIS_RESULT, { destinoZoneId: zoneId, result: 'sospechoso_equivocado' });
            return 'sospechoso_equivocado';
        }

        EventBus.emit(Events.HYPOTHESIS_RESULT, { destinoZoneId: zoneId, result: 'no_concluyente' });
        return 'no_concluyente';
    }
}
