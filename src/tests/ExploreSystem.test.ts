import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { ExploreSystem } from '../systems/ExploreSystem';
import { CASES } from '../data/cases';

const caso = CASES[0]; // caso1_medialunas — tiene clue_bolsa_medialunas_explorar

describe('ExploreSystem', () => {
    beforeEach(() => {
        gameState.reset();
    });

    it('encuentra la pista física de la zona si todavía no se recolectó', () => {
        const clue = ExploreSystem.findExploreClue(caso, 'terminal_sur');
        assert.equal(clue?.id, 'clue_bolsa_medialunas_explorar');
    });

    it('no encuentra nada en una zona sin pista física', () => {
        assert.equal(ExploreSystem.findExploreClue(caso, 'palo_alto'), null);
    });

    it('no vuelve a devolver una pista ya recolectada', () => {
        gameState.addClue('clue_bolsa_medialunas_explorar');
        assert.equal(ExploreSystem.findExploreClue(caso, 'terminal_sur'), null);
    });

    it('nunca devuelve una pista que tiene npcId (esa se consigue hablando, no explorando)', () => {
        const clue = ExploreSystem.findExploreClue(caso, 'terminal_sur');
        assert.ok(!clue?.npcId);
    });

    it('nunca devuelve una pista falsa, aunque no tenga npcId y esté en la zona correcta', () => {
        const casoConPistaFalsaSinNpc = {
            ...caso,
            clues: [
                {
                    id: 'clue_falsa_de_prueba',
                    descripcion: 'irrelevante para el test',
                    ubicacionZoneId: 'terminal_sur',
                    categoria: 'falsa' as const,
                    relevancia: 'baja' as const,
                    confiabilidad: 10,
                    destinosPosibles: [],
                    esFalsa: true,
                },
            ],
        };
        assert.equal(ExploreSystem.findExploreClue(casoConPistaFalsaSinNpc, 'terminal_sur'), null);
    });
});
