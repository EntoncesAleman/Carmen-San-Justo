import * as Phaser from 'phaser';
import { COLORS_CSS, SCENE_KEYS, TIME_COSTS } from '../core/Constants';
import { EventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { audioManager } from '../audio/AudioManager';
import { getZone } from '../data/zones';
import { getConnections } from '../data/zoneConnections';
import { renderActionMenu, ActionMenuItem } from '../ui/ActionMenuPanel';
import { renderLocationArtPanel } from '../ui/LocationArtPanel';
import { renderDescriptionTextPanel } from '../ui/DescriptionTextPanel';

// Pantalla dividida estilo persecución clásica: columna izquierda = arte
// de la zona actual arriba + descripción del caso abajo; columna derecha
// = menú numerado de acciones (viajar a una conexión, quedarme acá,
// pizarrón, expediente, inteligencia criminal). Mismo frame que
// LocationScene/DialogueScene (ver ui/frameLayout.ts) — no es una
// pantalla aparte, es "la misma pantalla" mostrando otro contenido.
export class CityMapScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.CITY_MAP);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        if (!this.scene.isActive(SCENE_KEYS.HUD)) this.scene.launch(SCENE_KEYS.HUD);
        audioManager.stopAmbient();
        audioManager.playMusic(gameState.deadlineWarningEmitted ? 'peligro' : 'investigacion');

        renderLocationArtPanel(this);

        const def = CaseManager.getCurrentCase();
        const zone = getZone(gameState.currentZoneId);
        const descripcion = def ? `${def.titulo}\n\n${def.objetoRobado}` : 'Sin caso activo.';
        renderDescriptionTextPanel(this, descripcion, zone?.nombre ?? '—');

        const items: ActionMenuItem[] = [
            { label: 'Quedarme e investigar acá', onClick: () => this.scene.start(SCENE_KEYS.LOCATION) },
            {
                label: 'Ver el mapa',
                onClick: () =>
                    this.scene.start(SCENE_KEYS.TRAVEL_MAP, {
                        returnSceneKey: SCENE_KEYS.CITY_MAP,
                        onTravel: (zoneId: string) => this.travelTo(zoneId),
                    }),
            },
        ];
        getConnections(gameState.currentZoneId).forEach((zoneId) => {
            const destino = getZone(zoneId);
            if (!destino) return;
            items.push({ label: `Viajar a ${destino.nombre}`, onClick: () => this.travelTo(zoneId) });
        });
        items.push(
            { label: 'Pizarrón — ruta del caco', onClick: () => this.scene.start(SCENE_KEYS.SUSPECT_BOARD) },
            { label: 'Expediente', onClick: () => this.scene.start(SCENE_KEYS.CASE_FILE) },
            { label: 'Sistema de Inteligencia Criminal', onClick: () => this.scene.start(SCENE_KEYS.CRIME_COMPUTER) },
        );

        renderActionMenu(this, items, 'QUÉ HACER');
    }

    private travelTo(zoneId: string) {
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
