// Coordenadas compartidas del "frame" de pantalla dividida (ver
// docs/GAME_DESIGN.md → "Pantalla dividida"), para que CityMapScene,
// LocationScene y DialogueScene armen exactamente el mismo layout en vez
// de reinventarlo cada una — la sensación de "es una sola pantalla que
// cambia de contenido" depende de que las coordenadas nunca desencajen
// entre escenas.
export const FRAME = {
    contentTop: 48,
    contentBottom: 696,
    toolbarTop: 704,
    toolbarBottom: 768,

    leftX: 14,
    leftWidth: 380,
    listHeight: 204,
    // El panel de arte/locación arranca justo debajo del de la lista.
    get artTop() {
        return this.contentTop + this.listHeight + 12;
    },

    rightX: 410,
    get rightWidth() {
        return 1024 - this.rightX - 14;
    },
};
