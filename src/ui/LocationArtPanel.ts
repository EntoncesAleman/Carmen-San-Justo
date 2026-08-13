import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { getZone } from '../data/zones';
import { getLocationByZone } from '../data/locations';
import { getBackgroundKey } from '../data/portraits';
import { FRAME } from './frameLayout';

// Panel arriba de la columna izquierda: arte de la zona actual (grande,
// calca el "gráfico de la ciudad" del formato clásico — ver
// frameLayout.ts). Mismo panel en CityMapScene y LocationScene; en
// DialogueScene este espacio lo ocupa el retrato de con quién hablás en
// vez de la zona (ver DialogueScene.renderPortrait), no este componente.
//
// `onEnter`, si se pasa, hace clickeable el panel para "entrar" al lugar
// donde ya estás parado sin viajar (gratis, sin costo de tiempo) — el
// menú de acciones de CityMapScene ya no lista la zona actual como
// destino (solo sus conexiones), así que esta es la forma de pasar a
// LocationScene sin moverte. Solo CityMapScene lo usa.
export function renderLocationArtPanel(scene: Phaser.Scene, onEnter?: () => void): void {
    const top = FRAME.contentTop;
    const height = FRAME.artHeight;
    const zone = getZone(gameState.currentZoneId);
    const location = getLocationByZone(gameState.currentZoneId);

    const panel = scene.add.rectangle(FRAME.leftX, top, FRAME.leftWidth, height, 0x000000, 1).setOrigin(0, 0).setStrokeStyle(2, COLORS.ACCENT);

    const bgKey = location ? getBackgroundKey(location.id) : undefined;
    if (bgKey && scene.textures.exists(bgKey)) {
        const img = scene.add.image(FRAME.leftX + FRAME.leftWidth / 2, top + height / 2, bgKey);
        img.setDisplaySize(FRAME.leftWidth - 4, height - 4);
    }

    scene.add
        .text(FRAME.leftX + 10, top + height - 26, zone?.nombre ?? '—', {
            fontFamily: FONTS.MONO,
            fontSize: '15px',
            color: COLORS_CSS.ACCENT,
            backgroundColor: '#000000cc',
            padding: { x: 4, y: 2 },
        })
        .setOrigin(0, 0);

    if (onEnter) {
        panel.setInteractive({ useHandCursor: true });
        panel.on('pointerdown', onEnter);
    }
}
