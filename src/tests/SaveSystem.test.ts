import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { SaveSystem } from '../core/SaveSystem';
import { CaseManager } from '../systems/CaseManager';
import { CaseGenerator } from '../systems/CaseGenerator';
import { mulberry32 } from '../systems/rng';
import { getFirstCase } from '../data/cases';

// Node no expone `localStorage` global (a diferencia del navegador). Shim
// mínimo en memoria únicamente para poder testear SaveSystem sin Phaser ni
// un DOM real.
class MemoryStorage {
    private store = new Map<string, string>();
    getItem(key: string): string | null {
        return this.store.has(key) ? this.store.get(key)! : null;
    }
    setItem(key: string, value: string): void {
        this.store.set(key, value);
    }
    removeItem(key: string): void {
        this.store.delete(key);
    }
    clear(): void {
        this.store.clear();
    }
}
(globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage();

const caso = getFirstCase();

describe('SaveSystem', () => {
    beforeEach(() => {
        gameState.reset();
        (globalThis as unknown as { localStorage: MemoryStorage }).localStorage.clear();
    });

    it('getSummary de un slot vacío marca empty=true', () => {
        const summary = SaveSystem.getSummary(0);
        assert.equal(summary.empty, true);
        assert.equal(summary.data, null);
    });

    it('guarda y recupera el estado completo de una partida', () => {
        CaseManager.startCase(caso.id);
        gameState.collectedClueIds.push(caso.clues[0].id);
        gameState.reputacionPolicial = 77;

        SaveSystem.save(1);
        gameState.reset(); // simula cerrar el juego / volver al menú

        const loaded = SaveSystem.load(1);
        assert.equal(loaded, true);
        assert.equal(gameState.currentCaseId, caso.id);
        assert.deepEqual(gameState.collectedClueIds, [caso.clues[0].id]);
        assert.equal(gameState.reputacionPolicial, 77);
    });

    it('load devuelve false si el slot está vacío', () => {
        assert.equal(SaveSystem.load(2), false);
    });

    it('guarda y recupera un caso GENERADO completo (no vive en el registro estático)', () => {
        const generado = CaseGenerator.generate(99, mulberry32(99));
        CaseManager.registerGeneratedCase(generado);
        CaseManager.startCase(generado.id);
        gameState.collectedClueIds.push(generado.clues[0].id);

        SaveSystem.save(2, CaseManager.getCurrentGeneratedCaseIfAny());
        gameState.reset(); // simula cerrar el juego: se pierde el cache en memoria

        const summary = SaveSystem.getSummary(2);
        assert.ok(summary.data?.generatedCase, 'el save debería incluir el contenido completo del caso generado');
        assert.equal(summary.data!.generatedCase!.id, generado.id);

        // Como haría LoadGameScene: re-registrar el caso ANTES de load().
        CaseManager.registerGeneratedCase(summary.data!.generatedCase!);
        SaveSystem.load(2);

        const recuperado = CaseManager.getCurrentCase();
        assert.equal(recuperado?.id, generado.id);
        assert.deepEqual(recuperado?.ruta, generado.ruta);
        assert.equal(gameState.collectedClueIds[0], generado.clues[0].id);
    });

    it('listSlots devuelve exactamente SAVE.SLOT_COUNT entradas', () => {
        const slots = SaveSystem.listSlots();
        assert.equal(slots.length, 3);
    });

    it('deleteSlot borra el guardado', () => {
        CaseManager.startCase(caso.id);
        SaveSystem.save(0);
        assert.equal(SaveSystem.getSummary(0).empty, false);
        SaveSystem.deleteSlot(0);
        assert.equal(SaveSystem.getSummary(0).empty, true);
    });

    it('los 3 slots son independientes entre sí', () => {
        CaseManager.startCase(caso.id);
        gameState.reputacionPolicial = 10;
        SaveSystem.save(0);

        gameState.reputacionPolicial = 90;
        SaveSystem.save(1);

        assert.equal(SaveSystem.getSummary(0).data?.reputacionPolicial, 10);
        assert.equal(SaveSystem.getSummary(1).data?.reputacionPolicial, 90);
    });
});
