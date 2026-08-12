import { NPC_RELATION, REPUTATION } from './Constants';

export interface NpcRelationState {
    confianza: number;
    sospecha: number;
    talkedCount: number;
}

export interface ClockState {
    dia: number;
    hora: number;
    minuto: number;
}

class GameState {
    // Progreso
    currentCaseId: string | null = null;
    currentZoneId: string = '';
    ended = false;
    endingId: string | null = null;

    // Reloj / tiempo
    minutosTranscurridos = 0;
    clock: ClockState = { dia: 1, hora: 8, minuto: 0 };

    // Pistas
    collectedClueIds: string[] = [];

    // Relación con NPCs
    npcRelations: Record<string, NpcRelationState> = {};

    // Reputación global
    reputacionPolicial = REPUTATION.START_REPUTACION_POLICIAL;
    reputacionCallejera = REPUTATION.START_REPUTACION_CALLEJERA;
    corrupcion = REPUTATION.START_CORRUPCION;
    sospecha = REPUTATION.START_SOSPECHA;
    rechazoSoborno = false;

    // Flags narrativos genéricos (por caso)
    flags: Record<string, boolean> = {};

    // Hipótesis presentada en el pizarrón de sospechosos
    hypothesisSubmitted = false;
    hypothesisDestinoZoneId: string | null = null;

    // Control de deadline (para no re-disparar el mismo evento)
    deadlineWarningEmitted = false;
    deadlineExpired = false;

    reset() {
        this.currentCaseId = null;
        this.currentZoneId = '';
        this.ended = false;
        this.endingId = null;
        this.minutosTranscurridos = 0;
        this.clock = { dia: 1, hora: 8, minuto: 0 };
        this.collectedClueIds = [];
        this.npcRelations = {};
        this.reputacionPolicial = REPUTATION.START_REPUTACION_POLICIAL;
        this.reputacionCallejera = REPUTATION.START_REPUTACION_CALLEJERA;
        this.corrupcion = REPUTATION.START_CORRUPCION;
        this.sospecha = REPUTATION.START_SOSPECHA;
        this.rechazoSoborno = false;
        this.flags = {};
        this.hypothesisSubmitted = false;
        this.hypothesisDestinoZoneId = null;
        this.deadlineWarningEmitted = false;
        this.deadlineExpired = false;
    }

    getNpcRelation(npcId: string): NpcRelationState {
        if (!this.npcRelations[npcId]) {
            this.npcRelations[npcId] = {
                confianza: NPC_RELATION.START_CONFIANZA,
                sospecha: NPC_RELATION.START_SOSPECHA,
                talkedCount: 0,
            };
        }
        return this.npcRelations[npcId];
    }

    hasClue(clueId: string): boolean {
        return this.collectedClueIds.includes(clueId);
    }

    addClue(clueId: string): boolean {
        if (this.hasClue(clueId)) return false;
        this.collectedClueIds.push(clueId);
        return true;
    }

    clamp(value: number): number {
        return Math.max(REPUTATION.MIN, Math.min(REPUTATION.MAX, value));
    }
}

export const gameState = new GameState();
