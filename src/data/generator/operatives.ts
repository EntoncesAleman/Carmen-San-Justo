// Pool de "operativos de campo" que el generador de casos puede asignar
// como EL caco de una partida generada. Cada uno ya tiene: un NPC jugable
// (data/npcs.ts, con retrato si existe), un perfil de atributos para el
// identikit (data/suspects.ts) y aparece como sospechoso confrontable en
// alguno de los casos fijos — acá se reutilizan esas mismas identidades en
// vez de inventar personajes nuevos sin cara ni voz.
//
// Narrativamente: no siempre el mismo tipo hace el mismo trabajo para "Los
// Administradores" — un operativo puede terminar mandado a cualquier
// laburo, no solo al que ya conocés de un caso fijo.
export const OPERATIVE_NPC_IDS: readonly string[] = ['el_ingeniero_contreras', 'chiche_molina', 'bocha_ferreyra'];
