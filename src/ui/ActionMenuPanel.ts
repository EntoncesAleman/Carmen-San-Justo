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

// Menú vertical de acciones, columna derecha del frame — lista PLANA sin
// numerar (pedido explícito, comparando contra capturas reales del juego
// de referencia: ahí la lista de destinos/acciones es texto plano, sin
// "1. 2. 3."; lo numerado era una lectura de una edición distinta del
// mismo juego). Las acciones "de sistema" (mapa, pizarrón, expediente,
// inteligencia criminal) viven aparte, en `IconToolbar.ts`, al pie de esta
// misma columna — acá solo quedan las acciones contextuales de la escena
// (con quién hablar, a dónde viajar, explorar).
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

    // Atajo de teclado 1-9 por posición — sin numerar la lista de nuevo
    // (eso quedó descartado en FASE 24, comparando contra capturas reales:
    // ahí la lista es texto plano). El atajo existe igual, documentado en
    // el panel de Preferencias, no como numeración visible fila por fila.
    const DIGIT_KEYS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];

    items.forEach((item, i) => {
        const baseColor = item.locked ? '#7a8091' : COLORS_CSS.TEXT;
        const label = scene.add
            .text(FRAME.rightX + 16, y, item.label, {
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
        const activate = () => {
            audioManager.playSfx('ui_click');
            item.onClick();
        };
        label.on('pointerdown', activate);
        if (i < DIGIT_KEYS.length) scene.input.keyboard?.once(`keydown-${DIGIT_KEYS[i]}`, activate);

        y += label.height + 12;
    });
}
