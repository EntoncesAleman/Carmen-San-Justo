import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { EndingResolver } from '../systems/EndingResolver';
import { CASES } from '../data/cases';
import { NPCS } from '../data/npcs';
import { REPUTATION } from '../core/Constants';
import { CaseDefinition } from '../data/types';

function hablarConTodos() {
    NPCS.forEach((npc) => {
        gameState.getNpcRelation(npc.id).talkedCount = 1;
    });
}

// EndingResolver es genérico (no debería conocer ningún flag ni npc de un
// caso en particular) — por eso este test corre sobre TODOS los casos
// registrados, no solo sobre el primero. Si algún caso nuevo rompe alguno
// de estos 7 finales, se entera acá antes que un jugador.
function checkEndings(caso: CaseDefinition) {
    beforeEach(() => {
        gameState.reset();
    });

    it('banda_escapa si el deadline se cumplió', () => {
        gameState.deadlineExpired = true;
        assert.equal(EndingResolver.resolve(caso), 'banda_escapa');
    });

    it('sospechoso_equivocado si la hipótesis apuntó a un destino falso', () => {
        gameState.hypothesisDestinoZoneId = caso.destinosFalsosZoneIds[0];
        assert.equal(EndingResolver.resolve(caso), 'sospechoso_equivocado');
    });

    it('banda_escapa si se dejó ir al sospechoso', () => {
        gameState.flags['sospechoso_liberado'] = true;
        assert.equal(EndingResolver.resolve(caso), 'banda_escapa');
    });

    it('escandalo si se aceptó el soborno y la corrupción es alta', () => {
        gameState.flags['sospechoso_soborno'] = true;
        gameState.corrupcion = REPUTATION.UMBRAL_ALTO;
        assert.equal(EndingResolver.resolve(caso), 'escandalo');
    });

    it('resuelto_correcto si se aceptó el soborno pero la corrupción no llegó al umbral', () => {
        gameState.flags['sospechoso_soborno'] = true;
        gameState.corrupcion = REPUTATION.UMBRAL_ALTO - 1;
        assert.equal(EndingResolver.resolve(caso), 'resuelto_correcto');
    });

    it('resuelto_correcto si nunca hubo confrontación (caso sin resolver por combate)', () => {
        assert.equal(EndingResolver.resolve(caso), 'resuelto_correcto');
    });

    it('final_absurdo con reputación callejera alta y policial baja', () => {
        gameState.flags['sospechoso_arrestado'] = true;
        gameState.reputacionCallejera = REPUTATION.UMBRAL_ALTO;
        gameState.reputacionPolicial = REPUTATION.UMBRAL_BAJO;
        assert.equal(EndingResolver.resolve(caso), 'final_absurdo');
    });

    it('final_secreto si se habló con todos y la reputación/corrupción cierran', () => {
        gameState.flags['sospechoso_arrestado'] = true;
        hablarConTodos();
        gameState.reputacionPolicial = REPUTATION.UMBRAL_ALTO;
        gameState.corrupcion = REPUTATION.UMBRAL_BAJO;
        // reputacionCallejera queda en su valor por defecto (50), no dispara final_absurdo
        assert.equal(EndingResolver.resolve(caso), 'final_secreto');
    });

    it('final_perfecto si se rechazó el sobre extraoficial y la reputación cierra', () => {
        gameState.flags['sospechoso_arrestado'] = true;
        gameState.flags['rechazo_extraoficial'] = true;
        gameState.reputacionPolicial = REPUTATION.UMBRAL_ALTO;
        gameState.corrupcion = REPUTATION.UMBRAL_BAJO;
        // sin hablar con todos, así que no cae en final_secreto primero
        assert.equal(EndingResolver.resolve(caso), 'final_perfecto');
    });

    it('resuelto_correcto como fallback si se confrontó sin cumplir ninguna condición especial', () => {
        gameState.flags['sospechoso_arrestado'] = true;
        assert.equal(EndingResolver.resolve(caso), 'resuelto_correcto');
    });
}

CASES.forEach((caso) => {
    describe(`EndingResolver — los 7 finales de ${caso.id}`, () => {
        checkEndings(caso);
    });
});
