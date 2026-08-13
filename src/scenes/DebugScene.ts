import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { gameState } from '../core/GameState';
import { CaseManager } from '../systems/CaseManager';
import { ClueManager } from '../systems/ClueManager';
import { EndingResolver } from '../systems/EndingResolver';
import { EventBus, Events } from '../core/EventBus';
import { createButton } from '../ui/Button';
import { CASES } from '../data/cases';

// Modo debug. Se mantiene siempre disponible durante el desarrollo (tecla
// backtick, ver HUDScene). Nunca se elimina, solo se extiende.
export class DebugScene extends Phaser.Scene {
    private stateText!: Phaser.GameObjects.Text;

    constructor() {
        super(SCENE_KEYS.DEBUG);
    }

    create() {
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.55);
        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 860, 620, COLORS.BG_DARK, 0.98).setStrokeStyle(2, COLORS.ACCENT);
        void panel;

        this.add.text(this.scale.width / 2 - 400, 120, 'DEBUG MODE', { fontFamily: '"VT323", monospace', fontSize: '20px', color: COLORS_CSS.ACCENT });

        const def = CaseManager.getCurrentCase();
        let x = this.scale.width / 2 - 400;
        let y = 170;
        const gap = 46;

        const btn = (label: string, action: () => void) => {
            createButton(this, x + 100, y, label, () => {
                action();
                if (this.scene.isActive(SCENE_KEYS.DEBUG)) this.refreshState();
            }, { width: 220, height: 36, fontSize: '12px' });
            y += gap;
            if (y > 170 + gap * 6) {
                y = 170;
                x += 230;
            }
        };

        btn('+60 min', () => {
            const expired = CaseManager.advanceTimeAndCheckDeadline(60);
            if (expired) {
                this.scene.start(SCENE_KEYS.ENDING);
            }
        });
        btn('Agregar todas las pistas reales', () => {
            def?.clues.filter((c) => !c.esFalsa).forEach((c) => ClueManager.addClue(c));
        });
        btn('Agregar pista falsa', () => {
            const falsa = def?.clues.find((c) => c.esFalsa);
            if (falsa) ClueManager.addClue(falsa);
        });
        btn('Rep. policial +10', () => (gameState.reputacionPolicial = gameState.clamp(gameState.reputacionPolicial + 10)));
        btn('Rep. callejera +10', () => (gameState.reputacionCallejera = gameState.clamp(gameState.reputacionCallejera + 10)));
        btn('Corrupción +10', () => (gameState.corrupcion = gameState.clamp(gameState.corrupcion + 10)));
        btn('Sospecha +10', () => (gameState.sospecha = gameState.clamp(gameState.sospecha + 10)));
        btn('Ir a zona inicial', () => {
            if (def) gameState.currentZoneId = def.zonaInicial;
        });
        btn('Ir a destino correcto', () => {
            if (def) gameState.currentZoneId = def.destinoCorrectoZoneId;
        });
        btn('Ir a destino falso', () => {
            if (def) gameState.currentZoneId = def.destinosFalsosZoneIds[0] ?? gameState.currentZoneId;
        });
        btn('Forzar hipótesis correcta', () => {
            if (def) gameState.hypothesisDestinoZoneId = def.destinoCorrectoZoneId;
        });
        btn('Completar caso (forzar final)', () => {
            if (!def) return;
            CaseManager.setFlag('sospechoso_arrestado');
            gameState.hypothesisDestinoZoneId = def.destinoCorrectoZoneId;
            gameState.rutaProgresoIndex = def.ruta.length - 1;
            gameState.ordenCapturaEmitida = true;
            const endingId = EndingResolver.resolve(def);
            CaseManager.finalizeCaseAndAdvance(endingId);
            this.scene.start(SCENE_KEYS.ENDING);
        });
        btn('Emitir orden de captura', () => {
            gameState.ordenCapturaEmitida = true;
        });
        btn('Avanzar una parada de la ruta', () => {
            if (def && gameState.rutaProgresoIndex < def.ruta.length - 1) {
                gameState.rutaProgresoIndex += 1;
                gameState.hypothesisDestinoZoneId = def.ruta[gameState.rutaProgresoIndex];
            }
        });
        btn('Reiniciar caso', () => {
            if (def) CaseManager.startCase(def.id);
        });
        CASES.forEach((caso, i) => {
            btn(`Saltar a Caso ${i + 1}: ${caso.titulo}`, () => {
                CaseManager.startCase(caso.id);
                this.scene.stop(SCENE_KEYS.DEBUG);
                this.scene.start(SCENE_KEYS.REPORT);
            });
        });
        btn('Generar caso nuevo (forzar)', () => {
            gameState.casoIndex = CASES.length;
            CaseManager.startNextCaseInSequence();
            this.scene.stop(SCENE_KEYS.DEBUG);
            this.scene.start(SCENE_KEYS.REPORT);
        });

        this.stateText = this.add.text(this.scale.width / 2 - 400, 470, '', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#9aa0ad',
            wordWrap: { width: 800 },
            lineSpacing: 4,
        });

        createButton(this, this.scale.width / 2, this.scale.height / 2 + 280, 'Cerrar (tecla `)', () => this.scene.stop(SCENE_KEYS.DEBUG));

        this.refreshState();
    }

    private refreshState() {
        EventBus.emit(Events.DEBUG_STATE_CHANGED, {});
        this.stateText.setText(
            [
                `zona: ${gameState.currentZoneId}`,
                `reloj: día ${gameState.clock.dia} ${gameState.clock.hora}:${String(gameState.clock.minuto).padStart(2, '0')}`,
                `reputacionPolicial=${gameState.reputacionPolicial} reputacionCallejera=${gameState.reputacionCallejera} corrupcion=${gameState.corrupcion} sospecha=${gameState.sospecha}`,
                `pistas: ${gameState.collectedClueIds.join(', ') || '(ninguna)'}`,
                `hipótesis: ${gameState.hypothesisDestinoZoneId ?? '(sin presentar)'}`,
                `flags: ${Object.keys(gameState.flags).join(', ') || '(ninguno)'}`,
                `ended=${gameState.ended} endingId=${gameState.endingId ?? '-'}`,
            ].join('\n'),
        );
    }
}
