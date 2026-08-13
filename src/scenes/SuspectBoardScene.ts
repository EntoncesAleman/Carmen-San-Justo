import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS, TIME_COSTS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { ClueManager } from '../systems/ClueManager';
import { RouteSystem } from '../systems/RouteSystem';
import { getZone } from '../data/zones';
import { createButton } from '../ui/Button';
import { audioManager } from '../audio/AudioManager';

export class SuspectBoardScene extends Phaser.Scene {
    private resultContainer?: Phaser.GameObjects.Container;

    constructor() {
        super(SCENE_KEYS.SUSPECT_BOARD);
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        const def = CaseManager.getCurrentCase();

        // OJO: cualquier texto con centro vertical dentro de la franja 0-40
        // (donde vive la barra del HUD, siempre activa en paralelo) se
        // renderizaba corrupto/espejado en pruebas — placeholder de un bug
        // de compositing entre dos cámaras de Phaser. Todo el contenido de
        // esta escena arranca en y>=52 a propósito.
        this.add
            .text(this.scale.width / 2, 52, 'PIZARRÓN — RUTA DEL CACO', { fontFamily: FONTS.MONO, fontSize: '20px', color: COLORS_CSS.ACCENT })
            .setOrigin(0.5);

        if (!def) {
            this.add.text(this.scale.width / 2, 150, 'No hay un caso activo.', { fontFamily: FONTS.MONO, fontSize: '16px', color: COLORS_CSS.TEXT }).setOrigin(0.5);
            createButton(this, this.scale.width / 2, 230, 'Volver', () => this.scene.start(SCENE_KEYS.CITY_MAP), { fontFamily: FONTS.MONO });
            return;
        }

        const progreso = def.ruta
            .map((zoneId, i) => (i <= gameState.rutaProgresoIndex ? getZone(zoneId)?.nombre ?? zoneId : '???'))
            .join('  →  ');
        this.add.text(60, 80, `RUTA RECONSTRUIDA: ${progreso}`, {
            fontFamily: FONTS.MONO,
            fontSize: '13px',
            color: COLORS_CSS.SUCCESS,
            wordWrap: { width: 900 },
        });

        const collected = ClueManager.getCollectedClues(def.clues);
        this.add.text(60, 114, 'PISTAS QUE TENÉS HASTA AHORA:', { fontFamily: FONTS.MONO, fontSize: '14px', color: COLORS_CSS.TEXT });
        if (collected.length === 0) {
            this.add.text(80, 138, 'Ninguna todavía. Volvé a investigar antes de arriesgar una hipótesis.', {
                fontFamily: FONTS.MONO,
                fontSize: '12px',
                color: '#c0392b',
            });
        } else {
            collected.forEach((clue, i) => {
                this.add.text(80, 138 + i * 20, `> ${clue.descripcion}`, {
                    fontFamily: FONTS.MONO,
                    fontSize: '11px',
                    color: clue.esFalsa ? '#c0392b' : COLORS_CSS.TEXT,
                    wordWrap: { width: 860 },
                });
            });
        }

        const boardTop = 138 + Math.max(collected.length, 1) * 20 + 26;
        const esParadaFinal = RouteSystem.isFinalHopReached(def);
        this.add.text(
            60,
            boardTop,
            esParadaFinal ? 'Ya llegaste al final de la ruta conocida. Confrontá al sospechoso en el mapa.' : '¿CUÁL ES LA PRÓXIMA PARADA DEL CACO? (elegí una zona)',
            { fontFamily: FONTS.MONO, fontSize: '14px', color: COLORS_CSS.ACCENT, wordWrap: { width: 900 } },
        );

        if (!esParadaFinal) {
            // Solo se puede arriesgar una hipótesis sobre una zona que
            // alguna pista YA CONSEGUIDA señaló como posible destino
            // (`Clue.destinosPosibles`) — no cualquiera de las 21 zonas del
            // mundo. Antes se podía elegir cualquier zona, gratis y sin
            // límite: se reconstruía la ruta entera a fuerza bruta sin
            // haber juntado una sola pista real (bug real encontrado por el
            // usuario jugando). Arriesgar además cuesta tiempo real, como
            // cualquier viaje (ver submit()) — declarar una hipótesis
            // implica ir hasta ahí a comprobarla.
            const opciones = [...new Set(collected.flatMap((c) => c.destinosPosibles))];
            const cols = 5;
            const startX = 130;
            const startY = boardTop + 50;
            const stepX = 175;
            const stepY = 52;

            if (opciones.length === 0) {
                this.add.text(60, startY, 'Todavía ninguna pista te señala un destino concreto. Seguí investigando.', {
                    fontFamily: FONTS.MONO,
                    fontSize: '12px',
                    color: '#c0392b',
                });
            }

            opciones.forEach((zoneId, i) => {
                const zone = getZone(zoneId);
                if (!zone) return;
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = startX + col * stepX;
                const y = startY + row * stepY;
                createButton(this, x, y, zone.nombre, () => this.submit(zoneId), { width: 160, height: 42, fontSize: '11px', fontFamily: FONTS.MONO });
            });
        }

        createButton(this, this.scale.width / 2, this.scale.height - 32, 'Volver sin presentar', () => this.scene.start(SCENE_KEYS.CITY_MAP), {
            width: 260,
            height: 38,
            fontFamily: FONTS.MONO,
        });
    }

    private submit(zoneId: string) {
        const def = CaseManager.getCurrentCase();
        if (!def) return;

        // Arriesgar una hipótesis cuesta lo mismo que viajar hasta ahí a
        // comprobarla (mismo costo que cualquier otro viaje, ver
        // CityMapScene/LocationScene.travelTo) — si el reloj se agota acá,
        // se corta directo al final, igual que un viaje normal.
        const expired = CaseManager.advanceTimeAndCheckDeadline(TIME_COSTS.VIAJAR_MINUTOS);
        if (expired) {
            this.scene.start(SCENE_KEYS.ENDING);
            return;
        }

        const result = RouteSystem.submitGuess(def, zoneId);

        this.resultContainer?.destroy();
        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 680, 220, COLORS.PANEL, 0.98).setStrokeStyle(2, COLORS.ACCENT).setInteractive();

        let message: string;
        if (result === 'correcto_intermedio') {
            audioManager.playSfx('clue_added');
            message = `Encaja. El caco pasó por acá y siguió viaje. Andá a ${getZone(zoneId)?.nombre ?? zoneId} a seguir la pista.`;
        } else if (result === 'correcto_final') {
            audioManager.playSfx('clue_added');
            message = `Esta es la última parada conocida. Viajá a ${getZone(zoneId)?.nombre ?? zoneId} — pero acordate de conseguir la orden de captura antes de confrontarlo.`;
        } else if (result === 'sospechoso_equivocado') {
            message = 'Estás seguro, pero algo no cierra del todo. Puede que estés por cometer un error.';
        } else {
            message = 'No tenés nada sólido que apunte para ahí. Puede que sea una pérdida de tiempo.';
        }

        const text = this.add
            .text(this.scale.width / 2, this.scale.height / 2, `${message}\n\n(click para continuar)`, {
                fontFamily: FONTS.MONO,
                fontSize: '15px',
                color: '#f2ede3',
                align: 'center',
                wordWrap: { width: 600 },
            })
            .setOrigin(0.5);

        this.resultContainer = this.add.container(0, 0, [panel, text]);
        panel.on('pointerdown', () => {
            gameState.currentZoneId = zoneId;
            this.scene.start(SCENE_KEYS.LOCATION);
        });
    }
}
