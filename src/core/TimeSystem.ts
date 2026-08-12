import { DEADLINE_WARNING_MINUTOS } from './Constants';
import { EventBus, Events } from './EventBus';
import { gameState } from './GameState';

// Avanza el reloj del caso. No depende de Phaser: se puede testear con Node.
export class TimeSystem {
    static advance(minutos: number, deadlineMinutos: number): void {
        gameState.minutosTranscurridos += minutos;

        const totalMinutos = gameState.clock.hora * 60 + gameState.clock.minuto + minutos;
        let dias = Math.floor(totalMinutos / (24 * 60));
        let restoMinutos = totalMinutos % (24 * 60);
        gameState.clock = {
            dia: gameState.clock.dia + dias,
            hora: Math.floor(restoMinutos / 60),
            minuto: restoMinutos % 60,
        };

        EventBus.emit(Events.TIME_ADVANCED, {
            minutosTranscurridos: gameState.minutosTranscurridos,
            clock: gameState.clock,
        });

        const restante = deadlineMinutos - gameState.minutosTranscurridos;

        if (restante <= DEADLINE_WARNING_MINUTOS && restante > 0 && !gameState.deadlineWarningEmitted) {
            gameState.deadlineWarningEmitted = true;
            EventBus.emit(Events.DEADLINE_WARNING, { minutosRestantes: restante });
        }

        if (restante <= 0 && !gameState.deadlineExpired) {
            gameState.deadlineExpired = true;
            EventBus.emit(Events.DEADLINE_EXPIRED, {});
        }
    }

    static getMinutosRestantes(deadlineMinutos: number): number {
        return Math.max(0, deadlineMinutos - gameState.minutosTranscurridos);
    }

    static formatClock(): string {
        const { dia, hora, minuto } = gameState.clock;
        const hh = hora.toString().padStart(2, '0');
        const mm = minuto.toString().padStart(2, '0');
        return `Día ${dia} — ${hh}:${mm}`;
    }
}
