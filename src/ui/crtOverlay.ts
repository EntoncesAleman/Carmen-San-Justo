import * as Phaser from 'phaser';
import { COLORS } from '../core/Constants';

// La estructura (arte+texto a la izquierda, menú numerado a la derecha) ya
// calca el formato clásico desde FASE 20 — lo que le faltaba para "sentirse"
// como esos juegos no es más layout, es la TEXTURA de estar mirando un
// monitor de terminal viejo: un marco de bisel alrededor de toda la
// pantalla y líneas de barrido (scanlines) sutiles encima de todo. Un solo
// hook global en main.ts (mismo patrón que el fade-in y el cursor) en vez
// de tocar cada escena — ver docs/ROADMAP.md, pedido explícito del usuario
// de acercar más la fidelidad visual sin copiar assets ajenos.
const DEPTH = 9999;

export function applyCrtOverlay(scene: Phaser.Scene): void {
    const { width, height } = scene.scale;

    if (!scene.textures.exists('crt_scanlines')) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false);
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 4, 4);
        g.fillStyle(0x000000, 0.4);
        g.fillRect(0, 0, 4, 1);
        g.generateTexture('crt_scanlines', 4, 4);
        g.destroy();
    }

    const scanlines = scene.add.tileSprite(width / 2, height / 2, width, height, 'crt_scanlines');
    scanlines.setDepth(DEPTH);
    scanlines.setAlpha(0.35);
    scanlines.setScrollFactor(0);

    // Bisel doble (línea gruesa por fuera, fina por dentro con un margen)
    // — el "marco de monitor" que separa "estás mirando una pantalla" de
    // "esto es una app plana sin chrome".
    const frame = scene.add.graphics();
    frame.setDepth(DEPTH);
    frame.setScrollFactor(0);
    frame.lineStyle(6, COLORS.ACCENT, 0.9);
    frame.strokeRect(3, 3, width - 6, height - 6);
    frame.lineStyle(1, COLORS.ACCENT, 0.5);
    frame.strokeRect(10, 10, width - 20, height - 20);
}
