import * as Phaser from 'phaser';
import { SCENE_KEYS } from '../core/Constants';

export class Boot extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.BOOT);
    }

    create() {
        this.scene.start(SCENE_KEYS.PRELOADER);
    }
}
