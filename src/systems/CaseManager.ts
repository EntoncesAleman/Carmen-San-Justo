import { gameState } from '../core/GameState';
import { getCase } from '../data/cases';
import { CaseDefinition } from '../data/types';
import { EventBus, Events } from '../core/EventBus';
import { TimeSystem } from '../core/TimeSystem';

export class CaseManager {
    static getCurrentCase(): CaseDefinition | null {
        if (!gameState.currentCaseId) return null;
        return getCase(gameState.currentCaseId) ?? null;
    }

    static startCase(caseId: string): void {
        gameState.reset();
        const def = getCase(caseId);
        gameState.currentCaseId = caseId;
        if (def) {
            gameState.currentZoneId = def.zonaInicial;
        }
        EventBus.emit(Events.CASE_STARTED, { caseId });
    }

    static endCase(endingId: string): void {
        gameState.ended = true;
        gameState.endingId = endingId;
        EventBus.emit(Events.CASE_ENDED, { endingId });
    }

    // Avanza el reloj y, si el deadline se cumplió, cierra el caso con el
    // final "la banda escapa". Devuelve true si el caso terminó por tiempo.
    static advanceTimeAndCheckDeadline(minutos: number): boolean {
        const def = this.getCurrentCase();
        TimeSystem.advance(minutos, def?.deadlineMinutos ?? 720);
        if (gameState.deadlineExpired && !gameState.ended) {
            this.endCase('banda_escapa');
            return true;
        }
        return false;
    }

    static setFlag(flag: string): void {
        gameState.flags[flag] = true;
    }

    static hasFlag(flag: string): boolean {
        return !!gameState.flags[flag];
    }
}
