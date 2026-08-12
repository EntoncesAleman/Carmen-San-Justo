// Pool de "informantes civiles" que el generador puede usar como testigos
// en un caso generado: dan la pista de la próxima parada de la ruta y/o un
// atributo del identikit. Excluye a propósito a los operativos (candidatos
// a caco), los señuelos (falso sospechoso) y a Bracamonte (siempre es el
// jefe que da el caso, nunca un testigo de calle).
//
// Cada zona listada acá tiene AL MENOS un informante — eso es lo que
// permite generar una ruta y garantizar que, al llegar a cada parada
// intermedia, haya alguien ahí con la pista de por dónde sigue el caco
// (ver CaseGenerator.ts). Las zonas SIN informante (la_ribera, la_feria,
// barrio_fabrica, la_cervecera, km_20, el_delta, barranca_norte) solo se
// usan como parada FINAL o como destino falso, nunca como parada
// intermedia — mismo patrón que ya usaban los 3 casos fijos (El Delta y
// Km 20 están vacíos de NPCs estáticos a propósito).
export const INFORMANT_NPC_IDS: readonly string[] = [
    'aldo_reissig',
    'marina_ithurbide',
    'nazareno_quiroga',
    'simon_achaval',
    'beba_corvalan',
    'federico_salaberry',
    'hombre_de_las_palomas',
    'marta_yulis',
    'armando_petrocelli',
    'cacho_domenech',
    'pipo_escanciano',
    'perla_sagasti',
    'media_cuadra_ibanez',
    'yamila_cospito',
    'egidio_paz',
    'manteca_ruiz',
    'walter_chiodi',
    'gustavo_salerno',
    'toto_ferradas',
];
