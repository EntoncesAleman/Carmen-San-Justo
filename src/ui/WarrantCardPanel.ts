import * as Phaser from 'phaser';
import { FONTS } from '../core/Constants';
import { SuspectAttributeKey } from '../data/types';
import { CURSOR_POINTER } from './cursor';

// "Ficha" de sospechoso — carpeta clara con foto + campos etiquetados,
// pedido explícito del usuario copiando el FORMATO (no el contenido) de
// la tarjeta de sospechoso del juego de referencia: portada crema/papel
// en vez del terminal negro/verde de siempre, con una "solapa" tipo
// carpeta arriba. Usa exclusivamente datos propios (SuspectProfile ya
// existente) — ningún texto ni nombre ajeno.
const PAPER = 0xede0c8;
const PAPER_DARK = 0xd8c9a3;
const INK = 0x1a1408;
const INK_CSS = '#1a1408';
const INK_FADED_CSS = '#6b6045';

const FIELD_ORDER: { key: SuspectAttributeKey; label: string }[] = [
    { key: 'cabello', label: 'PELO' },
    { key: 'ojos', label: 'OJOS' },
    { key: 'profesion', label: 'OCUPACIÓN' },
    { key: 'hobby', label: 'HOBBY' },
    { key: 'vehiculo', label: 'VEHÍCULO' },
    { key: 'comida', label: 'COMIDA PREFERIDA' },
];

export interface WarrantCardParams {
    nombreClave: string;
    known: Partial<Record<SuspectAttributeKey, string>>;
    portraitKey?: string;
    onClose: () => void;
}

export function renderWarrantCard(scene: Phaser.Scene, params: WarrantCardParams): Phaser.GameObjects.Container {
    const { width, height } = scene.scale;
    const cx = width / 2;
    const cy = height / 2 + 10;
    const cardW = 620;
    const cardH = 440;
    const top = cy - cardH / 2;
    const left = cx - cardW / 2;

    const elements: Phaser.GameObjects.GameObject[] = [];

    const dim = scene.add.rectangle(cx, height / 2, width, height, 0x000000, 0.6).setInteractive();
    dim.on('pointerdown', () => params.onClose());
    elements.push(dim);

    // Renglones de carpeta apiladas atrás (2-3 láminas asomando), truco
    // barato para simular "hay más fichas debajo de esta" sin más arte —
    // van DESPUÉS del velo oscuro (para no quedar apagadas con el resto
    // del fondo) pero ANTES de la carpeta principal.
    const stack1 = scene.add.rectangle(cx + 8, cy + 8, cardW, cardH, PAPER_DARK).setStrokeStyle(2, INK, 0.5);
    const stack2 = scene.add.rectangle(cx + 16, cy + 16, cardW, cardH, PAPER_DARK).setStrokeStyle(2, INK, 0.3);
    elements.push(stack2, stack1);

    // Solapa tipo carpeta, sobresaliendo del borde superior — el detalle
    // que más vende "carpeta de papel" en vez de "ventana más".
    const tabW = 220;
    const tab = scene.add.rectangle(left + tabW / 2 + 24, top - 12, tabW, 26, PAPER).setStrokeStyle(2, INK);
    const tabText = scene.add.text(tab.x, tab.y, params.nombreClave.toUpperCase(), { fontFamily: FONTS.MONO, fontSize: '13px', color: INK_CSS }).setOrigin(0.5);
    elements.push(tab, tabText);

    const card = scene.add.rectangle(cx, cy, cardW, cardH, PAPER).setStrokeStyle(3, INK);
    elements.push(card);

    const portraitX = left + 110;
    const portraitY = top + 120;
    const portraitBox = scene.add.rectangle(portraitX, portraitY, 150, 170, 0x000000, 0.08).setStrokeStyle(2, INK);
    elements.push(portraitBox);
    if (params.portraitKey && scene.textures.exists(params.portraitKey)) {
        const img = scene.add.image(portraitX, portraitY, params.portraitKey).setDisplaySize(142, 162);
        elements.push(img);
    } else {
        const q = scene.add.text(portraitX, portraitY, '?', { fontFamily: FONTS.MONO, fontSize: '56px', color: INK_CSS }).setOrigin(0.5);
        elements.push(q);
    }

    const nameLabel = scene.add.text(left + 210, top + 46, 'NOMBRE CLAVE', { fontFamily: FONTS.MONO, fontSize: '13px', color: INK_FADED_CSS });
    const nameValue = scene.add.text(left + 210, top + 64, params.nombreClave, { fontFamily: FONTS.MONO, fontSize: '22px', color: INK_CSS });
    elements.push(nameLabel, nameValue);

    let fieldY = top + 110;
    FIELD_ORDER.forEach(({ key, label }) => {
        const value = params.known[key] ?? '??? (todavía sin confirmar)';
        const labelText = scene.add.text(left + 210, fieldY, label, { fontFamily: FONTS.MONO, fontSize: '13px', color: INK_FADED_CSS });
        const valueText = scene.add.text(left + 210, fieldY + 18, value, {
            fontFamily: FONTS.MONO,
            fontSize: '17px',
            color: params.known[key] ? INK_CSS : INK_FADED_CSS,
        });
        elements.push(labelText, valueText);
        fieldY += 44;
    });

    const closeBtn = scene.add
        .text(left + cardW - 20, top + cardH - 24, '[ cerrar ]', { fontFamily: FONTS.MONO, fontSize: '14px', color: INK_CSS })
        .setOrigin(1, 0.5)
        .setInteractive({ cursor: CURSOR_POINTER });
    closeBtn.on('pointerdown', (_p: unknown, _lx: number, _ly: number, event: { stopPropagation: () => void }) => {
        event.stopPropagation();
        params.onClose();
    });
    elements.push(closeBtn);

    const container = scene.add.container(0, 0, elements);
    container.setDepth(10000);
    return container;
}
