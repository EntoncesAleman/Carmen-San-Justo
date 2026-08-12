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

    // Chequeo genérico más estricto: NINGUNA pista de atributo, tomada
    // SOLA, debe alcanzar para acorralar a un único sospechoso — eso sería
    // resolver el identikit "de un solo golpe" con la primera pista que el
    // jugador encuentre, sin combinar nada (justo lo que pide evitar la
    // sección 51 del diseño, "no simplificar"). Encontrado y corregido dos
    // veces ya en la base real (`profesion: 'Ingeniero trucho'` del Caso 1
    // y `vehiculo: 'Fiat Duna'` del Caso 2 eran, cada una, únicas en toda
    // la base de sospechosos hasta que se agregaron señuelos que las
    // comparten — ver `data/suspects.ts`).
    CASES.forEach((caso) => {
        const cluesConAtributo = caso.clues.filter((c) => c.revealsAttribute && !c.esFalsa);
        cluesConAtributo.forEach((clue) => {
            it(`${caso.id}: la pista "${clue.id}" (${clue.revealsAttribute!.key}) sola NO alcanza para emitir la orden`, () => {
                gameState.reset();
                gameState.addClue(clue.id);
                const matches = CrimeComputerSystem.getMatchingSuspects(caso);
                assert.ok(
                    matches.length > 1,
                    `la pista "${clue.id}" sola ya identifica un único sospechoso (${matches[0]?.id}) — el atributo "${clue.revealsAttribute!.key}: ${clue.revealsAttribute!.value}" es único en toda la base, hace falta un señuelo que lo comparta`,
                );
            });
        });
    });
});
