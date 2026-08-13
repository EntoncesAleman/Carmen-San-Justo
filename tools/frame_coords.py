"""Coordenadas del frame de pantalla dividida (ver src/ui/frameLayout.ts),
calculadas una sola vez acá para que los scripts de e2e_*.py no repitan el
error de coordenadas obsoletas cada vez que el layout cambie — actualizar
ESTE archivo alcanza para que todos los tests vuelvan a apuntar bien.

Todas las coordenadas están en el espacio de juego 1024x768 (multiplicadas
por sx/sy en cada test, no acá).

FASE 20 — layout rediseñado a fondo: columna izquierda = arte arriba +
texto de descripción/diálogo abajo (siempre en el mismo lugar, sea zona,
locación o retrato de con quién hablás). Columna derecha = un ÚNICO menú
vertical NUMERADO de acciones (viajar, hablar, explorar, pizarrón,
expediente, inteligencia criminal, o las opciones de un diálogo) —
reemplaza la lista de destinos + barra de íconos + panel de NPCs que antes
vivían en lugares separados. `action_menu_item(i)` sirve tanto para el
menú de CityMapScene/LocationScene como para las opciones de
DialogueScene: es EL MISMO menú numerado en las tres escenas.
"""

FRAME_CONTENT_TOP = 48
FRAME_CONTENT_BOTTOM = 740
FRAME_LEFT_X = 14
FRAME_LEFT_WIDTH = 580
FRAME_ART_HEIGHT = 340
FRAME_ART_BOTTOM = FRAME_CONTENT_TOP + FRAME_ART_HEIGHT  # 388
FRAME_TEXT_TOP = FRAME_ART_BOTTOM + 12  # 400
FRAME_RIGHT_X = 610
FRAME_RIGHT_WIDTH = 1024 - FRAME_RIGHT_X - 14  # 400

# Medido a mano contra capturas reales (análisis de píxeles fila por
# fila, ver notas de FASE 20) — NO recalculado a partir del código de
# Phaser, que no expone el alto real del texto renderizado sin correr el
# juego. Si el layout cambia, volver a medir así en vez de adivinar:
# tomar una captura, escanear la franja x=[rightX+16, 1010] buscando
# filas con píxeles no-fondo, y anotar el centro de cada bloque.
#
# `ActionMenuPanel` (ítems de texto plano, sin fondo ni borde por ítem):
# separación real ~26px entre centros consecutivos.
ACTION_ROW_HEIGHT = 26
ACTION_MENU_START_Y = 114  # centro del ítem 0


def action_menu_item(index: int):
    """Centro del ítem N (0-indexed) del menú numerado de la derecha en
    CityMapScene/LocationScene (viajar, hablar, explorar, pizarrón...)."""
    x = FRAME_RIGHT_X + 16 + 20
    y = ACTION_MENU_START_Y + index * ACTION_ROW_HEIGHT
    return (x, y)


# `DialogueScene.renderOptionRow` dibuja cada opción como un botón con
# fondo + borde (no texto plano) — las filas son bastante más altas que
# las del menú de acciones: separación real ~41px entre centros.
DIALOGUE_ROW_HEIGHT = 41
DIALOGUE_START_Y = 122  # centro del ítem 0


def dialogue_option(index: int):
    x = FRAME_RIGHT_X + 16 + 20
    y = DIALOGUE_START_Y + index * DIALOGUE_ROW_HEIGHT
    return (x, y)


def dialogue_skip_zone():
    """Un punto cualquiera dentro del panel de texto (columna izquierda,
    abajo del arte/retrato), para saltear el tipeo progresivo con un
    click."""
    return (FRAME_LEFT_X + FRAME_LEFT_WIDTH / 2, FRAME_TEXT_TOP + 40)


# Copia exacta de src/data/zoneConnections.ts — actualizar ACÁ también si
# el grafo cambia ahí.
ZONE_CONNECTIONS = {
    'manzana_fria': ['casco_antiguo', 'terminal_norte', 'la_feria', 'palo_alto'],
    'terminal_sur': ['casco_antiguo', 'barrio_fabrica', 'la_feria', 'oeste_profundo'],
    'palo_alto': ['manzana_fria', 'costa_alta', 'villa_quieta', 'feria_usados', 'casco_antiguo'],
    'barrio_fabrica': ['terminal_sur', 'la_ribera', 'parque_obrero', 'puente_sur'],
    'la_ribera': ['barrio_fabrica', 'casco_antiguo'],
    'villa_flor': ['la_feria', 'parque_obrero', 'feria_usados', 'villa_quieta'],
    'la_feria': ['manzana_fria', 'terminal_sur', 'villa_flor', 'terminal_norte'],
    'terminal_norte': ['manzana_fria', 'la_feria', 'barranca_norte', 'km_20'],
    'parque_obrero': ['barrio_fabrica', 'villa_flor', 'el_cruce', 'costa_alta'],
    'villa_quieta': ['villa_flor', 'palo_alto', 'oeste_profundo', 'feria_usados'],
    'costa_alta': ['palo_alto', 'barranca_norte', 'parque_obrero', 'la_cervecera'],
    'casco_antiguo': ['manzana_fria', 'terminal_sur', 'la_ribera', 'palo_alto'],
    'puente_sur': ['barrio_fabrica', 'el_cruce', 'la_cervecera'],
    'el_cruce': ['puente_sur', 'parque_obrero', 'lomas_bajas'],
    'la_cervecera': ['puente_sur', 'costa_alta', 'lomas_bajas'],
    'oeste_profundo': ['villa_quieta', 'feria_usados', 'km_20', 'el_delta', 'terminal_sur'],
    'km_20': ['terminal_norte', 'oeste_profundo', 'el_delta'],
    'el_delta': ['km_20', 'barranca_norte', 'oeste_profundo'],
    'barranca_norte': ['costa_alta', 'terminal_norte', 'el_delta'],
    'lomas_bajas': ['el_cruce', 'la_cervecera'],
    'feria_usados': ['villa_flor', 'villa_quieta', 'oeste_profundo', 'palo_alto'],
}


def shortest_path(current_zone_id: str, target_zone_id: str):
    """Lista de zonas a recorrer, EN ORDEN y sin incluir la de partida,
    para llegar de `current_zone_id` a `target_zone_id` por el grafo de
    conexiones (BFS, camino más corto)."""
    from collections import deque

    if current_zone_id == target_zone_id:
        return []
    visited = {current_zone_id}
    queue = deque([(current_zone_id, [])])
    while queue:
        node, path = queue.popleft()
        for neighbor in ZONE_CONNECTIONS.get(node, []):
            if neighbor == target_zone_id:
                return path + [neighbor]
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    raise ValueError(f"no hay camino de {current_zone_id} a {target_zone_id} en ZONE_CONNECTIONS")
