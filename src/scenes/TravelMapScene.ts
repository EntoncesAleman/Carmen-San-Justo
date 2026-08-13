import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { getZone, ZONES } from '../data/zones';
import { getConnections } from '../data/zoneConnections';
import { getZoneMapPosition } from '../data/zoneMapPositions';
import { audioManager } from '../audio/AudioManager';

export interface TravelMapSceneData {
    returnSceneKey: string;
    onTravel: (zoneId: string) => void;
}

const OFFSET_X = 190;
const OFFSET_Y = 150;
const NODE_RADIUS = 10;

// Mapa gráfico de viaje — pedido explícito: "viajar" no puede ser solo
// una línea de texto en un menú, tiene que sentirse como un mapa de
// verdad, esquemático pero dibujado (nodos + líneas), no Google Maps.
// Reemplaza temporalmente la escena actual (CityMapScene/LocationScene);
// al cerrar o viajar, vuelve a `returnSceneKey`. `onTravel` es la MISMA
// función que ya usa el menú de acciones para viajar (cuesta tiempo,
// respeta el grafo de conexiones) — este mapa es una forma alternativa de
// disparar la misma acción, no una mecánica nueva.
export class TravelMapScene extends Phaser.Scene {
    private sceneData!: TravelMapSceneData;

    constructor() {
        super(SCENE_KEYS.TRAVEL_MAP);
    }

    init(data: TravelMapSceneData) {
        this.sceneData = data;
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        audioManager.playSfx('ui_click');

        this.add
            .text(this.scale.width / 2, 40, 'MAPA — EL CINTURÓN', { fontFamily: FONTS.MONO, fontSize: '22px', color: COLORS_CSS.ACCENT })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 68, 'Click en una zona conectada para viajar', { fontFamily: FONTS.MONO, fontSize: '13px', color: '#9aa0ad' })
            .setOrigin(0.5);

        const currentZoneId = gameState.currentZoneId;
        const connected = new Set(getConnections(currentZoneId));

        const lines = this.add.graphics();
        lines.lineStyle(1, 0x3a4054, 1);
        const drawn = new Set<string>();
        ZONES.forEach((zone) => {
            const from = getZoneMapPosition(zone.id);
            if (!from) return;
            getConnections(zone.id).forEach((neighborId) => {
                const edgeKey = [zone.id, neighborId].sort().join('|');
                if (drawn.has(edgeKey)) return;
                drawn.add(edgeKey);
                const to = getZoneMapPosition(neighborId);
                if (!to) return;
                const isLiveEdge = zone.id === currentZoneId || neighborId === currentZoneId;
                lines.lineStyle(isLiveEdge ? 2 : 1, isLiveEdge ? COLORS.ACCENT : 0x3a4054, isLiveEdge ? 1 : 0.6);
                lines.beginPath();
                lines.moveTo(from.x + OFFSET_X, from.y + OFFSET_Y);
                lines.lineTo(to.x + OFFSET_X, to.y + OFFSET_Y);
                lines.strokePath();
            });
        });

        ZONES.forEach((zone) => {
            const pos = getZoneMapPosition(zone.id);
            if (!pos) return;
            const x = pos.x + OFFSET_X;
            const y = pos.y + OFFSET_Y;
            const isCurrent = zone.id === currentZoneId;
            const isConnected = connected.has(zone.id);

            const color = isCurrent ? COLORS.ACCENT : isConnected ? COLORS.SUCCESS : 0x555c6e;
            const radius = isCurrent ? NODE_RADIUS + 4 : NODE_RADIUS;
            const node = this.add.circle(x, y, radius, isCurrent ? COLORS.ACCENT : COLORS.BG_DARK, 1).setStrokeStyle(2, color);

            const label = this.add
                .text(x, y + radius + 4, zone.nombre, {
                    fontFamily: FONTS.MONO,
                    fontSize: isCurrent ? '13px' : '12px',
                    color: isCurrent ? COLORS_CSS.ACCENT : isConnected ? COLORS_CSS.SUCCESS : '#7a8091',
                })
                .setOrigin(0.5, 0);

            if (isConnected) {
                node.setInteractive({ useHandCursor: true });
                node.on('pointerover', () => {
                    node.setFillStyle(COLORS.SUCCESS, 1);
                    label.setColor('#ffffff');
                });
                node.on('pointerout', () => {
                    node.setFillStyle(COLORS.BG_DARK, 1);
                    label.setColor(COLORS_CSS.SUCCESS);
                });
                node.on('pointerdown', () => {
                    audioManager.playSfx('travel');
                    this.sceneData.onTravel(zone.id);
                });
            }
        });

        const currentZone = getZone(currentZoneId);
        this.add
            .text(this.scale.width / 2, this.scale.height - 56, `Estás en: ${currentZone?.nombre ?? '—'}`, {
                fontFamily: FONTS.MONO,
                fontSize: '14px',
                color: COLORS_CSS.TEXT,
            })
            .setOrigin(0.5);

        const closeBtn = this.add
            .text(this.scale.width / 2, this.scale.height - 26, '[ Cerrar mapa ]', {
                fontFamily: FONTS.MONO,
                fontSize: '15px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
        closeBtn.on('pointerout', () => closeBtn.setColor(COLORS_CSS.ACCENT));
        closeBtn.on('pointerdown', () => {
            audioManager.playSfx('ui_click');
            this.scene.start(this.sceneData.returnSceneKey);
        });
    }
}
