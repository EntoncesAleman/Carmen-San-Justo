import * as Phaser from 'phaser';
import '@fontsource/vt323';
import { GAME } from './core/Constants';
import { audioManager } from './audio/AudioManager';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { NameEntryScene } from './scenes/NameEntryScene';
import { LoadGameScene } from './scenes/LoadGameScene';
import { ReportScene } from './scenes/ReportScene';
import { CityMapScene } from './scenes/CityMapScene';
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
        LoadGameScene,
        ReportScene,
        CityMapScene,
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

document.addEventListener('DOMContentLoaded', () => {
    audioManager.init();
    new Phaser.Game(config);
});
