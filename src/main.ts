import * as Phaser from 'phaser';
import '@fontsource/vt323';
import { GAME, SCENE_KEYS } from './core/Constants';
import { applyDetectiveCursor } from './ui/cursor';
import { applyCrtOverlay } from './ui/crtOverlay';
import { audioManager } from './audio/AudioManager';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { NameEntryScene } from './scenes/NameEntryScene';
import { HallOfFameScene } from './scenes/HallOfFameScene';
import { LoadGameScene } from './scenes/LoadGameScene';
import { ReportScene } from './scenes/ReportScene';
import { CityMapScene } from './scenes/CityMapScene';
import { TravelMapScene } from './scenes/TravelMapScene';
import { LocationScene } from './scenes/LocationScene';
import { DialogueScene } from './scenes/DialogueScene';
import { SuspectBoardScene } from './scenes/SuspectBoardScene';
import { CaseFileScene } from './scenes/CaseFileScene';
import { CrimeComputerScene } from './scenes/CrimeComputerScene';
import { EndingScene } from './scenes/EndingScene';
import { HUDScene } from './scenes/HUDScene';
import { DebugScene } from './scenes/DebugScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
    parent: 'game-container',
    backgroundColor: GAME.BACKGROUND_COLOR,
    scene: [
        Boot,
        Preloader,
        MainMenu,
        NameEntryScene,
        HallOfFameScene,
        LoadGameScene,
        ReportScene,
        CityMapScene,
        TravelMapScene,
        LocationScene,
        DialogueScene,
        SuspectBoardScene,
        CaseFileScene,
        CrimeComputerScene,
        EndingScene,
        HUDScene,
        DebugScene,
    ],
};

// Escenas que se lanzan como overlay sobre otra ya visible (HUD, panel de
// debug) en vez de reemplazarla — encadenarles un fade-in las haría
// parpadear cada vez que se abren, así que quedan afuera del efecto.
const OVERLAY_SCENE_KEYS = new Set<string>([SCENE_KEYS.HUD, SCENE_KEYS.DEBUG]);

document.addEventListener('DOMContentLoaded', () => {
    audioManager.init();
    const game = new Phaser.Game(config);
    game.events.once(Phaser.Core.Events.READY, () => {
        applyDetectiveCursor(game.canvas);
        // Transición suave al entrar a cada escena en vez del corte seco
        // de scene.start() — no se anima la salida (rompería el timing de
        // los tests e2e que hacen click apenas cambia de escena), pero la
        // entrada con fundido desde negro ya corta el salto brusco.
        game.scene.scenes.forEach((scene) => {
            if (OVERLAY_SCENE_KEYS.has(scene.sys.settings.key)) return;
            scene.events.on(Phaser.Scenes.Events.CREATE, () => {
                scene.cameras.main.fadeIn(180, 5, 5, 5);
                // Bisel + scanlines: la textura de "estás mirando un
                // monitor de terminal" que la sola estructura de paneles
                // no daba (ver ui/crtOverlay.ts).
                applyCrtOverlay(scene);
            });
        });
    });
});
