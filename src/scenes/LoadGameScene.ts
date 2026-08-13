import * as Phaser from 'phaser';
import { COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { SaveSystem } from '../core/SaveSystem';
import { createButton } from '../ui/Button';
import { getCase } from '../data/cases';
import { CaseManager } from '../systems/CaseManager';

export class LoadGameScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.LOAD_GAME);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        this.add
            .text(this.scale.width / 2, 80, 'Cargar Partida', {
                fontFamily: '"VT323", monospace',
                fontSize: '30px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);

        const slots = SaveSystem.listSlots();
        slots.forEach((slot, i) => {
            const y = 200 + i * 110;
            const tituloCaso = slot.data ? (getCase(slot.data.currentCaseId ?? '')?.titulo ?? slot.data.generatedCase?.titulo ?? 'Caso desconocido') : '';
            const label =
                slot.empty || !slot.data
                    ? `Slot ${i + 1} — vacío`
                    : `Slot ${i + 1} — ${tituloCaso} — Día ${slot.data.clock.dia}, ${String(slot.data.clock.hora).padStart(2, '0')}:${String(slot.data.clock.minuto).padStart(2, '0')}`;

            createButton(
                this,
                this.scale.width / 2,
                y,
                label,
                () => {
                    if (slot.empty || !slot.data) return;
                    if (slot.data.generatedCase) CaseManager.registerGeneratedCase(slot.data.generatedCase);
                    SaveSystem.load(i);
                    this.scene.start(SCENE_KEYS.CITY_MAP);
                },
                { width: 640, height: 64, fontSize: '15px' },
            );
        });

        createButton(this, this.scale.width / 2, 620, 'Volver', () => this.scene.start(SCENE_KEYS.MAIN_MENU));
    }
}
