import * as Phaser from 'phaser';
import { COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { createButton } from '../ui/Button';
import { audioManager } from '../audio/AudioManager';
import { getRankForCasosResueltos } from '../data/ranks';

export class EndingScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.ENDING);
    }

    create() {
        // Se difiere al siguiente tick: parar otras escenas en el mismo paso
        // en que esta escena está siendo procesada por el SceneManager puede
        // perderse (carrera interna de Phaser al encolar operaciones).
        this.time.delayedCall(0, () => {
            if (this.scene.isActive(SCENE_KEYS.HUD)) this.scene.stop(SCENE_KEYS.HUD);
            if (this.scene.isActive(SCENE_KEYS.DEBUG)) this.scene.stop(SCENE_KEYS.DEBUG);
            if (this.scene.isActive(SCENE_KEYS.CITY_MAP)) this.scene.stop(SCENE_KEYS.CITY_MAP);
            if (this.scene.isActive(SCENE_KEYS.LOCATION)) this.scene.stop(SCENE_KEYS.LOCATION);
        });

        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        audioManager.stopAmbient();
        audioManager.playMusic(gameState.endingId && CaseManager.isEndingExitoso(gameState.endingId) ? 'captura' : 'menu');
        const def = CaseManager.getCurrentCase();
        const ending = def?.finales.find((f) => f.id === gameState.endingId);
        const rank = getRankForCasosResueltos(gameState.casosResueltos);

        this.add
            .text(this.scale.width / 2, 190, ending?.titulo ?? 'Fin del caso', {
                fontFamily: 'Georgia, serif',
                fontSize: '30px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 290, ending?.descripcion ?? 'El caso terminó de alguna manera.', {
                fontFamily: 'Georgia, serif',
                fontSize: '16px',
                color: COLORS_CSS.TEXT,
                align: 'center',
                wordWrap: { width: 700 },
                lineSpacing: 6,
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 400, `Casos resueltos: ${gameState.casosResueltos}   |   Rango: ${rank.titulo}`, {
                fontFamily: 'Georgia, serif',
                fontSize: '15px',
                color: COLORS_CSS.SUCCESS,
            })
            .setOrigin(0.5);

        createButton(this, this.scale.width / 2, 480, 'Siguiente caso', () => {
            CaseManager.startNextCaseInSequence();
            this.scene.start(SCENE_KEYS.REPORT);
        });

        createButton(this, this.scale.width / 2, 550, 'Volver al menú', () => this.scene.start(SCENE_KEYS.MAIN_MENU));
    }
}
