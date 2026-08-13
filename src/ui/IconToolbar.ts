import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS } from '../core/Constants';
import { audioManager } from '../audio/AudioManager';
import { FRAME } from './frameLayout';

export interface ToolbarButtonDef {
    icon: string; // emoji o glifo corto
    label: string;
    onClick: () => void;
    locked?: boolean;
}

// Barra inferior de íconos fija (Pizarrón / Expediente / Sistema de
// Inteligencia Criminal) — reemplaza los botones de texto sueltos que
// tenía cada escena por su cuenta, replicando la barra de íconos
// (OCULTA / SALIDA / ? / CRIMEN) del formato clásico de persecución.
export function createIconToolbar(scene: Phaser.Scene, buttons: ToolbarButtonDef[]): Phaser.GameObjects.Container {
    const width = 1024 - FRAME.leftX * 2;
    const gap = 16;
    const btnWidth = (width - gap * (buttons.length - 1)) / buttons.length;
    const y = (FRAME.toolbarTop + FRAME.toolbarBottom) / 2;
    const height = FRAME.toolbarBottom - FRAME.toolbarTop - 8;

    const items: Phaser.GameObjects.GameObject[] = [];

    buttons.forEach((btn, i) => {
        const x = FRAME.leftX + btnWidth / 2 + i * (btnWidth + gap);
        const bg = scene.add
            .rectangle(x, y, btnWidth, height, COLORS.PANEL, btn.locked ? 0.5 : 1)
            .setStrokeStyle(2, btn.locked ? 0x555c6e : COLORS.ACCENT);
        const icon = scene.add.text(x, y - 14, btn.icon, { fontFamily: FONTS.MONO, fontSize: '24px' }).setOrigin(0.5);
        const label = scene.add
            .text(x, y + 16, btn.label, { fontFamily: FONTS.MONO, fontSize: '11px', color: btn.locked ? '#7a8091' : COLORS_CSS.TEXT })
            .setOrigin(0.5);

        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setFillStyle(0x33394b, btn.locked ? 0.5 : 1));
        bg.on('pointerout', () => bg.setFillStyle(COLORS.PANEL, btn.locked ? 0.5 : 1));
        bg.on('pointerdown', () => {
            audioManager.playSfx('ui_click');
            btn.onClick();
        });

        items.push(bg, icon, label);
    });

    return scene.add.container(0, 0, items);
}
