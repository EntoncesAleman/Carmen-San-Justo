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
        addTerminalDivider(this, 82);

        if (!def) {
            this.add.text(this.scale.width / 2, 140, 'No hay un caso activo.', { fontFamily: FONTS.MONO, fontSize: '16px', color: COLORS_CSS.TEXT }).setOrigin(0.5);
            createButton(this, this.scale.width / 2, 220, 'Volver', () => this.scene.start(SCENE_KEYS.CITY_MAP), { fontFamily: FONTS.MONO });
            return;
        }

        this.add
            .text(this.scale.width / 2, 104, def.titulo, { fontFamily: FONTS.MONO, fontSize: '20px', color: COLORS_CSS.TEXT })
            .setOrigin(0.5);

        this.add
            .text(80, 144, def.descripcion, {
                fontFamily: FONTS.MONO,
                fontSize: '14px',
                color: COLORS_CSS.TEXT,
                wordWrap: { width: 860 },
                lineSpacing: 4,
            });

        this.add.text(80, 224, 'PISTAS RECOLECTADAS:', { fontFamily: FONTS.MONO, fontSize: '16px', color: COLORS_CSS.ACCENT });

        const collected = ClueManager.getCollectedClues(def.clues);
        if (collected.length === 0) {
            this.add.text(100, 254, 'Todavía no conseguiste ninguna pista.', { fontFamily: FONTS.MONO, fontSize: '13px', color: COLORS_CSS.TEXT });
        } else {
            collected.forEach((clue, i) => {
                const marker = clue.esFalsa ? '⚠' : '>';
                this.add.text(100, 254 + i * 46, `${marker} [${clue.categoria}] ${clue.descripcion}`, {
                    fontFamily: FONTS.MONO,
                    fontSize: '13px',
                    color: clue.esFalsa ? '#c0392b' : COLORS_CSS.TEXT,
                    wordWrap: { width: 820 },
                });
            });
        }

        const requiredCount = def.cluesRequeridasParaResolver.length;
        const haveCount = def.cluesRequeridasParaResolver.filter((id) => gameState.hasClue(id)).length;
        this.add.text(80, 254 + Math.max(collected.length, 1) * 46 + 20, `PISTAS CLAVE: ${haveCount}/${requiredCount}`, {
            fontFamily: FONTS.MONO,
            fontSize: '14px',
            color: COLORS_CSS.SUCCESS,
        });

        createButton(this, this.scale.width / 2, this.scale.height - 50, 'Volver al mapa', () => this.scene.start(SCENE_KEYS.CITY_MAP), { fontFamily: FONTS.MONO });
    }
}
