import { EventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { CaseDefinition } from '../data/types';

export type HypothesisResult = 'correcto' | 'sospechoso_equivocado' | 'no_concluyente';

export class DeductionSystem {
    static submitHypothesis(def: CaseDefinition, destinoZoneId: string): HypothesisResult {
        gameState.hypothesisSubmitted = true;
        gameState.hypothesisDestinoZoneId = destinoZoneId;

        let result: HypothesisResult;
        if (destinoZoneId === def.destinoCorrectoZoneId) {
            result = 'correcto';
        } else if (def.destinosFalsosZoneIds.includes(destinoZoneId)) {
            result = 'sospechoso_equivocado';
        } else {
            result = 'no_concluyente';
        }

        EventBus.emit(Events.HYPOTHESIS_RESULT, { destinoZoneId, result });
        return result;
    }
}
