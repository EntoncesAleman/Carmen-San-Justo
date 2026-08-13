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
    // Progreso de carrera (NO se resetea entre casos — persiste durante
    // toda la partida/guardado, ver SaveSystem).
    casoIndex = 0; // qué caso de CASES[] toca a continuación
    casosResueltos = 0; // impulsa el rango (ver data/ranks.ts)
    // Nombre que el jugador escribe en NameEntryScene al arrancar una
    // carrera nueva — se usa en ReportScene/CaseFileScene/CrimeComputerScene
    // para que el juego se dirija al jugador por su nombre, no solo al
    // protagonista fijo. No se resetea en reset() (persiste entre casos de
    // la misma carrera), solo se pisa al arrancar una carrera nueva.
    detectiveName = '';

    // Progreso del caso actual
    currentCaseId: string | null = null;
    currentZoneId: string = '';
    ended = false;
    endingId: string | null = null;

    // Ruta del caco: en qué parada de CaseDefinition.ruta está el jugador
    // parado en su reconstrucción de la persecución (0 = escena del crimen).
    rutaProgresoIndex = 0;
    // Se exige antes de poder confrontar/arrestar en la parada final.
    ordenCapturaEmitida = false;

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
        // OJO: casoIndex y casosResueltos NO se resetean acá a propósito —
        // son progreso de carrera entre casos, no estado del caso actual.
        this.currentCaseId = null;
        this.currentZoneId = '';
        this.ended = false;
        this.endingId = null;
        this.rutaProgresoIndex = 0;
        this.ordenCapturaEmitida = false;
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

    // Reinicia TODO, incluido el progreso de carrera. Usar solo al arrancar
    // una partida nueva desde cero (MainMenu → "Nueva Partida"), nunca al
    // pasar de un caso al siguiente.
    resetCareer() {
        this.casoIndex = 0;
        this.casosResueltos = 0;
        this.reset();
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
