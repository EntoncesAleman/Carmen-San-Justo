// Toda constante de configuración del juego vive acá. Cero valores mágicos
// sueltos en systems/scenes.

export const GAME = {
    WIDTH: 1024,
    HEIGHT: 768,
    BACKGROUND_COLOR: '#050505',
};

// Negro casi puro + ámbar, como un monitor de fósforo de terminal policial
// de PC de principios de los 90 — no un panel plano de UI moderna. El
// panel y el fondo general se distinguen solo por el borde (`ACCENT`), no
// por un cambio de tono suave, para que cada ventana se sienta como una
// ventana de verdad (chrome de sistema operativo viejo), no una card.
export const COLORS = {
    BG_DARK: 0x050505,
    PANEL: 0x0a0a0a,
    ACCENT: 0xe8b84b,
    ALERT: 0xc0392b,
    SUCCESS: 0x4caf7d,
    TEXT: 0xf2ede3,
};

export const COLORS_CSS = {
    BG_DARK: '#050505',
    PANEL: '#0a0a0a',
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

// VT323 (Google Fonts, licencia OFL, self-hosted vía @fontsource/vt323 —
// sin llamadas a un CDN externo) es una tipografía de terminal/VGA
// genérica, no asociada a ningún juego puntual: es el tipo de fuente
// bitmap de PC de principios de los 90 que define visualmente el género de
// "aventura de investigación retro", sin copiar el diseño de letra de
// ningún juego específico. Se usa en TODA la interfaz — menú, HUD,
// diálogos, pantallas de computadora — para que se sienta como un único
// sistema, no una mezcla de fuente moderna + fuente retro solo en algunas
// pantallas. `Preloader` espera a que el navegador termine de cargar el
// archivo de fuente antes de mostrar el menú (`document.fonts.ready`) para
// evitar el bug ya visto una vez: pedir un nombre de fuente no instalado
// hace que Phaser caiga a un fallback con glifos rotos en Chromium.
export const FONTS = {
    SERIF: '"VT323", monospace',
    MONO: '"VT323", monospace',
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
    NAME_ENTRY: 'NameEntryScene',
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
