import * as Phaser from 'phaser';
import { COLORS_CSS, FONTS, SCENE_KEYS } from '../core/Constants';
import { HallOfFame } from '../core/HallOfFame';
import { createButton } from '../ui/Button';
import { addTerminalDivider } from '../ui/TerminalDivider';

// Salón de la Fama — historial de detectives (nombre, rango final, casos
// resueltos) que jugaron una carrera completa en este navegador. Pedido
// explícito: reemplaza cualquier ranking genérico por uno con identidad
// real (ver core/HallOfFame.ts para cuándo se archiva una entrada).
export class HallOfFameScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.HALL_OF_FAME);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        this.input.keyboard?.once('keydown-ESC', () => this.scene.start(SCENE_KEYS.MAIN_MENU));

        this.add
            .text(this.scale.width / 2, 58, 'SALÓN DE LA FAMA', { fontFamily: FONTS.MONO, fontSize: '26px', color: COLORS_CSS.ACCENT })
            .setOrigin(0.5);
        addTerminalDivider(this, 84);

        const entries = HallOfFame.list();

        if (entries.length === 0) {
            this.add
                .text(this.scale.width / 2, 200, 'Todavía nadie retiró una placa acá.\nResolvé algunos casos y empezá una carrera nueva.', {
                    fontFamily: FONTS.MONO,
                    fontSize: '15px',
                    color: '#9aa0ad',
                    align: 'center',
                })
                .setOrigin(0.5);
        } else {
            const left = this.scale.width / 2 - 380;
            this.add.text(left, 118, 'DETECTIVE', { fontFamily: FONTS.MONO, fontSize: '13px', color: COLORS_CSS.ACCENT });
            this.add.text(left + 320, 118, 'RANGO FINAL', { fontFamily: FONTS.MONO, fontSize: '13px', color: COLORS_CSS.ACCENT });
            this.add.text(left + 640, 118, 'CASOS', { fontFamily: FONTS.MONO, fontSize: '13px', color: COLORS_CSS.ACCENT });

            entries.slice(0, 12).forEach((entry, i) => {
                const y = 150 + i * 32;
                this.add.text(left, y, entry.name, { fontFamily: FONTS.MONO, fontSize: '14px', color: COLORS_CSS.TEXT });
                this.add.text(left + 320, y, entry.rankTitulo, { fontFamily: FONTS.MONO, fontSize: '14px', color: COLORS_CSS.TEXT });
                this.add.text(left + 640, y, String(entry.casosResueltos), { fontFamily: FONTS.MONO, fontSize: '14px', color: COLORS_CSS.SUCCESS });
            });
        }

        createButton(this, this.scale.width / 2, this.scale.height - 60, 'Volver al menú', () => this.scene.start(SCENE_KEYS.MAIN_MENU), {
            fontFamily: FONTS.MONO,
        });
    }
}
