import { NPC_RELATION } from '../core/Constants';
import { EventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { DialogueEffectSet } from '../data/types';

function clampNpc(value: number): number {
    return Math.max(NPC_RELATION.MIN, Math.min(NPC_RELATION.MAX, value));
}

export class ReputationSystem {
    static applyEffects(npcId: string | null, effects?: DialogueEffectSet): void {
        if (!effects) return;

        if (npcId && effects.confianza !== undefined) {
            const rel = gameState.getNpcRelation(npcId);
            rel.confianza = clampNpc(rel.confianza + effects.confianza);
        }
        if (npcId && effects.sospechaNpc !== undefined) {
            const rel = gameState.getNpcRelation(npcId);
            rel.sospecha = clampNpc(rel.sospecha + effects.sospechaNpc);
        }
        if (effects.reputacionPolicial !== undefined) {
            gameState.reputacionPolicial = gameState.clamp(gameState.reputacionPolicial + effects.reputacionPolicial);
        }
        if (effects.reputacionCallejera !== undefined) {
            gameState.reputacionCallejera = gameState.clamp(gameState.reputacionCallejera + effects.reputacionCallejera);
        }
        if (effects.corrupcion !== undefined) {
            gameState.corrupcion = gameState.clamp(gameState.corrupcion + effects.corrupcion);
        }
        if (effects.sospechaGlobal !== undefined) {
            gameState.sospecha = gameState.clamp(gameState.sospecha + effects.sospechaGlobal);
        }

        EventBus.emit(Events.REPUTATION_CHANGED, {
            reputacionPolicial: gameState.reputacionPolicial,
            reputacionCallejera: gameState.reputacionCallejera,
            corrupcion: gameState.corrupcion,
            sospecha: gameState.sospecha,
        });

        if (npcId) {
            EventBus.emit(Events.NPC_RELATION_CHANGED, { npcId, relation: gameState.getNpcRelation(npcId) });
        }
    }
}
