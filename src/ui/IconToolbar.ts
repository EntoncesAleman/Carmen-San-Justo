import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS } from '../core/Constants';
import { audioManager } from '../audio/AudioManager';
import { FRAME } from './frameLayout';
import { CURSOR_POINTER } from './cursor';

export type IconId = 'mapa' | 'pizarron' | 'expediente' | 'crimen';

export interface IconToolbarItem {
    icon: IconId;
    label: string;
    onClick: () => void;
}

// Barra de íconos al pie de la columna derecha — pedido explícito
// comparando contra capturas reales del juego de referencia: las
// acciones "de sistema" (mapa, pizarrón, expediente, inteligencia
// criminal) ahí son botones con ícono + etiqueta corta en una fila, no
// más renglones de texto en la lista de arriba. Los íconos son vectores
// dibujados a mano (Graphics), no assets — mismo criterio que el resto
// del chrome propio del juego.
const ICON_SIZE = 22;

function drawIcon(scene: Phaser.Scene, icon: IconId, cx: number, cy: number): void {
    const g = scene.add.graphics();
    g.lineStyle(2, COLORS.ACCENT, 1);
    const s = ICON_SIZE / 2;

    if (icon === 'mapa') {
        // Tres puntos conectados — mini red de nodos.
        const pts: [number, number][] = [
            [cx - s, cy + s * 0.6],
            [cx + s, cy + s * 0.6],
            [cx, cy - s],
        ];
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        g.lineTo(pts[1][0], pts[1][1]);
        g.lineTo(pts[2][0], pts[2][1]);
        g.lineTo(pts[0][0], pts[0][1]);
        g.strokePath();
        pts.forEach(([x, y]) => g.fillStyle(COLORS.ACCENT, 1).fillCircle(x, y, 2.5));
    } else if (icon === 'pizarron') {
        // Pizarra con un pin — tablero de corcho esquemático.
        g.strokeRect(cx - s, cy - s * 0.8, s * 2, s * 1.6);
        g.beginPath();
        g.moveTo(cx - s * 0.5, cy - s * 0.2);
        g.lineTo(cx + s * 0.5, cy - s * 0.2);
        g.moveTo(cx - s * 0.5, cy + s * 0.3);
        g.lineTo(cx + s * 0.2, cy + s * 0.3);
        g.strokePath();
        g.fillStyle(COLORS.ALERT, 1).fillCircle(cx + s * 0.55, cy - s * 0.6, 2.5);
    } else if (icon === 'expediente') {
        // Carpeta — rectángulo con una solapa arriba a la izquierda.
        g.beginPath();
        g.moveTo(cx - s, cy - s * 0.3);
        g.lineTo(cx - s * 0.3, cy - s * 0.3);
        g.lineTo(cx - s * 0.1, cy - s * 0.7);
        g.lineTo(cx + s, cy - s * 0.7);
        g.lineTo(cx + s, cy + s * 0.7);
        g.lineTo(cx - s, cy + s * 0.7);
        g.closePath();
        g.strokePath();
    } else {
        // "crimen" — monitor con base, un par de líneas adentro (texto).
        g.strokeRect(cx - s, cy - s * 0.8, s * 2, s * 1.3);
        g.beginPath();
        g.moveTo(cx, cy + s * 0.5);
        g.lineTo(cx, cy + s * 0.8);
        g.moveTo(cx - s * 0.5, cy + s * 0.8);
        g.lineTo(cx + s * 0.5, cy + s * 0.8);
        g.strokePath();
        g.lineStyle(1, COLORS.SUCCESS, 1);
        g.beginPath();
        g.moveTo(cx - s * 0.6, cy - s * 0.4);
        g.lineTo(cx + s * 0.3, cy - s * 0.4);
        g.moveTo(cx - s * 0.6, cy - s * 0.05);
        g.lineTo(cx + s * 0.6, cy - s * 0.05);
        g.strokePath();
    }
}

export function renderIconToolbar(scene: Phaser.Scene, items: IconToolbarItem[]): void {
    const btnW = FRAME.rightWidth / items.length;
    const y = FRAME.contentBottom - 44;

    items.forEach((item, i) => {
        const cx = FRAME.rightX + btnW * i + btnW / 2;
        const box = scene.add
            .rectangle(cx, y, btnW - 10, 68, COLORS.PANEL, 1)
            .setStrokeStyle(2, COLORS.ACCENT)
            .setInteractive({ cursor: CURSOR_POINTER });

        drawIcon(scene, item.icon, cx, y - 12);
        scene.add
            .text(cx, y + 18, item.label, { fontFamily: FONTS.MONO, fontSize: '11px', color: COLORS_CSS.TEXT, align: 'center', wordWrap: { width: btnW - 16 } })
            .setOrigin(0.5);

        box.on('pointerover', () => box.setFillStyle(0x1a1a12, 1));
        box.on('pointerout', () => box.setFillStyle(COLORS.PANEL, 1));
        box.on('pointerdown', () => {
            audioManager.playSfx('ui_click');
            item.onClick();
        });
    });
}
