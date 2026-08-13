"""Verifica que 'Explorar' en Terminal Sur (caso1) ahora otorga
clue_bolsa_medialunas_explorar, en vez de solo texto random sin efecto.
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

        click(512, 330)  # Nueva Partida
        page.wait_for_timeout(400)
        click(512, 708)  # Ir a la escena del hecho
        page.wait_for_timeout(400)
        skip()
        click(512, 300)  # Entendido
        page.wait_for_timeout(250)
        skip()
        click(512, 366)  # rechazar sobre
        page.wait_for_timeout(500)

        click(375, 150)  # Terminal Sur (zona actual)
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/explore_00_before.png")
        click(150, 728)  # Explorar
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/explore_01_result.png")
        click(512, 400)  # cerrar overlay
        page.wait_for_timeout(300)
        click(150, 728)  # Explorar de nuevo -- no debería repetir la pista
        page.wait_for_timeout(400)
        page.screenshot(path="/tmp/explore_02_second_click.png")

        browser.close()

        if errors:
            print("ERRORES DE CONSOLA:")
            for e in errors:
                print(" ", e)
        else:
            print("[OK] sin errores de consola")


if __name__ == "__main__":
    run()
