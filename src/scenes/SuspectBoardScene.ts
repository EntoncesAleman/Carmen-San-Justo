import * as Phaser from 'phaser';
import { COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { ClueManager } from '../systems/ClueManager';
import { DeductionSystem } from '../systems/DeductionSystem';
import { ZONES } from '../data/zones';
import { createButton } from '../ui/Button';

export class SuspectBoardScene extends Phaser.Scene {
    private resultContainer?: Phaser.GameObjects.Container;

    constructor() {
        super(SCENE_KEYS.SUSPECT_BOARD);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        const def = CaseManager.getCurrentCase();

        this.add
            .text(this.scale.width / 2, 44, 'PIZARRÓN DE SOSPECHOSOS', { fontFamily: 'Georgia, serif', fontSize: '22px', color: COLORS_CSS.ACCENT })
            .setOrigin(0.5);

        if (!def) {
            this.add.text(this.scale.width / 2, 140, 'No hay un caso activo.', { fontFamily: 'Georgia, serif', fontSize: '16px', color: COLORS_CSS.TEXT }).setOrigin(0.5);
            createButton(this, this.scale.width / 2, 220, 'Volver', () => this.scene.start(SCENE_KEYS.CITY_MAP));
            return;
        }

        const collected = ClueManager.getCollectedClues(def.clues);
        this.add.text(60, 80, 'Pistas que tenés hasta ahora:', { fontFamily: 'Georgia, serif', fontSize: '14px', color: COLORS_CSS.TEXT });
        if (collected.length === 0) {
            this.add.text(80, 106, 'Ninguna todavía. Volvé a investigar antes de arriesgar una hipótesis.', {
                fontFamily: 'Georgia, serif',
                fontSize: '12px',
                color: '#c0392b',
            });
        } else {
            collected.forEach((clue, i) => {
                this.add.text(80, 106 + i * 22, `• ${clue.descripcion}`, {
                    fontFamily: 'Georgia, serif',
                    fontSize: '12px',
                    color: clue.esFalsa ? '#c0392b' : COLORS_CSS.TEXT,
                    wordWrap: { width: 860 },
                });
            });
        }

        const boardTop = 106 + Math.max(collected.length, 1) * 22 + 30;
        this.add.text(60, boardTop, '¿A qué zona apunta la hipótesis? (elegí un destino)', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: COLORS_CSS.ACCENT,
        });

        const cols = 5;
        const startX = 130;
        const startY = boardTop + 60;
        const stepX = 175;
        const stepY = 56;

        ZONES.forEach((zone, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * stepX;
            const y = startY + row * stepY;
            createButton(this, x, y, zone.nombre, () => this.submit(zone.id), { width: 160, height: 44, fontSize: '11px' });
        });

        createButton(this, this.scale.width / 2, this.scale.height - 36, 'Volver sin presentar', () => this.scene.start(SCENE_KEYS.CITY_MAP), {
            width: 260,
        });
    }

    private submit(zoneId: string) {
        const def = CaseManager.getCurrentCase();
        if (!def) return;

        const result = DeductionSystem.submitHypothesis(def, zoneId);
        gameState.currentZoneId = zoneId;

        this.resultContainer?.destroy();
        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 680, 220, 0x262b3a, 0.98).setStrokeStyle(2, 0xe8b84b).setInteractive();

        let message: string;
        if (result === 'correcto') {
            message = 'Todo cierra. Viajá para encontrarte con el sospechoso.';
        } else if (result === 'sospechoso_equivocado') {
            message = 'Estás seguro, pero algo no cierra del todo. Puede que estés por cometer un error.';
        } else {
            message = 'No tenés nada sólido que apunte para ahí. Puede que sea una pérdida de tiempo.';
        }

        const text = this.add
            .text(this.scale.width / 2, this.scale.height / 2, `${message}\n\n(click para continuar)`, {
                fontFamily: 'Georgia, serif',
                fontSize: '15px',
                color: '#f2ede3',
                align: 'center',
                wordWrap: { width: 600 },
            })
            .setOrigin(0.5);

        this.resultContainer = this.add.container(0, 0, [panel, text]);
        panel.on('pointerdown', () => {
            this.scene.start(SCENE_KEYS.LOCATION);
        });
    }
}
