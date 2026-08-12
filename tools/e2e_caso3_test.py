"""Verificación manual del Caso 3 ("El Robo del Trofeo del Club", Liniers).

Usa el nuevo botón de DebugScene "Saltar a Caso 3" para no tener que jugar
los casos 1 y 2 primero. Reproduce: reporte -> briefing -> ruta de 2 saltos
(feria_usados -> palo_alto -> casco_antiguo) -> identikit con 2 pistas de
atributo (vehiculo + ojos) -> orden de captura -> confrontación -> captura.
"""

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

        def skip(pause=150):
            click(400, 150)
            page.wait_for_timeout(pause)

        # MainMenu -> Nueva Partida -> ReportScene (caso1) -> briefing -> CityMap
        click(512, 330)
        page.wait_for_timeout(400)
        click(512, 708)
        page.wait_for_timeout(400)
        skip()
        click(512, 300)
        page.wait_for_timeout(250)
        skip()
        click(512, 366)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_00_citymap_caso1.png")

        # Abrir debug (backtick) y saltar directo al Caso 3
        page.keyboard.press("`")
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_01_debug.png")
        click(672, 308)  # "Saltar a Caso 3: El Robo del Trofeo del Club"
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_02_report.png")

        # ReportScene (caso3) -> briefing -> CityMap
        click(512, 708)
        page.wait_for_timeout(400)
        skip()
        click(512, 300)
        page.wait_for_timeout(250)
        skip()
        click(512, 366)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_03_citymap_feria_usados.png")

        # feria_usados (zona actual) -> hablar con Toto -> pista colectivo 21
        click(150, 640)
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_04_concesionaria.png")
        click(512, 200)
        page.wait_for_timeout(300)
        skip()
        click(512, 300)
        page.wait_for_timeout(300)
        skip()
        page.screenshot(path="/tmp/caso3_05_clue_colectivo.png")
        click(512, 500)
        page.wait_for_timeout(400)
        click(874, 728)
        page.wait_for_timeout(400)

        # Pizarrón: 1 pista -> boardTop=138+20+26=184,startY=234; palo_alto index2 -> col2,row0 -> x=130+2*175=480,y=234
        click(894, 734)
        page.wait_for_timeout(400)
        click(480, 234)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/caso3_06_hop1_result.png")
        click(512, 384)
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_07_palo_alto.png")

        # palo_alto -> Salerno -> clue hop2
        click(512, 200)
        page.wait_for_timeout(300)
        skip()
        click(512, 300)
        page.wait_for_timeout(300)
        skip()
        click(512, 500)
        page.wait_for_timeout(400)
        click(874, 728)
        page.wait_for_timeout(400)

        # Pizarrón: 2 pistas -> boardTop=138+40+26=204,startY=254; casco_antiguo index11 -> col1,row2 -> x=130+175=305,y=254+2*52=358
        click(894, 734)
        page.wait_for_timeout(400)
        click(305, 358)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/caso3_08_hop2_final_result.png")
        click(512, 384)
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_09_casco_antiguo_locked.png")

        # casco_antiguo -> Petrocelli -> clue vehiculo (Combi Volkswagen)
        click(512, 200)
        page.wait_for_timeout(300)
        skip()
        click(512, 300)
        page.wait_for_timeout(300)
        skip()
        click(512, 500)
        page.wait_for_timeout(400)
        click(874, 728)
        page.wait_for_timeout(400)

        # Viajar a villa_quieta (index9 -> col1,row2 -> x=375,y=346) -> Walter -> clue ojos
        click(375, 346)
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_10_villa_quieta.png")
        click(512, 266)  # 2do NPC del lugar (marta_yulis, walter_chiodi)
        page.wait_for_timeout(300)
        skip()
        click(512, 300)
        page.wait_for_timeout(300)
        skip()
        click(512, 500)
        page.wait_for_timeout(400)
        click(874, 728)
        page.wait_for_timeout(400)

        # Crime Computer: vehiculo + ojos deberían alcanzar para 1 solo match
        click(512, 734)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/caso3_11_crime_computer.png")
        click(512, 668)  # EMITIR ORDEN DE CAPTURA
        page.wait_for_timeout(400)

        # Viajar a casco_antiguo (index11 -> x=825,y=346) y confrontar
        click(825, 346)
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/caso3_12_casco_antiguo_unlocked.png")
        click(512, 266)  # 2do NPC visible (petrocelli + el sospechoso especial)
        page.wait_for_timeout(300)
        skip()
        click(512, 300)  # arrestar
        page.wait_for_timeout(300)
        skip()
        click(512, 500)
        page.wait_for_timeout(500)
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
