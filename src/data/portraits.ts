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
    beba_corvalan: 'npc_beba_corvalan_portrait',
    cacho_domenech: 'npc_cacho_domenech_portrait',
    egidio_paz: 'npc_egidio_paz_portrait',
    federico_salaberry: 'npc_federico_salaberry_portrait',
    gustavo_salerno: 'npc_gustavo_salerno_portrait',
    hombre_de_las_palomas: 'npc_hombre_de_las_palomas_portrait',
    manteca_ruiz: 'npc_manteca_ruiz_portrait',
    marta_yulis: 'npc_marta_yulis_portrait',
    media_cuadra_ibanez: 'npc_media_cuadra_ibanez_portrait',
    perla_sagasti: 'npc_perla_sagasti_portrait',
    pescador_aguirre: 'npc_pescador_aguirre_portrait',
    pipo_escanciano: 'npc_pipo_escanciano_portrait',
    walter_chiodi: 'npc_walter_chiodi_portrait',
    yamila_cospito: 'npc_yamila_cospito_portrait',
};

export const LOCATION_BACKGROUNDS: Record<string, string> = {
    kiosco_simon: 'location_kiosco_simon_background',
    muelle_anguila: 'location_muelle_anguila_background',
    comisaria_0: 'location_comisaria_0_background',
    concesionaria_el_rebusque: 'location_concesionaria_rebusque_background',
    anden_4: 'location_anden_4_background',
    bar_fantasma: 'location_bar_fantasma_background',
    boliche_marejada: 'location_boliche_marejada_background',
    central_cacho: 'location_central_cacho_background',
    club_remo_barranca: 'location_club_remo_barranca_background',
    club_ribera: 'location_club_ribera_background',
    delegacion_villa_quieta: 'location_delegacion_villa_quieta_background',
    estacion_fantasma: 'location_estacion_fantasma_background',
    galeria_feria: 'location_galeria_feria_background',
    galpon_fabrica: 'location_galpon_fabrica_background',
    galpon_televisores: 'location_galpon_televisores_background',
    inmobiliaria_salerno: 'location_inmobiliaria_salerno_background',
    lavadero_brillo_total: 'location_lavadero_brillo_total_background',
    lo_de_pipo: 'location_lo_de_pipo_background',
    peluqueria_bochin: 'location_peluqueria_bochin_background',
    plaza_lomas_bajas: 'location_plaza_lomas_bajas_background',
    porton_cervecera: 'location_porton_cervecera_background',
};

export function getPortraitKey(npcId: string): string | undefined {
    return NPC_PORTRAITS[npcId];
}

export function getBackgroundKey(locationId: string): string | undefined {
    return LOCATION_BACKGROUNDS[locationId];
}
