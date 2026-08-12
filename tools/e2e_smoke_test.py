"""Smoke test end-to-end de ambos casos, jugado en un navegador real.

No forma parte de `npm test` (que corre los unit tests de Node en
src/tests/). Este script es un complemento manual para verificar la capa
visual/de escenas de Phaser, que los unit tests no pueden cubrir.

Requisitos (no incluidos en package.json a propósito, para no mezclar
dependencias de Python en un proyecto Node):

    python3 -m venv .venv-e2e
    .venv-e2e/bin/pip install playwright
    .venv-e2e/bin/python -m playwright install chromium

Uso:
    npm run dev &          # deja el server corriendo en :8080
    .venv-e2e/bin/python tools/e2e_smoke_test.py

IMPORTANTE: si se agrega un caso nuevo (CASES.length cambia) o se cambia el
layout de alguna escena, las coordenadas hardcodeadas acá pueden quedar
obsoletas SIN que salte ningún error de consola (el click simplemente cae
en otro botón o en espacio vacío). Si algo deja de tener sentido, comparar
con una captura de pantalla antes de asumir que "no hay errores" significa
"funciona".
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

        def start_case(page, click, case_index):
            """MainMenu -> Nueva Partida -> CaseSelectScene -> elegir caso -> CaseIntro -> briefing."""
            click(512, 330)  # Nueva Partida (va a CaseSelectScene porque hay > 1 caso)
            page.wait_for_timeout(300)
            card_y = 220 + case_index * 150  # ver CaseSelectScene.ts
            click(512, card_y)
            page.wait_for_timeout(300)
            click(512, 540)  # CaseIntroScene: "Ir a la comisaria"
            page.wait_for_timeout(300)

        # --- 1) arranque + flujo principal, Caso 1 ----------------------
        page = new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        click = canvas_click(page)

        start_case(page, click, 0)
        page.screenshot(path="/tmp/smoke_caso1_briefing.png")
        click(512, 300)  # briefing: "Entendido."
        page.wait_for_timeout(250)
        click(512, 366)  # briefing: rechazar sobre extraoficial
        page.wait_for_timeout(400)
        click(375, 150)  # CityMap: Terminal Sur (zona actual)
        page.wait_for_timeout(400)
        click(512, 200)  # Hablar con Don Simon
        page.wait_for_timeout(300)
        click(512, 300)  # preguntar por las medialunas -> da la pista
        page.wait_for_timeout(300)
        click(512, 500)  # Continuar
        page.wait_for_timeout(400)
        click(130, 734)  # Expediente
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/smoke_caso1_expediente.png")
        page.close()
        assert not errors, f"errores de consola en el flujo del caso 1: {errors}"
        print("[OK] Caso 1: flujo principal (menu -> caso -> dialogo -> pista -> expediente)")

        # --- 2) Caso 1: final "resuelto_correcto" vía debug -------------
        page = new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        click = canvas_click(page)
        start_case(page, click, 0)
        click(512, 300); page.wait_for_timeout(250)
        click(512, 300); page.wait_for_timeout(400)  # aceptar sobre (para variar el path)
        page.keyboard.press("Backquote"); page.wait_for_timeout(300)
        click(442, 354)  # "Completar caso (forzar final)"
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/smoke_caso1_ending_resuelto.png")
        page.close()
        assert not errors, f"errores de consola en el final resuelto_correcto (caso 1): {errors}"
        print("[OK] Caso 1: final resuelto_correcto")

        # --- 3) Caso 1: "sospechoso_equivocado" jugado completo ---------
        page = new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        click = canvas_click(page)
        start_case(page, click, 0)
        click(512, 300); page.wait_for_timeout(250)
        click(512, 366); page.wait_for_timeout(400)
        click(894, 734)  # Pizarron
        page.wait_for_timeout(300)
        click(305, 386)  # elegir Km 20 (destino falso) -- SuspectBoardScene usa cols=5
        page.wait_for_timeout(300)
        click(512, 384)  # continuar overlay -> viaja a Km 20
        page.wait_for_timeout(400)
        click(512, 200)  # confrontar al camionero
        page.wait_for_timeout(300)
        click(512, 300)  # arrestarlo (equivocadamente)
        page.wait_for_timeout(300)
        click(512, 500)  # Continuar
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/smoke_caso1_ending_sospechoso_equivocado.png")
        page.close()
        assert not errors, f"errores de consola en sospechoso_equivocado (caso 1): {errors}"
        print("[OK] Caso 1: final sospechoso_equivocado (jugado de punta a punta)")

        # --- 4) Caso 1: "banda_escapa" agotando el reloj vía debug ------
        page = new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        click = canvas_click(page)
        start_case(page, click, 0)
        click(512, 300); page.wait_for_timeout(250)
        click(512, 366); page.wait_for_timeout(400)
        page.keyboard.press("Backquote"); page.wait_for_timeout(300)
        for _ in range(13):
            click(212, 170)  # "+60 min"
            page.wait_for_timeout(120)
        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/smoke_caso1_ending_banda_escapa.png")
        page.close()
        assert not errors, f"errores de consola en banda_escapa (caso 1): {errors}"
        print("[OK] Caso 1: final banda_escapa (deadline agotado)")

        # --- 5) Caso 2: flujo principal + final resuelto_correcto -------
        page = new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        click = canvas_click(page)
        start_case(page, click, 1)
        page.screenshot(path="/tmp/smoke_caso2_briefing.png")
        click(512, 300); page.wait_for_timeout(250)  # Entendido
        click(512, 300); page.wait_for_timeout(400)  # aceptar sobre extraoficial
        page.keyboard.press("Backquote"); page.wait_for_timeout(300)
        click(442, 354)  # "Completar caso (forzar final)"
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/smoke_caso2_ending.png")
        page.close()
        assert not errors, f"errores de consola en el flujo del caso 2: {errors}"
        print("[OK] Caso 2: flujo principal + final forzado")

    print("\nTodo OK. Capturas en /tmp/smoke_*.png")


if __name__ == "__main__":
    run()
