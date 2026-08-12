export interface CrimeFlavor {
    id: string;
    titulo: string;
    objetoRobado: string;
    victima: string;
    fechaHoraDelHecho: string;
    // Puede contener el token {operativoApodo}, reemplazado en generación.
    descripcionTemplate: string;
}

// Pool de "qué se robaron y a quién" para casos generados — deliberadamente
// distinto del contenido de los 3 casos fijos (medialunas, contador,
// trofeo), para que esos sigan sintiéndose como las historias "especiales"
// de arranque y lo generado nunca las repita ni las imite palabra por
// palabra.
export const CRIME_FLAVORS: readonly CrimeFlavor[] = [
    {
        id: 'recaudacion_kermes',
        titulo: 'La Recaudación de la Kermés',
        objetoRobado: 'La recaudación completa de la kermés solidaria del barrio, en un bolso de gimnasio',
        victima: 'La Comisión de Fomento del barrio',
        fechaHoraDelHecho: 'Anoche, justo cuando estaban por contar la plata',
        descripcionTemplate:
            'La kermés del barrio termina en escándalo cuando el bolso con toda la recaudación desaparece antes de que nadie la cuente. {operativoApodo} es, según todos, "la única persona que faltaba de la foto grupal" justo en ese momento.',
    },
    {
        id: 'camion_mercaderia',
        titulo: 'El Camión que Nunca Llegó',
        objetoRobado: 'Un camión entero de mercadería, con acoplado y todo',
        victima: 'Un depósito mayorista de la zona',
        fechaHoraDelHecho: 'Esta madrugada, entre el cambio de turno del sereno',
        descripcionTemplate:
            'El camión salió del depósito y nunca llegó a destino. En el libro de salidas, la firma de quien lo retiró es ilegible a propósito — pero varios coinciden en que caminaba como {operativoApodo}.',
    },
    {
        id: 'caja_chica_club',
        titulo: 'La Caja Chica del Club de Jubilados',
        objetoRobado: 'La caja chica del club de jubilados, guardada en una lata de galletitas',
        victima: 'El Club de Jubilados "Los Veteranos"',
        fechaHoraDelHecho: 'Ayer a la tarde, durante la partida de bingo',
        descripcionTemplate:
            'Nadie sospecha de nadie en un club de jubilados, hasta que falta la lata de galletitas con la caja chica. {operativoApodo} había venido "de visita" esa tarde, por primera y única vez.',
    },
    {
        id: 'repuestos_gomeria',
        titulo: 'Los Repuestos de la Gomería',
        objetoRobado: 'Un cargamento entero de repuestos de auto importados',
        victima: 'Una gomería y taller mecánico de la zona',
        fechaHoraDelHecho: 'Anteanoche, forzando el portón trasero del taller',
        descripcionTemplate:
            'Se llevaron los repuestos más caros del taller y dejaron los baratos, como si supieran exactamente qué buscaban. El dueño jura haber visto a {operativoApodo} rondando la cuadra esa semana.',
    },
    {
        id: 'rifa_solidaria',
        titulo: 'El Premio de la Rifa Solidaria',
        objetoRobado: 'El premio mayor de una rifa solidaria — un sobre con la plata de todos los números vendidos',
        victima: 'Un club de barrio organizando la rifa anual',
        fechaHoraDelHecho: 'Anoche, en medio del sorteo, con las luces cortadas por dos minutos',
        descripcionTemplate:
            'Cortaron la luz justo antes del sorteo y, cuando volvió, faltaba el sobre con la plata de los números vendidos. Alguien jura haber visto a {operativoApodo} cerca del tablero eléctrico.',
    },
    {
        id: 'documentacion_local',
        titulo: 'Los Papeles que Faltan',
        objetoRobado: 'Una carpeta con documentación comprometedora sobre "Los Administradores"',
        victima: 'Un contador independiente que trabajaba, sin saberlo, para la banda',
        fechaHoraDelHecho: 'Esta madrugada, en un local que ya había cerrado',
        descripcionTemplate:
            'El local ya estaba cerrado cuando alguien forzó la persiana y se llevó justo la carpeta que no debía. Todo apunta, otra vez, a {operativoApodo}.',
    },
];
