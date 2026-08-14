import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS } from '../core/Constants';
import { DialogueEngine, withDetectiveName } from '../systems/DialogueEngine';
import { DialogueOption, DialogueTree } from '../data/types';
import { getNpc } from '../data/npcs';
import { EventBus, Events } from '../core/EventBus';
import { CaseManager } from '../systems/CaseManager';
import { EndingResolver } from '../systems/EndingResolver';
import { audioManager } from '../audio/AudioManager';
import { getPortraitKey } from '../data/portraits';
import { TypewriterText } from '../ui/TypewriterText';
import { FRAME } from '../ui/frameLayout';
import { CURSOR_POINTER } from '../ui/cursor';
import { drawSpeechBubble } from '../ui/SpeechBubble';

export interface DialogueSceneData {
    npcId: string;
    tree?: DialogueTree;
    returnSceneKey: string;
    isConfrontacion?: boolean;
}

// Mismo frame que CityMapScene/LocationScene, pero acá la columna
// izquierda muestra el retrato de con quién hablás (en vez de la zona) y
// el texto de diálogo debajo (en vez de la descripción) — calca el
// "gráfico de testigo arriba + texto abajo" del formato clásico. La
// columna derecha sigue siendo el menú numerado de acciones, ahora
// mostrando las opciones de la conversación.
export class DialogueScene extends Phaser.Scene {
    private sceneData!: DialogueSceneData;
    private tree!: DialogueTree;
    private currentNodeId!: string;
    private contentContainer!: Phaser.GameObjects.Container;
    private pendingEndsCase = false;

    constructor() {
        super(SCENE_KEYS.DIALOGUE);
    }

    init(data: DialogueSceneData) {
        this.sceneData = data;
        this.tree = data.tree ?? DialogueEngine.getTreeForNpc(data.npcId);
        this.currentNodeId = this.tree.startNodeId;
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS_CSS.BG_DARK);
        if (!this.scene.isActive(SCENE_KEYS.HUD)) this.scene.launch(SCENE_KEYS.HUD);
        audioManager.playMusic(this.sceneData.isConfrontacion ? 'persecucion' : 'interrogatorio');
        audioManager.playSfx('dialog_open');

        this.renderPortrait();

        this.add
            .rectangle(FRAME.rightX, FRAME.contentTop, FRAME.rightWidth, FRAME.contentBottom - FRAME.contentTop, COLORS.PANEL, 0.9)
            .setOrigin(0, 0)
            .setStrokeStyle(2, COLORS.ACCENT);
        this.add.text(FRAME.rightX + 16, FRAME.contentTop + 14, 'QUÉ DECIR', {
            fontFamily: FONTS.MONO,
            fontSize: '17px',
            color: COLORS_CSS.ACCENT,
        });
        this.add.rectangle(FRAME.rightX + 16, FRAME.contentTop + 44, FRAME.rightWidth - 32, 1, COLORS.ACCENT, 0.5).setOrigin(0, 0);

        this.contentContainer = this.add.container(0, 0);
        this.renderNode();
    }

    private renderPortrait() {
        const npc = getNpc(this.sceneData.npcId);
        const portraitKey = getPortraitKey(this.sceneData.npcId);
        const size = FRAME.artHeight - 40;
        const cx = FRAME.leftX + FRAME.leftWidth / 2;
        const cy = FRAME.contentTop + FRAME.artHeight / 2;

        this.add.rectangle(FRAME.leftX, FRAME.contentTop, FRAME.leftWidth, FRAME.artHeight, 0x000000, 1).setOrigin(0, 0).setStrokeStyle(2, COLORS.ACCENT);
        if (portraitKey && this.textures.exists(portraitKey)) {
            const img = this.add.image(cx, cy - 10, portraitKey);
            img.setDisplaySize(size, size);
        }

        this.add
            .text(FRAME.leftX + 10, FRAME.contentTop + FRAME.artHeight - 26, npc?.apodo ?? '', {
                fontFamily: FONTS.MONO,
                fontSize: '15px',
                color: COLORS_CSS.ACCENT,
                backgroundColor: '#000000cc',
                padding: { x: 4, y: 2 },
            })
            .setOrigin(0, 0);
    }

    private textBubbleBounds() {
        return { x: FRAME.leftX, y: FRAME.textTop, width: FRAME.leftWidth, height: FRAME.contentBottom - FRAME.textTop };
    }

    private static readonly DIGIT_KEYS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];

    // Atajo 1-9 por opción, mismo criterio que ActionMenuPanel.ts. Acá
    // además hace falta LIMPIAR los listeners viejos ANTES de que empiece
    // a tipear el nodo nuevo (no recién cuando terminan de aparecer las
    // opciones nuevas) — si no, mientras el texto todavía se está
    // escribiendo, tocar "1" dispara la opción del nodo ANTERIOR, que ya
    // no está en pantalla.
    private clearDigitShortcuts() {
        DialogueScene.DIGIT_KEYS.forEach((k) => this.input.keyboard?.removeAllListeners(`keydown-${k}`));
    }

    private registerDigitShortcuts(handlers: (() => void)[]) {
        this.clearDigitShortcuts();
        handlers.slice(0, DialogueScene.DIGIT_KEYS.length).forEach((handler, i) => {
            this.input.keyboard?.once(`keydown-${DialogueScene.DIGIT_KEYS[i]}`, () => {
                audioManager.playSfx('ui_click');
                handler();
            });
        });
    }

    private renderNode() {
        this.contentContainer.removeAll(true);
        this.clearDigitShortcuts();

        if (this.currentNodeId === 'end') {
            this.finishDialogue();
            return;
        }

        const node = this.tree.nodes[this.currentNodeId];
        const bubble = this.textBubbleBounds();
        const bubbleBg = drawSpeechBubble(this, bubble.x, bubble.y, bubble.width, bubble.height, COLORS.ACCENT);
        this.contentContainer.add(bubbleBg);

        const npcLineText = this.add.text(bubble.x + 14, bubble.y + 12, '', {
            fontFamily: FONTS.MONO,
            fontSize: '14px',
            color: COLORS_CSS.TEXT,
            wordWrap: { width: bubble.width - 28 },
            lineSpacing: 5,
        });
        this.contentContainer.add(npcLineText);

        const options = DialogueEngine.getVisibleOptions(node, this.sceneData.npcId);
        const showOptions = () => {
            let y = FRAME.contentTop + 60;
            options.forEach((opt) => {
                const row = this.renderOptionRow(opt.label, y, () => this.chooseOption(opt));
                this.contentContainer.add(row.container);
                y += row.height + 10;
            });
            this.registerDigitShortcuts(options.map((opt) => () => this.chooseOption(opt)));
        };

        const typewriter = new TypewriterText(this, npcLineText, withDetectiveName(node.npcLine), 14);
        typewriter.start(showOptions);

        const skipZone = this.add.zone(bubble.x, bubble.y, bubble.width, bubble.height).setOrigin(0, 0).setInteractive({ cursor: CURSOR_POINTER });
        skipZone.on('pointerdown', () => typewriter.skip());
        this.contentContainer.add(skipZone);

        // ENTER también saltea el tipeo, como "PRESIONE ENTER PARA
        // CONTINUAR" del formato clásico — se re-registra en cada nodo
        // (removeAllListeners primero) para no acumular listeners viejos.
        // Con varias opciones a elegir no hay un "ENTER = continuar" único
        // sin ambigüedad, así que una vez terminado el tipeo ENTER no hace
        // nada más (hay que clickear/tocar un número).
        this.input.keyboard?.removeAllListeners('keydown-ENTER');
        this.input.keyboard?.on('keydown-ENTER', () => {
            if (!typewriter.isDone) typewriter.skip();
        });
    }

    private renderOptionRow(label: string, y: number, onClick: () => void): { container: Phaser.GameObjects.Container; height: number } {
        const width = FRAME.rightWidth - 32;
        const text = this.add.text(0, 0, label, {
            fontFamily: FONTS.MONO,
            fontSize: '15px',
            color: COLORS_CSS.TEXT,
            wordWrap: { width: width - 20 },
        });
        const height = text.height + 16;
        text.destroy();

        const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.3).setStrokeStyle(1, COLORS.ACCENT).setOrigin(0, 0);
        const label2 = this.add
            .text(10, height / 2, label, { fontFamily: FONTS.MONO, fontSize: '15px', color: COLORS_CSS.TEXT, wordWrap: { width: width - 20 } })
            .setOrigin(0, 0.5);
        bg.setInteractive({ cursor: CURSOR_POINTER });
        bg.on('pointerover', () => label2.setColor(COLORS_CSS.ACCENT));
        bg.on('pointerout', () => label2.setColor(COLORS_CSS.TEXT));
        bg.on('pointerdown', () => {
            audioManager.playSfx('ui_click');
            onClick();
        });
        return { container: this.add.container(FRAME.rightX + 16, y, [bg, label2]), height };
    }

    private chooseOption(opt: DialogueOption) {
        if (opt.endsCase) this.pendingEndsCase = true;
        const expired = DialogueEngine.resolveChoice(this.sceneData.npcId, opt);

        if (expired) {
            this.scene.start(SCENE_KEYS.ENDING);
            return;
        }

        if (opt.responseLine) {
            this.showResponse(opt);
        } else {
            this.currentNodeId = opt.next;
            this.renderNode();
        }
    }

    private showResponse(opt: DialogueOption) {
        this.contentContainer.removeAll(true);
        this.clearDigitShortcuts();
        const npc = getNpc(this.sceneData.npcId);
        const bubble = this.textBubbleBounds();
        const bubbleBg = drawSpeechBubble(this, bubble.x, bubble.y, bubble.width, bubble.height, COLORS.SUCCESS);
        this.contentContainer.add(bubbleBg);

        const text = this.add.text(bubble.x + 14, bubble.y + 12, '', {
            fontFamily: FONTS.MONO,
            fontSize: '14px',
            color: COLORS_CSS.SUCCESS,
            wordWrap: { width: bubble.width - 28 },
            lineSpacing: 5,
        });
        this.contentContainer.add(text);

        const showContinue = () => {
            const advance = () => {
                this.currentNodeId = opt.next;
                this.renderNode();
            };
            const row = this.renderOptionRow('Continuar', FRAME.contentTop + 60, advance);
            this.contentContainer.add(row.container);
            this.registerDigitShortcuts([advance]);
        };

        const typewriter = new TypewriterText(this, text, withDetectiveName(`${npc?.apodo ?? ''}: "${opt.responseLine}"`), 14);
        typewriter.start(showContinue);

        const skipZone = this.add.zone(bubble.x, bubble.y, bubble.width, bubble.height).setOrigin(0, 0).setInteractive({ cursor: CURSOR_POINTER });
        skipZone.on('pointerdown', () => typewriter.skip());
        this.contentContainer.add(skipZone);

        // Acá sí hay una única salida ("Continuar") sin ambigüedad, así que
        // ENTER hace las dos cosas: saltea el tipeo si todavía está
        // corriendo, o confirma "Continuar" si ya terminó.
        this.input.keyboard?.removeAllListeners('keydown-ENTER');
        this.input.keyboard?.on('keydown-ENTER', () => {
            if (!typewriter.isDone) {
                typewriter.skip();
                return;
            }
            this.currentNodeId = opt.next;
            this.renderNode();
        });
    }

    private finishDialogue() {
        EventBus.emit(Events.DIALOGUE_ENDED, { npcId: this.sceneData.npcId });

        if (this.sceneData.isConfrontacion || this.pendingEndsCase) {
            const def = CaseManager.getCurrentCase();
            if (def) {
                const endingId = EndingResolver.resolve(def);
                CaseManager.finalizeCaseAndAdvance(endingId);
            }
            this.scene.start(SCENE_KEYS.ENDING);
            return;
        }

        this.scene.start(this.sceneData.returnSceneKey);
    }
}
