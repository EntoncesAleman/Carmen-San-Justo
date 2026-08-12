import { SAVE } from './Constants';
import { gameState } from './GameState';

export interface SaveData {
    schemaVersion: number;
    savedAt: string;
    currentCaseId: string | null;
    currentZoneId: string;
    ended: boolean;
    endingId: string | null;
    minutosTranscurridos: number;
    clock: { dia: number; hora: number; minuto: number };
    collectedClueIds: string[];
    npcRelations: Record<string, { confianza: number; sospecha: number; talkedCount: number }>;
    reputacionPolicial: number;
    reputacionCallejera: number;
    corrupcion: number;
    sospecha: number;
    rechazoSoborno: boolean;
    flags: Record<string, boolean>;
    hypothesisSubmitted: boolean;
    hypothesisDestinoZoneId: string | null;
    deadlineWarningEmitted: boolean;
    deadlineExpired: boolean;
}

export interface SaveSlotSummary {
    slot: number;
    empty: boolean;
    data: SaveData | null;
}

function slotKey(slot: number): string {
    return `${SAVE.STORAGE_PREFIX}${slot}`;
}

export class SaveSystem {
    static save(slot: number): void {
        const data: SaveData = {
            schemaVersion: SAVE.SCHEMA_VERSION,
            savedAt: new Date().toISOString(),
            currentCaseId: gameState.currentCaseId,
            currentZoneId: gameState.currentZoneId,
            ended: gameState.ended,
            endingId: gameState.endingId,
            minutosTranscurridos: gameState.minutosTranscurridos,
            clock: { ...gameState.clock },
            collectedClueIds: [...gameState.collectedClueIds],
            npcRelations: JSON.parse(JSON.stringify(gameState.npcRelations)),
            reputacionPolicial: gameState.reputacionPolicial,
            reputacionCallejera: gameState.reputacionCallejera,
            corrupcion: gameState.corrupcion,
            sospecha: gameState.sospecha,
            rechazoSoborno: gameState.rechazoSoborno,
            flags: { ...gameState.flags },
            hypothesisSubmitted: gameState.hypothesisSubmitted,
            hypothesisDestinoZoneId: gameState.hypothesisDestinoZoneId,
            deadlineWarningEmitted: gameState.deadlineWarningEmitted,
            deadlineExpired: gameState.deadlineExpired,
        };
        localStorage.setItem(slotKey(slot), JSON.stringify(data));
    }

    static load(slot: number): boolean {
        const raw = localStorage.getItem(slotKey(slot));
        if (!raw) return false;
        const data = JSON.parse(raw) as SaveData;

        gameState.currentCaseId = data.currentCaseId;
        gameState.currentZoneId = data.currentZoneId;
        gameState.ended = data.ended;
        gameState.endingId = data.endingId;
        gameState.minutosTranscurridos = data.minutosTranscurridos;
        gameState.clock = { ...data.clock };
        gameState.collectedClueIds = [...data.collectedClueIds];
        gameState.npcRelations = JSON.parse(JSON.stringify(data.npcRelations));
        gameState.reputacionPolicial = data.reputacionPolicial;
        gameState.reputacionCallejera = data.reputacionCallejera;
        gameState.corrupcion = data.corrupcion;
        gameState.sospecha = data.sospecha;
        gameState.rechazoSoborno = data.rechazoSoborno;
        gameState.flags = { ...data.flags };
        gameState.hypothesisSubmitted = data.hypothesisSubmitted;
        gameState.hypothesisDestinoZoneId = data.hypothesisDestinoZoneId;
        gameState.deadlineWarningEmitted = data.deadlineWarningEmitted;
        gameState.deadlineExpired = data.deadlineExpired;
        return true;
    }

    static getSummary(slot: number): SaveSlotSummary {
        const raw = localStorage.getItem(slotKey(slot));
        if (!raw) return { slot, empty: true, data: null };
        try {
            return { slot, empty: false, data: JSON.parse(raw) as SaveData };
        } catch {
            return { slot, empty: true, data: null };
        }
    }

    static listSlots(): SaveSlotSummary[] {
        const slots: SaveSlotSummary[] = [];
        for (let i = 0; i < SAVE.SLOT_COUNT; i++) {
            slots.push(this.getSummary(i));
        }
        return slots;
    }

    static deleteSlot(slot: number): void {
        localStorage.removeItem(slotKey(slot));
    }
}
