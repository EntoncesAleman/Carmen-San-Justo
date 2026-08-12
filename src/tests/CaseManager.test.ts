import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { getFirstCase } from '../data/cases';

const caso = getFirstCase();

describe('CaseManager', () => {
    beforeEach(() => {
        gameState.reset();
    });

    it('startCase resetea el estado y ubica al jugador en la zona inicial del caso', () => {
        gameState.reputacionPolicial = 999; // valor "sucio" de una partida anterior
        CaseManager.startCase(caso.id);
        assert.equal(gameState.currentCaseId, caso.id);
        assert.equal(gameState.currentZoneId, caso.zonaInicial);
        assert.equal(gameState.reputacionPolicial, 50);
    });

    it('getCurrentCase devuelve null si no hay caso activo', () => {
        assert.equal(CaseManager.getCurrentCase(), null);
    });

    it('getCurrentCase devuelve la definición correcta luego de iniciar un caso', () => {
        CaseManager.startCase(caso.id);
        assert.equal(CaseManager.getCurrentCase()?.id, caso.id);
    });

    it('endCase marca el caso como terminado con el final indicado', () => {
        CaseManager.endCase('resuelto_correcto');
        assert.equal(gameState.ended, true);
        assert.equal(gameState.endingId, 'resuelto_correcto');
    });

    it('setFlag/hasFlag', () => {
        assert.equal(CaseManager.hasFlag('probando'), false);
        CaseManager.setFlag('probando');
        assert.equal(CaseManager.hasFlag('probando'), true);
    });

    it('advanceTimeAndCheckDeadline no termina el caso antes del deadline', () => {
        CaseManager.startCase(caso.id);
        const expired = CaseManager.advanceTimeAndCheckDeadline(60);
        assert.equal(expired, false);
        assert.equal(gameState.ended, false);
    });

    it('advanceTimeAndCheckDeadline termina el caso como "banda_escapa" al cumplirse el deadline', () => {
        CaseManager.startCase(caso.id);
        const expired = CaseManager.advanceTimeAndCheckDeadline(caso.deadlineMinutos + 1);
        assert.equal(expired, true);
        assert.equal(gameState.ended, true);
        assert.equal(gameState.endingId, 'banda_escapa');
    });
});
