import * as Phaser from 'phaser';
import { SCENE_KEYS } from '../core/Constants';

// Cualquier escena que pueda ser un "punto de entrada" alcanzable desde
// más de un camino (ReportScene, EndingScene) tiene que asegurarse de que
// ninguna escena de juego anterior siga activa por debajo — si no, Phaser
// la sigue dibujando (las escenas registradas después en main.ts se
// dibujan encima) con datos completamente desactualizados. Encontrado dos
// veces ya: una vez con DialogueScene quedando activa detrás de
// ReportScene al saltar de caso desde el debug, y antes con HUD/CityMap/
// Location detrás de EndingScene. Lista exhaustiva a propósito — más
// barato parar una escena que ya estaba inactiva que dejar una viva por
// error.
const GAMEPLAY_SCENE_KEYS = [
    SCENE_KEYS.HUD,
    SCENE_KEYS.DEBUG,
    SCENE_KEYS.CITY_MAP,
    SCENE_KEYS.LOCATION,
    SCENE_KEYS.DIALOGUE,
    SCENE_KEYS.SUSPECT_BOARD,
    SCENE_KEYS.CASE_FILE,
    SCENE_KEYS.CRIME_COMPUTER,
    SCENE_KEYS.REPORT,
    SCENE_KEYS.ENDING,
];

export function stopAllGameplayScenesExcept(scene: Phaser.Scene, ...except: string[]): void {
    GAMEPLAY_SCENE_KEYS.filter((key) => !except.includes(key)).forEach((key) => {
        if (scene.scene.isActive(key)) scene.scene.stop(key);
    });
}
