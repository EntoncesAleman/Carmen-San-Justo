import * as Phaser from 'phaser';
import { COLORS_CSS, FONTS, SCENE_KEYS } from '../core/Constants';
import { CaseManager } from '../systems/CaseManager';
import { CrimeComputerSystem } from '../systems/CrimeComputerSystem';
import { gameState } from '../core/GameState';
import { createButton } from '../ui/Button';
import { audioManager } from '../audio/AudioManager';
import { SuspectAttributeKey } from '../data/types';

const ATTRIBUTE_LABELS: Record<SuspectAttributeKey, string> = {
    cabello: 'CABELLO',
    ojos: 'OJOS',
    vehiculo: 'VEHÍCULO',
    profesion: 'PROFESIÓN',
    hobby: 'HOBBY',
    comida: 'COMIDA',
};

// "Sistema de Inteligencia Criminal" — el Crime Computer argentinizado.
// Arma el identikit del sospechoso con las pistas ya conseguidas y filtra
// la base de sospechosos. Solo con UN único sospechoso coincidente se
// puede emitir la orden de captura (requisito para confrontarlo).
export class CrimeComputerScene extends Phaser.Scene {
    private resultText!: Phaser.GameObjects.Text;
    private ordenBtn?: Phaser.GameObjects.Container;

    constructor() {
        super(SCENE_KEYS.CRIME_COMPUTER);
    }

    create() {
        this.cameras.main.setBackgroundColor('#050705');
        const def = CaseManager.getCurrentCase();

        this.add
            .text(this.scale.width / 2, 70, 'SISTEMA DE INTELIGENCIA CRIMINAL', {
                fontFamily: FONTS.MONO,
                fontSize: '22px',
                color: '#4caf7d',
            })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 100, `DETECTIVE: ${gameState.detectiveName || '—'}`, {
                fontFamily: FONTS.MONO,
                fontSize: '13px',
                color: '#2f6b2f',
            })
            .setOrigin(0.5);

        if (!def) {
            this.add.text(this.scale.width / 2, 140, 'NO HAY EXPEDIENTE ACTIVO', { fontFamily: FONTS.MONO, fontSize: '16px', color: '#4caf7d' }).setOrigin(0.5);
            createButton(this, this.scale.width / 2, 220, 'Volver', () => this.scene.start(SCENE_KEYS.CITY_MAP));
            return;
        }

        const panel = this.add.rectangle(this.scale.width / 2, 340, 760, 420, 0x001a00, 0.5).setStrokeStyle(2, 0x2f6b2f);
        void panel;

        const known = CrimeComputerSystem.getKnownAttributes(def);
        let y = 150;
        (Object.keys(ATTRIBUTE_LABELS) as SuspectAttributeKey[]).forEach((key) => {
            const value = known[key] ?? '???';
            this.add.text(this.scale.width / 2 - 340, y, `${ATTRIBUTE_LABELS[key].padEnd(14, ' ')} [ ${value.padEnd(20, ' ')} ]`, {
                fontFamily: FONTS.MONO,
                fontSize: '16px',
                color: known[key] ? '#4caf7d' : '#2f6b2f',
            });
            y += 34;
        });

        this.resultText = this.add.text(this.scale.width / 2 - 340, y + 20, '', {
            fontFamily: FONTS.MONO,
            fontSize: '16px',
            color: '#4caf7d',
        });

        createButton(this, this.scale.width / 2, 610, 'CALCULAR', () => this.calcular(), { width: 220, height: 44, fontSize: '15px' });
        createButton(this, this.scale.width - 150, this.scale.height - 40, 'Volver al mapa', () => this.scene.start(SCENE_KEYS.CITY_MAP));

        this.calcular();
    }

    private calcular() {
        audioManager.playSfx('ui_click');
        const def = CaseManager.getCurrentCase();
        if (!def) return;

        const matches = CrimeComputerSystem.getMatchingSuspects(def);
        this.resultText.setText(`SOSPECHOSOS COINCIDENTES: ${matches.length}`);

        this.ordenBtn?.destroy();
        this.ordenBtn = undefined;

        if (CrimeComputerSystem.canEmitirOrden(def) && !gameState.ordenCapturaEmitida) {
            this.ordenBtn = createButton(
                this,
                this.scale.width / 2,
                this.scale.height - 100,
                '⚠ EMITIR ORDEN DE CAPTURA',
                () => {
                    gameState.ordenCapturaEmitida = true;
                    audioManager.playSfx('clue_added');
                    this.scene.start(SCENE_KEYS.CITY_MAP);
                },
                { width: 420, height: 50, fontSize: '16px' },
            );
        } else if (gameState.ordenCapturaEmitida) {
            this.add.text(this.scale.width / 2, this.scale.height - 100, 'ORDEN DE CAPTURA YA EMITIDA', { fontFamily: FONTS.MONO, fontSize: '14px', color: COLORS_CSS.ACCENT }).setOrigin(0.5);
        }
    }
}
