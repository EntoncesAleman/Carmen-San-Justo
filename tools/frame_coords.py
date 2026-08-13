"""Coordenadas del frame de pantalla dividida (ver src/ui/frameLayout.ts),
calculadas una sola vez acá para que los scripts de e2e_*.py no repitan el
error de coordenadas obsoletas cada vez que el layout cambie — actualizar
ESTE archivo alcanza para que todos los tests vuelvan a apuntar bien.

Todas las coordenadas están en el espacio de juego 1024x768 (multiplicadas
por sx/sy en cada test, no acá).
"""

FRAME_LEFT_X = 14
FRAME_LEFT_WIDTH = 380
FRAME_CONTENT_TOP = 48
FRAME_CONTENT_BOTTOM = 696
FRAME_TOOLBAR_TOP = 704
FRAME_TOOLBAR_BOTTOM = 768
FRAME_RIGHT_X = 410
FRAME_RIGHT_WIDTH = 1024 - FRAME_RIGHT_X - 14

TOOLBAR_Y = (FRAME_TOOLBAR_TOP + FRAME_TOOLBAR_BOTTOM) / 2  # 736


def toolbar_button(index: int, count: int):
    """Centro de un botón de la barra de íconos inferior (Pizarrón/
    Expediente/Inteligencia Criminal, y Explorar en LocationScene)."""
    total_width = 1024 - FRAME_LEFT_X * 2
    gap = 16
    btn_width = (total_width - gap * (count - 1)) / count
    x = FRAME_LEFT_X + btn_width / 2 + index * (btn_width + gap)
    return (x, TOOLBAR_Y)


# Orden real de ZONES en src/data/zones.ts — hace falta para calcular en
# qué fila/columna de la lista de destinos cae cada una.
ZONE_IDS_IN_ORDER = [
    'manzana_fria', 'terminal_sur', 'palo_alto', 'barrio_fabrica', 'la_ribera',
    'villa_flor', 'la_feria', 'terminal_norte', 'parque_obrero', 'villa_quieta',
    'costa_alta', 'casco_antiguo', 'puente_sur', 'el_cruce', 'la_cervecera',
    'oeste_profundo', 'km_20', 'el_delta', 'barranca_norte', 'lomas_bajas',
    'feria_usados',
]


def destination_list_zone(zone_id: str):
    """Centro aproximado de la fila de una zona en el panel 'A DÓNDE
    VIAJAR' (arriba a la izquierda, presente en CityMap/Location/Dialogue).
    """
    i = ZONE_IDS_IN_ORDER.index(zone_id)
    cols = 3
    col, row = i % cols, i // cols
    step_x = FRAME_LEFT_WIDTH / cols
    x = FRAME_LEFT_X + 14 + col * step_x + 40
    y = FRAME_CONTENT_TOP + 30 + row * 24
    return (x, y)


def location_npc_row(index: int):
    """Centro de la fila de un NPC en el panel derecho de LocationScene
    (orden = mismo orden que Location.npcIds + roles especiales)."""
    list_top = FRAME_CONTENT_TOP + 100
    row_y = list_top + index * 60
    x = FRAME_RIGHT_X + 16 + (FRAME_RIGHT_WIDTH - 32) / 2
    return (x, row_y + 25)


def dialogue_option(index: int):
    """Centro de una opción de diálogo (misma posición para npcLine y para
    responseLine — ambas arrancan en OPTIONS_TOP)."""
    bubble_top = FRAME_CONTENT_TOP + 16  # 64
    bubble_height = 200
    options_top = bubble_top + bubble_height + 24  # 288
    x = FRAME_RIGHT_X + FRAME_RIGHT_WIDTH / 2
    return (x, options_top + index * 54)


def dialogue_skip_zone():
    """Un punto cualquiera dentro del globo de diálogo, para saltear el
    tipeo progresivo con un click."""
    portrait_x = FRAME_RIGHT_X + 16
    portrait_size = 150
    bubble_x = portrait_x + portrait_size + 16
    return (bubble_x + 60, FRAME_CONTENT_TOP + 16 + 40)
