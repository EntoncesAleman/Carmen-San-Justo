import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS } from '../core/Constants';
import { FRAME } from './frameLayout';

// Panel de texto debajo del arte, misma columna izquierda — calca el
// "texto de descripción y pistas" del formato clásico, siempre en el
// mismo lugar debajo del gráfico (ver frameLayout.ts).
export function renderDescriptionTextPanel(scene: Phaser.Scene, text: string, titulo?: string): void {
    const top = FRAME.textTop;
    const height = FRAME.contentBottom - top;

    scene.add.rectangle(FRAME.leftX, top, FRAME.leftWidth, height, COLORS.PANEL, 0.9).setOrigin(0, 0).setStrokeStyle(2, COLORS.ACCENT);

    let y = top + 12;
    if (titulo) {
        scene.add.text(FRAME.leftX + 14, y, titulo, {
            fontFamily: FONTS.MONO,
            fontSize: '15px',
            color: COLORS_CSS.ACCENT,
        });
        y += 26;
    }

    scene.add.text(FRAME.leftX + 14, y, text, {
        fontFamily: FONTS.MONO,
        fontSize: '13px',
        color: COLORS_CSS.TEXT,
        wordWrap: { width: FRAME.leftWidth - 28 },
        lineSpacing: 4,
    });
}
