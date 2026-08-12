export type MusicTrackId = 'menu' | 'investigacion' | 'persecucion' | 'interrogatorio';
export type SfxId = 'ui_click' | 'clue_added' | 'warning' | 'error' | 'travel' | 'dialog_open';

export interface MusicTrackDef {
    // Frecuencias en Hz de cada nota del loop, en orden.
    notes: number[];
    noteDurationMs: number;
    waveform: OscillatorType;
    gain: number;
}

// Placeholders funcionales: no son música real, son loops de notas simples
// que alcanzan para diferenciar el "clima" de cada contexto sin bloquear el
// desarrollo esperando audio definitivo (ver ART_DIRECTION.md / TESTING.md).
// Reemplazar por música real es un cambio contenido a este archivo + al
// AudioManager, no a las escenas que lo consumen.
export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrackDef> = {
    menu: {
        notes: [220, 261.63, 329.63, 261.63, 220, 196, 220, 261.63],
        noteDurationMs: 420,
        waveform: 'sine',
        gain: 0.5,
    },
    investigacion: {
        notes: [196, 220, 246.94, 220, 196, 174.61, 196, 220],
        noteDurationMs: 340,
        waveform: 'triangle',
        gain: 0.45,
    },
    interrogatorio: {
        notes: [174.61, 174.61, 185, 174.61, 164.81, 164.81, 155.56, 164.81],
        noteDurationMs: 300,
        waveform: 'square',
        gain: 0.25,
    },
    persecucion: {
        notes: [293.66, 349.23, 293.66, 261.63, 293.66, 349.23, 392, 349.23],
        noteDurationMs: 160,
        waveform: 'sawtooth',
        gain: 0.3,
    },
};

export interface SfxDef {
    freqStart: number;
    freqEnd: number;
    durationMs: number;
    waveform: OscillatorType;
}

export const SFX: Record<SfxId, SfxDef> = {
    ui_click: { freqStart: 520, freqEnd: 520, durationMs: 40, waveform: 'square' },
    dialog_open: { freqStart: 440, freqEnd: 660, durationMs: 90, waveform: 'sine' },
    clue_added: { freqStart: 523.25, freqEnd: 1046.5, durationMs: 220, waveform: 'triangle' },
    travel: { freqStart: 300, freqEnd: 700, durationMs: 260, waveform: 'sine' },
    warning: { freqStart: 660, freqEnd: 440, durationMs: 180, waveform: 'square' },
    error: { freqStart: 220, freqEnd: 110, durationMs: 300, waveform: 'sawtooth' },
};
