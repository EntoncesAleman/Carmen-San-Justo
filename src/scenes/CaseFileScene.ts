import * as Phaser from 'phaser';
import { COLORS_CSS, FONTS, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { ClueManager } from '../systems/ClueManager';
import { createButton } from '../ui/Button';
import { addTerminalDivider } from '../ui/TerminalDivider';

export class CaseFileScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.CASE_FILE);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        const def = CaseManager.getCurrentCase();

        this.add
            .text(this.scale.width / 2, 58, 'EXPEDIENTE', { fontFamily: FONTS.MONO, fontSize: '26px', color: COLORS_CSS.ACCENT })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 84, `DETECTIVE: ${gameState.detectiveName || '—'}`, { fontFamily: FONTS.MONO, fontSize: '13px', color: COLORS_CSS.TEXT })
            .setOrigin(0.5);
        addTerminalDivider(this, 106);

        if (!def) {
            this.add.text(this.scale.width / 2, 164, 'No hay un caso activo.', { fontFamily: FONTS.MONO, fontSize: '16px', color: COLORS_CSS.TEXT }).setOrigin(0.5);
            createButton(this, this.scale.width / 2, 244, 'Volver', () => this.scene.start(SCENE_KEYS.CITY_MAP), { fontFamily: FONTS.MONO });
            return;
        }

        this.add
            .text(this.scale.width / 2, 128, def.titulo, { fontFamily: FONTS.MONO, fontSize: '20px', color: COLORS_CSS.TEXT })
            .setOrigin(0.5);

        this.add
            .text(80, 168, def.descripcion, {
                fontFamily: FONTS.MONO,
                fontSize: '14px',
                color: COLORS_CSS.TEXT,
                wordWrap: { width: 860 },
                lineSpacing: 4,
            });

        this.add.text(80, 248, 'PISTAS RECOLECTADAS:', { fontFamily: FONTS.MONO, fontSize: '16px', color: COLORS_CSS.ACCENT });

        const collected = ClueManager.getCollectedClues(def.clues);
        if (collected.length === 0) {
            this.add.text(100, 278, 'Todavía no conseguiste ninguna pista.', { fontFamily: FONTS.MONO, fontSize: '13px', color: COLORS_CSS.TEXT });
        } else {
            collected.forEach((clue, i) => {
                const marker = clue.esFalsa ? '⚠' : '>';
                const confianza = clue.confiabilidad >= 70 ? 'ALTA' : clue.confiabilidad >= 45 ? 'MEDIA' : 'BAJA';
                this.add.text(100, 278 + i * 46, `${marker} [${clue.categoria}] ${clue.descripcion}  (CONFIANZA: ${confianza})`, {
                    fontFamily: FONTS.MONO,
                    fontSize: '13px',
                    color: clue.esFalsa ? '#c0392b' : COLORS_CSS.TEXT,
                    wordWrap: { width: 820 },
                });
            });
        }

        const requiredCount = def.cluesRequeridasParaResolver.length;
        const haveCount = def.cluesRequeridasParaResolver.filter((id) => gameState.hasClue(id)).length;
        this.add.text(80, 278 + Math.max(collected.length, 1) * 46 + 20, `PISTAS CLAVE: ${haveCount}/${requiredCount}`, {
            fontFamily: FONTS.MONO,
            fontSize: '14px',
            color: COLORS_CSS.SUCCESS,
        });

        createButton(this, this.scale.width / 2, this.scale.height - 50, 'Volver al mapa', () => this.scene.start(SCENE_KEYS.CITY_MAP), { fontFamily: FONTS.MONO });
    }
}
