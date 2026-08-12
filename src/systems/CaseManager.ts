import { gameState } from '../core/GameState';
import { CASES, getCase } from '../data/cases';
import { CaseDefinition } from '../data/types';
import { EventBus, Events } from '../core/EventBus';
import { TimeSystem } from '../core/TimeSystem';

// Finales que cuentan como "captura exitosa" a los fines de subir de rango.
// Los demás (banda_escapa, sospechoso_equivocado, escandalo) son fracasos:
// el jugador igual recibe un caso nuevo, pero no asciende.
const ENDINGS_EXITOSOS = new Set(['resuelto_correcto', 'final_perfecto', 'final_absurdo', 'final_secreto']);

export class CaseManager {
    static isEndingExitoso(endingId: string): boolean {
        return ENDINGS_EXITOSOS.has(endingId);
    }

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

    // El jugador NO elige caso: la agencia asigna el que sigue en la
    // secuencia (gameState.casoIndex). Envuelve al llegar al final de
    // CASES — la carrera es, en espíritu, indefinida.
    static startNextCaseInSequence(): void {
        const def = CASES[gameState.casoIndex % CASES.length];
        this.startCase(def.id);
    }

    static endCase(endingId: string): void {
        gameState.ended = true;
        gameState.endingId = endingId;
        EventBus.emit(Events.CASE_ENDED, { endingId });
    }

    // Cierra el caso Y actualiza la carrera (rango + qué caso sigue). Usar
    // esto en vez de endCase() en cualquier punto donde el caso realmente
    // termina para el jugador (no en simulaciones/tests que no deban
    // afectar la progresión).
    static finalizeCaseAndAdvance(endingId: string): void {
        this.endCase(endingId);
        if (ENDINGS_EXITOSOS.has(endingId)) {
            gameState.casosResueltos += 1;
        }
        gameState.casoIndex += 1;
    }

    // Avanza el reloj y, si el deadline se cumplió, cierra el caso con el
    // final "la banda escapa". Devuelve true si el caso terminó por tiempo.
    static advanceTimeAndCheckDeadline(minutos: number): boolean {
        const def = this.getCurrentCase();
        TimeSystem.advance(minutos, def?.deadlineMinutos ?? 720);
        if (gameState.deadlineExpired && !gameState.ended) {
            this.finalizeCaseAndAdvance('banda_escapa');
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
