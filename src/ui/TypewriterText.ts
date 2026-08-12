import * as Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager';

// Texto que aparece carácter por carácter (aventura clásica de terminal),
// con sonido sutil cada pocos caracteres, salteable con `skip()`. No
// depende de nada del dominio del juego — reutilizable en cualquier escena.
export class TypewriterText {
    private textObj: Phaser.GameObjects.Text;
    private fullText: string;
    private charIndex = 0;
    private timer?: Phaser.Time.TimerEvent;
    private scene: Phaser.Scene;
    private onComplete?: () => void;
    private msPerChar: number;
    private done = false;

    constructor(scene: Phaser.Scene, textObj: Phaser.GameObjects.Text, fullText: string, msPerChar = 16) {
        this.scene = scene;
        this.textObj = textObj;
        this.fullText = fullText;
        this.msPerChar = msPerChar;
        this.textObj.setText('');
    }

    start(onComplete?: () => void): void {
        this.onComplete = onComplete;
        this.charIndex = 0;
        this.done = false;
        this.textObj.setText('');
        this.tick();
    }

    private tick = (): void => {
        if (this.charIndex >= this.fullText.length) {
            this.finish();
            return;
        }
        this.charIndex++;
        this.textObj.setText(this.fullText.slice(0, this.charIndex));
        if (this.charIndex % 3 === 0) audioManager.playSfx('type_char');
        this.timer = this.scene.time.delayedCall(this.msPerChar, this.tick);
    };

    // Completa el texto instantáneamente (click para saltar el tipeo).
    skip(): void {
        if (this.done) return;
        this.timer?.remove(false);
        this.charIndex = this.fullText.length;
        this.textObj.setText(this.fullText);
        this.finish();
    }

    private finish(): void {
        if (this.done) return;
        this.done = true;
        this.onComplete?.();
    }

    get isDone(): boolean {
        return this.done;
    }
}
