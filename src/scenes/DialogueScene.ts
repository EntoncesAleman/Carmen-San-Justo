import * as Phaser from 'phaser';
import { COLORS, COLORS_CSS, FONTS, SCENE_KEYS, TIME_COSTS } from '../core/Constants';
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
import { createIconToolbar } from '../ui/IconToolbar';
import { renderDestinationListPanel } from '../ui/DestinationListPanel';
import { renderLocationArtPanel } from '../ui/LocationArtPanel';
import { gameState } from '../core/GameState';

export interface DialogueSceneData {
    npcId: string;
    tree?: DialogueTree;
    returnSceneKey: string;
    isConfrontacion?: boolean;
}

const PORTRAIT_SIZE = 150;
const BUBBLE_TOP = FRAME.contentTop + 16;
const BUBBLE_HEIGHT = 200;
const OPTIONS_TOP = BUBBLE_TOP + BUBBLE_HEIGHT + 24;

// Mismo frame que CityMapScene/LocationScene (lista de destinos + arte a
// la izquierda) — el panel derecho pasa a ser retrato + globo de diálogo,
// calcado del formato clásico de persecución (retrato a la izquierda del
// panel, texto en un globo a la derecha, nombre del NPC debajo del
// retrato, opciones como filas debajo de todo).
export class DialogueScene extends Phaser.Scene {
    private sceneData!: DialogueSceneData;
    private tree!: DialogueTree;
    private currentNodeId!: string;
    private contentContainer!: Phaser.GameObjects.Container;
    private pendingEndsCase = false;
    private portraitX = FRAME.rightX + 16;

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

        renderDestinationListPanel(this, (zoneId) => this.travelTo(zoneId));
        renderLocationArtPanel(this);

        this.add
            .rectangle(FRAME.rightX, FRAME.contentTop, FRAME.rightWidth, FRAME.contentBottom - FRAME.contentTop, COLORS.PANEL, 0.9)
            .setOrigin(0, 0)
            .setStrokeStyle(2, COLORS.ACCENT);

        this.renderPortrait();

        createIconToolbar(this, [
            { icon: '🗺', label: 'PIZARRÓN', onClick: () => this.scene.start(SCENE_KEYS.SUSPECT_BOARD) },
            { icon: '🔍', label: 'EXPEDIENTE', onClick: () => this.scene.start(SCENE_KEYS.CASE_FILE) },
            { icon: '💻', label: 'INTELIGENCIA CRIMINAL', onClick: () => this.scene.start(SCENE_KEYS.CRIME_COMPUTER) },
        ]);

        this.contentContainer = this.add.container(0, 0);
        this.renderNode();
    }

    private travelTo(zoneId: string) {
        if (zoneId === gameState.currentZoneId) {
            this.scene.start(SCENE_KEYS.LOCATION);
            return;
        }
        const expired = CaseManager.advanceTimeAndCheckDeadline(TIME_COSTS.VIAJAR_MINUTOS);
        gameState.currentZoneId = zoneId;
        if (expired) {
            this.scene.start(SCENE_KEYS.ENDING);
            return;
        }
        this.scene.start(SCENE_KEYS.LOCATION);
    }

    private renderPortrait() {
        const npc = getNpc(this.sceneData.npcId);
        const portraitY = FRAME.contentTop + 16;
        const portraitKey = getPortraitKey(this.sceneData.npcId);

        this.add.rectangle(this.portraitX + PORTRAIT_SIZE / 2, portraitY + PORTRAIT_SIZE / 2, PORTRAIT_SIZE, PORTRAIT_SIZE, COLORS.BG_DARK).setStrokeStyle(2, COLORS.ACCENT);
        if (portraitKey && this.textures.exists(portraitKey)) {
            const img = this.add.image(this.portraitX + PORTRAIT_SIZE / 2, portraitY + PORTRAIT_SIZE / 2, portraitKey);
            img.setDisplaySize(PORTRAIT_SIZE - 6, PORTRAIT_SIZE - 6);
        }

        this.add
            .text(this.portraitX + PORTRAIT_SIZE / 2, portraitY + PORTRAIT_SIZE + 16, npc?.apodo ?? '', {
                fontFamily: FONTS.MONO,
                fontSize: '13px',
                color: COLORS_CSS.ACCENT,
                wordWrap: { width: PORTRAIT_SIZE },
                align: 'center',
            })
            .setOrigin(0.5, 0);
    }

    private bubbleBounds() {
        const x = this.portraitX + PORTRAIT_SIZE + 16;
        const width = FRAME.rightX + FRAME.rightWidth - 16 - x;
        return { x, y: BUBBLE_TOP, width, height: BUBBLE_HEIGHT };
    }

    private renderNode() {
        this.contentContainer.removeAll(true);

        if (this.currentNodeId === 'end') {
            this.finishDialogue();
            return;
        }

        const node = this.tree.nodes[this.currentNodeId];
        const bubble = this.bubbleBounds();
        const bubbleBg = this.add.rectangle(bubble.x, bubble.y, bubble.width, bubble.height, COLORS.BG_DARK, 0.6).setOrigin(0, 0).setStrokeStyle(1, 0x555c6e);
        this.contentContainer.add(bubbleBg);

        const npcLineText = this.add.text(bubble.x + 12, bubble.y + 12, '', {
            fontFamily: FONTS.MONO,
            fontSize: '14px',
            color: COLORS_CSS.TEXT,
            wordWrap: { width: bubble.width - 24 },
            lineSpacing: 5,
        });
        this.contentContainer.add(npcLineText);

        const options = DialogueEngine.getVisibleOptions(node, this.sceneData.npcId);
        const showOptions = () => {
            options.forEach((opt, i) => {
                this.contentContainer.add(this.renderOptionRow(opt.label, OPTIONS_TOP + i * 54, () => this.chooseOption(opt)));
            });
        };

        const typewriter = new TypewriterText(this, npcLineText, node.npcLine, 14);
        typewriter.start(showOptions);

        const skipZone = this.add.zone(bubble.x, bubble.y, bubble.width, bubble.height).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        skipZone.on('pointerdown', () => typewriter.skip());
        this.contentContainer.add(skipZone);
    }

    private renderOptionRow(label: string, y: number, onClick: () => void): Phaser.GameObjects.Container {
        const x = FRAME.rightX + 16;
        const width = FRAME.rightWidth - 32;
        const bg = this.add.rectangle(0, 0, width, 44, COLORS.BG_DARK, 0.7).setStrokeStyle(1, COLORS.ACCENT);
        const text = this.add
            .text(-width / 2 + 12, 0, label, { fontFamily: FONTS.MONO, fontSize: '13px', color: COLORS_CSS.TEXT, wordWrap: { width: width - 24 } })
            .setOrigin(0, 0.5);
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setStrokeStyle(1, 0xffffff));
        bg.on('pointerout', () => bg.setStrokeStyle(1, COLORS.ACCENT));
        bg.on('pointerdown', () => {
            audioManager.playSfx('ui_click');
            onClick();
        });
        return this.add.container(x + width / 2, y, [bg, text]);
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
        const bubble = this.bubbleBounds();
        const bubbleBg = this.add.rectangle(bubble.x, bubble.y, bubble.width, bubble.height, COLORS.BG_DARK, 0.6).setOrigin(0, 0).setStrokeStyle(1, COLORS.SUCCESS);
        this.contentContainer.add(bubbleBg);

        const text = this.add.text(bubble.x + 12, bubble.y + 12, '', {
            fontFamily: FONTS.MONO,
            fontSize: '14px',
            color: COLORS_CSS.SUCCESS,
            wordWrap: { width: bubble.width - 24 },
            lineSpacing: 5,
        });
        this.contentContainer.add(text);

        const showContinue = () => {
            this.contentContainer.add(this.renderOptionRow('Continuar', OPTIONS_TOP, () => {
                this.currentNodeId = opt.next;
                this.renderNode();
            }));
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
