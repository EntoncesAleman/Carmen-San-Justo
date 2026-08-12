import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { RouteSystem } from '../systems/RouteSystem';
import { CASES } from '../data/cases';
import { CaseDefinition } from '../data/types';

// Usa un caso real (caso1) para probar la reconstrucción de ruta
// genéricamente — RouteSystem no debería tener nada hardcodeado por caso.
const def: CaseDefinition = CASES[0];

describe('RouteSystem', () => {
    beforeEach(() => {
        gameState.reset();
    });

    it('la ruta del caso tiene al menos 2 paradas (escena del hecho + destino)', () => {
        assert.ok(def.ruta.length >= 2);
    });

    it('getNextExpectedZoneId devuelve la segunda parada al arrancar', () => {
        assert.equal(RouteSystem.getNextExpectedZoneId(def), def.ruta[1]);
    });

    it('isFinalHopReached es falso al arrancar si hay más de 2 paradas', () => {
        assert.equal(RouteSystem.isFinalHopReached(def), def.ruta.length <= 2);
    });

    it('adivinar una zona que no es la próxima parada ni un destino falso da no_concluyente', () => {
        const zonaAjena = def.ruta.includes('manzana_fria') ? 'palo_alto' : 'manzana_fria';
        assert.equal(RouteSystem.submitGuess(def, zonaAjena), 'no_concluyente');
        assert.equal(gameState.rutaProgresoIndex, 0, 'un guess incorrecto no debe avanzar la ruta');
    });

    it('adivinar un destino falso conocido da sospechoso_equivocado', () => {
        assert.equal(RouteSystem.submitGuess(def, def.destinosFalsosZoneIds[0]), 'sospechoso_equivocado');
    });

    it('reconstruye la ruta completa parada por parada hasta el final', () => {
        for (let i = 1; i < def.ruta.length; i++) {
            const esperado = i === def.ruta.length - 1 ? 'correcto_final' : 'correcto_intermedio';
            const result = RouteSystem.submitGuess(def, def.ruta[i]);
            assert.equal(result, esperado, `parada ${i} (${def.ruta[i]}) debería dar ${esperado}`);
            assert.equal(gameState.rutaProgresoIndex, i);
        }
        assert.ok(RouteSystem.isFinalHopReached(def));
        assert.equal(RouteSystem.getNextExpectedZoneId(def), null);
    });

    it('getProgresoTexto oculta las paradas todavía no reconstruidas', () => {
        const texto = RouteSystem.getProgresoTexto(def);
        assert.ok(texto.includes(def.ruta[0]));
        if (def.ruta.length > 1) assert.ok(texto.includes('???'));
    });
});
