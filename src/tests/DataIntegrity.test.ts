import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ZONES } from '../data/zones';
import { LOCATIONS } from '../data/locations';
import { NPCS } from '../data/npcs';
import { CASES } from '../data/cases';
import { CaseDefinition } from '../data/types';
import { getSuspect } from '../data/suspects';

// Estos tests no verifican comportamiento, verifican que los datos del
// mundo sean consistentes entre sí. Están pensados para explotar rápido
// cuando alguien tipea mal un id al agregar contenido nuevo (NPC, pista,
// zona, caso). Corren sobre TODOS los casos registrados en data/cases —
// agregar un caso nuevo queda cubierto automáticamente, sin tocar este
// archivo.

const zoneIds = new Set(ZONES.map((z) => z.id));
const npcIds = new Set(NPCS.map((n) => n.id));

describe('Integridad de datos — mundo', () => {
    it('cada locación referencia una zona válida', () => {
        LOCATIONS.forEach((loc) => {
            assert.ok(zoneIds.has(loc.zoneId), `Location ${loc.id} referencia zona inexistente ${loc.zoneId}`);
        });
    });

    it('cada NPC listado en una locación existe en data/npcs.ts', () => {
        LOCATIONS.forEach((loc) => {
            loc.npcIds.forEach((npcId) => {
                assert.ok(npcIds.has(npcId), `Location ${loc.id} referencia NPC inexistente ${npcId}`);
            });
        });
    });

    it('cada NPC referencia una zona válida', () => {
        NPCS.forEach((npc) => {
            assert.ok(zoneIds.has(npc.zoneId), `NPC ${npc.id} referencia zona inexistente ${npc.zoneId}`);
        });
    });

    it('hay al menos una locación por zona', () => {
        const zonasConLocacion = new Set(LOCATIONS.map((l) => l.zoneId));
        ZONES.forEach((zone) => {
            assert.ok(zonasConLocacion.has(zone.id), `La zona ${zone.id} no tiene ninguna locación`);
        });
    });

    it('ningún NPC de rol especial (sospechoso / falso sospechoso) de ningún caso está listado estáticamente en una locación', () => {
        // Su aparición depende de la hipótesis presentada, no de la locación
        // (ver LocationScene.ts) — si alguien los vuelve a agregar acá por
        // error, quedarían visibles siempre y en cualquier caso.
        const rolesEspeciales = new Set<string>();
        CASES.forEach((c) => {
            rolesEspeciales.add(c.sospechosoId);
            if (c.falsoSospechosoId) rolesEspeciales.add(c.falsoSospechosoId);
        });
        LOCATIONS.forEach((loc) => {
            loc.npcIds.forEach((npcId) => {
                assert.ok(!rolesEspeciales.has(npcId), `Location ${loc.id} lista estáticamente a ${npcId}, que es sospechoso/falso sospechoso de algún caso`);
            });
        });
    });

    it('al menos 2 casos registrados', () => {
        assert.ok(CASES.length >= 2, 'se esperaban al menos 2 casos jugables (ver ROADMAP FASE 10)');
    });

    it('todos los ids de caso son únicos', () => {
        const ids = CASES.map((c) => c.id);
        assert.equal(new Set(ids).size, ids.length, 'hay ids de caso repetidos');
    });
});

function checkCaseIntegrity(caso: CaseDefinition) {
    const clueIds = new Set(caso.clues.map((c) => c.id));

    it('zonaInicial es una zona válida', () => {
        assert.ok(zoneIds.has(caso.zonaInicial));
    });

    it('destinoCorrectoZoneId y destinosFalsosZoneIds son zonas válidas', () => {
        assert.ok(zoneIds.has(caso.destinoCorrectoZoneId));
        caso.destinosFalsosZoneIds.forEach((id) => assert.ok(zoneIds.has(id)));
    });

    it('cluesRequeridasParaResolver referencian pistas que existen', () => {
        caso.cluesRequeridasParaResolver.forEach((id) => {
            assert.ok(clueIds.has(id), `pista requerida inexistente: ${id}`);
        });
    });

    it('sospechosoId y falsoSospechosoId son NPCs que existen', () => {
        assert.ok(npcIds.has(caso.sospechosoId));
        if (caso.falsoSospechosoId) assert.ok(npcIds.has(caso.falsoSospechosoId));
    });

    it('cada pista falsa contradice una pista real que existe', () => {
        caso.clues
            .filter((c) => c.esFalsa && c.contradiceConClueId)
            .forEach((c) => {
                assert.ok(clueIds.has(c.contradiceConClueId!), `${c.id} contradice una pista inexistente: ${c.contradiceConClueId}`);
            });
    });

    it('todos los npcId de los árboles de diálogo (incluida la confrontación) existen como NPC', () => {
        const npcsEnDialogo = [
            caso.briefingDialogue.npcId,
            caso.confrontacionDialogue.npcId,
            caso.falsoSospechosoDialogue?.npcId,
            ...caso.dialogueTrees.map((t) => t.npcId),
        ].filter((id): id is string => !!id);

        npcsEnDialogo.forEach((id) => assert.ok(npcIds.has(id), `diálogo referencia NPC inexistente: ${id}`));
    });

    it('todo givesClueId de cualquier opción de diálogo referencia una pista que existe en el caso', () => {
        const todosLosArboles = [caso.briefingDialogue, caso.confrontacionDialogue, caso.falsoSospechosoDialogue, ...caso.dialogueTrees].filter(
            (t): t is NonNullable<typeof t> => !!t,
        );

        todosLosArboles.forEach((tree) => {
            Object.values(tree.nodes).forEach((node) => {
                node.options.forEach((opt) => {
                    if (opt.givesClueId) {
                        assert.ok(clueIds.has(opt.givesClueId), `${tree.npcId} otorga una pista inexistente: ${opt.givesClueId}`);
                    }
                });
            });
        });
    });

    it('todo option.next apunta a un nodo real del mismo árbol, o a "end"', () => {
        const todosLosArboles = [caso.briefingDialogue, caso.confrontacionDialogue, caso.falsoSospechosoDialogue, ...caso.dialogueTrees].filter(
            (t): t is NonNullable<typeof t> => !!t,
        );

        todosLosArboles.forEach((tree) => {
            Object.values(tree.nodes).forEach((node) => {
                node.options.forEach((opt) => {
                    const target = opt.next;
                    assert.ok(
                        target === 'end' || Object.prototype.hasOwnProperty.call(tree.nodes, target),
                        `${tree.npcId}: la opción "${opt.id}" apunta a un nodo inexistente "${target}"`,
                    );
                });
            });
        });
    });

    it('ningún NPC tiene dos árboles de diálogo definidos en el mismo caso (se pisarían entre sí)', () => {
        const conteo = new Map<string, number>();
        caso.dialogueTrees.forEach((t) => conteo.set(t.npcId, (conteo.get(t.npcId) ?? 0) + 1));
        conteo.forEach((count, npcId) => {
            assert.equal(count, 1, `${npcId} tiene ${count} árboles de diálogo definidos, debería tener 1`);
        });
    });

    it('ruta tiene al menos 2 paradas, todas zonas válidas', () => {
        assert.ok(caso.ruta.length >= 2, `${caso.id} necesita una ruta de al menos 2 paradas (no un salto directo)`);
        caso.ruta.forEach((zoneId) => assert.ok(zoneIds.has(zoneId), `${caso.id}: la ruta referencia una zona inexistente ${zoneId}`));
    });

    it('la ruta empieza en zonaInicial y termina en destinoCorrectoZoneId', () => {
        assert.equal(caso.ruta[0], caso.zonaInicial, `${caso.id}: la ruta debería empezar en la zona inicial del caso`);
        assert.equal(caso.ruta[caso.ruta.length - 1], caso.destinoCorrectoZoneId, `${caso.id}: la ruta debería terminar en el destino correcto`);
    });

    it('sospechosoId (y falsoSospechosoId, si existe) tienen un perfil en el Sistema de Inteligencia Criminal', () => {
        assert.ok(getSuspect(caso.sospechosoId), `${caso.id}: falta un SuspectProfile para ${caso.sospechosoId} en data/suspects.ts`);
    });

    it('ninguna pista falsa revela un atributo del identikit (corrompería el Sistema de Inteligencia Criminal)', () => {
        caso.clues
            .filter((c) => c.esFalsa)
            .forEach((c) => assert.ok(!c.revealsAttribute, `${caso.id}: la pista falsa ${c.id} no debería tener revealsAttribute`));
    });

    it('los 7 finales estándar están todos presentes', () => {
        const idsDefinidos = new Set(caso.finales.map((f) => f.id));
        const posibles = [
            'resuelto_correcto',
            'banda_escapa',
            'sospechoso_equivocado',
            'escandalo',
            'final_absurdo',
            'final_secreto',
            'final_perfecto',
        ];
        posibles.forEach((id) => assert.ok(idsDefinidos.has(id), `falta el final ${id} en ${caso.id}`));
    });
}

CASES.forEach((caso) => {
    describe(`Integridad de datos — ${caso.id}`, () => {
        checkCaseIntegrity(caso);
    });
});
