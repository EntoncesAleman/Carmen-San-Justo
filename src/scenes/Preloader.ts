import * as Phaser from 'phaser';
import { COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { NPC_PORTRAITS, LOCATION_BACKGROUNDS, PROTAGONIST_PORTRAIT_KEY } from '../data/portraits';

// Carga los retratos/fondos generados (ver docs/ART_DIRECTION.md). Un NPC o
// locación sin entrada en data/portraits.ts simplemente no tiene imagen
// todavía — las escenas que los consumen ya saben mostrar un placeholder en
// ese caso, así que agregar un asset nuevo es un cambio de datos, no de
// código.
export class Preloader extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.PRELOADER);
    }

    preload() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        const label = this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'Cargando...', {
                fontFamily: 'Georgia, serif',
                fontSize: '24px',
                color: COLORS_CSS.TEXT,
            })
            .setOrigin(0.5);

        this.load.on('progress', (value: number) => {
            label.setText(`Cargando... ${Math.round(value * 100)}%`);
        });

        this.load.image(PROTAGONIST_PORTRAIT_KEY, `assets/characters/${PROTAGONIST_PORTRAIT_KEY}.png`);
        Object.values(NPC_PORTRAITS).forEach((key) => {
            this.load.image(key, `assets/characters/${key}.png`);
        });
        Object.values(LOCATION_BACKGROUNDS).forEach((key) => {
            this.load.image(key, `assets/backgrounds/${key}.png`);
        });
    }

    create() {
        this.scene.start(SCENE_KEYS.MAIN_MENU);
    }
}
