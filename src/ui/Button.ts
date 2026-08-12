import * as Phaser from 'phaser';
import { COLORS } from '../core/Constants';
import { audioManager } from '../audio/AudioManager';

export interface ButtonOptions {
    width?: number;
    height?: number;
    fontSize?: string;
}

// Botón reutilizable en toda la UI del juego. Nada de estilos sueltos
// repetidos por escena.
export function createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    options: ButtonOptions = {},
): Phaser.GameObjects.Container {
    const width = options.width ?? 320;
    const height = options.height ?? 48;

    const bg = scene.add.rectangle(0, 0, width, height, COLORS.PANEL).setStrokeStyle(2, COLORS.ACCENT);
    const text = scene.add
        .text(0, 0, label, {
            fontFamily: 'Georgia, serif',
            fontSize: options.fontSize ?? '18px',
            color: '#f2ede3',
            wordWrap: { width: width - 20 },
            align: 'center',
        })
        .setOrigin(0.5);

    const container = scene.add.container(x, y, [bg, text]);
    container.setSize(width, height);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(0x33394b));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.PANEL));
    bg.on('pointerdown', () => {
        audioManager.playSfx('ui_click');
        onClick();
    });

    return container;
}
