import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS } from '../core/Constants';
import { audioManager } from '../audio/AudioManager';
import { FRAME } from './frameLayout';
import { CURSOR_POINTER } from './cursor';

export interface ActionMenuItem {
    label: string;
    onClick: () => void;
    locked?: boolean;
}

// Menú vertical NUMERADO de acciones, columna derecha del frame — calca
// el "1. Depart / 2. Show Connections / 3. Investigate / 4. Visit
// Interpol" del formato clásico de persecución: un único menú de
// acciones, siempre en el mismo lugar, en vez de una lista de destinos y
// una barra de íconos separadas (ver frameLayout.ts). Cada escena arma su
// propia lista de `items` (viajar, hablar con alguien, pizarrón...); este
// componente solo sabe dibujar y numerar.
export function renderActionMenu(scene: Phaser.Scene, items: ActionMenuItem[], title?: string): void {
    scene.add
        .rectangle(FRAME.rightX, FRAME.contentTop, FRAME.rightWidth, FRAME.contentBottom - FRAME.contentTop, COLORS.PANEL, 0.9)
        .setOrigin(0, 0)
        .setStrokeStyle(2, COLORS.ACCENT);

    let y = FRAME.contentTop + 14;
    if (title) {
        scene.add.text(FRAME.rightX + 16, y, title, {
            fontFamily: FONTS.MONO,
            fontSize: '17px',
            color: COLORS_CSS.ACCENT,
        });
        y += 30;
        scene.add.rectangle(FRAME.rightX + 16, y, FRAME.rightWidth - 32, 1, COLORS.ACCENT, 0.5).setOrigin(0, 0);
        y += 14;
    }

    if (items.length === 0) {
        scene.add.text(FRAME.rightX + 16, y, 'No hay ninguna acción disponible acá.', {
            fontFamily: FONTS.MONO,
            fontSize: '14px',
            color: '#7a8091',
            wordWrap: { width: FRAME.rightWidth - 32 },
        });
        return;
    }

    items.forEach((item, i) => {
        const baseColor = item.locked ? '#7a8091' : COLORS_CSS.TEXT;
        const label = scene.add
            .text(FRAME.rightX + 16, y, `${i + 1}. ${item.label}`, {
                fontFamily: FONTS.MONO,
                fontSize: '15px',
                color: baseColor,
                wordWrap: { width: FRAME.rightWidth - 32 },
            })
            .setInteractive({ cursor: CURSOR_POINTER });

        // "locked" es solo estilo (atenuado, sin hover dorado) — el click
        // SIGUE andando: una acción bloqueada tiene que poder explicar por
        // qué (ej. "falta la orden de captura"), no quedar muda.
        label.on('pointerover', () => label.setColor(item.locked ? baseColor : COLORS_CSS.ACCENT));
        label.on('pointerout', () => label.setColor(baseColor));
        label.on('pointerdown', () => {
            audioManager.playSfx('ui_click');
            item.onClick();
        });

        y += label.height + 12;
    });
}
