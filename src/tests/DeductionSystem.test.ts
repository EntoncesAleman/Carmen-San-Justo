import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { DeductionSystem } from '../systems/DeductionSystem';
import { getFirstCase } from '../data/cases';

const caso = getFirstCase();

describe('DeductionSystem', () => {
    beforeEach(() => {
        gameState.reset();
    });

    it('reconoce el destino correcto', () => {
        const result = DeductionSystem.submitHypothesis(caso, caso.destinoCorrectoZoneId);
        assert.equal(result, 'correcto');
        assert.equal(gameState.hypothesisSubmitted, true);
        assert.equal(gameState.hypothesisDestinoZoneId, caso.destinoCorrectoZoneId);
    });

    it('reconoce un destino falso como sospechoso equivocado', () => {
        const result = DeductionSystem.submitHypothesis(caso, caso.destinosFalsosZoneIds[0]);
        assert.equal(result, 'sospechoso_equivocado');
    });

    it('un destino sin relación con el caso es "no concluyente"', () => {
        const result = DeductionSystem.submitHypothesis(caso, 'zona_inexistente');
        assert.equal(result, 'no_concluyente');
    });
});
