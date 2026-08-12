import { TIME_COSTS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { getNpc } from '../data/npcs';
import { DialogueNode, DialogueOption, DialogueTree } from '../data/types';
import { CaseManager } from './CaseManager';
import { ClueManager } from './ClueManager';
import { ReputationSystem } from './ReputationSystem';

export class DialogueEngine {
    static getTreeForNpc(npcId: string): DialogueTree {
        const def = CaseManager.getCurrentCase();
        const fromCase = def?.dialogueTrees.find((t) => t.npcId === npcId);
        if (fromCase) return fromCase;
        return DialogueEngine.buildFallbackTree(npcId);
    }

    static buildFallbackTree(npcId: string): DialogueTree {
        const npc = getNpc(npcId);
        const line = npc ? npc.infoQueConoce : 'No tengo nada para decirte, y si lo tuviera, tampoco te lo diría.';
        const saludo = npc ? `${npc.apodo} te mira de reojo antes de decir nada.` : 'Te mira de reojo antes de decir nada.';
        return {
            npcId,
            startNodeId: 'start',
            nodes: {
                start: {
                    npcLine: saludo,
                    options: [
                        {
                            id: 'preguntar',
                            label: '"¿Sabés algo de todo esto?"',
                            kind: 'preguntar',
                            next: 'end',
                            effects: { confianza: 3 },
                            responseLine: line,
                        },
                        { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                    ],
                },
            },
        };
    }

    static getVisibleOptions(node: DialogueNode, npcId: string): DialogueOption[] {
        return node.options.filter((opt) => DialogueEngine.optionAvailable(opt, npcId));
    }

    static optionAvailable(opt: DialogueOption, npcId: string): boolean {
        const rel = gameState.getNpcRelation(npcId);
        if (opt.requiresClueId && !gameState.hasClue(opt.requiresClueId)) return false;
        if (opt.requiresConfianzaMin !== undefined && rel.confianza < opt.requiresConfianzaMin) return false;
        if (opt.requiresFlagAbsent && CaseManager.hasFlag(opt.requiresFlagAbsent)) return false;
        if (opt.requiresFlagPresent && !CaseManager.hasFlag(opt.requiresFlagPresent)) return false;
        if (opt.requiresReputacionPolicialMin !== undefined && gameState.reputacionPolicial < opt.requiresReputacionPolicialMin) return false;
        if (opt.requiresReputacionCallejeraMin !== undefined && gameState.reputacionCallejera < opt.requiresReputacionCallejeraMin) return false;
        if (opt.requiresCorrupcionMax !== undefined && gameState.corrupcion > opt.requiresCorrupcionMax) return false;
        return true;
    }

    // Devuelve true si el caso terminó (deadline cumplido) como consecuencia
    // del tiempo consumido por esta elección.
    static resolveChoice(npcId: string, opt: DialogueOption): boolean {
        const rel = gameState.getNpcRelation(npcId);
        rel.talkedCount += 1;

        ReputationSystem.applyEffects(npcId, opt.effects);

        if (opt.givesClueId) {
            const def = CaseManager.getCurrentCase();
            const clue = def?.clues.find((c) => c.id === opt.givesClueId);
            if (clue) ClueManager.addClue(clue);
        }

        if (opt.setsFlag) {
            CaseManager.setFlag(opt.setsFlag);
        }

        return CaseManager.advanceTimeAndCheckDeadline(TIME_COSTS.ACCION_DIALOGO_MINUTOS);
    }
}
