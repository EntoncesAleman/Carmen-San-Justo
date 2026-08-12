import { DialogueTree } from '../types';

export const briefingDialogue: DialogueTree = {
    npcId: 'hugo_bracamonte',
    startNodeId: 'start',
    nodes: {
        start: {
            npcLine:
                'Bracamonte tira una carpeta finita sobre el escritorio. "Molina. El Contador de Los Administradores. Encontró algo en los libros que no le gustó, y desapareció. O lo desaparecieron. Andá a ver."',
            options: [
                { id: 'aceptar', label: '"Entendido."', kind: 'preguntar', next: 'node_extraoficial' },
                { id: 'preguntar_porque_yo', label: '"¿Por qué yo, otra vez?"', kind: 'preguntar', next: 'node_porque_vos' },
            ],
        },
        node_porque_vos: {
            npcLine: 'Bracamonte se encoge de hombros: "Porque sos el único acá que todavía no le debe plata a Molina. Que yo sepa."',
            options: [{ id: 'seguir', label: '"Tranquilizador."', kind: 'preguntar', next: 'node_extraoficial' }],
        },
        node_extraoficial: {
            npcLine: 'Antes de que te vayas, baja la voz otra vez: "Si esto se resuelve discreto, hay un sobre. Como siempre."',
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

export const dialogueTrees: DialogueTree[] = [
    {
        npcId: 'pipo_escanciano',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Pipo sigue sin levantar la vista de la parrilla. "El Contador estuvo acá anoche. No comió nada, cosa rara en él."',
                options: [
                    {
                        id: 'preguntar_pipo2',
                        label: '"¿De qué habló?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_pipo_faltante',
                        effects: { confianza: 5 },
                        responseLine: 'Decía algo de un número que no le cerraba. Y que tenía que "guardar los libros en un lugar seguro". Después se fue sin pagar, y eso sí que es raro en él.',
                    },
                    {
                        id: 'ofrecer_favor_pipo2',
                        label: 'Le pagás lo que Molina dejó a deber.',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        givesClueId: 'clue_pipo_faltante',
                        effects: { confianza: 9, corrupcion: 1 },
                        responseLine: 'Se ablanda enseguida y repite lo mismo, agradecido.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'perla_sagasti',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Sagasti te mira con la misma cara de siempre. "¿Vos también en esto? Justo con Molina."',
                options: [
                    {
                        id: 'preguntar_sagasti2',
                        label: '"¿Tenés algo sobre sus movimientos?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_llamada_cervecera',
                        effects: { confianza: 4 },
                        responseLine: 'Interceptamos un llamado suyo a la línea interna de la fábrica La Cervecera, la madrugada que desapareció. No sé qué hacía ahí a esa hora.',
                    },
                    {
                        id: 'ofrecer_favor_sagasti2',
                        label: '"Compartimos, como la vez pasada."',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        givesClueId: 'clue_llamada_cervecera',
                        effects: { confianza: 9 },
                        responseLine: 'Trato hecho, otra vez. Ese llamado a La Cervecera es lo único sólido que tenemos.',
                    },
                    {
                        id: 'intimidar_sagasti2',
                        label: '"Esto es mío, Sagasti."',
                        kind: 'intimidar',
                        next: 'end',
                        effects: { confianza: -6, reputacionCallejera: 3 },
                        responseLine: 'Se ríe. "Dale, quedátelo. Yo tengo otros expedientes." No suelta nada.',
                    },
                    {
                        id: 'insistir_sagasti2',
                        label: '"¿Alguna descripción física, algo?"',
                        kind: 'insistir',
                        next: 'end',
                        givesClueId: 'clue_ojos_sagasti',
                        effects: { confianza: 2 },
                        responseLine: 'Un testigo lo describió con ojos verdes, de esos que no se olvidan. Es lo único físico que tenemos.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'marta_yulis',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Marta revuelve una pila de formularios sin que nadie se lo pida. "¿Molina? Un nombre me suena..."',
                options: [
                    {
                        id: 'preguntar_marta2',
                        label: '"¿Tiene algo archivado sobre él?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_profesion_marta',
                        effects: { confianza: 4 },
                        responseLine: 'Encuentra, por casualidad, un formulario viejo: "contador matriculado", dice. "Nunca tiré nada en mi vida, oficial."',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'yamila_cospito',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Yamila te ve entrar y suspira. "Otra vez vos. ¿Ahora qué necesitás rastrear?"',
                options: [
                    {
                        id: 'ofrecer_favor_yamila2',
                        label: '"Una transferencia rara de Los Administradores."',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        givesClueId: 'clue_transferencia_yamila',
                        effects: { confianza: 8, corrupcion: 2 },
                        responseLine: 'Tarda dos minutos: hay una transferencia a un depósito en garantía a nombre de "C. Molina", hecha desde una IP de La Cervecera. Prolijo, para lo prolijo que es esconder plata.',
                    },
                    {
                        id: 'preguntar_yamila2',
                        label: '"¿Escuchaste algo de un faltante?"',
                        kind: 'preguntar',
                        next: 'end',
                        effects: { confianza: 3 },
                        responseLine: 'Algo escuché. En esa banda hasta las mentiras tienen que cerrar en la planilla.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'egidio_paz',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Don Egidio ya te está esperando con el cuaderno abierto. "Sabía que ibas a volver a preguntar."',
                options: [
                    {
                        id: 'preguntar_egidio2',
                        label: '"¿Vio a Molina estos días?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_auto_egidio',
                        effects: { confianza: 6 },
                        responseLine: 'Su auto entró a La Cervecera dos noches seguidas, después de hora. Una fábrica que se supone cerrada de noche, oficial.',
                    },
                    {
                        id: 'insistir_egidio2',
                        label: '"Necesito la fecha exacta."',
                        kind: 'insistir',
                        next: 'end',
                        givesClueId: 'clue_auto_egidio',
                        effects: { confianza: 2 },
                        responseLine: 'Repite las dos fechas, con hora y todo, de memoria.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'nazareno_quiroga',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Naza te intercepta de nuevo: "¡Fierro! Molina hizo lo mismo que Contreras, se lo juro!"',
                options: [
                    {
                        id: 'preguntar_naza2',
                        label: '"¿Qué versión tenés ahora?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_delta_naza',
                        effects: { confianza: 5 },
                        responseLine: 'Se fue al Delta con la diferencia. Todos los que quieren desaparecer en este Cinturón terminan en el Delta. Es un patrón, Fierro. UN PATRÓN.',
                    },
                    {
                        id: 'burlarse_naza2',
                        label: 'Le hacés notar que dijo lo mismo la vez pasada.',
                        kind: 'bromear',
                        next: 'end',
                        effects: { confianza: -6 },
                        responseLine: 'Reíte, reíte. Un día el patrón me va a dar la razón.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
];

export const confrontacionDialogue: DialogueTree = {
    npcId: 'chiche_molina',
    startNodeId: 'start',
    nodes: {
        start: {
            npcLine:
                'Encontrás a Molina entre cajas vacías en La Cervecera, calculadora en mano. "No robé nada. Encontré el faltante, eso es todo. Y me dio miedo lo que iba a pasar si lo decía en voz alta."',
            options: [
                {
                    id: 'arrestar',
                    label: '"Vas a tener que explicar eso en la comisaría."',
                    kind: 'insistir',
                    next: 'end',
                    effects: { reputacionPolicial: 10, sospechaGlobal: -5 },
                    setsFlag: 'sospechoso_arrestado',
                    responseLine: 'Molina asiente, casi aliviado. "Mejor. Así lo explico una sola vez."',
                },
                {
                    id: 'ofrecer_trato',
                    label: '"¿Cuánto vale que este faltante nunca haya existido?"',
                    kind: 'ofrecerFavor',
                    next: 'end',
                    effects: { corrupcion: 20, reputacionPolicial: -10 },
                    setsFlag: 'sospechoso_soborno',
                    responseLine: 'Molina hace unos cálculos rápidos y te ofrece un número. Vos le proponés otro. Cierran en el medio.',
                },
                {
                    id: 'intimidar',
                    label: '"Contame todo antes de que me arrepienta de ser piadoso."',
                    kind: 'intimidar',
                    next: 'end',
                    effects: { reputacionCallejera: 8, sospechaGlobal: 5, corrupcion: -5 },
                    setsFlag: 'sospechoso_intimidado',
                    responseLine: 'Molina habla de más, aterrado, y suelta nombres que no le pedías.',
                },
                {
                    id: 'dejar_ir',
                    label: '"Andá. Arreglate como puedas."',
                    kind: 'retirarse',
                    next: 'end',
                    effects: { sospechaGlobal: 10 },
                    setsFlag: 'sospechoso_liberado',
                    responseLine: 'Molina desaparece entre los tanques de fermentación sin mirar atrás.',
                },
            ],
        },
    },
};

export const falsoSospechosoDialogue: DialogueTree = {
    npcId: 'pescador_aguirre',
    startNodeId: 'start',
    nodes: {
        start: {
            npcLine: 'Un pescador te mira pasar sin apurarse. "¿Busca a alguien, oficial? Acá lo único que se pierde son los anzuelos."',
            options: [
                {
                    id: 'arrestar_pescador',
                    label: '"Va a tener que acompañarme igual." (arrestarlo)',
                    kind: 'insistir',
                    next: 'end',
                    effects: { reputacionPolicial: -8, sospechaGlobal: 8 },
                    responseLine: 'El pescador ni se inmuta. "Como usted diga. Igual ya terminé por hoy."',
                    endsCase: true,
                },
                { id: 'dejarlo_pescar', label: '"Siga pescando, disculpe."', kind: 'retirarse', next: 'end' },
            ],
        },
    },
};
