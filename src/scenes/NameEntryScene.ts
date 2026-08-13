import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { audioManager } from '../audio/AudioManager';
import { HallOfFame } from '../core/HallOfFame';
import { getRankForCasosResueltos } from '../data/ranks';

const MAX_LENGTH = 18;
const VALID_CHAR = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]$/;

// Pantalla de identificación del detective — se muestra una sola vez, al
// arrancar una carrera nueva desde MainMenu ("Nueva Partida"), antes del
// primer reporte. El nombre queda en `gameState.detectiveName` para el
// resto de la partida (ver ReportScene, CaseFileScene, CrimeComputerScene,
// EndingScene) — pedido explícito: el juego tiene que dirigirse al
// jugador por su nombre, no solo mostrar un protagonista fijo sin
// identidad.
export class NameEntryScene extends Phaser.Scene {
    private value = '';
    private inputText!: Phaser.GameObjects.Text;
    private cursorVisible = true;
    private cursorTimer?: Phaser.Time.TimerEvent;
    private keydownHandler?: (event: KeyboardEvent) => void;

    constructor() {
        super(SCENE_KEYS.NAME_ENTRY);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        this.value = '';

        const panel = this.add
            .rectangle(this.scale.width / 2, this.scale.height / 2, 620, 260, COLORS.PANEL, 0.95)
            .setStrokeStyle(2, COLORS.ACCENT);
        void panel;

        this.add
            .text(this.scale.width / 2, this.scale.height / 2 - 96, '----------------------------------------', {
                fontFamily: '"VT323", monospace',
                fontSize: '16px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, this.scale.height / 2 - 70, 'SISTEMA DE DETECTIVES', {
                fontFamily: '"VT323", monospace',
                fontSize: '22px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, this.scale.height / 2 - 44, '----------------------------------------', {
                fontFamily: '"VT323", monospace',
                fontSize: '16px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, this.scale.height / 2 - 4, 'INGRESE SU NOMBRE, DETECTIVE:', {
                fontFamily: '"VT323", monospace',
                fontSize: '18px',
                color: COLORS_CSS.TEXT,
            })
            .setOrigin(0.5);

        this.inputText = this.add
            .text(this.scale.width / 2, this.scale.height / 2 + 32, '>', {
                fontFamily: '"VT323", monospace',
                fontSize: '22px',
                color: COLORS_CSS.SUCCESS,
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, this.scale.height / 2 + 84, 'PRESIONE ENTER PARA CONTINUAR', {
                fontFamily: '"VT323", monospace',
                fontSize: '13px',
                color: '#7a8091',
            })
            .setOrigin(0.5);

        this.cursorTimer = this.time.addEvent({
            delay: 450,
            loop: true,
            callback: () => {
                this.cursorVisible = !this.cursorVisible;
                this.renderInput();
            },
        });

        this.keydownHandler = (event: KeyboardEvent) => this.handleKey(event);
        window.addEventListener('keydown', this.keydownHandler);

        this.events.once('shutdown', () => this.cleanup());
        this.events.once('destroy', () => this.cleanup());

        this.renderInput();
    }

    private cleanup() {
        if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
        this.cursorTimer?.remove();
    }

    private handleKey(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            const name = this.value.trim();
            if (name.length === 0) return;
            event.preventDefault();
            this.confirm(name);
            return;
        }
        if (event.key === 'Backspace') {
            event.preventDefault();
            if (this.value.length > 0) {
                this.value = this.value.slice(0, -1);
                audioManager.playSfx('type_char');
                this.renderInput();
            }
            return;
        }
        if (event.key.length === 1 && VALID_CHAR.test(event.key) && this.value.length < MAX_LENGTH) {
            event.preventDefault();
            this.value += event.key;
            audioManager.playSfx('type_char');
            this.renderInput();
        }
    }

    private renderInput() {
        const cursor = this.cursorVisible ? '_' : ' ';
        this.inputText.setText(`> ${this.value.toUpperCase()}${cursor}`);
    }

    private confirm(name: string) {
        audioManager.playSfx('ui_click');

        // Si había un detective anterior con algún caso resuelto, queda
        // archivado en el Salón de la Fama antes de arrancar la carrera
        // nueva (ver core/HallOfFame.ts) — resetCareer() más abajo borra
        // casosResueltos, así que esto tiene que pasar ANTES.
        if (gameState.detectiveName && gameState.casosResueltos > 0) {
            HallOfFame.record({
                name: gameState.detectiveName,
                casosResueltos: gameState.casosResueltos,
                rankTitulo: getRankForCasosResueltos(gameState.casosResueltos).titulo,
                date: new Date().toISOString(),
            });
        }

        gameState.resetCareer();
        gameState.detectiveName = name.toUpperCase();
        CaseManager.startNextCaseInSequence();
        this.scene.start(SCENE_KEYS.REPORT);
    }
}
