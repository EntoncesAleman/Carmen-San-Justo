export type Rng = () => number;

// PRNG determinístico (mulberry32) — permite fuzz-testing reproducible del
// generador de casos (mismo seed = misma partida generada, útil para
// reportar y depurar un fallo puntual encontrado en un test). El juego en
// sí usa `Math.random` por defecto (no necesita reproducibilidad).
export function mulberry32(seed: number): Rng {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function pick<T>(items: readonly T[], rng: Rng): T {
    if (items.length === 0) throw new Error('pick: lista vacía');
    return items[Math.floor(rng() * items.length)];
}

// Fisher-Yates, no muta el arreglo original.
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function pickN<T>(items: readonly T[], n: number, rng: Rng): T[] {
    return shuffle(items, rng).slice(0, n);
}

export function randomInt(min: number, max: number, rng: Rng): number {
    return min + Math.floor(rng() * (max - min + 1));
}
