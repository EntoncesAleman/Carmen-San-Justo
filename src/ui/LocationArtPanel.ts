import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { getZone } from '../data/zones';
import { getLocationByZone } from '../data/locations';
import { getBackgroundKey } from '../data/portraits';
import { FRAME } from './frameLayout';

// Panel abajo-izquierda del frame: arte de la zona actual. Mismo panel en
// CityMapScene (mientras se elige a dónde ir) y en LocationScene (una vez
// ahí) — es la misma "ventana al lugar", no dos cosas distintas.
export function renderLocationArtPanel(scene: Phaser.Scene): void {
    const top = FRAME.artTop;
    const height = FRAME.contentBottom - top;
    const zone = getZone(gameState.currentZoneId);
    const location = getLocationByZone(gameState.currentZoneId);

    scene.add.rectangle(FRAME.leftX, top, FRAME.leftWidth, height, 0x000000, 1).setOrigin(0, 0).setStrokeStyle(2, COLORS.ACCENT);

    const bgKey = location ? getBackgroundKey(location.id) : undefined;
    if (bgKey && scene.textures.exists(bgKey)) {
        const img = scene.add.image(FRAME.leftX + FRAME.leftWidth / 2, top + height / 2, bgKey);
        img.setDisplaySize(FRAME.leftWidth - 4, height - 4);
    }

    scene.add
        .text(FRAME.leftX + 10, top + height - 22, zone?.nombre ?? '—', {
            fontFamily: FONTS.MONO,
            fontSize: '13px',
            color: COLORS_CSS.ACCENT,
            backgroundColor: '#000000cc',
            padding: { x: 4, y: 2 },
        })
        .setOrigin(0, 0);
}
