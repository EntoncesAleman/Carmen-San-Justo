import { RANDOM_EVENT } from '../core/Constants';
import { RANDOM_EVENTS } from '../data/randomEvents';
import { RandomEventDef } from '../data/types';

export class EventSystem {
    static maybeTrigger(zoneId: string): RandomEventDef | null {
        if (Math.random() > RANDOM_EVENT.PROBABILIDAD_AL_EXPLORAR) return null;
        const pool = RANDOM_EVENTS.filter((e) => !e.zoneIds || e.zoneIds.length === 0 || e.zoneIds.includes(zoneId));
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }
}
