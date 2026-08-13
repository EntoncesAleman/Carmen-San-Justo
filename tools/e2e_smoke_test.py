"""Smoke test end-to-end del flujo "estilo Carmen Sandiego argentinizado".

No forma parte de `npm test` (que corre los unit tests de Node en
src/tests/). Complementa esos tests verificando la capa visual/de escenas
de Phaser, que no pueden cubrir.

Requisitos (no incluidos en package.json a propósito, para no mezclar
dependencias de Python en un proyecto Node):

    python3 -m venv .venv-e2e
    .venv-e2e/bin/pip install playwright
    .venv-e2e/bin/python -m playwright install chromium

Uso:
    npm run dev &          # deja el server corriendo en :8080
    .venv-e2e/bin/python tools/e2e_smoke_test.py

IMPORTANTE — cosas que ya rompieron este script antes y por qué:
  1. El diálogo usa texto progresivo (TypewriterText): los botones de
     opciones NO existen en el DOM/canvas hasta que el tipeo termina. Hay
     que hacer click en la zona de texto (skip zone) antes de clickear una
     opción, o esperar lo suficiente. Este script siempre hace skip primero.
  2. Desde FASE 20 (menú numerado), CityMapScene, LocationScene y
     DialogueScene comparten un mismo frame: columna izquierda = arte
     arriba + texto abajo, columna derecha = UN SOLO menú numerado de
     acciones (viajar, hablar, explorar, pizarrón, expediente,
     inteligencia — o las opciones de un diálogo). Las coordenadas viven
     centralizadas en tools/frame_coords.py (`action_menu_item(i)` /
     `dialogue_option(i)`) — actualizar ESE archivo si el layout vuelve a
     cambiar, no cada script suelto. SuspectBoardScene/CrimeComputerScene/
     DebugScene/EndingScene NO forman parte de ese frame y siguen con
     coordenadas propias hardcodeadas acá.
  3. El ÍNDICE de cada ítem del menú numerado depende de CUÁNTOS ítems lo
     preceden (NPCs de la locación, si hay "Explorar", cuántas conexiones
     tiene la zona) — no es fijo entre escenas. Cada paso de este script
     comenta explícitamente qué índice corresponde a qué acción y por qué,
     basado en `src/data/locations.ts` (npcIds por lugar) y
     `src/data/zoneConnections.ts` (conexiones por zona).
  4. El overlay de DebugScene NO bloquea los clicks hacia la escena de
     abajo (limitación de Phaser con escenas paralelas) — cerrarlo
     SIEMPRE con la tecla backtick, nunca clickeando su botón "Cerrar".
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from frame_coords import action_menu_item, dialogue_option, dialogue_skip_zone

from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8080/"


def run():
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        def new_page():
            page = browser.new_page(viewport={"width": 1100, "height": 850})
            page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type == "error" else None)
            page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))
            return page

        def canvas_click(page):
            box = page.locator("canvas").bounding_box()
            ox, oy = box["x"], box["y"]
            sx, sy = box["width"] / 1024, box["height"] / 768

            def click(gx, gy):
                page.mouse.click(ox + gx * sx, oy + gy * sy)

            return click

        def skip_typewriter(click, page):
            click(*dialogue_skip_zone())
            page.wait_for_timeout(200)

        def start_new_game(page, click):
            """MainMenu -> Nueva Partida -> ReportScene (SIN selección de caso)."""
            click(512, 330)
            page.wait_for_timeout(400)

        def go_to_crime_scene(page, click):
            """ReportScene -> briefing (Bracamonte) -> "Entendido" -> rechazar sobre -> CityMap."""
            click(512, 708)
            page.wait_for_timeout(400)
            skip_typewriter(click, page)
            click(*dialogue_option(0))  # "Entendido."
            page.wait_for_timeout(300)
            skip_typewriter(click, page)
            click(*dialogue_option(1))  # rechazar sobre extraoficial (2da opción de node_extraoficial)
            page.wait_for_timeout(700)

        # --- 1) Flujo principal: SIN pantalla de elegir caso -------------
        page = new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(600)
        click = canvas_click(page)

        start_new_game(page, click)
        page.screenshot(path="/tmp/smoke_01_report_no_selection.png")
        go_to_crime_scene(page, click)
        page.screenshot(path="/tmp/smoke_02_citymap.png")

        # CityMapScene(terminal_sur): item 0 = "Quedarme e investigar acá"
        click(*action_menu_item(0))
        page.wait_for_timeout(400)
        # LocationScene(terminal_sur): npcIds=[simon_achaval, beba_corvalan] -> item 0 = Simón
        click(*action_menu_item(0))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))  # preguntar -> da clue_kiosco_medialunas
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        page.screenshot(path="/tmp/smoke_03_clue_response.png")
        click(*dialogue_option(0))  # Continuar
        page.wait_for_timeout(500)

        # LocationScene(terminal_sur): items=[Simón,Beba,Explorar,4 viajar] -> Expediente no está acá,
        # hay que ir por Pizarrón(7)/Inteligencia(9); para el expediente: item 8
        click(*action_menu_item(8))  # Expediente
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_04_expediente.png")
        page.close()
        assert not errors, f"errores de consola en el flujo principal: {errors}"
        print("[OK] flujo principal (sin selección de caso, reporte -> briefing -> pista -> expediente)")

        # --- 2) Ruta multi-parada + Crime Computer + captura -------------
        page = new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(600)
        click = canvas_click(page)
        start_new_game(page, click)
        go_to_crime_scene(page, click)

        # Terminal Sur -> Simón (da clue_kiosco_medialunas, hop1 = oeste_profundo)
        click(*action_menu_item(0))  # Quedarme e investigar (CityMap)
        page.wait_for_timeout(400)
        click(*action_menu_item(0))  # Simón (Location)
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # Pizarrón: items=[Simón(0),Beba(1),Explorar(2),4 viajar(3-6)] -> Pizarrón = 7
        click(*action_menu_item(7))
        page.wait_for_timeout(400)
        # El Pizarrón solo ofrece zonas señaladas por pistas YA CONSEGUIDAS
        # (ver SuspectBoardScene.ts / fix del exploit de fuerza bruta): con 1
        # sola pista real, hay UNA sola opción ("Morón" = oeste_profundo),
        # en la fila 0 columna 0 de la grilla propia de la escena (sin
        # cambios por el rework visual). boardTop con 1 pista = 138+20+26=184.
        click(130, 184 + 50)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_05_hop1_result.png")
        click(512, 384)  # cerrar overlay -> teleporta a oeste_profundo
        page.wait_for_timeout(500)

        # LocationScene(oeste_profundo): npcIds=[cacho_domenech] -> item 0 = Cacho
        click(*action_menu_item(0))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(1))  # "mostrar evidencia" -> da clue_remise_pampa (hop2 = el_delta)
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # LocationScene(oeste_profundo): items=[Cacho(0),Explorar(1),5 viajar(2-6)] -> Pizarrón = 7
        click(*action_menu_item(7))
        page.wait_for_timeout(400)
        # Ahora 2 pistas reales colectadas -> 2 opciones: oeste_profundo (de
        # Simón, ya recorrida) en col0, el_delta (de Cacho, la nueva) en
        # col1. boardTop con 2 pistas = 138+40+26=204.
        click(130 + 175, 204 + 50)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_06_hop2_final_result.png")
        click(512, 384)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/smoke_07_el_delta_locked.png")  # sospechoso visible pero bloqueado

        # LocationScene(el_delta), 0 npcIds propios + sospechoso bloqueado:
        # items=[sospechoso bloqueado(0),Explorar(1),3 viajar(2-4)]. Ruta a
        # Parque Obrero (no conectado directo): el_delta -> barranca_norte
        # -> costa_alta -> parque_obrero. Conexiones el_delta=[km_20,
        # barranca_norte,oeste_profundo] -> barranca_norte es la 2da -> item
        # index = 2(offset) + 1 = 3.
        click(*action_menu_item(3))
        page.wait_for_timeout(400)
        # LocationScene(barranca_norte), 0 npcIds: items=[Explorar(0),3 viajar(1-3)].
        # Conexiones=[costa_alta,terminal_norte,el_delta] -> costa_alta es la 1ra -> item 1.
        click(*action_menu_item(1))
        page.wait_for_timeout(400)
        # LocationScene(costa_alta), npcIds=[yamila_cospito]: items=[Yamila(0),Explorar(1),4 viajar(2-5)].
        # Conexiones=[palo_alto,barranca_norte,parque_obrero,la_cervecera] -> parque_obrero es la 3ra -> item 2+2=4.
        click(*action_menu_item(4))
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/smoke_07b_parque_obrero.png")

        # LocationScene(parque_obrero), npcIds=[pipo_escanciano, hombre_de_las_palomas] -> item 1 = Hombre de las Palomas
        click(*action_menu_item(1))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # LocationScene(parque_obrero): items=[Pipo(0),Palomas(1),Explorar(2),4 viajar(3-6),Pizarrón(7),Expediente(8),Inteligencia(9)]
        click(*action_menu_item(9))  # Sistema de Inteligencia Criminal
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/smoke_08_crime_computer.png")
        click(512, 610)  # CALCULAR (por si el auto-cálculo no alcanzó a pintar; escena propia, sin cambios)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_09_crime_computer_1_match.png")
        click(512, 668)  # EMITIR ORDEN DE CAPTURA (CrimeComputerScene, sin cambios) -> vuelve a CityMap(parque_obrero)
        page.wait_for_timeout(400)

        # CityMapScene(parque_obrero): items=[Quedarme(0),4 viajar(1-4)]. Ruta a
        # El Delta: parque_obrero -> costa_alta -> barranca_norte -> el_delta.
        # Conexiones parque_obrero=[barrio_fabrica,villa_flor,el_cruce,costa_alta] -> costa_alta es la 4ta -> item 1+3=4.
        click(*action_menu_item(4))
        page.wait_for_timeout(400)
        # LocationScene(costa_alta): items=[Yamila(0),Explorar(1),4 viajar(2-5)].
        # Conexiones=[palo_alto,barranca_norte,parque_obrero,la_cervecera] -> barranca_norte es la 2da -> item 2+1=3.
        click(*action_menu_item(3))
        page.wait_for_timeout(400)
        # LocationScene(barranca_norte): items=[Explorar(0),3 viajar(1-3)].
        # Conexiones=[costa_alta,terminal_norte,el_delta] -> el_delta es la 3ra -> item 1+2=3.
        click(*action_menu_item(3))
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/smoke_10_el_delta_unlocked.png")

        # LocationScene(el_delta), ahora desbloqueado: item 0 = "Confrontar a..."
        click(*action_menu_item(0))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))  # arrestar
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(600)
        page.screenshot(path="/tmp/smoke_11_ending_with_rank.png")

        click(512, 480)  # Siguiente caso (EndingScene, sin cambios)
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/smoke_12_next_case_report_no_selection.png")
        page.close()
        assert not errors, f"errores de consola en ruta/crime-computer/captura: {errors}"
        print("[OK] ruta multi-parada + Crime Computer + orden de captura + captura + rango + siguiente caso")

    print("\nTodo OK. Capturas en /tmp/smoke_*.png")


if __name__ == "__main__":
    run()
