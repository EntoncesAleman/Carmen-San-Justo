import * as Phaser from 'phaser';
import { COLORS_CSS, DEBUG, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { TimeSystem } from '../core/TimeSystem';
import { EventBus, Events } from '../core/EventBus';
import { getZone } from '../data/zones';
import { CaseManager } from '../systems/CaseManager';
import { createButton } from '../ui/Button';
import { SaveSystem } from '../core/SaveSystem';
import { audioManager } from '../audio/AudioManager';

// Overlay persistente durante el gameplay (mapa/locación). Se lanza en
// paralelo, nunca reemplaza a la escena activa.
export class HUDScene extends Phaser.Scene {
    private infoText!: Phaser.GameObjects.Text;
    private saveMenuContainer?: Phaser.GameObjects.Container;
    private muteButton?: Phaser.GameObjects.Container;

    constructor() {
        super(SCENE_KEYS.HUD);
    }

    create() {
        this.add.rectangle(this.scale.width / 2, 20, this.scale.width, 40, 0x11141c, 0.92);

        this.infoText = this.add.text(16, 8, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: COLORS_CSS.TEXT,
        });

        createButton(this, this.scale.width - 90, 20, 'Guardar', () => this.toggleSaveMenu(), { width: 130, height: 32, fontSize: '13px' });
        this.renderMuteButton();

        if (DEBUG.ENABLED) {
            this.add.text(this.scale.width - 320, 8, 'debug: tecla `', {
                fontFamily: 'Georgia, serif',
                fontSize: '11px',
                color: '#555c6e',
            });
            const backtickKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK);
            backtickKey?.on('down', () => this.toggleDebug());
        }

        this.refresh();

        const onChange = () => this.refresh();
        EventBus.on(Events.TIME_ADVANCED, onChange);
        EventBus.on(Events.REPUTATION_CHANGED, onChange);
        EventBus.on(Events.CLUE_LIST_CHANGED, onChange);
        EventBus.on(Events.TRAVEL_COMPLETED, onChange);
        EventBus.on(Events.DEBUG_STATE_CHANGED, onChange);

        this.events.on('shutdown', () => {
            EventBus.off(Events.TIME_ADVANCED, onChange);
            EventBus.off(Events.REPUTATION_CHANGED, onChange);
            EventBus.off(Events.CLUE_LIST_CHANGED, onChange);
            EventBus.off(Events.TRAVEL_COMPLETED, onChange);
            EventBus.off(Events.DEBUG_STATE_CHANGED, onChange);
        });
    }

    private refresh() {
        const zone = getZone(gameState.currentZoneId);
        const def = CaseManager.getCurrentCase();
        const clueCount = gameState.collectedClueIds.length;
        const totalClues = def?.clues.length ?? 0;
        const objetivo = def?.titulo ?? 'Sin caso activo';
        const objetivoCorto = objetivo.length > 24 ? `${objetivo.slice(0, 24)}…` : objetivo;

        this.infoText.setText(
            `${TimeSystem.formatClock()}  |  ${zone?.nombre ?? '—'}  |  ` +
                `Pol. ${gameState.reputacionPolicial} Cal. ${gameState.reputacionCallejera} ` +
                `Corr. ${gameState.corrupcion} Sosp. ${gameState.sospecha}  |  ` +
                `Pistas ${clueCount}/${totalClues}  |  ${objetivoCorto}`,
        );
    }

    private renderMuteButton() {
        this.muteButton?.destroy();
        const label = audioManager.isMuted() ? '🔇' : '🔊';
        this.muteButton = createButton(
            this,
            this.scale.width - 194,
            20,
            label,
            () => {
                audioManager.toggleMuted();
                this.renderMuteButton();
            },
            { width: 56, height: 28, fontSize: '15px' },
        );
    }

    private toggleSaveMenu() {
        if (this.saveMenuContainer) {
            this.saveMenuContainer.destroy();
            this.saveMenuContainer = undefined;
            return;
        }

        const bg = this.add.rectangle(this.scale.width - 200, 120, 260, 170, 0x262b3a, 0.98).setStrokeStyle(2, 0xe8b84b);
        const title = this.add
            .text(this.scale.width - 200, 60, 'Guardar en...', { fontFamily: 'Georgia, serif', fontSize: '13px', color: COLORS_CSS.TEXT })
            .setOrigin(0.5);
        const buttons = [0, 1, 2].map((slot) =>
            createButton(
                this,
                this.scale.width - 200,
                95 + slot * 40,
                `Slot ${slot + 1}`,
                () => {
                    SaveSystem.save(slot);
                    EventBus.emit(Events.GAME_SAVED, { slot });
                    this.toggleSaveMenu();
                },
                { width: 200, height: 32, fontSize: '13px' },
            ),
        );
        this.saveMenuContainer = this.add.container(0, 0, [bg, title, ...buttons]);
    }

    private toggleDebug() {
        if (this.scene.isActive(SCENE_KEYS.DEBUG)) {
            this.scene.stop(SCENE_KEYS.DEBUG);
        } else {
            this.scene.launch(SCENE_KEYS.DEBUG);
        }
    }
}
