// Coordenadas compartidas del "frame" de pantalla dividida (ver
// docs/GAME_DESIGN.md → "Pantalla dividida"), para que CityMapScene,
// LocationScene y DialogueScene armen exactamente el mismo layout en vez
// de reinventarlo cada una — la sensación de "es una sola pantalla que
// cambia de contenido" depende de que las coordenadas nunca desencajen
// entre escenas.
//
// Estructura (FASE 20 — calcada del formato clásico de persecución):
// columna izquierda = gráfico arriba (zona actual o retrato de con quién
// hablás) + texto de descripción/diálogo abajo, SIEMPRE en el mismo
// lugar sea cual sea el contenido. Columna derecha = un único menú
// vertical NUMERADO de acciones (viajar, hablar, pizarrón, etc. — ver
// `ui/ActionMenuPanel.ts`), reemplazando la lista de destinos + barra de
// íconos que antes vivían separadas.
export const FRAME = {
    contentTop: 48,
    contentBottom: 740,

    leftX: 14,
    leftWidth: 580,
    artHeight: 340,
    get artBottom() {
        return this.contentTop + this.artHeight;
    },
    get textTop() {
        return this.artBottom + 12;
    },

    rightX: 610,
    get rightWidth() {
        return 1024 - this.rightX - 14;
    },
};
