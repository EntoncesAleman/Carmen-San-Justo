import * as Phaser from 'phaser';
import { COLORS_CSS, FONTS, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { createButton } from '../ui/Button';
import { audioManager } from '../audio/AudioManager';
import { getRankForCasosResueltos } from '../data/ranks';
import { addTerminalDivider } from '../ui/TerminalDivider';

export class EndingScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.ENDING);
    }

    create() {
        // Se difiere al siguiente tick: parar otras escenas en el mismo paso
        // en que esta escena está siendo procesada por el SceneManager puede
        // perderse (carrera interna de Phaser al encolar operaciones).
        //
        // Lista exhaustiva a propósito: cualquier escena de juego puede
        // seguir "activa" (no parada) si se llegó a Ending por un atajo de
        // debug (ej. "Completar caso") en vez del cierre normal de esa
        // escena. Encontrado con DIALOGUE: abrir el debug en medio de una
        // conversación sin cerrarla y usar "Completar caso" dejaba
        // DialogueScene activa por debajo — como está registrada después
        // que ReportScene en main.ts, se renderizaba ENCIMA del reporte
        // del siguiente caso al volver. Mismo bug de fondo que el de
        // HUD/CityMap/Location documentado originalmente acá, solo que en
        // un camino menos obvio.
        const escenasAParar = [
            SCENE_KEYS.HUD,
            SCENE_KEYS.DEBUG,
            SCENE_KEYS.CITY_MAP,
            SCENE_KEYS.LOCATION,
            SCENE_KEYS.DIALOGUE,
            SCENE_KEYS.SUSPECT_BOARD,
            SCENE_KEYS.CASE_FILE,
            SCENE_KEYS.CRIME_COMPUTER,
            SCENE_KEYS.REPORT,
        ];
        this.time.delayedCall(0, () => {
            escenasAParar.forEach((key) => {
                if (this.scene.isActive(key)) this.scene.stop(key);
            });
        });

        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        audioManager.stopAmbient();
        audioManager.playMusic(gameState.endingId && CaseManager.isEndingExitoso(gameState.endingId) ? 'captura' : 'menu');
        const def = CaseManager.getCurrentCase();
        const ending = def?.finales.find((f) => f.id === gameState.endingId);
        const rank = getRankForCasosResueltos(gameState.casosResueltos);

        this.add
            .text(this.scale.width / 2, 190, ending?.titulo ?? 'Fin del caso', {
                fontFamily: FONTS.MONO,
                fontSize: '30px',
                color: COLORS_CSS.ACCENT,
            })
            .setOrigin(0.5);
        addTerminalDivider(this, 226, 700);

        this.add
            .text(this.scale.width / 2, 290, ending?.descripcion ?? 'El caso terminó de alguna manera.', {
                fontFamily: FONTS.MONO,
                fontSize: '16px',
                color: COLORS_CSS.TEXT,
                align: 'center',
                wordWrap: { width: 700 },
                lineSpacing: 6,
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 400, `CASOS RESUELTOS: ${gameState.casosResueltos}   |   RANGO: ${rank.titulo.toUpperCase()}`, {
                fontFamily: FONTS.MONO,
                fontSize: '15px',
                color: COLORS_CSS.SUCCESS,
            })
            .setOrigin(0.5);

        createButton(this, this.scale.width / 2, 480, 'Siguiente caso', () => {
            CaseManager.startNextCaseInSequence();
            this.scene.start(SCENE_KEYS.REPORT);
        }, { fontFamily: FONTS.MONO });

        createButton(this, this.scale.width / 2, 550, 'Volver al menú', () => this.scene.start(SCENE_KEYS.MAIN_MENU), { fontFamily: FONTS.MONO });
    }
}
