import * as Phaser from 'phaser';
import { COLORS } from '../core/Constants';

// Línea divisoria fina, estilo panel de terminal — separa el título del
// contenido en las pantallas con la estética retro (ver docs/ROADMAP.md,
// FASE 14, "pasada de UI tipo terminal"). Reutilizable en vez de repetir
// la misma barra "====" ASCII en cada escena con títulos de largo distinto.
export function addTerminalDivider(scene: Phaser.Scene, y: number, width = 860): void {
    scene.add.rectangle(scene.scale.width / 2, y, width, 2, COLORS.ACCENT, 0.55);
}
