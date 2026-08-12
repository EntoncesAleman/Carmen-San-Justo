import { REPUTATION } from '../core/Constants';
import { gameState } from '../core/GameState';
import { NPCS } from '../data/npcs';
import { CaseDefinition } from '../data/types';

// Decide qué final corresponde según el estado acumulado del caso. Vive
// separado de CaseDefinition porque necesita leer todo el GameState, no solo
// los datos del caso.
export class EndingResolver {
    static resolve(def: CaseDefinition): string {
        if (gameState.deadlineExpired) {
            return 'banda_escapa';
        }

        if (gameState.hypothesisDestinoZoneId && def.destinosFalsosZoneIds.includes(gameState.hypothesisDestinoZoneId)) {
            return 'sospechoso_equivocado';
        }

        if (gameState.flags['sospechoso_liberado']) {
            return 'banda_escapa';
        }

        if (gameState.flags['sospechoso_soborno'] && gameState.corrupcion >= REPUTATION.UMBRAL_ALTO) {
            return 'escandalo';
        }

        const casoConfrontado =
            gameState.flags['sospechoso_arrestado'] || gameState.flags['sospechoso_intimidado'] || gameState.flags['sospechoso_soborno'];

        if (!casoConfrontado) {
            return 'resuelto_correcto';
        }

        if (gameState.reputacionCallejera >= REPUTATION.UMBRAL_ALTO && gameState.reputacionPolicial <= REPUTATION.UMBRAL_BAJO) {
            return 'final_absurdo';
        }

        const hablesConTodos = NPCS.every((n) => (gameState.npcRelations[n.id]?.talkedCount ?? 0) > 0);
        if (hablesConTodos && gameState.reputacionPolicial >= REPUTATION.UMBRAL_ALTO && gameState.corrupcion <= REPUTATION.UMBRAL_BAJO) {
            return 'final_secreto';
        }

        if (
            gameState.flags['rechazo_extraoficial'] &&
            gameState.corrupcion <= REPUTATION.UMBRAL_BAJO &&
            gameState.reputacionPolicial >= REPUTATION.UMBRAL_ALTO
        ) {
            return 'final_perfecto';
        }

        return 'resuelto_correcto';
    }
}
