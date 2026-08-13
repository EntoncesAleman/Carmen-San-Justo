import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getTransportLine } from '../data/transportLines';
import { ZONE_CONNECTIONS } from '../data/zoneConnections';

describe('transportLines', () => {
    it('es simétrico: el orden de las zonas no cambia el resultado', () => {
        for (const [zoneId, connections] of Object.entries(ZONE_CONNECTIONS)) {
            for (const other of connections) {
                assert.deepEqual(getTransportLine(zoneId, other), getTransportLine(other, zoneId));
            }
        }
    });

    it('es determinístico: el mismo tramo siempre da el mismo medio de transporte', () => {
        const a = getTransportLine('manzana_fria', 'casco_antiguo');
        const b = getTransportLine('manzana_fria', 'casco_antiguo');
        assert.deepEqual(a, b);
    });

    it('todo tramo real del grafo de conexiones resuelve a un medio de transporte válido', () => {
        const tiposValidos = new Set(['colectivo', 'tren', 'lancha']);
        for (const [zoneId, connections] of Object.entries(ZONE_CONNECTIONS)) {
            for (const other of connections) {
                const linea = getTransportLine(zoneId, other);
                assert.ok(tiposValidos.has(linea.tipo), `tipo inválido: ${linea.tipo}`);
                assert.ok(linea.nombre.length > 0);
            }
        }
    });
});
