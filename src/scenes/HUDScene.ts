import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, DEBUG, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { TimeSystem } from '../core/TimeSystem';
import { EventBus, Events } from '../core/EventBus';
import { getZone } from '../data/zones';
import { CaseManager } from '../systems/CaseManager';
import { createButton } from '../ui/Button';
import { SaveSystem } from '../core/SaveSystem';
import { audioManager } from '../audio/AudioManager';
import { PreferencesStore } from '../core/Preferences';

// Overlay persistente durante el gameplay (mapa/locación). Se lanza en
// paralelo, nunca reemplaza a la escena activa.
export class HUDScene extends Phaser.Scene {
    private infoText!: Phaser.GameObjects.Text;
    private saveMenuContainer?: Phaser.GameObjects.Container;
    private prefsMenuContainer?: Phaser.GameObjects.Container;

    constructor() {
        super(SCENE_KEYS.HUD);
    }

    create() {
        this.add.rectangle(this.scale.width / 2, 20, this.scale.width, 40, 0x11141c, 0.92);

        this.infoText = this.add.text(16, 8, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '13px',
            color: COLORS_CSS.TEXT,
        });

        createButton(this, this.scale.width - 90, 20, 'Guardar', () => this.toggleSaveMenu(), { width: 130, height: 32, fontSize: '13px' });
        createButton(this, this.scale.width - 230, 20, 'Preferencias', () => this.togglePrefsMenu(), { width: 130, height: 32, fontSize: '13px' });

        if (DEBUG.ENABLED) {
            // Debajo de infoText, no a la derecha: infoText es de largo
            // variable (nombre de zona, título de caso) y puede crecer
            // hasta invadir el costado derecho donde viven los botones —
            // una segunda línea angosta abajo es más segura que una
            // posición fija a la derecha.
            this.add.text(16, 26, 'debug: tecla `', {
                fontFamily: '"VT323", monospace',
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

    // Mute y velocidad de texto viven en un solo panel (mismo patrón que
    // "Guardar en...") en vez de ser botones sueltos en la barra: la barra
    // superior ya está apretada entre infoText (largo variable) y Guardar,
    // y agregar más botones fijos ahí es frágil (ver nota junto al hint de
    // debug más arriba).
    private togglePrefsMenu() {
        if (this.prefsMenuContainer) {
            this.prefsMenuContainer.destroy();
            this.prefsMenuContainer = undefined;
            return;
        }
        this.renderPrefsMenu();
    }

    private renderPrefsMenu() {
        this.prefsMenuContainer?.destroy();

        const textSpeedLabels: Record<string, string> = { lenta: 'Texto: lento', normal: 'Texto: normal', rapida: 'Texto: rápido' };

        const bg = this.add.rectangle(this.scale.width - 200, 150, 260, 170, COLORS.PANEL, 0.98).setStrokeStyle(2, COLORS.ACCENT);
        const title = this.add
            .text(this.scale.width - 200, 80, 'Preferencias', { fontFamily: '"VT323", monospace', fontSize: '13px', color: COLORS_CSS.TEXT })
            .setOrigin(0.5);
        const muteBtn = createButton(
            this,
            this.scale.width - 200,
            115,
            audioManager.isMuted() ? 'Sonido: mudo' : 'Sonido: activo',
            () => {
                audioManager.toggleMuted();
                this.renderPrefsMenu();
            },
            { width: 200, height: 32, fontSize: '13px' },
        );
        const speedBtn = createButton(
            this,
            this.scale.width - 200,
            155,
            textSpeedLabels[PreferencesStore.get().textSpeed],
            () => {
                PreferencesStore.cycleTextSpeed();
                this.renderPrefsMenu();
            },
            { width: 200, height: 32, fontSize: '13px' },
        );

        // Controles de teclado — no obvios solo mirando la pantalla (los
        // atajos numéricos del menú de acciones son invisibles a
        // propósito, ver ActionMenuPanel.ts), así que quedan documentados
        // acá, el lugar natural de "Opciones".
        const controls = this.add
            .text(
                this.scale.width - 200,
                190,
                '1-9: elegir de la lista\nESC: volver / cerrar\nENTER: avanzar diálogo\n` : modo debug',
                { fontFamily: '"VT323", monospace', fontSize: '12px', color: '#9aa0ad', align: 'center', lineSpacing: 4 },
            )
            .setOrigin(0.5, 0);

        this.prefsMenuContainer = this.add.container(0, 0, [bg, title, muteBtn, speedBtn, controls]);
    }

    private toggleSaveMenu() {
        if (this.saveMenuContainer) {
            this.saveMenuContainer.destroy();
            this.saveMenuContainer = undefined;
            return;
        }

        const bg = this.add.rectangle(this.scale.width - 200, 120, 260, 170, COLORS.PANEL, 0.98).setStrokeStyle(2, COLORS.ACCENT);
        const title = this.add
            .text(this.scale.width - 200, 60, 'Guardar en...', { fontFamily: '"VT323", monospace', fontSize: '13px', color: COLORS_CSS.TEXT })
            .setOrigin(0.5);
        const buttons = [0, 1, 2].map((slot) =>
            createButton(
                this,
                this.scale.width - 200,
                95 + slot * 40,
                `Slot ${slot + 1}`,
                () => {
                    SaveSystem.save(slot, CaseManager.getCurrentGeneratedCaseIfAny());
                    EventBus.emit(Events.GAME_SAVED, { slot });
                    this.toggleSaveMenu();
                },
                { width: 200, height: 32, fontSize: '13px' },
            ),
        );
        this.saveMenuContainer = this.add.container(0, 0, [bg, title, ...buttons]);
    }

    // NOTA: Phaser no bloquea automáticamente los clicks hacia escenas de
    // abajo cuando una escena "overlay" está encima (cada escena tiene su
    // propio input plugin e hitea de forma independiente) — un click
    // pensado para un botón del debug puede también disparar algo debajo
    // en el mapa/locación si coinciden en posición. Se probó pausar esas
    // escenas mientras el debug está abierto, pero `scene.resume()` no
    // reactivaba el input plugin de forma confiable (quedaba la escena
    // trabada, un bug peor que el original) — revertido. Mitigación real:
    // evitar que los botones del debug coincidan en pantalla con botones
    // de las escenas de juego (ya es el caso: el panel del debug ocupa el
    // costado izquierdo, ver DebugScene.ts) y cerrar el debug con la propia
    // tecla backtick en vez de clickear "Cerrar" cerca de otros botones.
    private toggleDebug() {
        if (this.scene.isActive(SCENE_KEYS.DEBUG)) {
            this.scene.stop(SCENE_KEYS.DEBUG);
        } else {
            this.scene.launch(SCENE_KEYS.DEBUG);
        }
    }
}
