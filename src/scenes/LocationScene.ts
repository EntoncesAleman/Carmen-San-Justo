import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS, TIME_COSTS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { getLocationByZone } from '../data/locations';
import { getNpc } from '../data/npcs';
import { CaseManager } from '../systems/CaseManager';
import { EventSystem } from '../systems/EventSystem';
import { ExploreSystem } from '../systems/ExploreSystem';
import { ClueManager } from '../systems/ClueManager';
import { audioManager } from '../audio/AudioManager';
import { getAmbientForZone } from '../data/ambient';
import { FRAME } from '../ui/frameLayout';
import { createIconToolbar } from '../ui/IconToolbar';
import { renderDestinationListPanel } from '../ui/DestinationListPanel';
import { renderLocationArtPanel } from '../ui/LocationArtPanel';

// Misma pantalla dividida que CityMapScene (lista de destinos + arte de la
// zona a la izquierda) — acá el panel derecho pasa a mostrar la locación:
// descripción + con quién se puede hablar, en vez del estado del caso.
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

        renderDestinationListPanel(this, (zoneId) => this.travelTo(zoneId));
        renderLocationArtPanel(this);
        this.renderPeoplePanel();

        createIconToolbar(this, [
            { icon: '🔦', label: 'EXPLORAR', onClick: () => this.explore() },
            { icon: '🗺', label: 'PIZARRÓN', onClick: () => this.scene.start(SCENE_KEYS.SUSPECT_BOARD) },
            { icon: '🔍', label: 'EXPEDIENTE', onClick: () => this.scene.start(SCENE_KEYS.CASE_FILE) },
            { icon: '💻', label: 'INTELIGENCIA CRIMINAL', onClick: () => this.scene.start(SCENE_KEYS.CRIME_COMPUTER) },
        ]);
    }

    private travelTo(zoneId: string) {
        if (zoneId === gameState.currentZoneId) {
            this.scene.start(SCENE_KEYS.LOCATION);
            return;
        }
        const expired = CaseManager.advanceTimeAndCheckDeadline(TIME_COSTS.VIAJAR_MINUTOS);
        gameState.currentZoneId = zoneId;
        if (expired) {
            this.scene.start(SCENE_KEYS.ENDING);
            return;
        }
        this.scene.start(SCENE_KEYS.LOCATION);
    }

    private renderPeoplePanel() {
        const location = getLocationByZone(gameState.currentZoneId);
        const def = CaseManager.getCurrentCase();
        const panelHeight = FRAME.contentBottom - FRAME.contentTop;

        this.add
            .rectangle(FRAME.rightX, FRAME.contentTop, FRAME.rightWidth, panelHeight, COLORS.PANEL, 0.9)
            .setOrigin(0, 0)
            .setStrokeStyle(2, COLORS.ACCENT);

        this.add.text(FRAME.rightX + 16, FRAME.contentTop + 12, location?.nombre ?? 'Lugar desconocido', {
            fontFamily: FONTS.MONO,
            fontSize: '17px',
            color: COLORS_CSS.ACCENT,
            wordWrap: { width: FRAME.rightWidth - 32 },
        });

        this.add.text(FRAME.rightX + 16, FRAME.contentTop + 44, location?.descripcion ?? '', {
            fontFamily: FONTS.MONO,
            fontSize: '12px',
            color: COLORS_CSS.TEXT,
            wordWrap: { width: FRAME.rightWidth - 32 },
            lineSpacing: 3,
        });

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

        const listTop = FRAME.contentTop + 100;
        if (visibleNpcIds.length === 0) {
            this.add.text(FRAME.rightX + 16, listTop, 'No hay nadie por acá ahora mismo.', {
                fontFamily: FONTS.MONO,
                fontSize: '13px',
                color: '#9aa0ad',
            });
            return;
        }

        visibleNpcIds.forEach((npcId, i) => {
            const npc = getNpc(npcId);
            if (!npc) return;
            const isSuspect = def && npcId === def.sospechosoId;
            const isFalsoSospechoso = def && npcId === def.falsoSospechosoId;
            const necesitaOrden = isSuspect && !gameState.ordenCapturaEmitida;

            let label: string;
            if (necesitaOrden) label = `🔒 ${npc.apodo} — falta la orden de captura`;
            else if (isSuspect) label = `⚠ Confrontar a ${npc.apodo}`;
            else label = `▸ Hablar con ${npc.apodo}`;

            const rowY = listTop + i * 60;
            const row = this.add
                .rectangle(FRAME.rightX + 16, rowY, FRAME.rightWidth - 32, 50, 0x000000, 0)
                .setOrigin(0, 0)
                .setStrokeStyle(1, necesitaOrden ? 0x555c6e : COLORS.ACCENT)
                .setInteractive({ useHandCursor: true });
            const text = this.add
                .text(FRAME.rightX + 26, rowY + 25, label, {
                    fontFamily: FONTS.MONO,
                    fontSize: '13px',
                    color: necesitaOrden ? '#7a8091' : COLORS_CSS.TEXT,
                    wordWrap: { width: FRAME.rightWidth - 60 },
                })
                .setOrigin(0, 0.5);
            void text;

            row.on('pointerover', () => row.setStrokeStyle(1, necesitaOrden ? 0x555c6e : 0xffffff));
            row.on('pointerout', () => row.setStrokeStyle(1, necesitaOrden ? 0x555c6e : COLORS.ACCENT));
            row.on('pointerdown', () => {
                audioManager.playSfx('ui_click');
                if (necesitaOrden) {
                    this.showOverlay('Sabés que está acá, pero no tenés orden de captura.\nAndá al Sistema de Inteligencia Criminal y armá el identikit primero.');
                    return;
                }
                this.talkTo(npcId, !!isSuspect, !!isFalsoSospechoso);
            });
        });
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
