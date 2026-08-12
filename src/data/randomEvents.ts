import { RandomEventDef } from './types';

// Eventos aleatorios menores que se pueden disparar al explorar. Son
// puramente narrativos por ahora (sin efecto mecánico) — ver ROADMAP.md
// para la idea de ligarlos a consecuencias reales en una fase posterior.
export const RANDOM_EVENTS: RandomEventDef[] = [
    { id: 'corte_calle', titulo: 'Corte de calle', descripcion: 'Un corte de calle totalmente injustificado te retiene un rato mirando bombos de murga.' },
    { id: 'manifestacion', titulo: 'Manifestación', descripcion: 'Una manifestación por una causa que nadie sabe explicar bien te corta el paso.' },
    { id: 'colectivo_no_llega', titulo: 'El colectivo que nunca llega', descripcion: 'Esperás un colectivo que, según la app, "está por llegar" desde hace veinte minutos.' },
    { id: 'policia_pide_indicaciones', titulo: 'Un colega perdido', descripcion: 'Un policía de otra comisaría te para para pedirte indicaciones. Es incómodo para los dos.' },
    { id: 'aparicion_random', titulo: 'Alguien de la nada', descripcion: 'Un tipo aparece de la nada, te dice "vos sabés lo que hiciste" y se va caminando tranquilo.' },
    { id: 'perro_sigue', titulo: 'Un perro te sigue', descripcion: 'Un perro callejero decide que ahora sos su responsabilidad. Te sigue dos cuadras y se aburre.' },
    { id: 'llamada_equivocada', titulo: 'Llamada equivocada', descripcion: 'Te suena el teléfono. Es para otro Fierro, de otro barrio, con otro quilombo.' },
    { id: 'operativo_ajeno', titulo: 'Operativo ajeno', descripcion: 'Te cruzás con un operativo que no tiene absolutamente nada que ver con tu caso, pero te retrasa igual.' },
    { id: 'confusion_identidad', titulo: 'Te confunden', descripcion: 'Alguien te confunde con "el de la inmobiliaria" y te reclama por un departamento que nunca existió.' },
];
