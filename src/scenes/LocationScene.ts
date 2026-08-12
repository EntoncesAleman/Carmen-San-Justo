import * as Phaser from 'phaser';
import { COLORS_CSS, FONTS, SCENE_KEYS, TIME_COSTS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { getLocationByZone } from '../data/locations';
import { getZone } from '../data/zones';
import { getNpc } from '../data/npcs';
import { createButton } from '../ui/Button';
import { CaseManager } from '../systems/CaseManager';
import { EventSystem } from '../systems/EventSystem';
import { audioManager } from '../audio/AudioManager';
import { getBackgroundKey } from '../data/portraits';
import { getAmbientForZone } from '../data/ambient';
import { addTerminalDivider } from '../ui/TerminalDivider';

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

        const zone = getZone(gameState.currentZoneId);
        const location = getLocationByZone(gameState.currentZoneId);
        const def = CaseManager.getCurrentCase();

        this.renderBackground(location?.id);

        this.add
            .text(this.scale.width / 2, 60, location?.nombre ?? zone?.nombre ?? 'Lugar desconocido', {
                fontFamily: FONTS.MONO,
                fontSize: '26px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);
        addTerminalDivider(this, 82, 500);

        this.add
            .text(this.scale.width / 2, 110, location?.descripcion ?? '', {
                fontFamily: FONTS.MONO,
                fontSize: '14px',
                color: COLORS_CSS.TEXT,
                align: 'center',
                wordWrap: { width: 760 },
            })
            .setOrigin(0.5);

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

        if (visibleNpcIds.length === 0) {
            this.add
                .text(this.scale.width / 2, 220, 'No hay nadie por acá ahora mismo.', {
                    fontFamily: FONTS.MONO,
                    fontSize: '15px',
                    color: COLORS_CSS.TEXT,
                })
                .setOrigin(0.5);
        }

        visibleNpcIds.forEach((npcId, i) => {
            const npc = getNpc(npcId);
            if (!npc) return;
            const isSuspect = def && npcId === def.sospechosoId;
            const isFalsoSospechoso = def && npcId === def.falsoSospechosoId;
            const necesitaOrden = isSuspect && !gameState.ordenCapturaEmitida;

            let label: string;
            if (necesitaOrden) label = `🔒 ${npc.apodo} está acá, pero falta la orden de captura`;
            else if (isSuspect) label = `⚠ Confrontar a ${npc.apodo}`;
            else label = `Hablar con ${npc.apodo}`;

            createButton(
                this,
                this.scale.width / 2,
                200 + i * 66,
                label,
                () => {
                    if (necesitaOrden) {
                        this.showOverlay('Sabés que está acá, pero no tenés orden de captura.\nAndá al Sistema de Inteligencia Criminal (mapa) y armá el identikit primero.');
                        return;
                    }
                    this.talkTo(npcId, !!isSuspect, !!isFalsoSospechoso);
                },
                { width: 560, height: 54, fontSize: '14px', fontFamily: FONTS.MONO },
            );
        });

        createButton(this, 150, this.scale.height - 40, 'Explorar', () => this.explore(), { fontFamily: FONTS.MONO });
        createButton(this, this.scale.width - 150, this.scale.height - 40, 'Volver al mapa', () => this.scene.start(SCENE_KEYS.CITY_MAP), { fontFamily: FONTS.MONO });
    }

    // Placeholder funcional de pasos al entrar a una locación (ver
    // docs/ART_DIRECTION.md → audio). 3 pasos espaciados, no un loop real.
    private playFootsteps() {
        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 180, () => audioManager.playSfx('footstep'));
        }
    }

    private renderBackground(locationId: string | undefined) {
        const bgKey = locationId ? getBackgroundKey(locationId) : undefined;
        if (!bgKey || !this.textures.exists(bgKey)) return;

        const img = this.add.image(this.scale.width / 2, this.scale.height / 2, bgKey);
        img.setDisplaySize(this.scale.width, this.scale.height);
        img.setAlpha(0.55);
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.35);
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

        const event = EventSystem.maybeTrigger(gameState.currentZoneId);
        const message = event ? `${event.titulo}\n\n${event.descripcion}` : 'No encontrás nada nuevo por ahora.';
        this.showOverlay(message);
    }

    private showOverlay(message: string) {
        const panel = this.add
            .rectangle(this.scale.width / 2, this.scale.height / 2, 640, 260, 0x262b3a, 0.98)
            .setStrokeStyle(2, 0xe8b84b)
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
