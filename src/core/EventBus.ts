// Único canal de comunicación entre escenas y sistemas. Ninguna escena debe
// referenciar a otra directamente: todo pasa por acá.
//
// Implementación propia y mínima (no Phaser.Events.EventEmitter): Phaser
// asume la existencia de `window` al importarse, lo que rompe cualquier
// intento de correr los sistemas puros (data/systems) en Node para tests
// automatizados. Este emisor no depende de ningún motor.
type Listener = (payload: unknown) => void;

class SimpleEventEmitter {
    private listeners: Map<string, Listener[]> = new Map();

    on(event: string, fn: Listener): void {
        const list = this.listeners.get(event) ?? [];
        list.push(fn);
        this.listeners.set(event, list);
    }

    off(event: string, fn: Listener): void {
        const list = this.listeners.get(event);
        if (!list) return;
        this.listeners.set(
            event,
            list.filter((l) => l !== fn),
        );
    }

    emit(event: string, payload: unknown): void {
        const list = this.listeners.get(event);
        if (!list) return;
        // Copia defensiva: un listener puede des-suscribirse a sí mismo
        // durante el emit (ver HUDScene shutdown).
        [...list].forEach((fn) => fn(payload));
    }
}

export const EventBus = new SimpleEventEmitter();

export const Events = {
    // Caso / flujo general
    CASE_STARTED: 'case:started',
    CASE_ENDED: 'case:ended',

    // Navegación
    TRAVEL_REQUESTED: 'travel:requested',
    TRAVEL_COMPLETED: 'travel:completed',
    LOCATION_ENTERED: 'location:entered',

    // Diálogo
    DIALOGUE_REQUESTED: 'dialogue:requested',
    DIALOGUE_ENDED: 'dialogue:ended',

    // Pistas
    CLUE_ADDED: 'clue:added',
    CLUE_LIST_CHANGED: 'clue:list-changed',

    // Deducción
    HYPOTHESIS_SUBMITTED: 'hypothesis:submitted',
    HYPOTHESIS_RESULT: 'hypothesis:result',

    // Tiempo
    TIME_ADVANCED: 'time:advanced',
    DEADLINE_WARNING: 'time:deadline-warning',
    DEADLINE_EXPIRED: 'time:deadline-expired',

    // Reputación
    REPUTATION_CHANGED: 'reputation:changed',
    NPC_RELATION_CHANGED: 'npc:relation-changed',

    // Eventos aleatorios
    RANDOM_EVENT_TRIGGERED: 'event:random-triggered',

    // Guardado
    GAME_SAVED: 'save:done',
    GAME_LOADED: 'save:loaded',

    // Debug
    DEBUG_STATE_CHANGED: 'debug:state-changed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
