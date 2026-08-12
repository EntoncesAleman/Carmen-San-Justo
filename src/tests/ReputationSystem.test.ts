import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { ReputationSystem } from '../systems/ReputationSystem';
import { REPUTATION, NPC_RELATION } from '../core/Constants';

describe('ReputationSystem', () => {
    beforeEach(() => {
        gameState.reset();
    });

    it('aplica un delta de reputación policial', () => {
        ReputationSystem.applyEffects(null, { reputacionPolicial: 10 });
        assert.equal(gameState.reputacionPolicial, REPUTATION.START_REPUTACION_POLICIAL + 10);
    });

    it('clampea la reputación global entre MIN y MAX', () => {
        ReputationSystem.applyEffects(null, { reputacionPolicial: 1000 });
        assert.equal(gameState.reputacionPolicial, REPUTATION.MAX);

        ReputationSystem.applyEffects(null, { corrupcion: -1000 });
        assert.equal(gameState.corrupcion, REPUTATION.MIN);
    });

    it('modifica la confianza de un NPC específico sin afectar a otros', () => {
        ReputationSystem.applyEffects('simon_achaval', { confianza: 20 });
        const simon = gameState.getNpcRelation('simon_achaval');
        const otro = gameState.getNpcRelation('otro_npc');
        assert.equal(simon.confianza, NPC_RELATION.START_CONFIANZA + 20);
        assert.equal(otro.confianza, NPC_RELATION.START_CONFIANZA);
    });

    it('clampea la confianza de un NPC entre MIN y MAX', () => {
        ReputationSystem.applyEffects('simon_achaval', { confianza: -1000 });
        assert.equal(gameState.getNpcRelation('simon_achaval').confianza, NPC_RELATION.MIN);
    });

    it('sin effects no cambia nada', () => {
        const before = gameState.reputacionPolicial;
        ReputationSystem.applyEffects(null, undefined);
        assert.equal(gameState.reputacionPolicial, before);
    });
});
