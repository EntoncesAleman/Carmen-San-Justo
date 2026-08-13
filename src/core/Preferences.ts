// Preferencias del navegador, no de la carrera: mute y velocidad de texto
// tienen que sobrevivir a "Nueva Partida" y a cargar cualquier slot, así
// que viven aparte de SaveSystem (mismo criterio que HallOfFame.ts).
export type TextSpeed = 'lenta' | 'normal' | 'rapida';

export interface Preferences {
    muted: boolean;
    textSpeed: TextSpeed;
}

const STORAGE_KEY = 'eup-preferences';

const TEXT_SPEED_MULTIPLIER: Record<TextSpeed, number> = {
    lenta: 1.8,
    normal: 1,
    rapida: 0.45,
};

const TEXT_SPEED_ORDER: TextSpeed[] = ['lenta', 'normal', 'rapida'];

const DEFAULTS: Preferences = { muted: false, textSpeed: 'normal' };

function isTextSpeed(value: unknown): value is TextSpeed {
    return value === 'lenta' || value === 'normal' || value === 'rapida';
}

export class PreferencesStore {
    private static cache: Preferences | null = null;

    static get(): Preferences {
        if (this.cache) return this.cache;
        const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            this.cache = { ...DEFAULTS };
            return this.cache;
        }
        try {
            const parsed = JSON.parse(raw);
            this.cache = {
                muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULTS.muted,
                textSpeed: isTextSpeed(parsed.textSpeed) ? parsed.textSpeed : DEFAULTS.textSpeed,
            };
        } catch {
            this.cache = { ...DEFAULTS };
        }
        return this.cache;
    }

    static set(partial: Partial<Preferences>): Preferences {
        const next = { ...this.get(), ...partial };
        this.cache = next;
        if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
    }

    static cycleTextSpeed(): TextSpeed {
        const current = this.get().textSpeed;
        const next = TEXT_SPEED_ORDER[(TEXT_SPEED_ORDER.indexOf(current) + 1) % TEXT_SPEED_ORDER.length];
        this.set({ textSpeed: next });
        return next;
    }

    static textSpeedMultiplier(): number {
        return TEXT_SPEED_MULTIPLIER[this.get().textSpeed];
    }
}
