import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { ClueManager } from '../systems/ClueManager';
import { getFirstCase } from '../data/cases';

const caso = getFirstCase();

describe('ClueManager', () => {
    beforeEach(() => {
        gameState.reset();
    });

    it('agrega una pista nueva y devuelve true', () => {
        const clue = caso.clues[0];
        const added = ClueManager.addClue(clue);
        assert.equal(added, true);
        assert.ok(gameState.hasClue(clue.id));
    });

    it('no duplica una pista ya recolectada', () => {
        const clue = caso.clues[0];
        ClueManager.addClue(clue);
        const addedAgain = ClueManager.addClue(clue);
        assert.equal(addedAgain, false);
        assert.equal(gameState.collectedClueIds.length, 1);
    });

    it('getCollectedClues devuelve solo las pistas recolectadas', () => {
        ClueManager.addClue(caso.clues[0]);
        const collected = ClueManager.getCollectedClues(caso.clues);
        assert.equal(collected.length, 1);
        assert.equal(collected[0].id, caso.clues[0].id);
    });

    it('hasAllRequired es false hasta tener todas las pistas clave', () => {
        assert.equal(ClueManager.hasAllRequired(caso.cluesRequeridasParaResolver), false);
        caso.cluesRequeridasParaResolver.forEach((id) => {
            const clue = caso.clues.find((c) => c.id === id)!;
            ClueManager.addClue(clue);
        });
        assert.equal(ClueManager.hasAllRequired(caso.cluesRequeridasParaResolver), true);
    });
});
