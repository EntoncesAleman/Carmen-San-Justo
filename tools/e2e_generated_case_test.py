"""Verificación en navegador de un caso GENERADO (CaseGenerator).

No se puede hardcodear la posición de cada NPC/zona como en los tests de
los casos fijos porque la ruta y el sospechoso cambian en cada corrida.
En cambio: (1) se visita la zona inicial (siempre marcada con el pin 📍 en
el mapa, sin importar cuál sea) y se habla con el primer NPC ahí para
confirmar que el diálogo generado se ve bien, y (2) se usa el botón
genérico de DebugScene "Completar caso (forzar final)" para recorrer el
resto del ciclo (identikit, orden, confrontación, final, rango,
siguiente caso) sin depender de las coordenadas exactas de esta corrida.
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
        click(512, 300)
        page.wait_for_timeout(250)
        skip()
        click(512, 366)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/gen_02_citymap.png")

        # CityMapScene.travelTo navega a LocationScene sin importar qué
        # zona se clickee (cuesta tiempo de viaje si no es la actual, pero
        # SIEMPRE termina en LocationScene) — no hace falta saber cuál es
        # la zona inicial de esta corrida en particular para probar que la
        # escena de locación (con un caso generado activo) renderiza bien.
        click(150, 150)  # primera zona del grid, cualquiera que sea
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/gen_03_first_location.png")

        # Hablar con el primer NPC del lugar, si hay alguno.
        click(512, 200)
        page.wait_for_timeout(300)
        skip()
        page.screenshot(path="/tmp/gen_04_informant_dialogue.png")

        # Volver al mapa, abrir debug, y usar "Completar caso (forzar
        # final)" para recorrer identikit + orden + confrontación + final
        # sin depender de las coordenadas exactas de esta corrida.
        click(874, 728)
        page.wait_for_timeout(400)
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
