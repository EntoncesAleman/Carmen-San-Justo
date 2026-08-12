import { gameState } from '../core/GameState';
import { CASES, getCase } from '../data/cases';
import { CaseDefinition } from '../data/types';
import { EventBus, Events } from '../core/EventBus';
import { TimeSystem } from '../core/TimeSystem';
import { CaseGenerator } from './CaseGenerator';

// Finales que cuentan como "captura exitosa" a los fines de subir de rango.
// Los demás (banda_escapa, sospechoso_equivocado, escandalo) son fracasos:
// el jugador igual recibe un caso nuevo, pero no asciende.
const ENDINGS_EXITOSOS = new Set(['resuelto_correcto', 'final_perfecto', 'final_absurdo', 'final_secreto']);

export class CaseManager {
    // Casos generados en runtime (ver CaseGenerator) — no viven en el
    // registro estático `CASES`, así que se cachean acá mientras dura la
    // sesión. `SaveSystem` persiste el contenido completo del caso activo
    // cuando es uno generado (ver SaveData.generatedCase), y lo vuelca de
    // nuevo acá al cargar una partida.
    private static generatedCases = new Map<string, CaseDefinition>();

    static isEndingExitoso(endingId: string): boolean {
        return ENDINGS_EXITOSOS.has(endingId);
    }

    static registerGeneratedCase(def: CaseDefinition): void {
        this.generatedCases.set(def.id, def);
    }

    private static resolveCase(caseId: string): CaseDefinition | undefined {
        return getCase(caseId) ?? this.generatedCases.get(caseId);
    }

    static getCurrentCase(): CaseDefinition | null {
        if (!gameState.currentCaseId) return null;
        return this.resolveCase(gameState.currentCaseId) ?? null;
    }

    // Devuelve el caso activo SOLO si es uno generado (no vive en `CASES`)
    // — para que SaveSystem sepa cuándo tiene que persistir el contenido
    // completo del caso además del progreso, ya que un caso generado no
    // se puede reconstruir por id la próxima vez que arranque la app.
    static getCurrentGeneratedCaseIfAny(): CaseDefinition | null {
        if (!gameState.currentCaseId) return null;
        if (getCase(gameState.currentCaseId)) return null;
        return this.generatedCases.get(gameState.currentCaseId) ?? null;
    }

    static startCase(caseId: string): void {
        gameState.reset();
        const def = this.resolveCase(caseId);
        gameState.currentCaseId = caseId;
        if (def) {
            gameState.currentZoneId = def.zonaInicial;
        }
        EventBus.emit(Events.CASE_STARTED, { caseId });
    }

    // El jugador NO elige caso: la agencia asigna el que sigue en la
    // secuencia (gameState.casoIndex). Los primeros `CASES.length` casos
    // son los escritos a mano (la "apertura" del juego); de ahí en más,
    // cada caso se genera combinando piezas al azar (CaseGenerator) para
    // que la carrera nunca se sienta igual dos veces — sin esto, el ciclo
    // volvía a caso 1 apenas se terminaba el último caso fijo.
    static startNextCaseInSequence(): void {
        if (gameState.casoIndex < CASES.length) {
            this.startCase(CASES[gameState.casoIndex].id);
            return;
        }
        const generated = CaseGenerator.generate(gameState.casoIndex);
        this.registerGeneratedCase(generated);
        this.startCase(generated.id);
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
