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


# Copia exacta de src/data/zoneConnections.ts — actualizar ACÁ también si
# el grafo cambia ahí. Desde la red de conexiones entre zonas, el panel de
# destinos ya no lista las 21 zonas del mundo: lista solo las CONECTADAS a
# la zona en la que estás parado (mismo patrón que "ver conexiones" del
# formato clásico), con el nombre de la zona actual como título arriba.
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


def destination_list_zone(current_zone_id: str, target_zone_id: str):
    """Centro aproximado de la fila de `target_zone_id` en el panel de
    destinos (arriba a la izquierda, presente en CityMap/Location/Dialogue),
    estando parado en `current_zone_id`. El panel solo lista las zonas
    CONECTADAS a la actual — ver DestinationListPanel.ts. Si
    `target_zone_id` no es una conexión directa de `current_zone_id`, este
    helper no puede clickearla (el juego tampoco te deja): revisar la ruta.
    """
    connections = ZONE_CONNECTIONS[current_zone_id]
    i = connections.index(target_zone_id)
    # x chico a propósito: el texto arranca en leftX+24 con origin (0,0) y
    # el nombre más corto de la lista ("Km 20") mide ~40px — un offset
    # grande (probado con +80) cae afuera del hitbox de los nombres cortos
    # y el click no pega en nada. y con +8 para no caer justo en el borde
    # superior del texto (origin (0,0), no centrado).
    x = FRAME_LEFT_X + 24 + 15
    y = FRAME_CONTENT_TOP + 42 + i * 26 + 8
    return (x, y)


def shortest_path(current_zone_id: str, target_zone_id: str):
    """Lista de zonas a recorrer, EN ORDEN y sin incluir la de partida,
    para llegar de `current_zone_id` a `target_zone_id` por el grafo de
    conexiones (BFS, camino más corto). Cada elemento es un salto real —
    ya no se puede clickear directo a cualquier zona del mundo, así que un
    "viaje" en los scripts de e2e puede necesitar varios clicks seguidos.
    """
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


def enter_current_location():
    """Centro del panel de arte (abajo a la izquierda) — clickearlo entra a
    la LocationScene de la zona en la que ya estás parado, SIN viajar y
    sin costo de tiempo (ver LocationArtPanel.ts `onEnter`, solo activo en
    CityMapScene). Reemplaza al viejo truco de "clickear tu propia zona en
    la lista de destinos", que dejó de existir cuando la lista pasó a
    mostrar solo conexiones."""
    x = FRAME_LEFT_X + FRAME_LEFT_WIDTH / 2
    y = (FRAME_CONTENT_BOTTOM + (FRAME_CONTENT_TOP + 204 + 12)) / 2  # centro del panel de arte (artTop..contentBottom)
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
