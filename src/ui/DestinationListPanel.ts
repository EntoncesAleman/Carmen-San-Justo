import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { ZONES } from '../data/zones';
import { audioManager } from '../audio/AudioManager';
import { FRAME } from './frameLayout';

// Panel arriba-izquierda del frame de pantalla dividida: lista de destinos
// SIEMPRE visible (en CityMapScene y en LocationScene) — el jugador puede
// viajar desde cualquiera de las dos sin tener que "volver al mapa"
// primero, igual que en el formato clásico de persecución.
export function renderDestinationListPanel(scene: Phaser.Scene, onTravel: (zoneId: string) => void): void {
    scene.add
        .rectangle(FRAME.leftX, FRAME.contentTop, FRAME.leftWidth, FRAME.listHeight, COLORS.PANEL, 0.9)
        .setOrigin(0, 0)
        .setStrokeStyle(2, COLORS.ACCENT);

    scene.add.text(FRAME.leftX + 10, FRAME.contentTop + 6, 'A DÓNDE VIAJAR', { fontFamily: FONTS.MONO, fontSize: '13px', color: COLORS_CSS.ACCENT });

    const cols = 3;
    const startX = FRAME.leftX + 14;
    const startY = FRAME.contentTop + 30;
    const stepX = FRAME.leftWidth / cols;
    const stepY = 24;

    ZONES.forEach((zone, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * stepX;
        const y = startY + row * stepY;
        const isHere = zone.id === gameState.currentZoneId;

        const label = scene.add
            .text(x, y, isHere ? `📍${zone.nombre}` : zone.nombre, {
                fontFamily: FONTS.MONO,
                fontSize: '10px',
                color: isHere ? COLORS_CSS.ACCENT : COLORS_CSS.TEXT,
                wordWrap: { width: stepX - 6 },
            })
            .setInteractive({ useHandCursor: true });
        label.on('pointerover', () => label.setColor('#ffffff'));
        label.on('pointerout', () => label.setColor(isHere ? COLORS_CSS.ACCENT : COLORS_CSS.TEXT));
        label.on('pointerdown', () => {
            audioManager.playSfx('ui_click');
            onTravel(zone.id);
        });
    });
}
