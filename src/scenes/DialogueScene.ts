import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, SCENE_KEYS } from '../core/Constants';
import { DialogueEngine } from '../systems/DialogueEngine';
import { DialogueOption, DialogueTree } from '../data/types';
import { getNpc } from '../data/npcs';
import { createButton } from '../ui/Button';
import { EventBus, Events } from '../core/EventBus';
import { CaseManager } from '../systems/CaseManager';
import { EndingResolver } from '../systems/EndingResolver';
import { audioManager } from '../audio/AudioManager';
import { getPortraitKey } from '../data/portraits';
import { TypewriterText } from '../ui/TypewriterText';

export interface DialogueSceneData {
    npcId: string;
    tree?: DialogueTree;
    returnSceneKey: string;
    isConfrontacion?: boolean;
}

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
        audioManager.playMusic(this.sceneData.isConfrontacion ? 'persecucion' : 'interrogatorio');
        audioManager.playSfx('dialog_open');
        const npc = getNpc(this.sceneData.npcId);

        this.add.text(60, 40, npc ? `${npc.nombre} — "${npc.apodo}"` : 'Conversación', {
            fontFamily: 'Georgia, serif',
            fontSize: '22px',
            color: COLORS_CSS.ACCENT,
        });

        this.renderPortrait();

        this.contentContainer = this.add.container(0, 0);
        this.renderNode();
    }

    private renderPortrait() {
        const portraitKey = getPortraitKey(this.sceneData.npcId);
        if (!portraitKey || !this.textures.exists(portraitKey)) return;

        this.add.rectangle(910, 155, 210, 210, COLORS.PANEL).setStrokeStyle(2, COLORS.ACCENT);
        const img = this.add.image(910, 155, portraitKey);
        img.setDisplaySize(200, 200);
    }

    private renderNode() {
        this.contentContainer.removeAll(true);

        if (this.currentNodeId === 'end') {
            this.finishDialogue();
            return;
        }

        const node = this.tree.nodes[this.currentNodeId];
        const npcLineText = this.add.text(60, 110, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: COLORS_CSS.TEXT,
            wordWrap: { width: 740 },
            lineSpacing: 6,
        });
        this.contentContainer.add(npcLineText);

        const options = DialogueEngine.getVisibleOptions(node, this.sceneData.npcId);
        const showOptions = () => {
            options.forEach((opt, i) => {
                const btn = createButton(this, this.scale.width / 2, 300 + i * 66, opt.label, () => this.chooseOption(opt), {
                    width: 840,
                    height: 54,
                    fontSize: '16px',
                });
                this.contentContainer.add(btn);
            });
        };

        const typewriter = new TypewriterText(this, npcLineText, node.npcLine, 14);
        typewriter.start(showOptions);

        const skipZone = this.add.zone(60, 100, 900, 180).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        skipZone.on('pointerdown', () => typewriter.skip());
        this.contentContainer.add(skipZone);
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

        const text = this.add.text(60, 110, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: COLORS_CSS.SUCCESS,
            wordWrap: { width: 740 },
            lineSpacing: 6,
        });
        this.contentContainer.add(text);

        const showContinue = () => {
            const btn = createButton(this, this.scale.width / 2, 500, 'Continuar', () => {
                this.currentNodeId = opt.next;
                this.renderNode();
            });
            this.contentContainer.add(btn);
        };

        const typewriter = new TypewriterText(this, text, `${npc?.apodo ?? ''}: "${opt.responseLine}"`, 14);
        typewriter.start(showContinue);

        const skipZone = this.add.zone(60, 100, 900, 180).setOrigin(0, 0).setInteractive({ useHandCursor: true });
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
