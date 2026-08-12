import { DialogueTree } from '../types';

// Todos los diálogos del Caso 1 viven acá (separado de caso1_medialunas.ts
// por tamaño de archivo). briefing = el jefe da el caso; confrontacion = el
// enfrentamiento final en el destino correcto; falsoSospechoso = lo mismo
// pero en un destino falso; dialogueTrees = el resto de los NPCs.

export const briefingDialogue: DialogueTree = {
    npcId: 'hugo_bracamonte',
    startNodeId: 'start',
    nodes: {
        start: {
            npcLine:
                'Bracamonte te tira el caso arriba del escritorio sin mirarte a los ojos: "Se nos perdió Contreras en medio del operativo de Terminal Sur. Si aparece muerto, es un escándalo. Si aparece vivo y hablando, es peor. Lo quiero resuelto, discreto y rápido."',
            options: [
                { id: 'aceptar', label: '"Entendido."', kind: 'preguntar', next: 'node_extraoficial' },
                { id: 'preguntar_porque_yo', label: '"¿Por qué yo?"', kind: 'preguntar', next: 'node_porque_vos' },
            ],
        },
        node_porque_vos: {
            npcLine: 'Bracamonte se encoge de hombros: "Porque nadie más te va a extrañar si esto sale mal."',
            options: [{ id: 'seguir', label: '"Reconfortante."', kind: 'preguntar', next: 'node_extraoficial' }],
        },
        node_extraoficial: {
            npcLine: 'Antes de que te vayas, baja la voz: "Si esto se resuelve... extraoficialmente, hay un sobre para vos. Nadie se entera."',
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
        npcId: 'simon_achaval',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Simón acomoda latas de gaseosa sin mirarte. "¿Qué anda buscando, Fierro?"',
                options: [
                    {
                        id: 'preguntar_medialunas',
                        label: '"¿Vio a Contreras esa noche?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_kiosco_medialunas',
                        effects: { confianza: 5 },
                        responseLine: 'Vino, compró tres docenas de medialunas. Dijo que iba a ver a los del Delta antes de que se enfriaran. Nunca entendí ese apuro.',
                    },
                    {
                        id: 'bromear',
                        label: 'Le hacés un chiste sobre el precio de las medialunas.',
                        kind: 'bromear',
                        next: 'end',
                        givesClueId: 'clue_kiosco_medialunas',
                        effects: { confianza: 8 },
                        responseLine: 'Se ríe y, entre risas, te cuenta lo de las medialunas y el Delta igual.',
                    },
                    { id: 'retirarse', label: 'Te vas sin preguntar nada.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'aldo_reissig',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Reissig relee el libro de guardia por décima vez. "Turno raro, esa noche."',
                options: [
                    { id: 'preguntar_hora', label: '"¿A qué hora terminó el operativo?"', kind: 'preguntar', next: 'node_evasivo', effects: { confianza: 3 } },
                    { id: 'ofrecer_favor', label: '"Yo te cubro la próxima guardia, decime la verdad."', kind: 'ofrecerFavor', next: 'node_evasivo', effects: { confianza: 15, corrupcion: 3 } },
                    { id: 'insistir', label: '"Dale, Aldo, en serio."', kind: 'insistir', next: 'node_evasivo', effects: { confianza: 6 } },
                ],
            },
            node_evasivo: {
                npcLine: 'Reissig duda, mirando la puerta.',
                options: [
                    {
                        id: 'pedir_confirmacion',
                        label: '"¿Es la hora que dice el libro?"',
                        kind: 'preguntar',
                        next: 'end',
                        requiresConfianzaMin: 55,
                        givesClueId: 'clue_libro_guardia',
                        effects: { confianza: 5 },
                        responseLine: 'No. El libro dice 02:14. Fue pasadas las 03:00. Yo mismo tapé esa media hora, no me pregunten por qué.',
                    },
                    {
                        id: 'no_suelta',
                        label: '"No consigo que se abra del todo."',
                        kind: 'preguntar',
                        next: 'end',
                        responseLine: 'Volvé cuando tengamos más confianza, pibe.',
                    },
                ],
            },
        },
    },
    {
        npcId: 'armando_petrocelli',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Petrocelli canta un fragmento de tango inventado antes de que puedas preguntar nada.',
                options: [
                    {
                        id: 'preguntar_tango',
                        label: '"¿De qué habla esa canción?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_tango_lancha',
                        effects: { confianza: 5 },
                        responseLine: 'Habla de una lancha que no vuelve... la escribí pensando en el Muelle La Anguila, allá en el Delta. No sé por qué se me vino a la cabeza esta semana.',
                    },
                    {
                        id: 'pagar_trago',
                        label: 'Le pagás un trago.',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        givesClueId: 'clue_tango_lancha',
                        effects: { confianza: 10, corrupcion: 2 },
                        responseLine: 'Canta otra estrofa, más contento, y remata la idea de la lancha que no vuelve.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'cacho_domenech',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Cacho te reconoce enseguida: "¡Fierro! ¿Otra vez laburando de noche?"',
                options: [
                    { id: 'preguntar_viajes', label: '"¿Llevaste a alguien raro esta semana?"', kind: 'preguntar', next: 'node_duda', effects: { confianza: 5 } },
                    {
                        id: 'mostrar_evidencia',
                        label: 'Le mostrás una foto de "Pampa" Ledesma.',
                        kind: 'mostrarEvidencia',
                        next: 'end',
                        givesClueId: 'clue_remise_pampa',
                        effects: { confianza: 5 },
                        responseLine: 'Ah, a este lo llevé hasta el muelle de La Anguila. Me pagó bien para no acordarme, pero vos me caés mejor que la plata.',
                    },
                ],
            },
            node_duda: {
                npcLine: 'Cacho duda: "Puede ser... ¿por qué preguntás?"',
                options: [
                    {
                        id: 'insistir_pago',
                        label: '"Te lo hago valer la próxima vez que te pare Tránsito."',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        givesClueId: 'clue_remise_pampa',
                        effects: { confianza: 8, corrupcion: 3 },
                        responseLine: 'Dicho y hecho. Lo llevé hasta el muelle de La Anguila.',
                    },
                    { id: 'no_insistir', label: '"Nada, curiosidad."', kind: 'retirarse', next: 'end', responseLine: 'Ta bien, quedate tranquilo.' },
                ],
            },
        },
    },
    {
        npcId: 'nazareno_quiroga',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Naza te agarra del brazo: "¡Fierro! Tenés que escuchar esto!"',
                options: [
                    {
                        id: 'preguntar_camioneta',
                        label: '"¿Qué viste, Naza?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_camioneta_blanca',
                        effects: { confianza: 5 },
                        responseLine: 'Una camioneta blanca, sin patente visible, saliendo de Terminal Sur pasada la medianoche. No era policía. No era de la banda. Era ALGO MÁS.',
                    },
                    { id: 'burlarse', label: 'Te reís de la teoría.', kind: 'bromear', next: 'end', effects: { confianza: -5 }, responseLine: 'Reíte, reíte. Ya vas a ver.' },
                ],
            },
        },
    },
    {
        npcId: 'marina_ithurbide',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Ithurbide te mira con desconfianza. "¿Necesita algo, inspector?"',
                options: [
                    {
                        id: 'preguntar_patrulleros',
                        label: '"¿Movieron patrulleros esa noche?"',
                        kind: 'preguntar',
                        next: 'end',
                        requiresReputacionPolicialMin: 60,
                        effects: { confianza: 5 },
                        responseLine: 'Sí. Uno no estaba donde debía. No voy a decir más sin una orden.',
                    },
                    {
                        id: 'preguntar_descripcion',
                        label: '"¿Qué decía la descripción del registro?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_descripcion_ithurbide',
                        effects: { confianza: 3 },
                        responseLine: 'Pelo negro. Eso figura, al menos. El resto del formulario está incompleto, como todo acá.',
                    },
                    {
                        id: 'insistir_sin_reputacion',
                        label: 'Insistís igual.',
                        kind: 'insistir',
                        next: 'end',
                        responseLine: 'No tengo nada para decirle, inspector.',
                    },
                ],
            },
        },
    },
    {
        npcId: 'federico_salaberry',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Salaberry te recibe en la puerta de su estudio, maletín en mano. "¿Otra vez usted, inspector? No tengo comentarios sobre nada."',
                options: [
                    {
                        id: 'preguntar_nombre',
                        label: '"Solo quiero un nombre."',
                        kind: 'preguntar',
                        next: 'end',
                        effects: { confianza: -2 },
                        responseLine: 'Sonríe. "Los nombres son información privilegiada. Como todo lo demás."',
                    },
                    {
                        id: 'intimidar_orden',
                        label: '"Puedo conseguir una orden."',
                        kind: 'intimidar',
                        next: 'end',
                        effects: { confianza: -5, sospechaGlobal: 3 },
                        responseLine: 'Consígala. Mientras tanto, con permiso.',
                    },
                    {
                        id: 'mentir_cliente',
                        label: '"Vengo de parte de uno de sus clientes."',
                        kind: 'mentir',
                        next: 'end',
                        effects: { confianza: 3, sospechaGlobal: 2 },
                        responseLine: 'Te mira un segundo de más. "No sé de qué me habla." Pero por primera vez, duda.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'hombre_de_las_palomas',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: "El hombre les tira migas a las palomas sin mirarte. \"Las palomas saben todo. El problema es que no hablan en cristiano.\"",
                options: [
                    {
                        id: 'preguntar_palomas',
                        label: '"¿Vio algo raro estos días?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_acertijo_palomas',
                        effects: { confianza: 5 },
                        responseLine: 'Una paloma volvió tres veces al mismo techo, en Villa Quieta. Eso no es normal. Ni para paloma ni para gente.',
                    },
                    {
                        id: 'bromear_palomas',
                        label: 'Le seguís la corriente sobre las palomas.',
                        kind: 'bromear',
                        next: 'end',
                        givesClueId: 'clue_acertijo_palomas',
                        effects: { confianza: 8 },
                        responseLine: 'Se ríe, contento de que alguien le crea, y suelta el mismo dato sobre el techo de Villa Quieta.',
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
                npcLine: 'Marta sella un papel que nadie pidió. "Ventanilla tres. Puede pasar."',
                options: [
                    {
                        id: 'preguntar_tramites',
                        label: '"¿Vio pasar algo raro por acá?"',
                        kind: 'preguntar',
                        next: 'end',
                        effects: { confianza: 3 },
                        responseLine: 'Acá lo único raro es que un trámite salga el mismo día que se pide.',
                    },
                    {
                        id: 'ofrecer_favor_tramite',
                        label: 'Le ofrecés agilizarle un trámite personal.',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        effects: { confianza: 10, corrupcion: 2 },
                        responseLine: 'Se ilumina. "Ahora que lo dice... había un formulario mal archivado. Se lo busco para la próxima."',
                    },
                    {
                        id: 'insistir_marta',
                        label: '"Marta, en serio."',
                        kind: 'insistir',
                        next: 'end',
                        effects: { confianza: 1 },
                        responseLine: 'En serio le digo que acá no pasa nada, oficial. Tome un caramelo.',
                    },
                ],
            },
        },
    },
    {
        npcId: 'pipo_escanciano',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Pipo no levanta la vista de la parrilla. "Sentate. ¿Vas a comer o vas a preguntar?"',
                options: [
                    {
                        id: 'preguntar_pipo',
                        label: '"¿Vino alguien raro esta semana?"',
                        kind: 'preguntar',
                        next: 'end',
                        effects: { confianza: 4 },
                        responseLine: 'Acá vienen puros policías raros, Fierro. Vos incluido.',
                    },
                    {
                        id: 'ofrecer_favor_pipo',
                        label: 'Le pagás una ronda de achuras para "aflojarle la lengua".',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        effects: { confianza: 6, corrupcion: 1 },
                        responseLine: 'Come en silencio un rato largo. "No vi nada. Pero la carne estaba buena, ¿no?"',
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
                npcLine: 'Sagasti te mira con una mezcla de fastidio y respeto. "¿Vos también en esto, Fierro?"',
                options: [
                    {
                        id: 'preguntar_sagasti',
                        label: '"¿Tenés algo que yo no tenga?"',
                        kind: 'preguntar',
                        next: 'end',
                        effects: { confianza: 3, sospechaGlobal: 1 },
                        responseLine: 'Si lo tuviera, ¿por qué te lo iba a decir? Pero no lo niega del todo.',
                    },
                    {
                        id: 'intimidar_sagasti',
                        label: '"Esto es mío, Sagasti."',
                        kind: 'intimidar',
                        next: 'end',
                        effects: { confianza: -6, reputacionCallejera: 3 },
                        responseLine: 'Se ríe. "Ah, mirá vos. Bueno, suerte con eso." Se va sin ayudarte.',
                    },
                    {
                        id: 'ofrecer_favor_sagasti',
                        label: '"Compartimos lo que encontremos, ¿va?"',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        effects: { confianza: 8 },
                        responseLine: 'Trato hecho. No te acostumbres.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'media_cuadra_ibanez',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: '"Media Cuadra" te ve y ya levanta las manos. "Yo no fui, sea lo que sea."',
                options: [
                    {
                        id: 'intimidar_media_cuadra',
                        label: '"Contame lo que sabés de Los Administradores."',
                        kind: 'intimidar',
                        next: 'end',
                        effects: { confianza: -3, sospechaGlobal: 2 },
                        responseLine: 'Traga saliva. "Sé que no conviene deberles plata. Nada más, se lo juro."',
                    },
                    {
                        id: 'bromear_media_cuadra',
                        label: '"Tranquilo, no vine por vos esta vez."',
                        kind: 'bromear',
                        next: 'end',
                        effects: { confianza: 7 },
                        responseLine: 'Se relaja. "Ah, menos mal. Mirá, corre el rumor de que andan reacomodando gente en el Delta."',
                    },
                    {
                        id: 'mostrar_evidencia_media_cuadra',
                        label: 'Le mostrás una foto de Contreras.',
                        kind: 'mostrarEvidencia',
                        next: 'end',
                        effects: { confianza: 5 },
                        responseLine: '¿Ese? Dicen que se cortó solo antes de que lo auditaran. Yo no sé qué es auditar, pero suena feo.',
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
                npcLine: 'Yamila no levanta la vista de la notebook. "Fierro. Si es por la multa, ya te dije que la voy a pagar."',
                options: [
                    {
                        id: 'ofrecer_favor_yamila',
                        label: '"Te la olvido si me ayudás con algo."',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        effects: { confianza: 10, corrupcion: 2 },
                        responseLine: 'Trato clásico. ¿Qué necesitás? — te tira un dato suelto sobre movimientos raros de plata en una inmobiliaria de Palo Alto.',
                    },
                    {
                        id: 'preguntar_yamila',
                        label: '"¿Escuchaste algo de Los Administradores?"',
                        kind: 'preguntar',
                        next: 'end',
                        effects: { confianza: 4 },
                        responseLine: 'Lo suficiente para no querer escuchar más. Esa gente audita en serio.',
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
                npcLine: 'Don Egidio no despega los ojos de la calle. "Setenta y dos autos hoy. Ayer fueron sesenta y ocho."',
                options: [
                    {
                        id: 'preguntar_egidio',
                        label: '"¿Anotó algo raro últimamente?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_cuaderno_patentes',
                        effects: { confianza: 6 },
                        responseLine: 'Un Peugeot 504, dos veces la misma semana, siempre a la misma hora, cerca de la terminal. Yo todo lo anoto — le muestra el cuaderno.',
                    },
                    {
                        id: 'insistir_egidio',
                        label: '"Necesito que sea más específico."',
                        kind: 'insistir',
                        next: 'end',
                        givesClueId: 'clue_cuaderno_patentes',
                        effects: { confianza: 2 },
                        responseLine: 'Suspira y repite lo mismo, palabra por palabra, como si ya lo hubiera dicho mil veces.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'manteca_ruiz',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Manteca te ofrece un paraguas sin que se lo pidas. "Para cuando llueva, tenga."',
                options: [
                    {
                        id: 'preguntar_manteca',
                        label: '"¿Escuchaste algo por la feria?"',
                        kind: 'preguntar',
                        next: 'end',
                        effects: { confianza: 3 },
                        responseLine: 'Escucho de todo. La mitad es mentira, y no sé cuál mitad.',
                    },
                    {
                        id: 'ofrecer_favor_manteca',
                        label: 'Le comprás el paraguas.',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        effects: { confianza: 8, corrupcion: 1 },
                        responseLine: 'Ahora sí hablamos — te cuenta un rumor sin confirmar sobre plata que se mueve por Palo Alto.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'walter_chiodi',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Walter te habla en susurros desde atrás de la persiana. "Las palomas nos filman. A todos."',
                options: [
                    {
                        id: 'preguntar_walter',
                        label: '"¿Vio algo con Contreras?"',
                        kind: 'preguntar',
                        next: 'end',
                        givesClueId: 'clue_camaras_palomas',
                        effects: { confianza: 4 },
                        responseLine: 'Las palomas no mienten porque no son palomas: son cámaras. Y las cámaras vieron todo en Km 20, se lo aseguro.',
                    },
                    {
                        id: 'bromear_walter',
                        label: 'Le seguís la broma de las cámaras.',
                        kind: 'bromear',
                        next: 'end',
                        givesClueId: 'clue_camaras_palomas',
                        effects: { confianza: 9 },
                        responseLine: 'Encantado de que alguien le crea. Repite lo de Km 20 con más convicción todavía.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'gustavo_salerno',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Salerno te recibe con un café que no pediste. "Fierro. ¿Departamento, oficina, o algo más discreto?"',
                options: [
                    {
                        id: 'preguntar_salerno',
                        label: '"¿Algún cliente raro últimamente?"',
                        kind: 'preguntar',
                        next: 'end',
                        effects: { confianza: 2 },
                        responseLine: 'Todos mis clientes son gente seria — miente con total tranquilidad.',
                    },
                    {
                        id: 'mostrar_evidencia_salerno',
                        label: 'Le mostrás papeles de una cuenta compartida con Los Administradores.',
                        kind: 'mostrarEvidencia',
                        next: 'end',
                        givesClueId: 'clue_cuenta_compartida',
                        effects: { confianza: -5, sospechaGlobal: 4 },
                        responseLine: 'Se pone pálido. "Eso... eso es un malentendido contable. Se lo puedo explicar." No lo explica.',
                    },
                    {
                        id: 'ofrecer_favor_salerno',
                        label: '"Esto queda entre nosotros si colaborás."',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        givesClueId: 'clue_cuenta_compartida',
                        effects: { confianza: 10, corrupcion: 8 },
                        responseLine: 'Ahora hablamos el mismo idioma — le desliza unos papeles.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
    {
        npcId: 'beba_corvalan',
        startNodeId: 'start',
        nodes: {
            start: {
                npcLine: 'Beba tiene la ventanilla baja y el mate a punto. "¿Subís o preguntás desde ahí?"',
                options: [
                    {
                        id: 'preguntar_beba',
                        label: '"¿Llevaste a algún pasajero raro?"',
                        kind: 'preguntar',
                        next: 'end',
                        effects: { confianza: 5 },
                        responseLine: 'Rarísimo no, pero uno me pidió ir al Delta a las tres de la mañana. Le cobré doble por el horario.',
                    },
                    {
                        id: 'ofrecer_favor_beba',
                        label: '"Te perdono la próxima infracción."',
                        kind: 'ofrecerFavor',
                        next: 'end',
                        givesClueId: 'clue_testigo_beba',
                        effects: { confianza: 8, corrupcion: 2 },
                        responseLine: 'Trato hecho. Ese pasajero hablaba solo, algo de una auditoría, y tenía unos ojos marrones que no te miraban de frente. No entendí nada más.',
                    },
                    { id: 'retirarse', label: 'Te vas.', kind: 'retirarse', next: 'end' },
                ],
            },
        },
    },
];

export const confrontacionDialogue: DialogueTree = {
    npcId: 'el_ingeniero_contreras',
    startNodeId: 'start',
    nodes: {
        start: {
            npcLine:
                'Encontrás a Contreras escondido detrás de unos bidones en el Muelle La Anguila. "No me busques problemas, Fierro. Me escapé antes de que La Directora me mandara a auditar. En esa banda, auditar es un decir."',
            options: [
                {
                    id: 'arrestar',
                    label: '"Quedás detenido, Contreras."',
                    kind: 'insistir',
                    next: 'end',
                    effects: { reputacionPolicial: 10, sospechaGlobal: -5 },
                    setsFlag: 'sospechoso_arrestado',
                    responseLine: 'Contreras no opone resistencia. "Total, adentro por lo menos como caliente."',
                },
                {
                    id: 'ofrecer_trato',
                    label: '"¿Cuánto vale que no te vea?"',
                    kind: 'ofrecerFavor',
                    next: 'end',
                    effects: { corrupcion: 20, reputacionPolicial: -10 },
                    setsFlag: 'sospechoso_soborno',
                    responseLine: 'Contreras sonríe, aliviado, y te pasa un fajo de billetes húmedos por la humedad del río.',
                },
                {
                    id: 'intimidar',
                    label: '"Hablá antes de que se te acaben las excusas."',
                    kind: 'intimidar',
                    next: 'end',
                    effects: { reputacionCallejera: 8, sospechaGlobal: 5, corrupcion: -5 },
                    setsFlag: 'sospechoso_intimidado',
                    responseLine: 'Contreras habla de más, nervioso, y termina contándote más de lo que necesitabas saber sobre La Directora.',
                },
                {
                    id: 'dejar_ir',
                    label: '"Andate. Hoy no te vi."',
                    kind: 'retirarse',
                    next: 'end',
                    effects: { sospechaGlobal: 10 },
                    setsFlag: 'sospechoso_liberado',
                    responseLine: 'Contreras desaparece entre los juncos sin decir gracias.',
                },
            ],
        },
    },
};

export const falsoSospechosoDialogue: DialogueTree = {
    npcId: 'camionero_catering',
    startNodeId: 'start',
    nodes: {
        start: {
            npcLine:
                'Un camionero descarga cajas de facturas frente al galpón. "¿Puedo ayudarlo, oficial? Tengo que llegar a un cumpleaños de 15 en Villa Quieta."',
            options: [
                {
                    id: 'arrestar_camionero',
                    label: '"Quedate ahí. Esto no me cierra." (arrestarlo)',
                    kind: 'insistir',
                    next: 'end',
                    effects: { reputacionPolicial: -8, sospechaGlobal: 8 },
                    responseLine: 'El camionero no entiende nada y empieza a mencionar a un abogado.',
                    endsCase: true,
                },
                { id: 'dejarlo_trabajar', label: '"Seguí con lo tuyo, disculpá."', kind: 'retirarse', next: 'end' },
            ],
        },
    },
};
