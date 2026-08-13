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
                fontFamily: '"VT323", monospace',
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
        // Esperar a que el navegador termine de bajar VT323 antes de pasar
        // al menú — pedir una fuente que todavía no está lista hace que
        // Phaser caiga a un fallback con glifos rotos (bug real, visto
        // antes con "Courier New" en Chromium headless). document.fonts.ready
        // resuelve enseguida si la fuente ya está en caché.
        Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 1500))]).then(() => {
            this.scene.start(SCENE_KEYS.MAIN_MENU);
        });
    }
}
