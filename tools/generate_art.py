import urllib.parse
import subprocess
import time
import os

OUT_DIR = "/Users/entonces/proyectos/carmen san a/public/assets"

STYLE = (
    "flat cel shaded comic book character illustration, thick bold black outlines, "
    "stylized cartoon caricature, video game concept art, exaggerated features, "
    "flat colors no gradients, warm yellow rim light against dark navy blue flat background, "
    "graphic novel style, centered, plain background, no text, no watermark, no photorealism"
)

BG_STYLE = (
    "flat cel shaded comic book illustration, thick bold black outlines, stylized graphic novel "
    "environment art, video game background art, flat colors no gradients, warm sodium-vapor "
    "streetlight glow (mustard yellow) against a dark navy blue night sky, moody saturated colors, "
    "gritty gritty Buenos Aires urban atmosphere, wide scene, no people, no text, no watermark, no photorealism"
)

CHARACTERS = [
    ("character_police_main_portrait", 47,
     "tired Argentine police inspector, worn dark leather jacket over wrinkled shirt, "
     "sunglasses pushed up on messy slicked hair, sarcastic tired half smile, stubble", 7),
    ("npc_hugo_bracamonte_portrait", 55,
     "corrupt police chief, ill-fitting suit stretched over his belly, big gaudy gold ring, "
     "greasy confident smile, slicked back hair, double chin", 11),
    ("npc_simon_achaval_portrait", 68,
     "neighborhood kiosk shopkeeper, grey work coat, thick magnifying reading glasses low on nose, "
     "calm knowing smile, wispy grey hair", 21),
    ("npc_aldo_reissig_portrait", 61,
     "veteran police officer, impeccable uniform, neatly trimmed grey mustache, tired knowing eyes", 33),
    ("npc_armando_petrocelli_portrait", 64,
     "washed-up tango bar singer, worn shiny suit, bandoneon accordion under one arm, dramatic pose", 44),
    ("npc_nazareno_quiroga_portrait", 38,
     "paranoid journalist, jacket with too many pockets, old tape recorder in hand, wide manic eyes", 55),
    ("npc_marina_ithurbide_portrait", 29,
     "strict by-the-book police cadet, perfectly pressed uniform, notebook in hand, disapproving stare", 66),
    ("npc_el_ingeniero_contreras_portrait", 44,
     "cartoonish small-time gangster who calls himself an engineer, golf polo shirt, oversized flashy watch, "
     "nervous smug grin", 77),
    ("npc_camionero_catering_portrait", 39,
     "confused catering truck driver, company uniform, faded logo cap, indignant expression", 88),
    ("npc_chiche_molina_portrait", 51,
     "obsessive gang accountant terrified for the first time in his life, worn suit, pocket calculator, "
     "crooked tie", 99),
    ("npc_toto_ferradas_portrait", 49,
     "used car dealership owner, checkered shirt, pen behind his ear, indignant proud expression, "
     "soccer club fan", 110),
    ("npc_bocha_ferreyra_portrait", 34,
     "cocky small-time soccer club equipment manager, worn tracksuit, backwards cap, nervous smug grin, "
     "always chewing something", 121),
    ("npc_turco_almada_portrait", 44,
     "street vendor with a folding table of counterfeit watches and sunglasses, confused innocent expression", 132),
]

BACKGROUNDS = [
    ("location_kiosco_simon_background",
     "small Argentine neighborhood kiosk on a street corner at night, corrugated metal shutters, "
     "hand painted sign, cigarette and candy displays", 111),
    ("location_muelle_anguila_background",
     "small wooden boat rental dock on a river delta at night, moored rowboats, wooden posts, "
     "misty water, distant silhouette of trees on islands", 222),
    ("location_comisaria_0_background",
     "run down neighborhood police station facade at night, peeling paint, a single lit window, "
     "an old patrol car parked outside", 333),
    ("location_concesionaria_rebusque_background",
     "row of used car dealerships along a wide avenue at night, plastic pennant flags strung overhead, "
     "windshields with hand painted prices, a bus stop on the corner", 444),
]


def download(url, path, retries=3):
    for attempt in range(retries):
        try:
            result = subprocess.run(
                ["curl", "-s", "-f", "-o", path, "--max-time", "90", url],
                capture_output=True,
                timeout=100,
            )
            if result.returncode == 0 and os.path.exists(path) and os.path.getsize(path) > 1000:
                return os.path.getsize(path)
            print(f"  retry {attempt+1}/{retries}: curl exit {result.returncode}, stderr={result.stderr.decode()[:200]}")
        except Exception as e:
            print(f"  retry {attempt+1}/{retries} failed: {e}")
        time.sleep(3)
    return 0


def main():
    os.makedirs(f"{OUT_DIR}/characters", exist_ok=True)
    os.makedirs(f"{OUT_DIR}/backgrounds", exist_ok=True)

    for name, age, desc, seed in CHARACTERS:
        prompt = f"portrait bust of a {age} year old {desc}, {STYLE}"
        url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=768&height=768&nologo=true&seed={seed}"
        path = f"{OUT_DIR}/characters/{name}.png"
        size = download(url, path)
        print(f"{name}: {size} bytes")
        time.sleep(1)

    for name, desc, seed in BACKGROUNDS:
        prompt = f"wide illustration of {desc}, {BG_STYLE}"
        url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=1280&height=720&nologo=true&seed={seed}"
        path = f"{OUT_DIR}/backgrounds/{name}.png"
        size = download(url, path)
        print(f"{name}: {size} bytes")
        time.sleep(1)


if __name__ == "__main__":
    main()
