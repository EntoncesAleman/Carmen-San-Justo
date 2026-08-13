import urllib.parse
import subprocess
import time
import os
from PIL import Image, ImageEnhance

OUT_DIR = "/Users/entonces/proyectos/carmen san a/public/assets"

# El modelo de Pollinations no respeta "pixel art" como palabra de estilo
# (probado: la devuelve como ilustración semi-fotorrealista igual). En vez
# de pelear con el prompt, se le pide una ilustración plana, de alto
# contraste y colores saturados — y el look de pixel art de verdad se
# fuerza DESPUÉS, algorítmicamente, con `pixelate()` (downscale + cuantizar
# paleta + reescalar con NEAREST, sin antialiasing). Es el mismo truco que
# usan generadores de pixel art reales: la cuantización garantiza el
# resultado, el prompt de texto no.
STYLE = (
    "portrait bust, flat cel shaded comic book character illustration, thick bold black outlines, "
    "stylized cartoon caricature, exaggerated features, bright saturated flat colors, "
    "simple flat colored background, high contrast, no gradients, no soft shadows, "
    "centered, no text, no watermark, no photorealism"
)

BG_STYLE = (
    "flat cel shaded comic book illustration, thick bold black outlines, stylized graphic novel "
    "environment art, bright saturated flat colors, high contrast, warm sodium-vapor streetlight "
    "glow (mustard yellow) against a dark blue night sky, gritty Buenos Aires urban atmosphere, "
    "wide scene, no people, no gradients, no soft shadows, no text, no watermark, no photorealism"
)

PORTRAIT_PIXEL = dict(block=8, colors=32, saturation=1.15, contrast=1.15)
BACKGROUND_PIXEL = dict(block=10, colors=28, saturation=1.3, contrast=1.15)


def pixelate(path, block, colors, saturation=1.0, contrast=1.0):
    img = Image.open(path).convert('RGB')
    if saturation != 1.0:
        img = ImageEnhance.Color(img).enhance(saturation)
    if contrast != 1.0:
        img = ImageEnhance.Contrast(img).enhance(contrast)
    w, h = img.size
    small = img.resize((max(1, w // block), max(1, h // block)), Image.BILINEAR)
    quant = small.quantize(colors=colors, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    quant.resize((w, h), Image.NEAREST).save(path)

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
    ("npc_colorada_benitez_portrait", 42,
     "neighborhood hairdresser with bright dyed red curly hair, stained work coat, confident gossiping smile, "
     "hair scissors in one hand", 143),
    ("npc_media_lengua_vidal_portrait", 37,
     "small-time bootleg radio announcer, headphones around neck, cheap flashy jacket, "
     "exaggerated showman grin, holding a microphone", 154),
    ("npc_tuerto_ibarra_portrait", 51,
     "auto body shop mechanic with an eyepatch, grease-stained overalls, welding goggles pushed up on forehead, "
     "stern unreadable expression", 165),
    ("npc_beba_corvalan_portrait", 50,
     "taxi driver who knows everything, hard negotiator, denim jacket, mate cup in the cupholder, "
     "arms crossed confident stare", 200),
    ("npc_cacho_domenech_portrait", 47,
     "remise driver and neighborhood information hub, club tracksuit, cold mate in one hand, "
     "friendly gossiping grin", 211),
    ("npc_egidio_paz_portrait", 79,
     "observant retired old man, beret, park bench regular, thermos under one arm, "
     "sharp attentive eyes despite his age", 222),
    ("npc_federico_salaberry_portrait", 45,
     "suspicious elegant lawyer, evasive, impeccable suit, leather briefcase, "
     "polite but untrustworthy smile", 233),
    ("npc_gustavo_salerno_portrait", 53,
     "shady real estate businessman, expensive suit, flashy watch, oily salesman smile", 244),
    ("npc_hombre_de_las_palomas_portrait", 70,
     "cryptic old informant who speaks only in riddles, worn raincoat, breadcrumbs falling from his pockets, "
     "distant dreamy stare, a pigeon on his shoulder", 255),
    ("npc_manteca_ruiz_portrait", 36,
     "street vendor selling everything from a pushcart, umbrella, batteries, flashlights, "
     "eager salesman energy", 266),
    ("npc_marta_yulis_portrait", 52,
     "municipal clerk obsessed with paperwork stamps, cardigan, painted nails, "
     "behind a service window, rehearsed customer service smile", 277),
    ("npc_media_cuadra_ibanez_portrait", 33,
     "mediocre small-time crook, always nervous, hooded sweatshirt, shifty eyes", 288),
    ("npc_perla_sagasti_portrait", 41,
     "rival police inspector, impeccably dressed, leather notebook in hand, competitive confident smirk, "
     "never a hair out of place", 299),
    ("npc_pescador_aguirre_portrait", 58,
     "calm fisherman uninvolved in any case, rubber boots, fishing rod, sun-worn hat, "
     "relaxed unbothered expression", 310),
    ("npc_pipo_escanciano_portrait", 58,
     "owner of a clandestine grill restaurant for off-duty cops, stained apron, "
     "knife in hand, booming friendly presence", 321),
    ("npc_walter_chiodi_portrait", 60,
     "conspiracy theorist neighbor convinced pigeons are surveillance cameras, pajamas at all hours, "
     "tinfoil hat, wide paranoid eyes", 332),
    ("npc_yamila_cospito_portrait", 26,
     "young porteña hacker who trades favors for help, patched denim jacket, sticker-covered laptop under arm, "
     "sharp sarcastic smirk", 343),
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
    ("location_anden_4_background",
     "abandoned train platform at a station at night, trains that never arrive on schedule, "
     "dim overhead lighting, empty benches", 500),
    ("location_bar_fantasma_background",
     "old tango bar interior at night, worn wooden tables, dim warm yellow lighting, "
     "an accordion hanging on the wall, faded photographs", 511),
    ("location_boliche_marejada_background",
     "nightclub coat check area with dim lighting, disco ball glow reflecting on empty coat racks", 522),
    ("location_central_cacho_background",
     "small remise taxi dispatch storefront disguised as an information hub at night, neon sign, "
     "parked cars idling outside", 533),
    ("location_club_remo_barranca_background",
     "exclusive rowing club boathouse by the river at dusk, wealthy old-money atmosphere, "
     "wooden rowing boats stacked on racks", 544),
    ("location_club_ribera_background",
     "suspiciously well-equipped neighborhood sports club facade at night, colorful houses nearby, "
     "a single floodlight over the entrance", 555),
    ("location_delegacion_villa_quieta_background",
     "sleepy municipal government office interior, people drinking mate at their desks, "
     "stacks of untouched paperwork, fluorescent lighting", 566),
    ("location_estacion_fantasma_background",
     "abandoned train station platform at night used for shady deliveries, graffiti, "
     "one flickering broken light", 577),
    ("location_galeria_feria_background",
     "wholesale textile market gallery interior, stacked boxes to the ceiling, "
     "narrow crowded aisles, hand painted price signs", 588),
    ("location_galpon_fabrica_background",
     "industrial warehouse next to train tracks at night, dusty, corrugated metal walls, "
     "graffiti tags, a single hanging light bulb", 599),
    ("location_galpon_televisores_background",
     "dim warehouse interior stacked with old televisions of unknown origin, dusty, "
     "cables everywhere, single work lamp", 610),
    ("location_inmobiliaria_salerno_background",
     "shady real estate office storefront at night, glossy but empty-feeling, "
     "fake property listings in the window", 621),
    ("location_lavadero_brillo_total_background",
     "small car wash at night, neon sign, soap suds on wet pavement, hoses coiled up", 632),
    ("location_lo_de_pipo_background",
     "clandestine grill restaurant for off-duty police at night, smoky, string lights, "
     "wooden tables and a parrilla grill glowing with embers", 643),
    ("location_peluqueria_bochin_background",
     "unisex neighborhood hair salon interior at night, retro chairs and mirrors, "
     "gossip magazines on a side table", 654),
    ("location_plaza_lomas_bajas_background",
     "small neighborhood park plaza at dusk, a wooden bench, a basketball court nearby, "
     "old trees and a street lamp", 665),
    ("location_porton_cervecera_background",
     "large brewery factory gate at night, industrial steam rising, tall chain-link fence, "
     "warm sodium lights over the entrance", 676),
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
        if size:
            pixelate(path, **PORTRAIT_PIXEL)
        print(f"{name}: {size} bytes")
        time.sleep(1)

    for name, desc, seed in BACKGROUNDS:
        prompt = f"wide illustration of {desc}, {BG_STYLE}"
        url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=1280&height=720&nologo=true&seed={seed}"
        path = f"{OUT_DIR}/backgrounds/{name}.png"
        size = download(url, path)
        if size:
            pixelate(path, **BACKGROUND_PIXEL)
        print(f"{name}: {size} bytes")
        time.sleep(1)


if __name__ == "__main__":
    main()
