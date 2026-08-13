import assert from 'node:assert/strict';
import { gameState } from '../../core/GameState';
import { CaseDefinition } from '../../data/types';
import { CrimeComputerSystem } from '../../systems/CrimeComputerSystem';
import { getSuspect } from '../../data/suspects';
import { getConnections } from '../../data/zoneConnections';
import { estimateOptimalMinutos } from '../../systems/timeEstimate';

// Invariantes que CUALQUIER CaseDefinition tiene que cumplir, sea escrito
// a mano o armado por CaseGenerator — reutilizado por
// `tests/DataIntegrity.test.ts` (casos fijos) y `tests/CaseGenerator.test.ts`
// (fuzzing sobre cientos de casos generados). Funciones puras con
// `node:assert`, sin `describe/it` propio, para poder llamarlas desde
// cualquiera de los dos archivos con su propio mensaje de contexto.
export function assertCaseIntegrity(caso: CaseDefinition, zoneIds: Set<string>, npcIds: Set<string>): void {
    const clueIds = new Set(caso.clues.map((c) => c.id));

    assert.ok(zoneIds.has(caso.zonaInicial), `${caso.id}: zonaInicial inválida (${caso.zonaInicial})`);
    assert.ok(zoneIds.has(caso.destinoCorrectoZoneId), `${caso.id}: destinoCorrectoZoneId inválido`);
    caso.destinosFalsosZoneIds.forEach((id) => assert.ok(zoneIds.has(id), `${caso.id}: destino falso inválido (${id})`));

    assert.ok(caso.ruta.length >= 2, `${caso.id}: ruta necesita al menos 2 paradas`);
    caso.ruta.forEach((id) => assert.ok(zoneIds.has(id), `${caso.id}: la ruta referencia una zona inexistente ${id}`));
    assert.equal(caso.ruta[0], caso.zonaInicial, `${caso.id}: la ruta debería empezar en zonaInicial`);
    assert.equal(caso.ruta[caso.ruta.length - 1], caso.destinoCorrectoZoneId, `${caso.id}: la ruta debería terminar en destinoCorrectoZoneId`);
    assert.equal(new Set(caso.ruta).size, caso.ruta.length, `${caso.id}: la ruta repite alguna zona`);
    for (let i = 0; i < caso.ruta.length - 1; i++) {
        assert.ok(
            getConnections(caso.ruta[i]).includes(caso.ruta[i + 1]),
            `${caso.id}: ${caso.ruta[i]} no conecta directamente con ${caso.ruta[i + 1]} — la ruta no se podría recorrer con el mapa de conexiones`,
        );
    }

    // El Pizarrón (SuspectBoardScene) solo deja arriesgar una hipótesis
    // sobre una zona que alguna pista YA CONSEGUIDA señaló como destino
    // posible — no cualquiera de las 21 zonas del mundo (bug real
    // encontrado jugando: se podía reconstruir la ruta entera a fuerza
    // bruta, gratis, sin haber juntado una sola pista). Esto exige que,
    // para cada salto real de la ruta, EXISTA al menos una pista real (no
    // falsa) cuyo `destinosPosibles` lo mencione — si no, ese caso sería
    // literalmente imposible de resolver por el jugador.
    for (let i = 0; i < caso.ruta.length - 1; i++) {
        const siguiente = caso.ruta[i + 1];
        const hayPista = caso.clues.some((c) => !c.esFalsa && c.destinosPosibles.includes(siguiente));
        assert.ok(hayPista, `${caso.id}: ningún clue real señala ${siguiente} como destinosPosibles — el salto sería imposible de reconstruir en el Pizarrón`);
    }

    caso.clues.forEach((c) => assert.ok(zoneIds.has(c.ubicacionZoneId), `${caso.id}: ${c.id} referencia una zona inexistente ${c.ubicacionZoneId}`));
    caso.clues
        .filter((c) => c.npcId)
        .forEach((c) => assert.ok(npcIds.has(c.npcId!), `${caso.id}: ${c.id} referencia un NPC inexistente ${c.npcId}`));

    caso.cluesRequeridasParaResolver.forEach((id) => assert.ok(clueIds.has(id), `${caso.id}: pista requerida inexistente ${id}`));

    assert.ok(npcIds.has(caso.sospechosoId), `${caso.id}: sospechosoId inexistente (${caso.sospechosoId})`);
    if (caso.falsoSospechosoId) assert.ok(npcIds.has(caso.falsoSospechosoId), `${caso.id}: falsoSospechosoId inexistente`);
    assert.ok(getSuspect(caso.sospechosoId), `${caso.id}: falta SuspectProfile para ${caso.sospechosoId}`);

    caso.clues
        .filter((c) => c.esFalsa && c.contradiceConClueId)
        .forEach((c) => assert.ok(clueIds.has(c.contradiceConClueId!), `${caso.id}: ${c.id} contradice una pista inexistente`));

    caso.clues
        .filter((c) => c.esFalsa)
        .forEach((c) => assert.ok(!c.revealsAttribute, `${caso.id}: la pista falsa ${c.id} no debería revelar un atributo`));

    const todosLosArboles = [caso.briefingDialogue, caso.confrontacionDialogue, caso.falsoSospechosoDialogue, ...caso.dialogueTrees].filter(
        (t): t is NonNullable<typeof t> => !!t,
    );

    todosLosArboles.forEach((tree) => {
        assert.ok(npcIds.has(tree.npcId), `${caso.id}: diálogo referencia NPC inexistente ${tree.npcId}`);
        Object.values(tree.nodes).forEach((node) => {
            node.options.forEach((opt) => {
                if (opt.givesClueId) assert.ok(clueIds.has(opt.givesClueId), `${caso.id}: ${tree.npcId} otorga pista inexistente ${opt.givesClueId}`);
                const target = opt.next;
                assert.ok(
                    target === 'end' || Object.prototype.hasOwnProperty.call(tree.nodes, target),
                    `${caso.id}: ${tree.npcId} opción "${opt.id}" apunta a un nodo inexistente "${target}"`,
                );
            });
        });
    });

    const conteoPorNpc = new Map<string, number>();
    caso.dialogueTrees.forEach((t) => conteoPorNpc.set(t.npcId, (conteoPorNpc.get(t.npcId) ?? 0) + 1));
    conteoPorNpc.forEach((count, npcId) => assert.equal(count, 1, `${caso.id}: ${npcId} tiene ${count} árboles de diálogo, debería tener 1`));

    const optimo = estimateOptimalMinutos(caso);
    assert.ok(
        caso.deadlineMinutos >= optimo,
        `${caso.id}: deadlineMinutos (${caso.deadlineMinutos}) es menor al óptimo teórico (${optimo}) — el caso sería imposible de ganar ni jugando perfecto`,
    );

    const idsFinales = new Set(caso.finales.map((f) => f.id));
    ['resuelto_correcto', 'banda_escapa', 'sospechoso_equivocado', 'escandalo', 'final_absurdo', 'final_secreto', 'final_perfecto'].forEach((id) =>
        assert.ok(idsFinales.has(id), `${caso.id}: falta el final ${id}`),
    );
}

// El identikit completo (todas las pistas reales de atributo juntas) tiene
// que acorralar a un único sospechoso: el real. Y NINGUNA pista de
// atributo, sola, puede alcanzar para lo mismo (si no, la deducción es
// trivial — ver docs/ROADMAP.md, FASE 14).
export function assertIdentikitSolvableAndNotTrivial(caso: CaseDefinition): void {
    const cluesConAtributo = caso.clues.filter((c) => c.revealsAttribute && !c.esFalsa);

    cluesConAtributo.forEach((clue) => {
        gameState.reset();
        gameState.addClue(clue.id);
        const matches = CrimeComputerSystem.getMatchingSuspects(caso);
        assert.ok(matches.length > 1, `${caso.id}: la pista "${clue.id}" sola ya identifica a un único sospechoso — atributo no único en la base`);
    });

    gameState.reset();
    cluesConAtributo.forEach((c) => gameState.addClue(c.id));
    const matches = CrimeComputerSystem.getMatchingSuspects(caso);
    assert.equal(matches.length, 1, `${caso.id}: juntando todas las pistas de atributo se esperaba 1 sospechoso, hubo ${matches.length}`);
    assert.equal(matches[0].id, caso.sospechosoId, `${caso.id}: el identikit completo no apunta al sospechoso real`);
    assert.ok(CrimeComputerSystem.canEmitirOrden(caso), `${caso.id}: no se puede emitir la orden de captura ni con todas las pistas`);
}
