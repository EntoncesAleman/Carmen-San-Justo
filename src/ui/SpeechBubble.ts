import * as Phaser from 'phaser';

// Globo de diálogo con "colita" apuntando hacia arriba (al retrato que
// siempre está justo encima, en la misma columna izquierda) — pedido
// explícito comparando contra capturas reales: ahí lo que dice un testigo
// aparece en un globo de cómic con una colita hacia su retrato, no en un
// panel rectangular liso como el resto de la UI. Dibujado con Graphics
// (rounded rect + triángulo), no un asset.
export function drawSpeechBubble(scene: Phaser.Scene, x: number, y: number, width: number, height: number, borderColor: number, fillAlpha = 0.9): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    const radius = 10;
    const tailX = x + 46;
    const tailW = 22;

    g.fillStyle(0x0a0a0a, fillAlpha);
    g.fillRoundedRect(x, y, width, height, radius);

    // Colita: triángulo que sobresale del borde superior, cerca del
    // extremo izquierdo (donde queda el retrato justo arriba).
    g.beginPath();
    g.moveTo(tailX, y);
    g.lineTo(tailX + tailW * 0.4, y - 12);
    g.lineTo(tailX + tailW, y);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, borderColor, 1);
    g.strokeRoundedRect(x, y, width, height, radius);
    g.beginPath();
    g.moveTo(tailX, y);
    g.lineTo(tailX + tailW * 0.4, y - 12);
    g.lineTo(tailX + tailW, y);
    g.strokePath();
    // Tapa el segmento del borde del rect donde nace la colita, para que
    // no quede una línea recta cruzando el triángulo.
    g.lineStyle(3, 0x0a0a0a, 1);
    g.beginPath();
    g.moveTo(tailX + 1, y);
    g.lineTo(tailX + tailW - 1, y);
    g.strokePath();

    return g;
}
