// Cursor propio en vez del cursor de flecha del navegador — mismo motivo
// que el resto de la pasada visual de FASE 21: lo que más "retrotrae" al
// formato clásico es la estética general, y un cursor de sistema operativo
// rompe la ilusión de estar frente a un terminal policial dedicado. Es una
// lupa (motivo de investigación), dibujada a mano en SVG con la paleta del
// juego (ámbar sobre casi-negro) — no un asset generado ni de terceros.
const svgToCursorUrl = (svg: string, hotspotX: number, hotspotY: number): string =>
    `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspotX} ${hotspotY}, auto`;

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="9" cy="9" r="6" fill="none" stroke="#050505" stroke-width="4"/>
  <circle cx="9" cy="9" r="6" fill="none" stroke="#e8b84b" stroke-width="2"/>
  <line x1="13.5" y1="13.5" x2="21" y2="21" stroke="#050505" stroke-width="4" stroke-linecap="round"/>
  <line x1="13.5" y1="13.5" x2="21" y2="21" stroke="#e8b84b" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const POINTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="9" cy="9" r="6" fill="#e8b84b22" stroke="#050505" stroke-width="4"/>
  <circle cx="9" cy="9" r="6" fill="#e8b84b22" stroke="#e8b84b" stroke-width="2"/>
  <line x1="13.5" y1="13.5" x2="21" y2="21" stroke="#050505" stroke-width="4" stroke-linecap="round"/>
  <line x1="13.5" y1="13.5" x2="21" y2="21" stroke="#e8b84b" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export const CURSOR_DEFAULT = svgToCursorUrl(DEFAULT_SVG, 9, 9);
export const CURSOR_POINTER = svgToCursorUrl(POINTER_SVG, 9, 9);

export function applyDetectiveCursor(canvas: HTMLCanvasElement): void {
    canvas.style.cursor = CURSOR_DEFAULT;
}
