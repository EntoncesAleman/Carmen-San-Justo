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
     que hacer click en la zona del globo de diálogo (skip zone) antes de
     clickear una opción, o esperar lo suficiente. Este script siempre
     hace skip primero.
  2. Desde la pasada de "pantalla dividida" (FASE 17), CityMapScene,
     LocationScene y DialogueScene comparten un mismo frame (lista de
     destinos + arte arriba/abajo a la izquierda, panel derecho, barra de
     íconos abajo — ver src/ui/frameLayout.ts). Las coordenadas de esas
     tres escenas viven centralizadas en tools/frame_coords.py — actualizar
     ESE archivo si el layout vuelve a cambiar, no cada script suelto.
     SuspectBoardScene/CrimeComputerScene/CaseFileScene/EndingScene NO
     forman parte de ese frame (son "pantallas de computadora" aparte,
     con su propio layout centrado de siempre) y sus coordenadas siguen
     hardcodeadas acá mismo.
  3. El overlay de DebugScene NO bloquea los clicks hacia la escena de
     abajo (limitación de Phaser con escenas paralelas) — cerrarlo
     SIEMPRE con la tecla backtick, nunca clickeando su botón "Cerrar".
  4. Cualquier texto con centro vertical en y<40 en una escena que corre
     en paralelo con HUDScene se renderiza corrupto (glitch de compositing
     entre cámaras de Phaser). Si algo nuevo se ve mal, comparar con una
     captura antes de asumir "funciona".
  5. Desde la red de conexiones entre zonas (ver data/zoneConnections.ts),
     el panel de destinos ya NO lista las 21 zonas del mundo: solo lista
     las CONECTADAS a la zona en la que estás parado. Un "viaje" a una
     zona no adyacente necesita varios clicks seguidos (uno por salto) —
     usar el helper `travel()` de acá abajo, que resuelve el camino más
     corto con `frame_coords.shortest_path`. Y ya no existe el truco de
     "clickear tu propia zona en la lista" para entrar gratis a la
     locación: eso ahora es `enter_current_location()` (clickear el panel
     de arte).
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from frame_coords import (
    toolbar_button,
    destination_list_zone,
    enter_current_location,
    shortest_path,
    location_npc_row,
    dialogue_option,
    dialogue_skip_zone,
)

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

        def travel(click, page, current_zone, target_zone):
            """Viaja de `current_zone` a `target_zone` haciendo un click
            por cada salto real del camino más corto (ver shortest_path).
            Devuelve `target_zone` para poder reasignar la variable de
            zona actual en el llamador."""
            zone = current_zone
            for next_zone in shortest_path(current_zone, target_zone):
                click(*destination_list_zone(zone, next_zone))
                page.wait_for_timeout(400)
                zone = next_zone
            return zone

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

        click(*enter_current_location())  # entrar a Terminal Sur sin viajar (gratis)
        page.wait_for_timeout(400)
        click(*location_npc_row(0))  # Hablar con Don Simón
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))  # preguntar -> da clue_kiosco_medialunas
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        page.screenshot(path="/tmp/smoke_03_clue_response.png")
        click(*dialogue_option(0))  # Continuar
        page.wait_for_timeout(500)

        click(*toolbar_button(2, 4))  # Expediente (4to ícono en LocationScene: Explorar/Pizarrón/Expediente/Inteligencia)
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
        zone = 'terminal_sur'  # zonaInicial de caso1_medialunas

        # Terminal Sur -> Simón (da clue_kiosco_medialunas, hop1 = oeste_profundo)
        click(*enter_current_location())
        page.wait_for_timeout(400)
        click(*location_npc_row(0))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # Pizarrón (2do ícono de 4 en LocationScene): adivinar hop1 = oeste_profundo
        click(*toolbar_button(1, 4))
        page.wait_for_timeout(400)
        # boardTop con 1 pista = 138+20+26=184, startY=234, stepY=52; oeste_profundo index15 -> row3,col0 (grilla propia de SuspectBoardScene, sin cambios)
        click(130, 234 + 3 * 52)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_05_hop1_result.png")
        click(512, 384)  # cerrar overlay -> teleporta a oeste_profundo
        page.wait_for_timeout(500)
        zone = 'oeste_profundo'

        # Oeste Profundo -> Cacho -> "mostrar evidencia" da clue_remise_pampa (hop2 = el_delta)
        click(*location_npc_row(0))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(1))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # Pizarrón otra vez: ahora 2 pistas -> boardTop=138+40+26=204,startY=254; el_delta index17->row3,col2
        click(*toolbar_button(1, 4))
        page.wait_for_timeout(400)
        click(130 + 2 * 175, 254 + 3 * 52)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_06_hop2_final_result.png")
        click(512, 384)
        page.wait_for_timeout(500)
        zone = 'el_delta'
        page.screenshot(path="/tmp/smoke_07_el_delta_locked.png")  # sospechoso visible pero bloqueado

        # Viajar a Parque Obrero -> Hombre de las Palomas (2do NPC del lugar) -> hobby
        zone = travel(click, page, zone, 'parque_obrero')
        page.wait_for_timeout(200)
        click(*location_npc_row(1))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        click(*toolbar_button(3, 4))  # Sistema de Inteligencia Criminal
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/smoke_08_crime_computer.png")
        click(512, 610)  # CALCULAR (por si el auto-cálculo no alcanzó a pintar; escena propia, sin cambios)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_09_crime_computer_1_match.png")
        click(512, 668)  # EMITIR ORDEN DE CAPTURA (scale.height - 100)
        page.wait_for_timeout(400)

        zone = travel(click, page, zone, 'el_delta')
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/smoke_10_el_delta_unlocked.png")
        click(*location_npc_row(0))  # Confrontar (único NPC visible ahora)
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
