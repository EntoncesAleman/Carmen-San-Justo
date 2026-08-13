import { gameState } from '../core/GameState';
import { CaseDefinition, Clue } from '../data/types';

// Pistas "físicas": se encuentran revisando el lugar, no hablando con
// nadie (por eso no tienen `npcId`). Antes de esto, el botón "Explorar" de
// LocationScene solo disparaba flavor text sin efecto mecánico (ver
// docs/ROADMAP.md) — ninguna pista de ningún caso pasaba por acá.
export class ExploreSystem {
    static findExploreClue(def: CaseDefinition, zoneId: string): Clue | null {
        return def.clues.find((c) => !c.npcId && !c.esFalsa && c.ubicacionZoneId === zoneId && !gameState.hasClue(c.id)) ?? null;
    }
}
