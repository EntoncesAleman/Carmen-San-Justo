import { DialogueOption, DialogueTree, CaseEnding, SuspectAttributeKey } from '../types';
import { Rng, pick } from '../../systems/rng';

// Frases variadas por atributo — el generador elige una al azar por cada
// pista para que dos informantes que revelan el mismo atributo en casos
// generados distintos no digan literalmente la misma línea.
const ATTRIBUTE_PHRASES: Record<SuspectAttributeKey, ((apodo: string, valor: string) => string)[]> = {
    cabello: [
        (apodo, valor) => `${apodo} te dice que el tipo tenía el pelo ${valor}, bien notorio.`,
        (apodo, valor) => `Según ${apodo}, el pelo del sospechoso era ${valor}. No tiene dudas.`,
    ],
    ojos: [
        (apodo, valor) => `${apodo} se acuerda de los ojos ${valor} del tipo, "de esos que no se olvidan".`,
        (apodo, valor) => `${apodo} jura que tenía ojos ${valor}, se los vio bien de cerca.`,
    ],
    vehiculo: [
        (apodo, valor) => `${apodo} vio al sospechoso subirse a un ${valor} y arrancar.`,
        (apodo, valor) => `Según ${apodo}, el tipo se movía en un ${valor}.`,
    ],
    profesion: [
        (apodo, valor) => `${apodo} está seguro de que el tipo trabaja de ${valor}.`,
        (apodo, valor) => `${apodo} escuchó, de buena fuente, que el sospechoso se dedica a ${valor}.`,
    ],
    hobby: [
        (apodo, valor) => `${apodo} lo vio entretenido con ${valor}, como si no pasara nada.`,
        (apodo, valor) => `Según ${apodo}, al tipo le encanta ${valor}. Se lo comentó sin que se lo pregunten.`,
    ],
    comida: [
        (apodo, valor) => `${apodo} lo vio comprando ${valor} antes de rajar.`,
        (apodo, valor) => `${apodo} se acuerda que el tipo no paraba de comer ${valor}.`,
    ],
};

const ROUTE_PHRASES: ((apodo: string, proximaZona: string) => string)[] = [
    (apodo, zona) => `${apodo} lo vio subir a un colectivo con destino a ${zona}.`,
    (apodo, zona) => `Según ${apodo}, el tipo mencionó que iba para ${zona} antes de irse.`,
    (apodo, zona) => `${apodo} jura haberlo visto tomar un remise rumbo a ${zona}.`,
];

export interface ClueAssignment {
    clueId: string;
    kind: 'route' | 'attribute';
    proximaZonaNombre?: string;
    attributeKey?: SuspectAttributeKey;
    attributeValue?: string;
}

// Construye el árbol de diálogo de UN informante para un caso generado.
// Un mismo informante puede tener más de una pista para dar (ej: la ruta Y
// un atributo) — cada una es una opción de nivel superior con su propio
// `givesClueId`, igual que en los casos escritos a mano (ver, por ejemplo,
// Cacho en caso1_dialogues.ts).
export function buildInformantTree(npcId: string, apodo: string, assignments: ClueAssignment[], rng: Rng): DialogueTree {
    const options: DialogueOption[] = assignments.map((a, i) => {
        const line =
            a.kind === 'route'
                ? pick(ROUTE_PHRASES, rng)(apodo, a.proximaZonaNombre!)
                : pick(ATTRIBUTE_PHRASES[a.attributeKey!], rng)(apodo, a.attributeValue!);
        return {
            id: `preguntar_${i}`,
            label: i === 0 ? '"¿Viste algo raro por acá?"' : '"¿Algo más que te acuerdes?"',
            kind: 'preguntar',
            next: 'end',
            givesClueId: a.clueId,
            effects: { confianza: 5 },
            responseLine: line,
        };
    });
    options.push({ id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' });

    return {
        npcId,
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: `${apodo} te mira, dudando si te tiene algo o no.`,
                options,
            },
        },
    };
}

export function buildBriefingDialogue(objetoRobado: string, zonaInicialNombre: string): DialogueTree {
    return {
        npcId: 'hugo_bracamonte',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: `Bracamonte te tira otra carpeta encima del escritorio, sin mirarte. "Se afanaron ${objetoRobado.toLowerCase()}, en ${zonaInicialNombre}. Andá a ver antes de que se enfríe."`,
                options: [
                    { id: 'aceptar', label: '"Entendido."', kind: 'preguntar', next: 'node_extraoficial' },
                    { id: 'preguntar_porque_yo', label: '"¿Por qué yo, otra vez?"', kind: 'preguntar', next: 'node_porque_vos' },
                ],
            },
            node_porque_vos: {
                npcLine: 'Bracamonte ya ni se molesta en inventar una excusa nueva: "Porque estás acá y sos gratis."',
                options: [{ id: 'seguir', label: '"Como siempre."', kind: 'preguntar', next: 'node_extraoficial' }],
            },
            node_extraoficial: {
                npcLine: 'Baja la voz, por costumbre más que por cuidado: "Si esto se arregla rápido y calladito, hay un sobre. Vos sabrás."',
                options: [
                    {
                        id: 'aceptar_offline',
                        label: '"Hablamos cuando termine."',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        effects: { corrupcion: 15 },
                        setsFlag: 'acepto_extraoficial',
                    },
                    {
                        id: 'rechazar_offline',
                        label: '"Prefiero hacerlo como corresponde."',
                        kind: 'retirarse',
                        next: 'end',
                        effects: { reputacionPolicial: 5 },
                        setsFlag: 'rechazo_extraoficial',
                    },
                ],
            },
        },
    };
}

export function buildConfrontacionDialogue(npcId: string, apodo: string, objetoRobado: string, lugarNombre: string): DialogueTree {
    return {
        npcId,
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: `Encontrás a ${apodo} tratando de deshacerse de ${objetoRobado.toLowerCase()} en ${lugarNombre}. "No me busques problemas, Fierro. Yo solo hacía un mandado."`,
                options: [
                    {
                        id: 'arrestar',
                        label: `"Quedás detenido."`,
                        kind: 'insistir',
                        next: 'end',
                        effects: { reputacionPolicial: 10, sospechaGlobal: -5 },
                        setsFlag: 'sospechoso_arrestado',
                        responseLine: `${apodo} no opone resistencia. "Total, adentro por lo menos como caliente."`,
                    },
                    {
                        id: 'ofrecer_trato',
                        label: '"¿Cuánto vale que no te vea?"',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        effects: { corrupcion: 20, reputacionPolicial: -10 },
                        setsFlag: 'sospechoso_soborno',
                        responseLine: `${apodo} sonríe, aliviado, y te ofrece un arreglo ahí mismo.`,
                    },
                    {
                        id: 'intimidar',
                        label: '"Hablá antes de que se te complique más."',
                        kind: 'intimidar',
                        next: 'end',
                        effects: { reputacionCallejera: 8, sospechaGlobal: 5, corrupcion: -5 },
                        setsFlag: 'sospechoso_intimidado',
                        responseLine: `${apodo} habla de más, nervioso, y termina contándote más de lo que necesitabas saber sobre Los Administradores.`,
                    },
                    {
                        id: 'dejar_ir',
                        label: '"Andate. Hoy no te vi."',
                        kind: 'retirarse',
                        next: 'end',
                        effects: { sospechaGlobal: 10 },
                        setsFlag: 'sospechoso_liberado',
                        responseLine: `${apodo} desaparece sin decir gracias.`,
                    },
                ],
            },
        },
    };
}

export function buildFalsoSospechosoDialogue(npcId: string, apodo: string): DialogueTree {
    return {
        npcId,
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: `${apodo} te mira sin entender nada. "¿Puedo ayudarlo, oficial? Porque la verdad que no sé de qué me habla."`,
                options: [
                    {
                        id: 'arrestar_falso',
                        label: '"Esto no me cierra. Quedate ahí." (arrestarlo)',
                        kind: 'insistir',
                        next: 'end',
                        effects: { reputacionPolicial: -8, sospechaGlobal: 8 },
                        responseLine: `${apodo} no entiende nada y ya empieza a hablar de un abogado.`,
                        endsCase: true,
                    },
                    { id: 'dejarlo_ir_falso', label: '"Seguí con lo tuyo, disculpá."', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    };
}

export function buildFinales(apodo: string, objetoRobado: string): CaseEnding[] {
    return [
        { id: 'resuelto_correcto', titulo: 'Caso resuelto', descripcion: `Entregaste a ${apodo} con ${objetoRobado.toLowerCase()} como prueba. Bracamonte no te felicita, pero tampoco te putea.` },
        { id: 'banda_escapa', titulo: 'La banda escapa', descripcion: `Para cuando llegaste a una conclusión, ya no quedaba rastro de ${objetoRobado.toLowerCase()}. ${apodo} es un fantasma otra vez.` },
        { id: 'sospechoso_equivocado', titulo: 'El sospechoso equivocado', descripcion: 'Arrestaste a alguien que no tenía nada que ver. Te lo va a hacer acordar cada vez que te cruce.' },
        { id: 'escandalo', titulo: 'Escándalo', descripcion: `Negociaste con ${apodo} y alguien se enteró. La nota sobre vos ya está circulando.` },
        { id: 'final_absurdo', titulo: 'Final absurdo', descripcion: 'Entre intimidaciones y contradicciones, el caso se resuelve casi por accidente. Nadie entiende bien cómo.' },
        { id: 'final_secreto', titulo: 'Algo no cierra', descripcion: `Hablando con todo el mundo, algo no cierra sobre este caso. Bracamonte se pone raro cuando se lo mencionás.` },
        { id: 'final_perfecto', titulo: 'Procedimiento perfecto', descripcion: `Resolviste el caso, rechazaste el sobre, y tu reputación quedó mejor que como empezaste. Raro en vos.` },
    ];
}
