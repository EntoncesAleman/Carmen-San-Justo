import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gameState } from '../core/GameState';
import { TimeSystem } from '../core/TimeSystem';
import { EventBus, Events } from '../core/EventBus';

describe('TimeSystem', () => {
    beforeEach(() => {
        gameState.reset();
    });

    it('avanza el reloj sumando minutos y acarreando horas/días', () => {
        TimeSystem.advance(90, 720);
        assert.equal(gameState.clock.dia, 1);
        assert.equal(gameState.clock.hora, 9);
        assert.equal(gameState.clock.minuto, 30);
        assert.equal(gameState.minutosTranscurridos, 90);
    });

    it('acarrea un día completo cuando se pasa de medianoche', () => {
        // arranca a las 08:00, avanzar 20 horas (1200 min) cruza medianoche
        TimeSystem.advance(20 * 60, 24 * 60);
        assert.equal(gameState.clock.dia, 2);
        assert.equal(gameState.clock.hora, 4);
    });

    it('emite DEADLINE_WARNING una sola vez al cruzar el umbral', () => {
        let count = 0;
        const handler = () => count++;
        EventBus.on(Events.DEADLINE_WARNING, handler);

        TimeSystem.advance(601, 720); // quedan 119 min (<= 120 de umbral)
        TimeSystem.advance(10, 720); // sigue por debajo del umbral, no debe repetir

        EventBus.off(Events.DEADLINE_WARNING, handler);
        assert.equal(count, 1);
        assert.equal(gameState.deadlineWarningEmitted, true);
    });

    it('emite DEADLINE_EXPIRED una sola vez al agotar el tiempo', () => {
        let count = 0;
        const handler = () => count++;
        EventBus.on(Events.DEADLINE_EXPIRED, handler);

        TimeSystem.advance(720, 720);
        TimeSystem.advance(10, 720);

        EventBus.off(Events.DEADLINE_EXPIRED, handler);
        assert.equal(count, 1);
        assert.equal(gameState.deadlineExpired, true);
    });

    it('getMinutosRestantes nunca es negativo', () => {
        TimeSystem.advance(900, 720);
        assert.equal(TimeSystem.getMinutosRestantes(720), 0);
    });

    it('formatClock devuelve el formato esperado', () => {
        TimeSystem.advance(90, 720);
        assert.equal(TimeSystem.formatClock(), 'Día 1 — 09:30');
    });
});
