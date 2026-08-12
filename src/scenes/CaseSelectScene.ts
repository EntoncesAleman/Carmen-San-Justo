import * as Phaser from 'phaser';
import { COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { CASES } from '../data/cases';
import { CaseManager } from '../systems/CaseManager';
import { createButton } from '../ui/Button';
import { audioManager } from '../audio/AudioManager';

// Pantalla de selección de caso. Aparece siempre que hay más de un caso
// registrado (ver data/cases/index.ts) — agregar un caso nuevo lo suma acá
// automáticamente, sin tocar esta escena.
export class CaseSelectScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.CASE_SELECT);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        audioManager.playMusic('menu');

        this.add
            .text(this.scale.width / 2, 90, 'ELEGIR CASO', {
                fontFamily: 'Georgia, serif',
                fontSize: '28px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);

        CASES.forEach((def, i) => {
            const y = 220 + i * 150;
            const bg = this.add.rectangle(this.scale.width / 2, y, 780, 120, 0x262b3a, 0.9).setStrokeStyle(2, 0xe8b84b).setInteractive({ useHandCursor: true });

            this.add
                .text(this.scale.width / 2, y - 34, `Caso ${i + 1}: ${def.titulo}`, {
                    fontFamily: 'Georgia, serif',
                    fontSize: '18px',
                    color: COLORS_CSS.TEXT,
                })
                .setOrigin(0.5);

            this.add
                .text(this.scale.width / 2, y + 10, def.descripcion, {
                    fontFamily: 'Georgia, serif',
                    fontSize: '13px',
                    color: '#9aa0ad',
                    align: 'center',
                    wordWrap: { width: 720 },
                })
                .setOrigin(0.5);

            bg.on('pointerdown', () => {
                audioManager.playSfx('ui_click');
                CaseManager.startCase(def.id);
                this.scene.start(SCENE_KEYS.CASE_INTRO);
            });
        });

        createButton(this, this.scale.width / 2, this.scale.height - 50, 'Volver', () => this.scene.start(SCENE_KEYS.MAIN_MENU));
    }
}
