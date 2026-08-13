import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { createButton } from '../ui/Button';
import { SaveSystem } from '../core/SaveSystem';
import { audioManager } from '../audio/AudioManager';
import { PROTAGONIST_PORTRAIT_KEY } from '../data/portraits';
import { addTerminalDivider } from '../ui/TerminalDivider';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.MAIN_MENU);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        audioManager.stopAmbient();
        audioManager.playMusic('menu');

        // Pantalla de título "de verdad" en vez de un texto suelto: doble
        // línea arriba y abajo del nombre (mismo recurso que ReportScene),
        // credencial/subtítulo tipo placa policial, y un prompt parpadeante
        // abajo — la convención visual de attract-screen de terminal vieja
        // que separa "pantalla de arranque" de "menú plano".
        addTerminalDivider(this, 78, 700);
        this.add
            .text(this.scale.width / 2, 130, 'EL ÚLTIMO PROCEDIMIENTO', {
                fontFamily: '"VT323", monospace',
                fontSize: '46px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);
        addTerminalDivider(this, 172, 700);

        this.add
            .text(this.scale.width / 2, 200, '— UN CASO DE LA POLICÍA DE EL CINTURÓN —', {
                fontFamily: '"VT323", monospace',
                fontSize: '16px',
                color: COLORS_CSS.TEXT,
            })
            .setOrigin(0.5);

        const prompt = this.add
            .text(this.scale.width / 2, this.scale.height - 30, 'TERMINAL LISTA', {
                fontFamily: '"VT323", monospace',
                fontSize: '14px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);
        this.tweens.add({ targets: prompt, alpha: { from: 1, to: 0.25 }, duration: 900, yoyo: true, repeat: -1 });

        const hasSave = SaveSystem.listSlots().some((s) => !s.empty);

        createButton(this, this.scale.width / 2, 330, 'Nueva Partida', () => {
            // Primero se identifica el detective (NameEntryScene); recién
            // ahí arranca la carrera y llega el primer caso — el jugador
            // NO elige caso, la agencia asigna el que sigue.
            this.scene.start(SCENE_KEYS.NAME_ENTRY);
        });

        createButton(this, this.scale.width / 2, 400, hasSave ? 'Continuar' : 'Continuar (sin partidas guardadas)', () => {
            if (hasSave) this.scene.start(SCENE_KEYS.LOAD_GAME);
        });

        createButton(this, this.scale.width / 2, 470, 'Salón de la Fama', () => this.scene.start(SCENE_KEYS.HALL_OF_FAME));

        createButton(this, this.scale.width / 2, 540, 'Créditos', () => this.showCredits());

        this.renderProtagonistPortrait();
    }

    private renderProtagonistPortrait() {
        if (!this.textures.exists(PROTAGONIST_PORTRAIT_KEY)) return;
        this.add.rectangle(150, 320, 200, 200, COLORS.PANEL).setStrokeStyle(2, COLORS.ACCENT);
        this.add.image(150, 320, PROTAGONIST_PORTRAIT_KEY).setDisplaySize(190, 190);
    }

    private showCredits() {
        const panel = this.add
            .rectangle(this.scale.width / 2, this.scale.height / 2, 600, 280, COLORS.PANEL, 0.98)
            .setStrokeStyle(2, COLORS.ACCENT)
            .setInteractive();

        const text = this.add
            .text(
                this.scale.width / 2,
                this.scale.height / 2,
                'EL ÚLTIMO PROCEDIMIENTO\n\nJuego de investigación ficticio.\nTodos los personajes, lugares y la organización\ncriminal son inventados y no representan a\npersonas reales.\n\nHecho con Phaser 3 + TypeScript.\n\n(click para cerrar)',
                { fontFamily: '"VT323", monospace', fontSize: '15px', color: '#f2ede3', align: 'center' },
            )
            .setOrigin(0.5);

        panel.on('pointerdown', () => {
            panel.destroy();
            text.destroy();
        });
    }
}
