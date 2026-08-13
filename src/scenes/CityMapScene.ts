import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS, TIME_COSTS } from '../core/Constants';
import { EventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { audioManager } from '../audio/AudioManager';
import { FRAME } from '../ui/frameLayout';
import { createIconToolbar } from '../ui/IconToolbar';
import { renderDestinationListPanel } from '../ui/DestinationListPanel';
import { renderLocationArtPanel } from '../ui/LocationArtPanel';

// Pantalla dividida estilo persecución clásica: lista de destinos siempre
// visible arriba a la izquierda, arte del lugar actual abajo a la
// izquierda, estado del caso a la derecha, barra de íconos abajo. Mismo
// frame que LocationScene/DialogueScene (ver ui/frameLayout.ts) — no es
// una pantalla aparte, es "la misma pantalla" mostrando otro contenido.
export class CityMapScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.CITY_MAP);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        if (!this.scene.isActive(SCENE_KEYS.HUD)) this.scene.launch(SCENE_KEYS.HUD);
        audioManager.stopAmbient();
        audioManager.playMusic(gameState.deadlineWarningEmitted ? 'peligro' : 'investigacion');

        renderDestinationListPanel(this, (zoneId) => this.travelTo(zoneId));
        renderLocationArtPanel(this, () => this.scene.start(SCENE_KEYS.LOCATION));
        this.renderStatusPanel();

        createIconToolbar(this, [
            { icon: '🗺', label: 'PIZARRÓN', onClick: () => this.scene.start(SCENE_KEYS.SUSPECT_BOARD) },
            { icon: '🔍', label: 'EXPEDIENTE', onClick: () => this.scene.start(SCENE_KEYS.CASE_FILE) },
            { icon: '💻', label: 'INTELIGENCIA CRIMINAL', onClick: () => this.scene.start(SCENE_KEYS.CRIME_COMPUTER) },
        ]);
    }

    private renderStatusPanel() {
        const def = CaseManager.getCurrentCase();
        this.add
            .rectangle(FRAME.rightX, FRAME.contentTop, FRAME.rightWidth, FRAME.contentBottom - FRAME.contentTop, COLORS.PANEL, 0.9)
            .setOrigin(0, 0)
            .setStrokeStyle(2, COLORS.ACCENT);

        this.add.text(FRAME.rightX + 16, FRAME.contentTop + 16, def?.titulo ?? 'Sin caso activo', {
            fontFamily: FONTS.MONO,
            fontSize: '16px',
            color: COLORS_CSS.ACCENT,
            wordWrap: { width: FRAME.rightWidth - 32 },
        });

        this.add.text(FRAME.rightX + 16, FRAME.contentTop + 60, def?.objetoRobado ?? '', {
            fontFamily: FONTS.MONO,
            fontSize: '13px',
            color: COLORS_CSS.TEXT,
            wordWrap: { width: FRAME.rightWidth - 32 },
            lineSpacing: 4,
        });

        this.add.text(FRAME.rightX + 16, FRAME.contentBottom - 40, '> Elegí un destino de la lista\n  o seguí investigando acá.', {
            fontFamily: FONTS.MONO,
            fontSize: '12px',
            color: '#9aa0ad',
            wordWrap: { width: FRAME.rightWidth - 32 },
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
