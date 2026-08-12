import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RANKS, getRankForCasosResueltos } from '../data/ranks';

describe('ranks', () => {
    it('el primer rango requiere 0 casos resueltos', () => {
        assert.equal(RANKS[0].casosRequeridos, 0);
    });

    it('los rangos están ordenados por casosRequeridos ascendente', () => {
        for (let i = 1; i < RANKS.length; i++) {
            assert.ok(RANKS[i].casosRequeridos > RANKS[i - 1].casosRequeridos);
        }
    });

    it('con 0 casos resueltos, el rango es el primero', () => {
        assert.equal(getRankForCasosResueltos(0).id, RANKS[0].id);
    });

    it('devuelve el rango más alto cuyo umbral no fue superado', () => {
        const segundo = RANKS[1];
        const tercero = RANKS[2];
        assert.equal(getRankForCasosResueltos(segundo.casosRequeridos).id, segundo.id);
        assert.equal(getRankForCasosResueltos(tercero.casosRequeridos - 1).id, segundo.id);
    });

    it('con más casos resueltos que el máximo, se mantiene en el rango más alto', () => {
        const maximo = RANKS[RANKS.length - 1];
        assert.equal(getRankForCasosResueltos(maximo.casosRequeridos + 100).id, maximo.id);
    });
});
