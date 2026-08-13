export type MusicTrackId = 'menu' | 'reporte' | 'investigacion' | 'persecucion' | 'interrogatorio' | 'peligro' | 'captura';
export type SfxId = 'ui_click' | 'clue_added' | 'warning' | 'error' | 'travel' | 'dialog_open' | 'type_char' | 'footstep';
export type AmbientId = 'urbano' | 'agua';

export interface MusicTrackDef {
    // Frecuencias en Hz de cada nota del loop, en orden.
    notes: number[];
    noteDurationMs: number;
    waveform: OscillatorType;
    gain: number;
    // Nombre de instrumento General MIDI (ver AudioManager.loadInstrument,
    // usa `soundfont-player`) para renderizar estas mismas notas con un
    // timbre real en vez de un oscilador crudo. Opcional: si el soundfont
    // todavía no cargó (o falla, ej. sin red) AudioManager sigue tocando
    // estas notas por oscilador — nunca queda en silencio.
    instrument?: string;
}

// Composiciones simples (loops de 6-8 notas) pensadas para diferenciar el
// "clima" de cada contexto, no para sonar como un tema orquestal — pero ya
// no son un placeholder de un solo oscilador crudo: cada una tiene un
// instrumento General MIDI real asignado (ver `instrument`, cargado con
// `soundfont-player` — MIT, soundfonts gratuitos de
// github.com/gleitz/midi-js-soundfonts) que las toca con timbre real.
export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrackDef> = {
    menu: {
        notes: [220, 261.63, 329.63, 261.63, 220, 196, 220, 261.63],
        noteDurationMs: 420,
        waveform: 'sine',
        gain: 0.5,
        instrument: 'acoustic_grand_piano',
    },
    investigacion: {
        notes: [196, 220, 246.94, 220, 196, 174.61, 196, 220],
        noteDurationMs: 340,
        waveform: 'triangle',
        gain: 0.45,
        instrument: 'vibraphone',
    },
    interrogatorio: {
        notes: [174.61, 174.61, 185, 174.61, 164.81, 164.81, 155.56, 164.81],
        noteDurationMs: 300,
        waveform: 'square',
        gain: 0.25,
        instrument: 'clarinet',
    },
    persecucion: {
        notes: [293.66, 349.23, 293.66, 261.63, 293.66, 349.23, 392, 349.23],
        noteDurationMs: 160,
        waveform: 'sawtooth',
        gain: 0.3,
        instrument: 'distortion_guitar',
    },
    // Más solemne que 'menu': suena en ReportScene, cuando llega el caso.
    // Bandoneón (tango_accordion, el instrumento GM más cercano) a
    // propósito — es el sonido que más "policial negro porteño" pega con
    // el tono del juego.
    reporte: {
        notes: [196, 233.08, 196, 174.61, 155.56, 174.61, 196, 146.83],
        noteDurationMs: 480,
        waveform: 'triangle',
        gain: 0.4,
        instrument: 'tango_accordion',
    },
    // Se dispara automáticamente cuando el reloj cruza el umbral de
    // advertencia de deadline (ver AudioManager.init) — reemplaza a
    // 'investigacion'/'persecucion' mientras el caso sigue activo.
    peligro: {
        notes: [246.94, 246.94, 233.08, 233.08, 220, 220, 233.08, 246.94],
        noteDurationMs: 130,
        waveform: 'square',
        gain: 0.32,
        instrument: 'muted_trumpet',
    },
    // Suena en EndingScene cuando el caso terminó en una captura exitosa.
    captura: {
        notes: [261.63, 329.63, 392, 523.25, 392, 329.63],
        noteDurationMs: 220,
        waveform: 'triangle',
        gain: 0.45,
        instrument: 'trumpet',
    },
};

export interface AmbientTrackDef {
    // Un drone de fondo, mucho más grave y silencioso que la música — la
    // idea es que apenas se note conscientemente, solo dé "presencia" a la
    // locación (calle vs. agua) mientras suena la música por encima.
    notes: number[];
    noteDurationMs: number;
    waveform: OscillatorType;
    gain: number;
}

export const AMBIENT_TRACKS: Record<AmbientId, AmbientTrackDef> = {
    urbano: {
        notes: [98, 92.5, 98, 110],
        noteDurationMs: 900,
        waveform: 'sawtooth',
        gain: 0.05,
    },
    agua: {
        notes: [80, 87.31, 80, 73.42],
        noteDurationMs: 1100,
        waveform: 'sine',
        gain: 0.06,
    },
};

export interface SfxDef {
    freqStart: number;
    freqEnd: number;
    durationMs: number;
    waveform: OscillatorType;
    // Ganancia relativa 0-1. Si no se especifica, AudioManager usa un
    // volumen "normal" por defecto (ver DEFAULT_SFX_GAIN).
    gain?: number;
}

export const DEFAULT_SFX_GAIN = 0.35;

export const SFX: Record<SfxId, SfxDef> = {
    ui_click: { freqStart: 520, freqEnd: 520, durationMs: 40, waveform: 'square' },
    dialog_open: { freqStart: 440, freqEnd: 660, durationMs: 90, waveform: 'sine' },
    clue_added: { freqStart: 523.25, freqEnd: 1046.5, durationMs: 220, waveform: 'triangle' },
    travel: { freqStart: 300, freqEnd: 700, durationMs: 260, waveform: 'sine' },
    warning: { freqStart: 660, freqEnd: 440, durationMs: 180, waveform: 'square' },
    error: { freqStart: 220, freqEnd: 110, durationMs: 300, waveform: 'sawtooth' },
    // Sutiles a propósito, volumen bajo: se disparan muy seguido (texto
    // progresivo, pasos al entrar a una locación) y no deben cansar.
    type_char: { freqStart: 900, freqEnd: 850, durationMs: 14, waveform: 'square', gain: 0.08 },
    footstep: { freqStart: 180, freqEnd: 120, durationMs: 70, waveform: 'triangle', gain: 0.15 },
};
