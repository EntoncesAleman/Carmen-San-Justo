import * as Phaser from 'phaser';
import { COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { createButton } from '../ui/Button';
import { CaseManager } from '../systems/CaseManager';
import { CASES } from '../data/cases';

export class CaseIntroScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.CASE_INTRO);
    }

    create() {
        const def = CaseManager.getCurrentCase();
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);

        const numeroCaso = def ? CASES.findIndex((c) => c.id === def.id) + 1 : 0;

        this.add
            .text(this.scale.width / 2, 210, numeroCaso > 0 ? `CASO ${numeroCaso}` : 'CASO', {
                fontFamily: 'Georgia, serif',
                fontSize: '20px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 260, def?.titulo ?? 'Caso desconocido', {
                fontFamily: 'Georgia, serif',
                fontSize: '30px',
                color: COLORS_CSS.TEXT,
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 360, def?.descripcion ?? '', {
                fontFamily: 'Georgia, serif',
                fontSize: '16px',
                color: COLORS_CSS.TEXT,
                align: 'center',
                wordWrap: { width: 720 },
                lineSpacing: 6,
            })
            .setOrigin(0.5);

        createButton(this, this.scale.width / 2, 540, 'Ir a la comisaría', () => {
            if (!def) {
                this.scene.start(SCENE_KEYS.MAIN_MENU);
                return;
            }
            this.scene.start(SCENE_KEYS.DIALOGUE, {
                npcId: def.briefingDialogue.npcId,
                tree: def.briefingDialogue,
                returnSceneKey: SCENE_KEYS.CITY_MAP,
            });
        });
    }
}
