import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS, TIME_COSTS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { getLocationByZone } from '../data/locations';
import { getNpc } from '../data/npcs';
import { getZone } from '../data/zones';
import { getConnections } from '../data/zoneConnections';
import { CaseManager } from '../systems/CaseManager';
import { EventSystem } from '../systems/EventSystem';
import { ExploreSystem } from '../systems/ExploreSystem';
import { ClueManager } from '../systems/ClueManager';
import { audioManager } from '../audio/AudioManager';
import { getAmbientForZone } from '../data/ambient';
import { renderActionMenu, ActionMenuItem } from '../ui/ActionMenuPanel';
import { renderLocationArtPanel } from '../ui/LocationArtPanel';
import { renderDescriptionTextPanel } from '../ui/DescriptionTextPanel';

// Misma pantalla dividida que CityMapScene (arte de la zona + descripción
// a la izquierda) — acá el menú de acciones de la derecha pasa a listar
// con quién hablar, explorar, y recién después viajar/pizarrón/etc.
export class LocationScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.LOCATION);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        if (!this.scene.isActive(SCENE_KEYS.HUD)) this.scene.launch(SCENE_KEYS.HUD);
        audioManager.playMusic(gameState.deadlineWarningEmitted ? 'peligro' : 'investigacion');
        audioManager.playAmbient(getAmbientForZone(gameState.currentZoneId));
        this.playFootsteps();

        renderLocationArtPanel(this);

        const location = getLocationByZone(gameState.currentZoneId);
        renderDescriptionTextPanel(this, location?.descripcion ?? 'No hay nada digno de nota acá.', location?.nombre ?? 'Lugar desconocido');

        this.renderActions();
    }

    private travelTo(zoneId: string) {
        const expired = CaseManager.advanceTimeAndCheckDeadline(TIME_COSTS.VIAJAR_MINUTOS);
        gameState.currentZoneId = zoneId;
        if (expired) {
            this.scene.start(SCENE_KEYS.ENDING);
            return;
        }
        this.scene.start(SCENE_KEYS.LOCATION);
    }

    private renderActions() {
        const location = getLocationByZone(gameState.currentZoneId);
        const def = CaseManager.getCurrentCase();

        // Los NPCs "de rol especial" del caso activo (el sospechoso real y el
        // falso sospechoso) nunca viven en Location.npcIds: su aparición
        // depende pura y exclusivamente de la hipótesis presentada en el
        // pizarrón, no de la locación en sí. Esto evita que un personaje de
        // un caso "se filtre" a otro caso que reutilice la misma locación, y
        // evita poder confrontar al sospechoso equivocado sin haber arriesgado
        // antes una hipótesis (lo que rompía el final "sospechoso_equivocado").
        const staticNpcIds = (location?.npcIds ?? []).filter((id) => id !== def?.sospechosoId && id !== def?.falsoSospechosoId);
        const visibleNpcIds = [...staticNpcIds];

        if (def) {
            const hipotesisApuntaAqui = gameState.hypothesisDestinoZoneId === gameState.currentZoneId;
            if (hipotesisApuntaAqui && gameState.currentZoneId === def.destinoCorrectoZoneId) {
                visibleNpcIds.push(def.sospechosoId);
            }
            if (hipotesisApuntaAqui && def.falsoSospechosoId && def.destinosFalsosZoneIds.includes(gameState.currentZoneId)) {
                visibleNpcIds.push(def.falsoSospechosoId);
            }
        }

        const items: ActionMenuItem[] = [];

        visibleNpcIds.forEach((npcId) => {
            const npc = getNpc(npcId);
            if (!npc) return;
            const isSuspect = !!def && npcId === def.sospechosoId;
            const isFalsoSospechoso = !!def && npcId === def.falsoSospechosoId;
            const necesitaOrden = isSuspect && !gameState.ordenCapturaEmitida;

            let label: string;
            if (necesitaOrden) label = `${npc.apodo} — falta la orden de captura`;
            else if (isSuspect) label = `Confrontar a ${npc.apodo}`;
            else label = `Hablar con ${npc.apodo}`;

            items.push({
                label,
                locked: necesitaOrden,
                onClick: () => {
                    if (necesitaOrden) {
                        this.showOverlay('Sabés que está acá, pero no tenés orden de captura.\nAndá al Sistema de Inteligencia Criminal y armá el identikit primero.');
                        return;
                    }
                    this.talkTo(npcId, isSuspect, isFalsoSospechoso);
                },
            });
        });

        items.push({ label: 'Explorar', onClick: () => this.explore() });

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

    // Placeholder funcional de pasos al entrar a una locación (ver
    // docs/ART_DIRECTION.md → audio). 3 pasos espaciados, no un loop real.
    private playFootsteps() {
        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 180, () => audioManager.playSfx('footstep'));
        }
    }

    private talkTo(npcId: string, isSuspect: boolean, isFalsoSospechoso: boolean) {
        const def = CaseManager.getCurrentCase();
        if (isSuspect && def) {
            this.scene.start(SCENE_KEYS.DIALOGUE, {
                npcId,
                tree: def.confrontacionDialogue,
                returnSceneKey: SCENE_KEYS.LOCATION,
                isConfrontacion: true,
            });
            return;
        }
        if (isFalsoSospechoso && def?.falsoSospechosoDialogue) {
            this.scene.start(SCENE_KEYS.DIALOGUE, {
                npcId,
                tree: def.falsoSospechosoDialogue,
                returnSceneKey: SCENE_KEYS.LOCATION,
            });
            return;
        }
        this.scene.start(SCENE_KEYS.DIALOGUE, { npcId, returnSceneKey: SCENE_KEYS.LOCATION });
    }

    private explore() {
        const expired = CaseManager.advanceTimeAndCheckDeadline(TIME_COSTS.EXPLORAR_MINUTOS);
        if (expired) {
            this.scene.start(SCENE_KEYS.ENDING);
            return;
        }

        const def = CaseManager.getCurrentCase();
        const clue = def ? ExploreSystem.findExploreClue(def, gameState.currentZoneId) : null;
        if (clue) {
            ClueManager.addClue(clue);
            this.showOverlay(`Revisás el lugar con más atención.\n\n${clue.descripcion}`);
            return;
        }

        const event = EventSystem.maybeTrigger(gameState.currentZoneId);
        const message = event ? `${event.titulo}\n\n${event.descripcion}` : 'No encontrás nada nuevo por ahora.';
        this.showOverlay(message);
    }

    private showOverlay(message: string) {
        const panel = this.add
            .rectangle(this.scale.width / 2, this.scale.height / 2, 640, 260, COLORS.PANEL, 0.98)
            .setStrokeStyle(2, COLORS.ACCENT)
            .setInteractive();
        const text = this.add
            .text(this.scale.width / 2, this.scale.height / 2, `${message}\n\n(click para continuar)`, {
                fontFamily: FONTS.MONO,
                fontSize: '16px',
                color: '#f2ede3',
                align: 'center',
                wordWrap: { width: 580 },
            })
            .setOrigin(0.5);

        panel.on('pointerdown', () => {
            panel.destroy();
            text.destroy();
        });
    }
}
