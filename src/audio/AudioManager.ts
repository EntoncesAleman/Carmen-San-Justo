import { AUDIO } from '../core/Constants';
import { EventBus, Events } from '../core/EventBus';
import { PreferencesStore } from '../core/Preferences';
import { AMBIENT_TRACKS, DEFAULT_SFX_GAIN, MUSIC_TRACKS, SFX, AmbientId, MusicTrackId, SfxId } from './tracks';

// Sistema de audio modular con placeholders sintetizados (Web Audio API).
// No depende de ningún archivo de audio externo: mientras no haya música ni
// sonidos definitivos, esto cumple la regla de "no bloquear el desarrollo
// esperando audio definitivo" (ver docs/ART_DIRECTION.md).
//
// Vive fuera de core/ y systems/ a propósito: usa `AudioContext`, que solo
// existe en el navegador, y core/systems deben poder importarse en Node
// para los unit tests (ver docs/TESTING.md).
class AudioManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private musicGain: GainNode | null = null;
    private ambientGain: GainNode | null = null;
    private currentTrackId: MusicTrackId | null = null;
    private currentTrackTimer: ReturnType<typeof setInterval> | null = null;
    private currentAmbientId: AmbientId | null = null;
    private currentAmbientTimer: ReturnType<typeof setInterval> | null = null;
    // El default de Preferences (ver core/Preferences.ts) ya coincide con
    // AUDIO.ENABLED_BY_DEFAULT la primera vez que se abre el juego; de ahí
    // en más, lo que persiste ahí gana por sobre la constante.
    private muted = PreferencesStore.get().muted;
    private unlockListenersAttached = false;

    // Se llama una sola vez, típicamente desde Boot.
    init(): void {
        this.attachUnlockListeners();
        EventBus.on(Events.CLUE_ADDED, () => this.playSfx('clue_added'));
        EventBus.on(Events.DEADLINE_WARNING, () => {
            this.playSfx('warning');
            this.playMusic('peligro');
        });
        EventBus.on(Events.DEADLINE_EXPIRED, () => this.playSfx('error'));
        EventBus.on(Events.TRAVEL_COMPLETED, () => this.playSfx('travel'));
    }

    private attachUnlockListeners(): void {
        if (this.unlockListenersAttached || typeof window === 'undefined') return;
        this.unlockListenersAttached = true;
        const unlock = () => {
            const ctx = this.ensureContext();
            if (ctx.state === 'suspended') void ctx.resume();
        };
        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
    }

    private ensureContext(): AudioContext {
        if (!this.ctx) {
            const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.ctx = new AudioContextCtor();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.muted ? 0 : AUDIO.MASTER_VOLUME;
            this.masterGain.connect(this.ctx.destination);
            this.musicGain = this.ctx.createGain();
            this.musicGain.connect(this.masterGain);
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.connect(this.masterGain);
        }
        return this.ctx;
    }

    isMuted(): boolean {
        return this.muted;
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
        PreferencesStore.set({ muted });
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : AUDIO.MASTER_VOLUME;
        }
    }

    toggleMuted(): boolean {
        this.setMuted(!this.muted);
        return this.muted;
    }

    playMusic(trackId: MusicTrackId): void {
        if (this.currentTrackId === trackId) return;
        this.stopMusic();
        this.currentTrackId = trackId;

        const ctx = this.ensureContext();
        const track = MUSIC_TRACKS[trackId];
        let noteIndex = 0;

        const playNote = () => {
            if (!this.musicGain) return;
            const freq = track.notes[noteIndex % track.notes.length];
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            osc.type = track.waveform;
            osc.frequency.value = freq;
            noteGain.gain.setValueAtTime(track.gain, ctx.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + track.noteDurationMs / 1000);
            osc.connect(noteGain);
            noteGain.connect(this.musicGain);
            osc.start();
            osc.stop(ctx.currentTime + track.noteDurationMs / 1000);
            noteIndex++;
        };

        playNote();
        this.currentTrackTimer = setInterval(playNote, track.noteDurationMs);
    }

    stopMusic(): void {
        if (this.currentTrackTimer !== null) {
            clearInterval(this.currentTrackTimer);
            this.currentTrackTimer = null;
        }
        this.currentTrackId = null;
    }

    // Drone de fondo por tipo de zona (urbano/agua), suena en simultáneo con
    // la música — un segundo loop mucho más grave y silencioso, no un
    // reemplazo. Ver `data/ambient.ts` para qué zonas usan cuál.
    playAmbient(ambientId: AmbientId): void {
        if (this.currentAmbientId === ambientId) return;
        this.stopAmbient();
        this.currentAmbientId = ambientId;

        const ctx = this.ensureContext();
        const track = AMBIENT_TRACKS[ambientId];
        let noteIndex = 0;

        const playNote = () => {
            if (!this.ambientGain) return;
            const freq = track.notes[noteIndex % track.notes.length];
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            osc.type = track.waveform;
            osc.frequency.value = freq;
            noteGain.gain.setValueAtTime(track.gain, ctx.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + track.noteDurationMs / 1000);
            osc.connect(noteGain);
            noteGain.connect(this.ambientGain);
            osc.start();
            osc.stop(ctx.currentTime + track.noteDurationMs / 1000);
            noteIndex++;
        };

        playNote();
        this.currentAmbientTimer = setInterval(playNote, track.noteDurationMs);
    }

    stopAmbient(): void {
        if (this.currentAmbientTimer !== null) {
            clearInterval(this.currentAmbientTimer);
            this.currentAmbientTimer = null;
        }
        this.currentAmbientId = null;
    }

    playSfx(id: SfxId): void {
        const ctx = this.ensureContext();
        if (!this.masterGain) return;
        const def = SFX[id];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = def.waveform;
        osc.frequency.setValueAtTime(def.freqStart, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(Math.max(def.freqEnd, 1), ctx.currentTime + def.durationMs / 1000);
        gain.gain.setValueAtTime(def.gain ?? DEFAULT_SFX_GAIN, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + def.durationMs / 1000);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(ctx.currentTime + def.durationMs / 1000);
    }
}

export const audioManager = new AudioManager();
