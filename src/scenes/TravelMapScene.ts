import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { getZone, ZONES } from '../data/zones';
import { getConnections } from '../data/zoneConnections';
import { getZoneMapPosition } from '../data/zoneMapPositions';
import { audioManager } from '../audio/AudioManager';
import { CURSOR_POINTER } from '../ui/cursor';

export interface TravelMapSceneData {
    returnSceneKey: string;
    onTravel: (zoneId: string) => void;
}

const OFFSET_X = 190;
const OFFSET_Y = 150;
const NODE_RADIUS = 7;

// Silueta de "tierra" detrás del cluster de zonas — sin esto el mapa se
// veía como un grafo abstracto flotando en negro, no como territorio real
// (pedido explícito: que se sienta como el mapa del formato clásico, con
// una masa continental y el agua marcada aparte). Forma libre, no es
// geografía precisa — solo tiene que leerse como "esto es tierra".
const LAND_POLYGON: [number, number][] = [
    [160, 10], [560, 0], [660, 60], [560, 260], [640, 340],
    [560, 560], [420, 560], [160, 500], [140, 260],
];

// El AMBA real tiene el Río de la Plata al norte/este de la ciudad — acá
// una franja diagonal angosta a la derecha del cluster alcanza para dar
// esa lectura ("hay costa"), sin pretender ser un mapa preciso.
const RIVER_POLYGON: [number, number][] = [
    [545, 15], [660, 55], [705, 130], [700, 300], [645, 440],
    [605, 555], [830, 555], [830, 15],
];

function toScreen(pt: [number, number]): [number, number] {
    return [pt[0] + OFFSET_X, pt[1] + OFFSET_Y];
}

function drawDashedLine(g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, dash = 7, gap = 6): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;
    const ux = dx / len;
    const uy = dy / len;
    let dist = 0;
    g.beginPath();
    while (dist < len) {
        const startX = x1 + ux * dist;
        const startY = y1 + uy * dist;
        const endDist = Math.min(dist + dash, len);
        const endX = x1 + ux * endDist;
        const endY = y1 + uy * endDist;
        g.moveTo(startX, startY);
        g.lineTo(endX, endY);
        dist += dash + gap;
    }
    g.strokePath();
}

// Mapa gráfico de viaje — pedido explícito: "viajar" no puede ser solo
// una línea de texto en un menú, tiene que sentirse como un mapa de
// verdad, con silueta de territorio y rutas punteadas entre puntos (no un
// grafo esquemático tipo diagrama de subte). Reemplaza temporalmente la
// escena actual (CityMapScene/LocationScene); al cerrar o viajar, vuelve
// a `returnSceneKey`. `onTravel` es la MISMA función que ya usa el menú de
// acciones para viajar (cuesta tiempo, respeta el grafo de conexiones) —
// este mapa es una forma alternativa de disparar la misma acción, no una
// mecánica nueva.
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
        this.input.keyboard?.once('keydown-ESC', () => this.scene.start(this.sceneData.returnSceneKey));

        this.add
            .text(this.scale.width / 2, 40, 'MAPA — EL CINTURÓN', { fontFamily: FONTS.MONO, fontSize: '22px', color: COLORS_CSS.ACCENT })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 68, 'Click en una zona conectada para viajar', { fontFamily: FONTS.MONO, fontSize: '13px', color: '#9aa0ad' })
            .setOrigin(0.5);

        const terrain = this.add.graphics();
        terrain.fillStyle(0x151f11, 1);
        terrain.beginPath();
        LAND_POLYGON.forEach((pt, i) => {
            const [x, y] = toScreen(pt);
            if (i === 0) terrain.moveTo(x, y);
            else terrain.lineTo(x, y);
        });
        terrain.closePath();
        terrain.fillPath();

        terrain.fillStyle(0x0a1626, 0.85);
        terrain.beginPath();
        RIVER_POLYGON.forEach((pt, i) => {
            const [x, y] = toScreen(pt);
            if (i === 0) terrain.moveTo(x, y);
            else terrain.lineTo(x, y);
        });
        terrain.closePath();
        terrain.fillPath();

        const currentZoneId = gameState.currentZoneId;
        const connected = new Set(getConnections(currentZoneId));

        const lines = this.add.graphics();
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
                lines.lineStyle(isLiveEdge ? 2 : 1, isLiveEdge ? COLORS.ACCENT : 0x5c6b52, isLiveEdge ? 1 : 0.7);
                drawDashedLine(lines, from.x + OFFSET_X, from.y + OFFSET_Y, to.x + OFFSET_X, to.y + OFFSET_Y);
            });
        });

        ZONES.forEach((zone) => {
            const pos = getZoneMapPosition(zone.id);
            if (!pos) return;
            const x = pos.x + OFFSET_X;
            const y = pos.y + OFFSET_Y;
            const isCurrent = zone.id === currentZoneId;
            const isConnected = connected.has(zone.id);

            const color = isCurrent ? COLORS.ACCENT : isConnected ? COLORS.SUCCESS : 0xa8ad9c;
            const radius = isCurrent ? NODE_RADIUS + 3 : NODE_RADIUS;
            // Marcador tipo "pin de mapa" (cuadrado rotado 45°) en vez de
            // un círculo de nodo de grafo — más cerca del punto/bandera
            // que usa un mapa de verdad para señalar una ciudad.
            const node = this.add.rectangle(x, y, radius * 1.6, radius * 1.6, isCurrent ? COLORS.ACCENT : COLORS.BG_DARK, 1).setStrokeStyle(2, color);
            node.setAngle(45);

            const label = this.add
                .text(x, y + radius + 8, zone.nombre, {
                    fontFamily: FONTS.MONO,
                    fontSize: isCurrent ? '13px' : '12px',
                    color: isCurrent ? COLORS_CSS.ACCENT : isConnected ? COLORS_CSS.SUCCESS : '#c7cbbd',
                })
                .setOrigin(0.5, 0);

            if (isConnected) {
                node.setInteractive({ cursor: CURSOR_POINTER });
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
            .setInteractive({ cursor: CURSOR_POINTER });
        closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
        closeBtn.on('pointerout', () => closeBtn.setColor(COLORS_CSS.ACCENT));
        closeBtn.on('pointerdown', () => {
            audioManager.playSfx('ui_click');
            this.scene.start(this.sceneData.returnSceneKey);
        });
    }
}
