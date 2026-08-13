import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { getZone } from '../data/zones';
import { getConnections } from '../data/zoneConnections';
import { audioManager } from '../audio/AudioManager';
import { FRAME } from './frameLayout';

// Panel arriba-izquierda del frame de pantalla dividida: el título es la
// zona ACTUAL (como "Atenas" en el formato clásico) y la lista de abajo
// son solo las zonas CONECTADAS a ella (ver data/zoneConnections.ts) — no
// las 21 zonas del mundo siempre disponibles. Es la misma idea que la
// pantalla de "ver conexiones" del juego original: desde acá solo se
// puede viajar directo a un puñado de lugares, no a cualquier lado.
export function renderDestinationListPanel(scene: Phaser.Scene, onTravel: (zoneId: string) => void): void {
    scene.add
        .rectangle(FRAME.leftX, FRAME.contentTop, FRAME.leftWidth, FRAME.listHeight, COLORS.PANEL, 0.9)
        .setOrigin(0, 0)
        .setStrokeStyle(2, COLORS.ACCENT);

    const currentZone = getZone(gameState.currentZoneId);
    scene.add.text(FRAME.leftX + 12, FRAME.contentTop + 8, currentZone?.nombre ?? '—', {
        fontFamily: FONTS.MONO,
        fontSize: '15px',
        color: COLORS_CSS.ACCENT,
    });
    scene.add
        .rectangle(FRAME.leftX + 12, FRAME.contentTop + 32, FRAME.leftWidth - 24, 1, COLORS.ACCENT, 0.5)
        .setOrigin(0, 0);

    const connections = getConnections(gameState.currentZoneId);
    const startY = FRAME.contentTop + 42;
    const stepY = 26;

    connections.forEach((zoneId, i) => {
        const zone = getZone(zoneId);
        if (!zone) return;
        const y = startY + i * stepY;

        const label = scene.add
            .text(FRAME.leftX + 24, y, zone.nombre, {
                fontFamily: FONTS.MONO,
                fontSize: '13px',
                color: COLORS_CSS.TEXT,
                wordWrap: { width: FRAME.leftWidth - 48 },
            })
            .setInteractive({ useHandCursor: true });
        label.on('pointerover', () => label.setColor(COLORS_CSS.ACCENT));
        label.on('pointerout', () => label.setColor(COLORS_CSS.TEXT));
        label.on('pointerdown', () => {
            audioManager.playSfx('ui_click');
            onTravel(zoneId);
        });
    });
}
