"""Verificación en navegador de un caso GENERADO (CaseGenerator).

No se puede hardcodear la posición de cada NPC/zona como en los tests de
los casos fijos porque la ruta y el sospechoso cambian en cada corrida.
En cambio: (1) se visita una zona cualquiera de la lista de destinos y se
habla con el primer NPC ahí para confirmar que el diálogo generado se ve
bien, y (2) se usa el botón genérico de DebugScene "Completar caso (forzar
final)" para recorrer el resto del ciclo (identikit, orden, confrontación,
final, rango, siguiente caso) sin depender de las coordenadas exactas de
esta corrida.

Coordenadas de CityMap/Location/Dialogue centralizadas en
tools/frame_coords.py (pantalla dividida, ver src/ui/frameLayout.ts).
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from frame_coords import destination_list_zone, location_npc_row, dialogue_option, dialogue_skip_zone

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

        # Debug -> Generar caso nuevo (forzar)
        page.keyboard.press("`")
        page.wait_for_timeout(400)
        click(672, 354)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/gen_01_report.png")

        # ReportScene (generado) -> briefing -> CityMap
        click(512, 708)
        page.wait_for_timeout(400)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(1))
        page.wait_for_timeout(700)
        page.screenshot(path="/tmp/gen_02_citymap.png")

        # Cualquier fila de la lista de destinos navega a LocationScene
        # (manzana_fria siempre está en la fila 0, sin importar cuál sea la
        # zona inicial de esta corrida en particular).
        click(*destination_list_zone('manzana_fria'))
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/gen_03_first_location.png")

        # Hablar con el primer NPC del lugar, si hay alguno.
        click(*location_npc_row(0))
        page.wait_for_timeout(300)
        skip()
        page.screenshot(path="/tmp/gen_04_informant_dialogue.png")

        # Abrir debug y usar "Completar caso (forzar final)" para recorrer
        # identikit + orden + confrontación + final sin depender de las
        # coordenadas exactas de esta corrida — funciona sin importar en
        # qué escena/diálogo hayamos quedado (ver ui/sceneCleanup.ts).
        page.keyboard.press("`")
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/gen_05_debug_before_complete.png")
        click(442, 354)  # "Completar caso (forzar final)"
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/gen_06_ending.png")

        # "Siguiente caso" debería generar OTRO caso más (o el siguiente
        # fijo si todavía quedan) sin romper nada.
        click(512, 480)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/gen_07_next_case_report.png")

        browser.close()

        if errors:
            print("ERRORES DE CONSOLA:")
            for e in errors:
                print(" ", e)
        else:
            print("[OK] Caso generado jugado de punta a punta sin errores de consola.")


if __name__ == "__main__":
    run()
