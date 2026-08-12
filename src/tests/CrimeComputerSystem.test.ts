import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { CrimeComputerSystem } from '../systems/CrimeComputerSystem';
import { CASES } from '../data/cases';

describe('CrimeComputerSystem', () => {
    beforeEach(() => {
        gameState.reset();
    });

    const def = CASES[0]; // caso1_medialunas

    it('sin pistas recolectadas, no hay ningún atributo conocido', () => {
        assert.deepEqual(CrimeComputerSystem.getKnownAttributes(def), {});
    });

    it('sin pistas, no se puede emitir orden de captura (demasiados sospechosos posibles)', () => {
        assert.equal(CrimeComputerSystem.canEmitirOrden(def), false);
    });

    it('una sola pista de atributo compartida entre dos sospechosos no alcanza para emitir la orden', () => {
        // clue_kiosco_medialunas revela comida:Medialunas, que comparten
        // el sospechoso real y un señuelo (ver data/suspects.ts) — a
        // propósito, para que el identikit exija más de una pista.
        gameState.addClue('clue_kiosco_medialunas');
        const matches = CrimeComputerSystem.getMatchingSuspects(def);
        assert.ok(matches.length > 1, 'esta pista sola debería dejar más de un sospechoso posible');
        assert.equal(CrimeComputerSystem.canEmitirOrden(def), false);
    });

    it('combinando dos pistas de atributo se acorrala a un único sospechoso: el real', () => {
        gameState.addClue('clue_kiosco_medialunas');
        gameState.addClue('clue_acertijo_palomas');
        const matches = CrimeComputerSystem.getMatchingSuspects(def);
        assert.equal(matches.length, 1);
        assert.equal(matches[0].id, def.sospechosoId);
        assert.ok(CrimeComputerSystem.canEmitirOrden(def));
    });

    // Chequeo genérico de diseño: para CUALQUIER caso registrado, juntar
    // TODAS las pistas reales (no falsas) que revelan un atributo debe
    // alcanzar para acorralar exactamente al sospechoso real — si un caso
    // nuevo se agrega sin suficientes atributos distintivos, este test
    // explota en vez de dejar pasar una deducción trivial o imposible.
    CASES.forEach((caso) => {
        it(`${caso.id}: juntando todas las pistas reales de atributo se identifica únicamente al sospechoso real`, () => {
            gameState.reset();
            caso.clues.filter((c) => c.revealsAttribute && !c.esFalsa).forEach((c) => gameState.addClue(c.id));

            const matches = CrimeComputerSystem.getMatchingSuspects(caso);
            assert.equal(matches.length, 1, `se esperaba un único sospechoso coincidente en ${caso.id}, se obtuvieron ${matches.length}`);
            assert.equal(matches[0].id, caso.sospechosoId);
            assert.ok(CrimeComputerSystem.canEmitirOrden(caso));
        });
    });
});
