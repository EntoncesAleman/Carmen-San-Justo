import { EventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { Clue } from '../data/types';

export class ClueManager {
    static addClue(clue: Clue): boolean {
        const added = gameState.addClue(clue.id);
        if (added) {
            EventBus.emit(Events.CLUE_ADDED, { clueId: clue.id });
            EventBus.emit(Events.CLUE_LIST_CHANGED, { clueIds: gameState.collectedClueIds });
        }
        return added;
    }

    static getCollectedClues(allClues: Clue[]): Clue[] {
        return allClues.filter((c) => gameState.hasClue(c.id));
    }

    static hasAllRequired(requiredIds: string[]): boolean {
        return requiredIds.every((id) => gameState.hasClue(id));
    }
}
