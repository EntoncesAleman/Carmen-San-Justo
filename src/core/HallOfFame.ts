// Salón de la Fama — historial de detectives que jugaron una carrera
// completa en este navegador, no del caso actual (eso ya lo cubre
// SaveSystem). Separado de los 3 slots de guardado a propósito: guardar
// una carrera nueva no debería borrar el registro de la anterior.
export interface HallOfFameEntry {
    name: string;
    casosResueltos: number;
    rankTitulo: string;
    date: string;
}

const STORAGE_KEY = 'eup-hall-of-fame';

export class HallOfFame {
    static list(): HallOfFameEntry[] {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    // Solo vale la pena archivar una carrera que efectivamente resolvió
    // algo — un detective recién creado que nunca jugó no ensucia el
    // salón de la fama.
    static record(entry: HallOfFameEntry): void {
        if (entry.casosResueltos <= 0) return;
        const entries = HallOfFame.list();
        entries.push(entry);
        entries.sort((a, b) => b.casosResueltos - a.casosResueltos);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
    }
}
