// Mapa de retratos generados (ver docs/ART_DIRECTION.md → TODO_ASSET).
// Un NPC sin entrada acá simplemente no muestra retrato en el diálogo — no
// es un error, es contenido pendiente de generar. Ver herramienta usada en
// tools/generate_art.py.
export const PROTAGONIST_PORTRAIT_KEY = 'character_police_main_portrait';

export const NPC_PORTRAITS: Record<string, string> = {
    hugo_bracamonte: 'npc_hugo_bracamonte_portrait',
    simon_achaval: 'npc_simon_achaval_portrait',
    aldo_reissig: 'npc_aldo_reissig_portrait',
    armando_petrocelli: 'npc_armando_petrocelli_portrait',
    nazareno_quiroga: 'npc_nazareno_quiroga_portrait',
    marina_ithurbide: 'npc_marina_ithurbide_portrait',
    el_ingeniero_contreras: 'npc_el_ingeniero_contreras_portrait',
    camionero_catering: 'npc_camionero_catering_portrait',
    chiche_molina: 'npc_chiche_molina_portrait',
    toto_ferradas: 'npc_toto_ferradas_portrait',
    bocha_ferreyra: 'npc_bocha_ferreyra_portrait',
    turco_almada: 'npc_turco_almada_portrait',
    colorada_benitez: 'npc_colorada_benitez_portrait',
    media_lengua_vidal: 'npc_media_lengua_vidal_portrait',
    tuerto_ibarra: 'npc_tuerto_ibarra_portrait',
};

export const LOCATION_BACKGROUNDS: Record<string, string> = {
    kiosco_simon: 'location_kiosco_simon_background',
    muelle_anguila: 'location_muelle_anguila_background',
    comisaria_0: 'location_comisaria_0_background',
    concesionaria_el_rebusque: 'location_concesionaria_rebusque_background',
};

export function getPortraitKey(npcId: string): string | undefined {
    return NPC_PORTRAITS[npcId];
}

export function getBackgroundKey(locationId: string): string | undefined {
    return LOCATION_BACKGROUNDS[locationId];
}
