import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ZONES } from '../data/zones';
import { ZONE_CONNECTIONS, getConnections } from '../data/zoneConnections';
import { getZoneMapPosition } from '../data/zoneMapPositions';
import { CASES } from '../data/cases';

const zoneIds = new Set(ZONES.map((z) => z.id));

describe('ZoneConnections', () => {
    it('toda zona listada en el grafo existe de verdad', () => {
        Object.keys(ZONE_CONNECTIONS).forEach((id) => assert.ok(zoneIds.has(id), `zona inexistente en el grafo: ${id}`));
    });

    it('toda zona del mundo tiene al menos una conexión', () => {
        ZONES.forEach((z) => assert.ok(getConnections(z.id).length > 0, `${z.id} no tiene ninguna conexión`));
    });

    it('las conexiones apuntan a zonas que existen', () => {
        ZONES.forEach((z) => getConnections(z.id).forEach((n) => assert.ok(zoneIds.has(n), `${z.id} conecta con una zona inexistente ${n}`)));
    });

    it('el grafo es simétrico (si A conecta con B, B conecta con A)', () => {
        ZONES.forEach((z) => {
            getConnections(z.id).forEach((n) => {
                assert.ok(getConnections(n).includes(z.id), `${z.id} -> ${n} no tiene la vuelta ${n} -> ${z.id}`);
            });
        });
    });

    it('el grafo completo es conexo: cualquier zona es alcanzable desde cualquier otra', () => {
        const start = ZONES[0].id;
        const visited = new Set([start]);
        const queue = [start];
        while (queue.length > 0) {
            const current = queue.shift()!;
            getConnections(current).forEach((n) => {
                if (!visited.has(n)) {
                    visited.add(n);
                    queue.push(n);
                }
            });
        }
        ZONES.forEach((z) => assert.ok(visited.has(z.id), `${z.id} no es alcanzable desde ${start} — el grafo está partido en dos`));
    });

    it('toda zona tiene una posición definida para el mapa gráfico de viaje (TravelMapScene)', () => {
        ZONES.forEach((z) => assert.ok(getZoneMapPosition(z.id), `${z.id} no tiene posición en zoneMapPositions.ts — no se dibujaría en el mapa`));
    });

    CASES.forEach((caso) => {
        it(`${caso.id}: la ruta es un camino válido en el grafo (cada salto conecta con el siguiente)`, () => {
            for (let i = 0; i < caso.ruta.length - 1; i++) {
                const [from, to] = [caso.ruta[i], caso.ruta[i + 1]];
                assert.ok(getConnections(from).includes(to), `${caso.id}: ${from} no conecta directamente con ${to} — la ruta no se podría recorrer con el mapa de conexiones`);
            }
        });
    });
});
