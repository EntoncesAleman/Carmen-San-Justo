import { DialogueTree } from '../types';

export const briefingDialogue: DialogueTree = {
    npcId: 'hugo_bracamonte',
    startNodeId: 'start',
    nodes: {
        start: {
            npcLine:
                'Bracamonte ni te mira. "Se afanaron la copa del campeonato de un club de barrio en Liniers. Sí, ya sé, no es el caso del siglo. Pero el presidente del club es amigo de un concejal, y el concejal me llama a mí. Andá."',
            options: [
                { id: 'aceptar', label: '"Entendido."', kind: 'preguntar', next: 'node_extraoficial' },
                { id: 'preguntar_porque_yo', label: '"¿Por una copa de barrio?"', kind: 'preguntar', next: 'node_porque_vos' },
            ],
        },
        node_porque_vos: {
            npcLine: 'Bracamonte suspira: "Porque el concejal me debe un favor a mí, y yo te lo cobro a vos. Así funciona esto, Fierro."',
            options: [{ id: 'seguir', label: '"Como siempre."', kind: 'preguntar', next: 'node_extraoficial' }],
        },
        node_extraoficial: {
            npcLine: 'Baja la voz, casi por costumbre: "Si esto se resuelve rápido y discreto, el concejal capaz se acuerda de vos con un sobre. Vos decidís."',
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
        npcId: 'toto_ferradas',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Toto no despega los ojos de la vereda de enfrente. "¡Fierro! Justo a tiempo. Anoche pasó algo raro justo ahí, frente al club."',
                options: [
                    {
                        id: 'preguntar_colectivo',
                        label: '"¿Qué viste, Toto?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_colectivo_21',
                        effects: { confianza: 5 },
                        responseLine: 'Un pibe salió corriendo del club con un bulto envuelto en arpillera y se subió a un colectivo de la línea 21. Iba lleno, pero se subió igual. Raro para alguien que se está escapando, ¿no?',
                    },
                    {
                        id: 'preguntar_aspecto',
                        label: '"¿Le viste bien la cara?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_campera_naranja',
                        effects: { confianza: 3 },
                        responseLine: 'La cara no, pero el pelo rubio se le veía desde acá. Y una campera naranja espantosa. Con ese pelo y esa campera, no debe ser difícil de encontrar.',
                    },
                ],
            },
        },
    },
    {
        npcId: 'gustavo_salerno',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Salerno te recibe con la misma sonrisa de siempre. "Fierro. ¿Ahora investigás trofeos deportivos? El negocio inmobiliario está más tranquilo, le aseguro."',
                options: [
                    {
                        id: 'preguntar_salerno3',
                        label: '"¿Sabés algo de una copa robada en Liniers?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_salerno_antiguedades',
                        effects: { confianza: 4 },
                        responseLine: 'Mmm. Un conocido mío, anticuario en San Telmo, me comentó que le ofrecieron "algo de plata, con una inscripción rara" esta semana. No pregunté más, por las dudas.',
                    },
                    { id: 'retirarse_salerno3', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'federico_salaberry',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Salaberry te recibe con el mismo maletín de siempre. "Inspector. Le adelanto que no represento a ningún club de barrio."',
                options: [
                    {
                        id: 'preguntar_salaberry3',
                        label: '"¿Conocés a algún utilero metido en problemas?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_salaberry_utilero',
                        effects: { confianza: 3 },
                        responseLine: 'No doy nombres. Pero le puedo decir que el "utilero" de ciertos clubes suele deberle plata a gente que no perdona las deudas de truco.',
                    },
                    { id: 'retirarse_salaberry3', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'armando_petrocelli',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Petrocelli afina el bandoneón antes de que puedas preguntar nada. "Tengo un tango nuevo. Habla de una combi que no encaja en la cuadra."',
                options: [
                    {
                        id: 'preguntar_petrocelli3',
                        label: '"¿Qué combi, Petrocelli?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_petrocelli_tango_trofeo',
                        effects: { confianza: 5 },
                        responseLine: 'Una combi Volkswagen, estacionada toda la noche frente al anticuario de la esquina. Nunca la había visto por acá. La escribí sin saber por qué, como siempre.',
                    },
                    {
                        id: 'pagar_trago3',
                        label: 'Le pagás un trago.',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        givesClueId: 'clue_petrocelli_tango_trofeo',
                        effects: { confianza: 9, corrupcion: 2 },
                        responseLine: 'Canta la estrofa completa, agradecido, con lujo de detalle sobre la combi Volkswagen.',
                    },
                ],
            },
        },
    },
    {
        npcId: 'walter_chiodi',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Walter espía por la persiana. "Un pibe raro pasó por acá. Las palomas lo vieron, obviamente."',
                options: [
                    {
                        id: 'preguntar_walter3',
                        label: '"¿Qué más viste, Walter?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_walter_ojos',
                        effects: { confianza: 4 },
                        responseLine: 'Ojos marrones, bien marrones, de esos que miran para todos lados menos al frente. Las cámaras-paloma no mienten, Fierro.',
                    },
                    { id: 'retirarse_walter3', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'nazareno_quiroga',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Naza casi te tira el grabador encima. "¡Fierro! Esto va a volarte la cabeza."',
                options: [
                    {
                        id: 'preguntar_naza3',
                        label: '"¿Qué escuchaste, Naza?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_naza_truco',
                        effects: { confianza: 5 },
                        responseLine: 'Un utilero de Liniers debe una fortuna en partidas de truco a gente de Los Administradores. Un "cuatro limpio" que le costó carísimo, literalmente. Esto está TODO conectado, Fierro.',
                    },
                    { id: 'burlarse_naza3', label: 'Te reís de la teoría.', kind: 'bromear', next: 'end', effects: { confianza: -5 }, responseLine: 'Reíte, reíte. Ya vas a ver quién tenía razón.' },
                ],
            },
        },
    },
    {
        npcId: 'egidio_paz',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Don Egidio levanta la vista del cuaderno un segundo. "Cuarenta y un autos hoy. Y un pibe comiendo bondiola en la parada, dos noches seguidas."',
                options: [
                    {
                        id: 'preguntar_egidio3',
                        label: '"¿Qué más notó de ese pibe?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_egidio_bondiola',
                        effects: { confianza: 5 },
                        responseLine: 'Bondiola con todo, dos noches seguidas, siempre en el mismo puesto. Yo todo lo anoto — le muestra el cuaderno, orgulloso.',
                    },
                    { id: 'retirarse_egidio3', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'manteca_ruiz',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Manteca te intercepta con el carrito. "¡Fierro! Justo lo que necesitaba, un cliente con criterio."',
                options: [
                    {
                        id: 'preguntar_manteca3',
                        label: '"¿Escuchaste algo de una copa robada?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_rumor_feria_once',
                        effects: { confianza: 4 },
                        responseLine: '¡Y cómo no! La vi con mis propios ojos en un puesto de La Feria, cambiada por relojes truchos. Se la juro, Fierro. Bueno, casi se la juro.',
                    },
                    { id: 'retirarse_manteca3', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
];

export const confrontacionDialogue: DialogueTree = {
    npcId: 'bocha_ferreyra',
    startNodeId: 'start',
    nodes: {
        start: {
            npcLine:
                'Encontrás al Bocha discutiendo el precio de la copa con el dueño del anticuario. "¡Fierro! Esto... esto es de mi tío. La tenía de recuerdo. Se la iba a devolver, eh. Después del asado de la revancha."',
            options: [
                {
                    id: 'arrestar3',
                    label: '"Quedás detenido, Bocha."',
                    kind: 'insistir',
                    next: 'end',
                    effects: { reputacionPolicial: 10, sospechaGlobal: -5 },
                    setsFlag: 'sospechoso_arrestado',
                    responseLine: 'El Bocha baja los hombros. "Total, en cana por lo menos no le debo la próxima partida a nadie."',
                },
                {
                    id: 'ofrecer_trato3',
                    label: '"¿Cuánto vale que no te vea?"',
                    kind: 'ofrecerFavor',
                    next: 'end',
                    effects: { corrupcion: 20, reputacionPolicial: -10 },
                    setsFlag: 'sospechoso_soborno',
                    responseLine: 'El Bocha sonríe, aliviado, y te ofrece "arreglar" con la mitad de lo que sacaría vendiendo la copa.',
                },
                {
                    id: 'intimidar3',
                    label: '"Hablá antes de que se te complique más."',
                    kind: 'intimidar',
                    next: 'end',
                    effects: { reputacionCallejera: 8, sospechaGlobal: 5, corrupcion: -5 },
                    setsFlag: 'sospechoso_intimidado',
                    responseLine: 'El Bocha habla de más, nervioso, y termina contando a quién le debe la deuda de truco que lo metió en esto.',
                },
                {
                    id: 'dejar_ir3',
                    label: '"Andate. Hoy no te vi."',
                    kind: 'retirarse',
                    next: 'end',
                    effects: { sospechaGlobal: 10 },
                    setsFlag: 'sospechoso_liberado',
                    responseLine: 'El Bocha desaparece entre los puestos de antigüedades sin mirar atrás.',
                },
            ],
        },
    },
};

export const falsoSospechosoDialogue: DialogueTree = {
    npcId: 'turco_almada',
    startNodeId: 'start',
    nodes: {
        start: {
            npcLine: 'Almada acomoda sus relojes falsificados sin inmutarse. "¿Copa de fútbol? Yo vendo relojes, oficial. Baratos, eso sí, pero relojes."',
            options: [
                {
                    id: 'arrestar_almada',
                    label: '"Esto no me cierra. Quedate ahí." (arrestarlo)',
                    kind: 'insistir',
                    next: 'end',
                    effects: { reputacionPolicial: -8, sospechaGlobal: 8 },
                    responseLine: 'Almada no lo puede creer y empieza a nombrar a un primo abogado.',
                    endsCase: true,
                },
                { id: 'dejarlo_trabajar3', label: '"Seguí con lo tuyo, disculpá."', kind: 'retirarse', next: 'end' },
            ],
        },
    },
};
