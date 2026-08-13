"""Verificación manual del Caso 3 ("El Robo del Trofeo del Club", Liniers).

Usa el nuevo botón de DebugScene "Saltar a Caso 3" para no tener que jugar
los casos 1 y 2 primero. Reproduce: reporte -> briefing -> ruta de 2 saltos
(feria_usados -> palo_alto -> casco_antiguo) -> identikit con 2 pistas de
atributo (vehiculo + ojos) -> orden de captura -> confrontación -> captura.

Coordenadas centralizadas en tools/frame_coords.py (ver
src/ui/frameLayout.ts / ui/ActionMenuPanel.ts — FASE 20, menú numerado
único a la derecha). SuspectBoardScene/CrimeComputerScene/DebugScene no
forman parte de ese frame y siguen con coordenadas propias hardcodeadas
acá. El ÍNDICE de cada ítem del menú depende de cuántos ítems lo preceden
(NPCs de la locación + Explorar antes de los "viajar") — cada paso
comenta qué índice corresponde a qué acción, basado en
`src/data/locations.ts` y `src/data/zoneConnections.ts`.
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

        # CityMapScene(feria_usados): item 0 = "Quedarme e investigar acá"
        click(*action_menu_item(0))
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_04_concesionaria.png")

        # LocationScene(feria_usados): npcIds=[toto_ferradas] -> item 0 = Toto
        click(*action_menu_item(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        page.screenshot(path="/tmp/caso3_05_clue_colectivo.png")
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # LocationScene(feria_usados): items=[Toto(0),Explorar(1),4 viajar(2-5)] -> Pizarrón = 6
        click(*action_menu_item(6))
        page.wait_for_timeout(400)
        # 1 pista real (destinosPosibles=['palo_alto']) -> 1 sola opción, row0col0.
        # boardTop con 1 pista = 138+20+26=184.
        click(130, 184 + 50)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/caso3_06_hop1_result.png")
        click(512, 384)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_07_palo_alto.png")

        # LocationScene(palo_alto): npcIds=[gustavo_salerno, federico_salaberry] -> item 0 = Salerno
        click(*action_menu_item(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # LocationScene(palo_alto): items=[Salerno(0),Salaberry(1),Explorar(2),5 viajar(3-7)] -> Pizarrón = 8
        click(*action_menu_item(8))
        page.wait_for_timeout(400)
        # 2 pistas reales (palo_alto de Toto ya recorrida + casco_antiguo de Salerno) -> 2 opciones, col1 = casco_antiguo.
        # boardTop con 2 pistas = 138+40+26=204.
        click(130 + 175, 204 + 50)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/caso3_08_hop2_final_result.png")
        click(512, 384)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_09_casco_antiguo_locked.png")

        # LocationScene(casco_antiguo): npcIds=[armando_petrocelli] + sospechoso bloqueado -> item 0 = Petrocelli
        click(*action_menu_item(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # Viajar a villa_quieta (no conectada directo desde casco_antiguo, pasa por palo_alto):
        # LocationScene(casco_antiguo): items=[Petrocelli(0),bloqueado(1),Explorar(2),4 viajar(3-6: manzana_fria,terminal_sur,la_ribera,palo_alto)] -> palo_alto = 6
        click(*action_menu_item(6))
        page.wait_for_timeout(400)
        # LocationScene(palo_alto): items=[Salerno(0),Salaberry(1),Explorar(2),5 viajar(3-7: manzana_fria,costa_alta,villa_quieta,feria_usados,casco_antiguo)] -> villa_quieta = 5
        click(*action_menu_item(5))
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_10_villa_quieta.png")

        # LocationScene(villa_quieta): npcIds=[marta_yulis, walter_chiodi] -> item 1 = Walter
        click(*action_menu_item(1))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(300)
        skip()
        click(*dialogue_option(0))
        page.wait_for_timeout(500)

        # LocationScene(villa_quieta): items=[Marta(0),Walter(1),Explorar(2),4 viajar(3-6),Pizarrón(7),Expediente(8),Inteligencia(9)]
        click(*action_menu_item(9))
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_11_crime_computer.png")
        click(512, 668)  # EMITIR ORDEN DE CAPTURA (CrimeComputerScene, sin cambios) -> vuelve a CityMap(villa_quieta)
        page.wait_for_timeout(400)

        # CityMapScene(villa_quieta): items=[Quedarme(0),4 viajar(1-4: villa_flor,palo_alto,oeste_profundo,feria_usados)] -> palo_alto = 2
        click(*action_menu_item(2))
        page.wait_for_timeout(400)
        # LocationScene(palo_alto): items=[Salerno(0),Salaberry(1),Explorar(2),5 viajar(3-7)] -> casco_antiguo = 7
        click(*action_menu_item(7))
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_12_casco_antiguo_unlocked.png")

        # LocationScene(casco_antiguo) desbloqueado: item 1 = "Confrontar a..."
        click(*action_menu_item(1))
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
