"""Verificación manual del Caso 3 ("El Robo del Trofeo del Club", Liniers).

Usa el nuevo botón de DebugScene "Saltar a Caso 3" para no tener que jugar
los casos 1 y 2 primero. Reproduce: reporte -> briefing -> ruta de 2 saltos
(feria_usados -> palo_alto -> casco_antiguo) -> identikit con 2 pistas de
atributo (vehiculo + ojos) -> orden de captura -> confrontación -> captura.

Coordenadas de CityMap/Location/Dialogue centralizadas en
tools/frame_coords.py (pantalla dividida, ver src/ui/frameLayout.ts).
SuspectBoardScene/CrimeComputerScene/DebugScene no forman parte de ese
frame y siguen con coordenadas propias hardcodeadas acá.

Desde la red de conexiones entre zonas (ver data/zoneConnections.ts), el
panel de destinos solo lista zonas CONECTADAS a la actual — un viaje a una
zona no adyacente necesita varios clicks (uno por salto), ver `travel()`
más abajo. Y para "entrar" a la zona en la que ya estás parado sin viajar
se usa `enter_current_location()` (clickear el panel de arte), ya no
clickear tu propia zona en la lista.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from frame_coords import toolbar_button, destination_list_zone, enter_current_location, shortest_path, location_npc_row, dialogue_option, dialogue_skip_zone

from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8080/"


def run():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1100, "height": 850})
        page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(600)

        box = page.locator("canvas").bounding_box()
        ox, oy = box["x"], box["y"]
        sx, sy = box["width"] / 1024, box["height"] / 768

        def click(gx, gy):
            page.mouse.click(ox + gx * sx, oy + gy * sy)

        def skip(pause=200):
            click(*dialogue_skip_zone())
            page.wait_for_timeout(pause)

        def travel(current_zone, target_zone):
            zone = current_zone
            for next_zone in shortest_path(current_zone, target_zone):
                click(*destination_list_zone(zone, next_zone))
                page.wait_for_timeout(400)
                zone = next_zone
            return zone

        # MainMenu -> Nueva Partida -> ReportScene (caso1) -> briefing -> CityMap
        click(512, 330)
        page.wait_for_timeout(400)
        click(512, 708)
        page.wait_for_timeout(400)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(1))
        page.wait_for_timeout(700)
        page.screenshot(path="/tmp/caso3_00_citymap_caso1.png")

        # Abrir debug (backtick) y saltar directo al Caso 3
        page.keyboard.press("`")
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_01_debug.png")
        click(672, 308)  # "Saltar a Caso 3: El Robo del Trofeo del Club" (DebugScene, sin cambios)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_02_report.png")

        # ReportScene (caso3) -> briefing -> CityMap
        click(512, 708)
        page.wait_for_timeout(400)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(1))
        page.wait_for_timeout(700)
        page.screenshot(path="/tmp/caso3_03_citymap_feria_usados.png")

        zone = 'feria_usados'  # zonaInicial de caso3_trofeo

        # feria_usados (zona actual) -> hablar con Toto -> pista colectivo 21
        click(*enter_current_location())
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_04_concesionaria.png")
        click(*location_npc_row(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        page.screenshot(path="/tmp/caso3_05_clue_colectivo.png")
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # Pizarrón: 1 pista -> boardTop=138+20+26=184,startY=234; palo_alto index2 -> col2,row0 -> x=130+2*175=480,y=234
        click(*toolbar_button(1, 4))
        page.wait_for_timeout(400)
        click(480, 234)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/caso3_06_hop1_result.png")
        click(512, 384)
        page.wait_for_timeout(500)
        zone = 'palo_alto'
        page.screenshot(path="/tmp/caso3_07_palo_alto.png")

        # palo_alto -> Salerno -> clue hop2
        click(*location_npc_row(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # Pizarrón: 2 pistas -> boardTop=138+40+26=204,startY=254; casco_antiguo index11 -> col1,row2 -> x=130+175=305,y=254+2*52=358
        click(*toolbar_button(1, 4))
        page.wait_for_timeout(400)
        click(305, 358)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/caso3_08_hop2_final_result.png")
        click(512, 384)
        page.wait_for_timeout(500)
        zone = 'casco_antiguo'
        page.screenshot(path="/tmp/caso3_09_casco_antiguo_locked.png")

        # casco_antiguo -> Petrocelli -> clue vehiculo (Combi Volkswagen)
        click(*location_npc_row(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # Viajar a villa_quieta -> Walter (2do NPC del lugar) -> clue ojos
        # (no es conexión directa de casco_antiguo: pasa por palo_alto)
        zone = travel(zone, 'villa_quieta')
        page.wait_for_timeout(200)
        page.screenshot(path="/tmp/caso3_10_villa_quieta.png")
        click(*location_npc_row(1))  # 2do NPC del lugar (marta_yulis, walter_chiodi)
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # Crime Computer: vehiculo + ojos deberían alcanzar para 1 solo match
        click(*toolbar_button(3, 4))
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_11_crime_computer.png")
        click(512, 668)  # EMITIR ORDEN DE CAPTURA (CrimeComputerScene, sin cambios)
        page.wait_for_timeout(400)

        # Viajar a casco_antiguo y confrontar (pasa por palo_alto de nuevo)
        zone = travel(zone, 'casco_antiguo')
        page.wait_for_timeout(200)
        page.screenshot(path="/tmp/caso3_12_casco_antiguo_unlocked.png")
        click(*location_npc_row(1))  # 2do NPC visible (petrocelli + el sospechoso especial)
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))  # arrestar
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(600)
        page.screenshot(path="/tmp/caso3_13_ending.png")

        browser.close()

        if errors:
            print("ERRORES DE CONSOLA:")
            for e in errors:
                print(" ", e)
        else:
            print("[OK] Caso 3 jugado de punta a punta sin errores de consola.")


if __name__ == "__main__":
    run()
