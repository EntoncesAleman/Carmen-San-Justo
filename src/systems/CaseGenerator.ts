import { CaseDefinition, Clue, DialogueTree, SuspectAttributeKey } from '../data/types';
import { ZONES, getZone } from '../data/zones';
import { getConnections } from '../data/zoneConnections';
import { getTransportLine } from '../data/transportLines';
import { getNpc } from '../data/npcs';
import { getSuspect } from '../data/suspects';
import { OPERATIVE_NPC_IDS } from '../data/generator/operatives';
import { BYSTANDER_NPC_IDS } from '../data/generator/bystanders';
import { INFORMANT_NPC_IDS } from '../data/generator/informants';
import { CRIME_FLAVORS } from '../data/generator/crimeFlavors';
import {
    buildBriefingDialogue,
    buildConfrontacionDialogue,
    buildFalsoSospechosoDialogue,
    buildFinales,
    buildInformantTree,
    ClueAssignment,
} from '../data/generator/dialogueTemplates';
import { Rng, pick, pickN, randomInt, shuffle } from './rng';
import { calibrateDeadlineMinutos } from './timeEstimate';

const ATTRIBUTE_KEYS: SuspectAttributeKey[] = ['cabello', 'ojos', 'vehiculo', 'profesion', 'hobby', 'comida'];

interface DifficultyTier {
    rutaLengthRange: [number, number];
    buffer: number;
    confiabilidadPenalty: number;
}

// Escala con `casosResueltos` (el mismo contador que decide el rango en
// data/ranks.ts) en vez de con `generationIndex`: si el jugador pierde
// casos, la dificultad no debe seguir subiendo solo porque pasó el
// tiempo. Tres perillas suben juntas con el rango: rutas más largas
// (más viajes hasta el destino real), menos margen de tiempo sobre el
// óptimo (BUFFER, ver timeEstimate.ts) y pistas menos confiables (fuerza
// a cruzar más testimonios en vez de confiar en el primero que aparece).
function difficultyTier(casosResueltos: number): DifficultyTier {
    if (casosResueltos >= 5) return { rutaLengthRange: [4, 6], buffer: 1.15, confiabilidadPenalty: 20 };
    if (casosResueltos >= 4) return { rutaLengthRange: [4, 5], buffer: 1.2, confiabilidadPenalty: 15 };
    if (casosResueltos >= 2) return { rutaLengthRange: [3, 5], buffer: 1.3, confiabilidadPenalty: 8 };
    return { rutaLengthRange: [3, 4], buffer: 1.4, confiabilidadPenalty: 0 };
}

function withPenalty(min: number, max: number, penalty: number, rng: Rng): number {
    const floor = 15; // mismo piso que separa "BAJA confianza" en el expediente (ver CaseFileScene)
    return randomInt(Math.max(floor, min - penalty), Math.max(floor + 5, max - penalty), rng);
}

// Arma un CaseDefinition nuevo combinando piezas reutilizables: un
// operativo al azar (con sus atributos fijos de identikit), una ruta al
// azar por el mapa, informantes al azar dando cada pista, un sospechoso
// falso al azar y una "excusa" de crimen al azar. El objeto resultante es
// del mismo tipo `CaseDefinition` que usan los 3 casos escritos a mano —
// ningún system ni scene necesita saber si un caso es fijo o generado
// (ver CaseManager.ts).
//
// Por qué existe: con solo 3 casos fijos, el ciclo se repetía siempre en
// la misma secuencia a partir de la cuarta partida. Este generador hace
// que, de ahí en más, cada caso sea una combinación distinta — mismo
// mundo, mismos personajes, pero nunca la misma ruta ni el mismo caco dos
// veces seguidas (ver docs/GAME_DESIGN.md → "Generador de casos").
export class CaseGenerator {
    static generate(generationIndex: number, rng: Rng = Math.random, casosResueltos: number = 0): CaseDefinition {
        const tier = difficultyTier(casosResueltos);
        const operativoId = pick(OPERATIVE_NPC_IDS, rng);
        const operativo = getNpc(operativoId);
        const perfil = getSuspect(operativoId);
        if (!operativo || !perfil) {
            throw new Error(`CaseGenerator: operativo ${operativoId} no tiene NPC o perfil de sospechoso registrado`);
        }

        const bystanderId = pick(BYSTANDER_NPC_IDS, rng);
        const bystander = getNpc(bystanderId);
        if (!bystander) throw new Error(`CaseGenerator: señuelo ${bystanderId} no tiene NPC registrado`);

        const flavor = pick(CRIME_FLAVORS, rng);

        // --- Ruta: un camino real sobre el grafo de conexiones (ver
        // data/zoneConnections.ts) — cada salto tiene que ser a una zona
        // directamente conectada, igual que la pantalla de "ver
        // conexiones" del formato clásico. Los tramos que no son la parada
        // final además necesitan tener al menos un informante viviendo ahí
        // (si no, nadie podría darte la pista de por dónde sigue el caco).
        // Solo la parada final puede ser una zona "vacía" de NPCs estáticos
        // (mismo patrón que Tigre/San Martín en los casos fijos).
        const populatedZoneIds = new Set(INFORMANT_NPC_IDS.map((id) => getNpc(id)!.zoneId));
        const rutaLength = randomInt(tier.rutaLengthRange[0], tier.rutaLengthRange[1], rng);

        const buildRuta = (largo: number): string[] | null => {
            for (const inicio of shuffle([...populatedZoneIds], rng)) {
                const camino = [inicio];
                const visitados = new Set(camino);
                while (camino.length < largo) {
                    const esUltimoSalto = camino.length === largo - 1;
                    const actual = camino[camino.length - 1];
                    const candidatos = shuffle(
                        getConnections(actual).filter((z) => !visitados.has(z) && (esUltimoSalto || populatedZoneIds.has(z))),
                        rng,
                    );
                    if (candidatos.length === 0) break;
                    camino.push(candidatos[0]);
                    visitados.add(candidatos[0]);
                }
                if (camino.length === largo) return camino;
            }
            return null;
        };

        const ruta = buildRuta(rutaLength) ?? buildRuta(Math.max(3, rutaLength - 1)) ?? buildRuta(3) ?? buildRuta(2);
        if (!ruta) {
            throw new Error('CaseGenerator: no se pudo armar una ruta conectada — revisar data/zoneConnections.ts');
        }

        const destinoCorrectoZoneId = ruta[ruta.length - 1];
        const zonasUsadas = new Set(ruta);
        const zonasFalsasCandidatas = shuffle(
            (getConnections(destinoCorrectoZoneId).filter((id) => !zonasUsadas.has(id)).length > 0
                ? getConnections(destinoCorrectoZoneId).filter((id) => !zonasUsadas.has(id))
                : ZONES.map((z) => z.id).filter((id) => !zonasUsadas.has(id))),
            rng,
        );
        const destinoFalsoZoneId = zonasFalsasCandidatas[0];

        // --- Asignación de informantes: uno por salto de ruta (da la
        // pista de la próxima parada) + uno por atributo del identikit
        // (pueden repetirse entre sí — un mismo informante puede tener
        // más de una pista para dar, igual que en los casos fijos).
        const assignmentsByNpc = new Map<string, ClueAssignment[]>();
        const addAssignment = (npcId: string, assignment: ClueAssignment) => {
            const list = assignmentsByNpc.get(npcId) ?? [];
            list.push(assignment);
            assignmentsByNpc.set(npcId, list);
        };

        const clues: Clue[] = [];
        const cluesRequeridasParaResolver: string[] = [];

        for (let i = 0; i < ruta.length - 1; i++) {
            const zonaActual = ruta[i];
            const informantesAca = INFORMANT_NPC_IDS.filter((id) => getNpc(id)!.zoneId === zonaActual);
            const informanteId = pick(informantesAca, rng);
            const proximaZona = getZone(ruta[i + 1])!;
            const clueId = `gen_${generationIndex}_ruta_${i}`;

            clues.push({
                id: clueId,
                descripcion: '', // se completa más abajo, una vez resuelta la frase
                ubicacionZoneId: zonaActual,
                npcId: informanteId,
                categoria: 'geografica',
                relevancia: 'alta',
                confiabilidad: withPenalty(55, 80, tier.confiabilidadPenalty, rng),
                destinosPosibles: [ruta[i + 1]],
                esFalsa: false,
            });
            cluesRequeridasParaResolver.push(clueId);
            const transporte = getTransportLine(zonaActual, ruta[i + 1]).nombre;
            addAssignment(informanteId, { clueId, kind: 'route', proximaZonaNombre: proximaZona.nombre, transporte });
        }

        const atributoInformantes = pickN(INFORMANT_NPC_IDS, ATTRIBUTE_KEYS.length, rng);
        ATTRIBUTE_KEYS.forEach((key, i) => {
            const informanteId = atributoInformantes[i];
            const clueId = `gen_${generationIndex}_attr_${key}`;
            const valor = perfil.atributos[key];

            clues.push({
                id: clueId,
                descripcion: '',
                ubicacionZoneId: getNpc(informanteId)!.zoneId,
                npcId: informanteId,
                categoria: 'visual',
                relevancia: 'baja',
                confiabilidad: withPenalty(45, 70, tier.confiabilidadPenalty, rng),
                destinosPosibles: [],
                esFalsa: false,
                revealsAttribute: { key, value: valor },
            });
            addAssignment(informanteId, { clueId, kind: 'attribute', attributeKey: key, attributeValue: valor });
        });

        // --- Una pista "física", encontrable explorando la escena del
        // hecho sin hablar con nadie (ver ExploreSystem) — refuerza uno de
        // los atributos ya revelados por testimonio, no agrega uno nuevo.
        const atributoExplorar = pick(ATTRIBUTE_KEYS, rng);
        clues.push({
            id: `gen_${generationIndex}_explorar`,
            descripcion: `Revisando la escena con más cuidado encontrás algo que se le cayó al que se escapó: ${perfil.atributos[atributoExplorar].toLowerCase()}.`,
            ubicacionZoneId: ruta[0],
            categoria: 'visual',
            relevancia: 'baja',
            confiabilidad: withPenalty(50, 75, tier.confiabilidadPenalty, rng),
            destinosPosibles: [],
            esFalsa: false,
            revealsAttribute: { key: atributoExplorar, value: perfil.atributos[atributoExplorar] },
        });

        // --- Una pista falsa, a cargo de un informante todavía sin usar,
        // que apunta al destino falso y contradice la primera pista de
        // ruta real (mismo patrón que los 3 casos fijos).
        const informantesLibres = INFORMANT_NPC_IDS.filter((id) => !assignmentsByNpc.has(id));
        if (informantesLibres.length > 0 && clues.length > 0) {
            const falsoInformanteId = pick(informantesLibres, rng);
            const zonaFalsaNombre = getZone(destinoFalsoZoneId)!.nombre;
            const clueFalsaId = `gen_${generationIndex}_falsa`;
            const primeraClueRuta = clues.find((c) => c.destinosPosibles.length > 0 && !c.esFalsa)!;

            clues.push({
                id: clueFalsaId,
                descripcion: `Alguien jura, sin estar muy seguro, haber visto al sospechoso rumbo a ${zonaFalsaNombre}.`,
                ubicacionZoneId: getNpc(falsoInformanteId)!.zoneId,
                npcId: falsoInformanteId,
                categoria: 'falsa',
                relevancia: 'media',
                confiabilidad: randomInt(15, 30, rng),
                destinosPosibles: [destinoFalsoZoneId],
                esFalsa: true,
                contradiceConClueId: primeraClueRuta.id,
            });
            addAssignment(falsoInformanteId, {
                clueId: clueFalsaId,
                kind: 'route',
                proximaZonaNombre: zonaFalsaNombre,
            });
        }

        // Resuelve la frase de cada pista real (la misma que dice el NPC
        // en el diálogo, para que expediente/pizarrón nunca contradigan
        // lo que ya escuchaste) y arma un árbol de diálogo por informante.
        const dialogueTrees: DialogueTree[] = [];
        assignmentsByNpc.forEach((assignments, npcId) => {
            const npc = getNpc(npcId)!;
            const tree = buildInformantTree(npcId, npc.apodo, assignments, rng);
            dialogueTrees.push(tree);

            assignments.forEach((a) => {
                const clue = clues.find((c) => c.id === a.clueId)!;
                if (clue.esFalsa) return; // ya tiene su descripcion propia
                const opt = tree.nodes.start.options.find((o) => o.givesClueId === a.clueId);
                clue.descripcion = opt?.responseLine ?? clue.descripcion;
            });
        });

        const zonaInicialNombre = getZone(ruta[0])!.nombre;
        const descripcion = flavor.descripcionTemplate.replace('{operativoApodo}', operativo.apodo);

        const id = `generado_${generationIndex}`;

        // El deadline se calcula en base a esta ruta y estos informantes
        // puntuales — no es un número fijo. Con la red de conexiones entre
        // zonas, cuánto cuesta resolver un caso depende de dónde termina
        // cayendo cada informante de atributo (pueden quedar lejos de la
        // ruta principal), así que un valor fijo o le sobraba tiempo a los
        // casos fáciles o le faltaba a los difíciles (ver timeEstimate.ts).
        const deadlineMinutos = calibrateDeadlineMinutos({ zonaInicial: ruta[0], destinoCorrectoZoneId, clues }, tier.buffer);

        return {
            id,
            titulo: flavor.titulo,
            descripcion,
            objetoRobado: flavor.objetoRobado,
            victima: flavor.victima,
            fechaHoraDelHecho: flavor.fechaHoraDelHecho,
            sospechosoId: operativoId,
            zonaInicial: ruta[0],
            deadlineMinutos,
            clues,
            cluesRequeridasParaResolver,
            ruta,
            destinoCorrectoZoneId,
            destinosFalsosZoneIds: [destinoFalsoZoneId],
            dialogueTrees,
            briefingDialogue: buildBriefingDialogue(flavor.objetoRobado, zonaInicialNombre),
            confrontacionDialogue: buildConfrontacionDialogue(operativoId, operativo.apodo, flavor.objetoRobado, getZone(destinoCorrectoZoneId)!.nombre),
            falsoSospechosoId: bystanderId,
            falsoSospechosoDialogue: buildFalsoSospechosoDialogue(bystanderId, bystander.apodo),
            finales: buildFinales(operativo.apodo, flavor.objetoRobado),
        };
    }
}
