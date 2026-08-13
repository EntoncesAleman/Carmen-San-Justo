import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS } from '../core/Constants';
import { createButton } from '../ui/Button';
import { CaseManager } from '../systems/CaseManager';
import { getZone } from '../data/zones';
import { getRankForCasosResueltos } from '../data/ranks';
import { gameState } from '../core/GameState';
import { audioManager } from '../audio/AudioManager';
import { TypewriterText } from '../ui/TypewriterText';
import { stopAllGameplayScenesExcept } from '../ui/sceneCleanup';

// Reemplaza la vieja pantalla de "elegir misión": el caso llega solo. Esta
// escena es el reporte policial que dispara todo — no hay ningún botón acá
// para elegir OTRO caso.
export class ReportScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.REPORT);
    }

    create() {
        // Ver ui/sceneCleanup.ts: se puede llegar acá con una escena de
        // juego anterior todavía activa (ej. saltar de caso desde el
        // debug estando en CityMap/Location/Dialogue) — sin esto, esa
        // escena vieja se sigue dibujando ENCIMA con datos del caso
        // anterior (está registrada después en main.ts).
        this.time.delayedCall(0, () => stopAllGameplayScenesExcept(this, SCENE_KEYS.REPORT));

        const def = CaseManager.getCurrentCase();
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        audioManager.playMusic('reporte');

        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 880, 620, 0x11141c, 0.96).setStrokeStyle(2, COLORS.ACCENT);
        void panel;

        const rank = getRankForCasosResueltos(gameState.casosResueltos);
        const expediente = String(1000 + gameState.casoIndex * 137).padStart(5, '0');
        const zona = def ? getZone(def.zonaInicial)?.nombre ?? def.zonaInicial : '—';
        const horas = def ? Math.round(def.deadlineMinutos / 60) : 0;

        const left = this.scale.width / 2 - 400;
        let y = 90;
        const line = (text: string, size = 14, color = COLORS_CSS.TEXT) => {
            const obj = this.add.text(left, y, text, { fontFamily: FONTS.MONO, fontSize: `${size}px`, color, wordWrap: { width: 800 } });
            y += Math.max(obj.height, size + 10) + 8;
        };

        line('======================================================', 13, COLORS_CSS.ACCENT);
        line('           REPORTE URGENTE — POLICÍA DE EL CINTURÓN', 14, COLORS_CSS.ACCENT);
        line('======================================================', 13, COLORS_CSS.ACCENT);
        y += 6;
        line(`EXPEDIENTE N°:        ${expediente}`);
        line(`RANGO ACTUAL:         ${rank.titulo}`);
        y += 10;
        line(`OBJETO SUSTRAÍDO:     ${def?.objetoRobado ?? '—'}`, 14, COLORS_CSS.SUCCESS);
        line(`VÍCTIMA:              ${def?.victima ?? '—'}`);
        line(`FECHA / HORA:         ${def?.fechaHoraDelHecho ?? '—'}`);
        line(`ÚLTIMA UBICACIÓN:     ${zona}`, 14, COLORS_CSS.SUCCESS);
        line(`LÍMITE DE TIEMPO:     ${horas} horas`, 14, '#c0392b');
        y += 10;

        const descripcionText = this.add.text(left, y, '', {
            fontFamily: FONTS.MONO,
            fontSize: '13px',
            color: COLORS_CSS.TEXT,
            wordWrap: { width: 800 },
            lineSpacing: 6,
        });
        const typewriter = new TypewriterText(this, descripcionText, def?.descripcion ?? '', 12);
        typewriter.start();
        const skipZone = this.add.zone(left, y, 800, 100).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        skipZone.on('pointerdown', () => typewriter.skip());

        createButton(this, this.scale.width / 2, this.scale.height - 60, 'Ir a la escena del hecho', () => {
            if (!def) {
                this.scene.start(SCENE_KEYS.MAIN_MENU);
                return;
            }
            this.scene.start(SCENE_KEYS.DIALOGUE, {
                npcId: def.briefingDialogue.npcId,
                tree: def.briefingDialogue,
                returnSceneKey: SCENE_KEYS.CITY_MAP,
            });
        });
    }
}
