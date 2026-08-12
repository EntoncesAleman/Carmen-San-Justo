// Toda constante de configuración del juego vive acá. Cero valores mágicos
// sueltos en systems/scenes.

export const GAME = {
    WIDTH: 1024,
    HEIGHT: 768,
    BACKGROUND_COLOR: '#1b1f2a',
};

export const COLORS = {
    BG_DARK: 0x1b1f2a,
    PANEL: 0x262b3a,
    ACCENT: 0xe8b84b,
    ALERT: 0xc0392b,
    SUCCESS: 0x4caf7d,
    TEXT: 0xf2ede3,
};

export const COLORS_CSS = {
    BG_DARK: '#1b1f2a',
    PANEL: '#262b3a',
    ACCENT: '#e8b84b',
    ALERT: '#c0392b',
    SUCCESS: '#4caf7d',
    TEXT: '#f2ede3',
};

export const TIME_COSTS = {
    VIAJAR_MINUTOS: 45,
    EXPLORAR_MINUTOS: 15,
    HABLAR_MINUTOS: 10,
    ESPERAR_MINUTOS: 30,
    ACCION_DIALOGO_MINUTOS: 5,
};

// Minutos totales del reloj de caso antes de que la banda escape por defecto.
// El caso 1 sobreescribe esto con su propio deadlineMinutos.
export const DEFAULT_DEADLINE_MINUTOS = 12 * 60;

// Umbral de minutos restantes en el que empiezan a dispararse eventos de
// presión (una pista puede desaparecer, etc).
export const DEADLINE_WARNING_MINUTOS = 120;

export const REPUTATION = {
    MIN: 0,
    MAX: 100,
    START_REPUTACION_POLICIAL: 50,
    START_REPUTACION_CALLEJERA: 50,
    START_CORRUPCION: 20,
    START_SOSPECHA: 10,
    UMBRAL_ALTO: 65,
    UMBRAL_BAJO: 35,
};

export const NPC_RELATION = {
    START_CONFIANZA: 30,
    START_SOSPECHA: 10,
    MIN: 0,
    MAX: 100,
    CONFIANZA_MINIMA_PISTA_SENSIBLE: 55,
};

export const RANDOM_EVENT = {
    // probabilidad (0-1) de que ocurra un evento aleatorio menor al explorar
    PROBABILIDAD_AL_EXPLORAR: 0.25,
};

export const DEBUG = {
    ENABLED: true,
    TOGGLE_KEY: 'BACKTICK',
};

export const FONTS = {
    SERIF: 'Georgia, serif',
    // Usada en pantallas "de computadora"/terminal (Crime Computer, Reporte,
    // Expediente) para reforzar la estética retro policial pedida en el
    // diseño — ver docs/CARMEN_AR_AUDIT.md. "monospace" genérico a
    // propósito: un nombre de fuente específico (ej. "Courier New") que no
    // esté instalado hace que Phaser caiga a un fallback con glifos rotos
    // en algunos entornos (visto en Chromium headless).
    MONO: 'monospace',
};

export const AUDIO = {
    MASTER_VOLUME: 0.18,
    SFX_VOLUME: 0.3,
    ENABLED_BY_DEFAULT: true,
};

export const SAVE = {
    SLOT_COUNT: 3,
    STORAGE_PREFIX: 'eup-save-slot-',
    SCHEMA_VERSION: 1,
};

export const SCENE_KEYS = {
    BOOT: 'Boot',
    PRELOADER: 'Preloader',
    MAIN_MENU: 'MainMenu',
    LOAD_GAME: 'LoadGame',
    REPORT: 'ReportScene',
    CITY_MAP: 'CityMap',
    LOCATION: 'LocationScene',
    DIALOGUE: 'DialogueScene',
    SUSPECT_BOARD: 'SuspectBoardScene',
    CASE_FILE: 'CaseFileScene',
    CRIME_COMPUTER: 'CrimeComputerScene',
    ENDING: 'EndingScene',
    HUD: 'HUDScene',
    DEBUG: 'DebugScene',
};
