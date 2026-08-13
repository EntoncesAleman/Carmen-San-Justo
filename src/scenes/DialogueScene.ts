import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS } from '../core/Constants';
import { DialogueEngine } from '../systems/DialogueEngine';
import { DialogueOption, DialogueTree } from '../data/types';
import { getNpc } from '../data/npcs';
import { EventBus, Events } from '../core/EventBus';
import { CaseManager } from '../systems/CaseManager';
import { EndingResolver } from '../systems/EndingResolver';
import { audioManager } from '../audio/AudioManager';
import { getPortraitKey } from '../data/portraits';
import { TypewriterText } from '../ui/TypewriterText';
import { FRAME } from '../ui/frameLayout';

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

    private renderNode() {
        this.contentContainer.removeAll(true);

        if (this.currentNodeId === 'end') {
            this.finishDialogue();
            return;
        }

        const node = this.tree.nodes[this.currentNodeId];
        const bubble = this.textBubbleBounds();
        const bubbleBg = this.add.rectangle(bubble.x, bubble.y, bubble.width, bubble.height, COLORS.PANEL, 0.9).setOrigin(0, 0).setStrokeStyle(2, COLORS.ACCENT);
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
            options.forEach((opt, i) => {
                const row = this.renderOptionRow(`${i + 1}. ${opt.label}`, y, () => this.chooseOption(opt));
                this.contentContainer.add(row.container);
                y += row.height + 10;
            });
        };

        const typewriter = new TypewriterText(this, npcLineText, node.npcLine, 14);
        typewriter.start(showOptions);

        const skipZone = this.add.zone(bubble.x, bubble.y, bubble.width, bubble.height).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        skipZone.on('pointerdown', () => typewriter.skip());
        this.contentContainer.add(skipZone);
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
        bg.setInteractive({ useHandCursor: true });
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
        const npc = getNpc(this.sceneData.npcId);
        const bubble = this.textBubbleBounds();
        const bubbleBg = this.add.rectangle(bubble.x, bubble.y, bubble.width, bubble.height, COLORS.PANEL, 0.9).setOrigin(0, 0).setStrokeStyle(2, COLORS.SUCCESS);
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
            const row = this.renderOptionRow('1. Continuar', FRAME.contentTop + 60, () => {
                this.currentNodeId = opt.next;
                this.renderNode();
            });
            this.contentContainer.add(row.container);
        };

        const typewriter = new TypewriterText(this, text, `${npc?.apodo ?? ''}: "${opt.responseLine}"`, 14);
        typewriter.start(showContinue);

        const skipZone = this.add.zone(bubble.x, bubble.y, bubble.width, bubble.height).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        skipZone.on('pointerdown', () => typewriter.skip());
        this.contentContainer.add(skipZone);
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
