// Modelos de datos puros. Nada acá depende de Phaser ni de systems/.

export interface Zone {
    id: string;
    nombre: string;
    descripcion: string;
}

export interface Location {
    id: string;
    zoneId: string;
    nombre: string;
    descripcion: string;
    npcIds: string[];
}

export type ClueCategoria =
    | 'geografica'
    | 'temporal'
    | 'cultural'
    | 'visual'
    | 'economica'
    | 'criminal'
    | 'absurda'
    | 'falsa'
    | 'contradictoria';

// Atributos del identikit del sospechoso (Crime Computer / Sistema de
// Inteligencia Criminal). Cada pista puede revelar como máximo uno.
export interface SuspectAttributes {
    cabello: string;
    ojos: string;
    vehiculo: string;
    profesion: string;
    hobby: string;
    comida: string;
}

export type SuspectAttributeKey = keyof SuspectAttributes;

export interface SuspectAttributeReveal {
    key: SuspectAttributeKey;
    value: string;
}

export interface Clue {
    id: string;
    descripcion: string;
    ubicacionZoneId: string;
    npcId?: string;
    categoria: ClueCategoria;
    relevancia: 'alta' | 'media' | 'baja';
    confiabilidad: number; // 0-100
    destinosPosibles: string[]; // zoneIds sugeridos por esta pista
    esFalsa: boolean;
    // si es falsa, qué pista real la contradice (para poder descartarla por deducción)
    contradiceConClueId?: string;
    // Si esta pista aporta un dato al identikit del sospechoso (Crime Computer)
    revealsAttribute?: SuspectAttributeReveal;
}

// Base de sospechosos ficticios para el Sistema de Inteligencia Criminal.
// El "caco" real de un caso es una entrada acá cuyo id coincide con
// CaseDefinition.sospechosoId; el resto son señuelos para que filtrar por
// atributos sea una deducción real, no trivial.
export interface SuspectProfile {
    id: string; // coincide con un NPC id cuando el sospechoso es confrontable
    nombreClave: string;
    atributos: SuspectAttributes;
}

export interface Rank {
    id: string;
    titulo: string;
    // casos resueltos con éxito necesarios para alcanzar este rango
    casosRequeridos: number;
}

export interface NPC {
    id: string;
    nombre: string;
    apodo: string;
    edadAproximada: number;
    personalidad: string;
    apariencia: string;
    vozConceptual: string;
    relacionProtagonista: string;
    zoneId: string;
    infoQueConoce: string;
    infoQueOculta: string;
    puedeMentir: boolean;
}

export type DialogueEffectSet = Partial<{
    confianza: number;
    sospechaNpc: number;
    reputacionPolicial: number;
    reputacionCallejera: number;
    corrupcion: number;
    sospechaGlobal: number;
}>;

export type InterrogationKind =
    | 'preguntar'
    | 'insistir'
    | 'intimidar'
    | 'bromear'
    | 'mentir'
    | 'mostrarEvidencia'
    | 'ofrecerFavor'
    | 'retirarse';

export interface DialogueOption {
    id: string;
    label: string;
    kind: InterrogationKind;
    requiresClueId?: string;
    requiresConfianzaMin?: number;
    requiresFlagAbsent?: string;
    requiresFlagPresent?: string;
    requiresReputacionPolicialMin?: number;
    requiresReputacionCallejeraMin?: number;
    requiresCorrupcionMax?: number;
    effects?: DialogueEffectSet;
    givesClueId?: string;
    setsFlag?: string;
    next: string | 'end';
    responseLine?: string;
    // Si es true, esta elección específica cierra el caso (se resuelve el
    // final) aunque la escena de diálogo no sea la confrontación principal.
    endsCase?: boolean;
}

export interface DialogueNode {
    npcLine: string;
    options: DialogueOption[];
}

export interface DialogueTree {
    npcId: string;
    startNodeId: string;
    nodes: Record<string, DialogueNode>;
}

export interface RandomEventDef {
    id: string;
    titulo: string;
    descripcion: string;
    zoneIds?: string[]; // si está vacío, puede pasar en cualquier zona
}

export interface CaseEnding {
    id: string;
    titulo: string;
    descripcion: string;
}

export interface CaseDefinition {
    id: string;
    titulo: string;
    descripcion: string;
    // Datos del reporte policial (ReportScene)
    objetoRobado: string;
    victima: string;
    fechaHoraDelHecho: string;
    sospechosoId: string;
    zonaInicial: string;
    deadlineMinutos: number;
    clues: Clue[];
    cluesRequeridasParaResolver: string[];
    // Ruta del caco: zonas en orden, de la escena del crimen (ruta[0], debe
    // coincidir con zonaInicial) a la parada final (ruta[último], debe
    // coincidir con destinoCorrectoZoneId). El jugador debe reconstruirla
    // parada por parada en el Pizarrón — no es un salto directo.
    ruta: string[];
    destinoCorrectoZoneId: string;
    destinosFalsosZoneIds: string[];
    dialogueTrees: DialogueTree[];
    finales: CaseEnding[];
    briefingDialogue: DialogueTree; // diálogo inicial del jefe que da el caso
    confrontacionDialogue: DialogueTree; // diálogo final en el destino correcto
    // Confrontación alternativa disponible en un destino falso, para que
    // "sospechoso equivocado" sea un final alcanzable jugando, no solo por debug.
    falsoSospechosoId?: string;
    falsoSospechosoDialogue?: DialogueTree;
}

export interface GangMember {
    id: string;
    nombre: string;
    apodo: string;
    rol: string;
    descripcion: string;
}
