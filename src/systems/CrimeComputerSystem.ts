import { gameState } from '../core/GameState';
import { CaseDefinition, SuspectAttributeKey, SuspectProfile } from '../data/types';
import { filterSuspects } from '../data/suspects';

// Lógica del "Sistema de Inteligencia Criminal" (Crime Computer). Pura,
// sin Phaser: arma el identikit a partir de las pistas ya conseguidas y
// filtra la base de sospechosos.
export class CrimeComputerSystem {
    static getKnownAttributes(def: CaseDefinition): Partial<Record<SuspectAttributeKey, string>> {
        const known: Partial<Record<SuspectAttributeKey, string>> = {};
        def.clues
            .filter((c) => c.revealsAttribute && gameState.hasClue(c.id))
            .forEach((c) => {
                known[c.revealsAttribute!.key] = c.revealsAttribute!.value;
            });
        return known;
    }

    static getMatchingSuspects(def: CaseDefinition): SuspectProfile[] {
        return filterSuspects(this.getKnownAttributes(def));
    }

    // Emitir la orden requiere haber acorralado a UN solo sospechoso Y que
    // sea, efectivamente, el caco real del caso (no un señuelo con la
    // casualidad de quedar solo por pistas incompletas).
    static canEmitirOrden(def: CaseDefinition): boolean {
        const matches = this.getMatchingSuspects(def);
        return matches.length === 1 && matches[0].id === def.sospechosoId;
    }
}
