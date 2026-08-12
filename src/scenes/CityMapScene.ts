import * as Phaser from 'phaser';
import { COLORS_CSS, SCENE_KEYS, TIME_COSTS } from '../core/Constants';
import { ZONES } from '../data/zones';
import { EventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { createButton } from '../ui/Button';
import { audioManager } from '../audio/AudioManager';

export class CityMapScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.CITY_MAP);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        if (!this.scene.isActive(SCENE_KEYS.HUD)) this.scene.launch(SCENE_KEYS.HUD);
        audioManager.stopAmbient();
        audioManager.playMusic(gameState.deadlineWarningEmitted ? 'peligro' : 'investigacion');

        this.add
            .text(this.scale.width / 2, 55, 'EL CINTURÓN', {
                fontFamily: 'Georgia, serif',
                fontSize: '24px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 82, 'Elegí a dónde viajar', {
                fontFamily: 'Georgia, serif',
                fontSize: '13px',
                color: COLORS_CSS.TEXT,
            })
            .setOrigin(0.5);

        const cols = 4;
        const startX = 150;
        const startY = 150;
        const stepX = 225;
        const stepY = 98;

        ZONES.forEach((zone, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * stepX;
            const y = startY + row * stepY;
            const isHere = zone.id === gameState.currentZoneId;
            createButton(this, x, y, isHere ? `📍 ${zone.nombre}` : zone.nombre, () => this.travelTo(zone.id), {
                width: 205,
                height: 62,
                fontSize: '13px',
            });
        });

        createButton(this, this.scale.width - 130, this.scale.height - 34, 'Pizarrón', () => this.scene.start(SCENE_KEYS.SUSPECT_BOARD), {
            width: 200,
            height: 44,
        });
        createButton(this, 130, this.scale.height - 34, 'Expediente', () => this.scene.start(SCENE_KEYS.CASE_FILE), {
            width: 200,
            height: 44,
        });
        createButton(this, this.scale.width / 2, this.scale.height - 34, 'Sistema de Inteligencia Criminal', () => this.scene.start(SCENE_KEYS.CRIME_COMPUTER), {
            width: 340,
            height: 44,
            fontSize: '13px',
        });
    }

    private travelTo(zoneId: string) {
        if (zoneId === gameState.currentZoneId) {
            this.scene.start(SCENE_KEYS.LOCATION);
            return;
        }

        const expired = CaseManager.advanceTimeAndCheckDeadline(TIME_COSTS.VIAJAR_MINUTOS);
        gameState.currentZoneId = zoneId;
        EventBus.emit(Events.TRAVEL_COMPLETED, { zoneId });

        if (expired) {
            this.scene.start(SCENE_KEYS.ENDING);
            return;
        }

        this.scene.start(SCENE_KEYS.LOCATION);
    }
}
