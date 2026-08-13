import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { CaseGenerator } from '../systems/CaseGenerator';
import { mulberry32 } from '../systems/rng';
import { RouteSystem } from '../systems/RouteSystem';
import { ZONES } from '../data/zones';
import { NPCS } from '../data/npcs';
import { assertCaseIntegrity, assertIdentikitSolvableAndNotTrivial } from './helpers/caseInvariants';

const zoneIds = new Set(ZONES.map((z) => z.id));
const npcIds = new Set(NPCS.map((n) => n.id));

const FUZZ_TRIALS = 300;

describe('CaseGenerator', () => {
    beforeEach(() => {
        gameState.reset();
    });

    it('con el mismo seed, genera exactamente el mismo caso (determinístico)', () => {
        const a = CaseGenerator.generate(1, mulberry32(42));
        const b = CaseGenerator.generate(1, mulberry32(42));
        assert.deepEqual(a, b);
    });

    it('con seeds distintos, genera casos distintos (la ruta y/o el sospechoso cambian)', () => {
        const a = CaseGenerator.generate(1, mulberry32(1));
        const b = CaseGenerator.generate(2, mulberry32(2));
        const distintos = a.sospechosoId !== b.sospechosoId || JSON.stringify(a.ruta) !== JSON.stringify(b.ruta);
        assert.ok(distintos, 'dos seeds distintos no deberían producir siempre el mismo caso');
    });

    it('la ruta reconstruida en el pizarrón funciona igual que en un caso escrito a mano', () => {
        const caso = CaseGenerator.generate(1, mulberry32(7));
        for (let i = 1; i < caso.ruta.length; i++) {
            const esperado = i === caso.ruta.length - 1 ? 'correcto_final' : 'correcto_intermedio';
            assert.equal(RouteSystem.submitGuess(caso, caso.ruta[i]), esperado);
        }
        assert.ok(RouteSystem.isFinalHopReached(caso));
    });

    it('la pista falsa, si existe, apunta a un destino falso real y no al correcto', () => {
        // corre varias veces porque la pista falsa es opcional (solo se
        // agrega si queda algún informante libre) — con suficientes
        // trials, en la gran mayoría va a haber una para revisar.
        let huboAlMenosUna = false;
        for (let seed = 0; seed < 30; seed++) {
            const caso = CaseGenerator.generate(seed, mulberry32(seed));
            const falsa = caso.clues.find((c) => c.esFalsa);
            if (!falsa) continue;
            huboAlMenosUna = true;
            assert.ok(caso.destinosFalsosZoneIds.some((id) => falsa.destinosPosibles.includes(id)));
            assert.ok(!falsa.destinosPosibles.includes(caso.destinoCorrectoZoneId));
        }
        assert.ok(huboAlMenosUna, 'ningún caso generado en 30 seeds tuvo pista falsa — revisar el pool de informantes libres');
    });

    it(`fuzzing: ${FUZZ_TRIALS} casos generados cumplen todas las invariantes de integridad y de identikit no-trivial`, () => {
        for (let seed = 0; seed < FUZZ_TRIALS; seed++) {
            const caso = CaseGenerator.generate(seed, mulberry32(seed));
            assertCaseIntegrity(caso, zoneIds, npcIds);
            assertIdentikitSolvableAndNotTrivial(caso);
        }
    });

    it('la dificultad escala con casosResueltos: rutas más largas y menos confiables a mayor rango, siempre ganable', () => {
        // Todos los tiers de dificultad (ver difficultyTier() en
        // CaseGenerator.ts) tienen que seguir produciendo casos íntegros y
        // ganables — subir la dificultad no puede romper la garantía de
        // "se puede ganar jugando perfecto" que ya cubre assertCaseIntegrity.
        for (const casosResueltos of [0, 1, 2, 3, 4, 5, 6, 9]) {
            for (let seed = 0; seed < 40; seed++) {
                const caso = CaseGenerator.generate(seed, mulberry32(seed * 31 + casosResueltos), casosResueltos);
                assertCaseIntegrity(caso, zoneIds, npcIds);
            }
        }

        const rutaLargoPromedio = (casosResueltos: number) => {
            let total = 0;
            const trials = 60;
            for (let seed = 0; seed < trials; seed++) {
                total += CaseGenerator.generate(seed, mulberry32(seed * 17 + casosResueltos), casosResueltos).ruta.length;
            }
            return total / trials;
        };

        assert.ok(
            rutaLargoPromedio(6) > rutaLargoPromedio(0),
            'un detective con más casos resueltos debería recibir, en promedio, rutas más largas',
        );
    });
});
