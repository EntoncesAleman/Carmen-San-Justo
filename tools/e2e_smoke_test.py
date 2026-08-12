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
     opción, o esperar lo suficiente. Este script siempre hace skip.
  2. CityMapScene usa una grilla de 4 columnas; SuspectBoardScene usa una
     grilla de 5 columnas. Son fórmulas DISTINTAS — confundirlas hace que
     los clicks caigan en el botón equivocado sin ningún error de consola
     (falso positivo silencioso).
  3. El overlay de DebugScene NO bloquea los clicks hacia la escena de
     abajo (limitación de Phaser con escenas paralelas) — cerrarlo
     SIEMPRE con la tecla backtick, nunca clickeando su botón "Cerrar"
     (un click ahí puede además activar un botón de la escena de atrás).
  4. Cualquier texto con centro vertical en y<40 en una escena que corre
     en paralelo con HUDScene se renderiza corrupto (glitch de compositing
     entre cámaras de Phaser). Si algo nuevo se ve mal, comparar con una
     captura antes de asumir "funciona".
"""

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
            """Click en la zona de texto del diálogo/reporte para saltar el tipeo."""
            click(400, 150)
            page.wait_for_timeout(150)

        def start_new_game(page, click):
            """MainMenu -> Nueva Partida -> ReportScene (SIN selección de caso)."""
            click(512, 330)
            page.wait_for_timeout(400)

        def go_to_crime_scene(page, click):
            """ReportScene -> briefing (Bracamonte) -> "Entendido" -> rechazar sobre -> CityMap."""
            click(512, 708)
            page.wait_for_timeout(400)
            skip_typewriter(click, page)
            click(512, 300)  # "Entendido."
            page.wait_for_timeout(250)
            skip_typewriter(click, page)
            click(512, 366)  # rechazar sobre extraoficial (2da opción de node_extraoficial)
            page.wait_for_timeout(500)

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

        # Terminal Sur (zona actual, index1, cols=4 -> x=375,y=150)
        click(375, 150)
        page.wait_for_timeout(400)
        click(512, 200)  # Hablar con Don Simón
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(512, 300)  # preguntar -> da clue_kiosco_medialunas
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        page.screenshot(path="/tmp/smoke_03_clue_response.png")
        click(512, 500)  # Continuar
        page.wait_for_timeout(400)

        click(130, 734)  # Expediente
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
        click(375, 150)
        page.wait_for_timeout(400)
        click(512, 200)
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(512, 300)
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(512, 500)
        page.wait_for_timeout(400)
        click(874, 728)  # Volver al mapa
        page.wait_for_timeout(400)

        # Pizarrón: adivinar hop1 = oeste_profundo (SuspectBoardScene usa cols=5)
        click(894, 734)
        page.wait_for_timeout(400)
        # boardTop con 1 pista = 138+20+26=184, startY=234, stepY=52; oeste_profundo index15 -> row3,col0
        click(130, 234 + 3 * 52)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_05_hop1_result.png")
        click(512, 384)  # cerrar overlay -> teleporta a oeste_profundo
        page.wait_for_timeout(400)

        # Oeste Profundo -> Cacho -> "mostrar evidencia" da clue_remise_pampa (hop2 = el_delta)
        click(512, 200)
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(512, 366)
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(512, 500)
        page.wait_for_timeout(400)
        click(874, 728)
        page.wait_for_timeout(400)

        # Pizarrón otra vez: ahora 2 pistas -> boardTop=138+40+26=204,startY=254; el_delta index17->row3,col2
        click(894, 734)
        page.wait_for_timeout(400)
        click(130 + 2 * 175, 254 + 3 * 52)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_06_hop2_final_result.png")
        click(512, 384)
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/smoke_07_el_delta_locked.png")  # sospechoso visible pero bloqueado

        click(874, 728)
        page.wait_for_timeout(400)

        # Crime Computer con las pistas de atributo ya en mano (comida via
        # Simón) mas hobby (Hombre de las Palomas, Parque Obrero index8)
        click(150, 346)
        page.wait_for_timeout(400)
        click(512, 266)  # 2do NPC del lugar
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(512, 300)
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(512, 500)
        page.wait_for_timeout(400)
        click(874, 728)
        page.wait_for_timeout(400)

        click(512, 734)  # Sistema de Inteligencia Criminal
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/smoke_08_crime_computer.png")
        click(512, 610)  # CALCULAR (por si el auto-cálculo no alcanzó a pintar)
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_09_crime_computer_1_match.png")
        click(512, 668)  # EMITIR ORDEN DE CAPTURA (scale.height - 100)
        page.wait_for_timeout(400)

        click(375, 542)  # volver a El Delta (index17, cols=4 -> row4,col1)
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/smoke_10_el_delta_unlocked.png")
        click(512, 200)  # Confrontar
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(512, 300)  # arrestar
        page.wait_for_timeout(300)
        skip_typewriter(click, page)
        click(512, 500)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/smoke_11_ending_with_rank.png")

        click(512, 480)  # Siguiente caso
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/smoke_12_next_case_report_no_selection.png")
        page.close()
        assert not errors, f"errores de consola en ruta/crime-computer/captura: {errors}"
        print("[OK] ruta multi-parada + Crime Computer + orden de captura + captura + rango + siguiente caso")

    print("\nTodo OK. Capturas en /tmp/smoke_*.png")


if __name__ == "__main__":
    run()
