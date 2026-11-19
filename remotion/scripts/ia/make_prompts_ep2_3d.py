# The Invisible Audience ep2 — 3D prompt sheet (Google Flow / Nano Banana for stills, Pollo image-to-video for clips).
# Built on the 2026-11-19 "prompt guide": canon first (character sheets, location masters, style block), blocks pasted
# verbatim, every reference image given one job, positive wording only (no negative fields in Gemini/Flow),
# image-to-video prompts describe motion only. Output: one HTML page with copy buttons.
# usage: python3 make_prompts_ep2_3d.py <out.html>
import html, sys

STYLE = ("STYLE: the exact 3D look of the attached character reference images: smooth matte white vinyl-toy characters, soft rounded shapes, sculpted clay-like hair, "
         "soft top light with gentle shadows, clean and minimal, the same look in every image. Palette: bodies off-white #ECEBEE, background navy #0B2352, warm accent light #F2B45A.")
ENV_STYLE = ("STYLE: a minimal 3D set in the same 3D look as the characters: a seamless dark navy studio floor and backdrop #0B2352 that fades into darkness, "
             "only a few simple rounded matte props in soft muted colours, soft light, lots of empty space, clean and calm. Every set in this video uses this same navy studio.")
BODY = ("a smooth matte off-white rounded body with no clothing, a large round head, two small black dot eyes, a small simple mouth, "
        "short rounded arms and legs, about 2.5 heads tall, exactly like the attached character reference images")
C = {   # matches the approved 3D sheets (2026-11-19)
 "YOU": f"YOU (the main character): {BODY}; short caramel-brown hair #B98563 swept up into a big soft wave on top.",
 "BLONDE": f"BLONDE (the partner): {BODY}; long straight golden-yellow hair #E7B54A falling past the shoulders, center part.",
 "RED": f"RED: {BODY}; orange-red hair #D0612F made of many small round ball-shaped curls.",
 "BOB": f"BOB: {BODY}; dark-brown bob haircut #5B3322 at chin length with a side part.",
 "SENPAI": f"SENPAI (the older coworker): {BODY}; short neat dark navy-black hair #2F3442 with a side part; thin black rectangular glasses.",
}
NAVY_BG = "Background: plain solid dark navy #0B2352, nothing else in the frame, no text. 16:9, highest resolution."

def sheet(key, extra=""):   # only for remaking a sheet: the 5-character lineup is blurry and is not used anywhere
    return (f"Recreate this 3D character reference sheet at higher quality, the same character in every view.\n"
            f"Image 1 = {key}'s approved reference sheet (keep the design exactly).\n"
            f"{C[key]}{extra}\n"
            f"Layout: left, a front close-up of the face with a neutral expression; right, four full-body views side by side at equal height with the tops of the heads and the feet aligned: front, three-quarter, true side profile, back. Relaxed standing pose, arms slightly away from the body.\n"
            f"Plain flat mid-grey background #9097A6, flat even light, nothing else, no text, no labels.\n{STYLE}\nAspect ratio 16:9, highest resolution.")

def pose(keys, scene, roles):
    blocks = "\n".join(C[k] for k in keys)
    return (f"{roles}\n{blocks}\nScene: {scene}\nKeep the face, hair shape, hair colour and body proportions exactly as in the reference images.\n{STYLE}\n{NAVY_BG}")

def r1(k):   # one job per reference image: the cut-outs made from the approved sheets
    return f"Image 1 = {k}_face (face and hair). Image 2 = {k}_front (body shape and proportions). Use them for this one character only."

LOC = {
 "B1": ("SET_APT1", "first cheap apartment", "Props only: a small plain window frame floating on the backdrop showing tiny distant city lights, a small sink with a faucet on frame-left, one bare light bulb hanging from above.", "Light: one dim warm bulb light from above #F2B45A."),
 "B2": ("SET_OFFICE", "the office at night", "Props only: one simple desk with a closed laptop and a small desk lamp on frame-right, two more plain desks fading into the dark behind it.", "Light: the desk lamp is the only warm light, everything else dark navy."),
 "B3": ("SET_GROCERY", "grocery shelf", "Props only: one short shelf on frame-left with a few rounded boxes and bottles in soft muted colours with plain fronts, a small shopping basket on the floor.", "Light: soft cool white light from above."),
 "B4": ("SET_STREET", "the walk home", "Props only: two simple street lamps standing on the navy floor, evenly spaced, a thin pale line on the floor as the edge of a sidewalk.", "Light: two warm pools of lamp light #F2B45A on the floor."),
 "B5": ("SET_BEDROOM", "bedroom before dawn", "Props only: a simple bed in the center with a plain blanket, a small nightstand on frame-right with a round alarm clock whose face glows plainly.", "Light: dark blue pre-dawn light, the clock face is the only small warm glow."),
 "B6": ("SET_COFFEE", "office coffee corner", "Props only: a short counter in the center with a simple coffee machine and three plain mugs.", "Light: pale grey-blue morning light from frame-right."),
 "B7": ("SET_PARKING", "parking lot at night", "Props only: one sleek dark rounded sedan in the center facing frame-left, one tall lamp post on frame-left.", "Light: orange lamp light #F2B45A from the post, faint shine on the floor."),
 "B8": ("SET_APT2", "the new big quiet apartment", "Props only: a large plain window frame on the backdrop showing city lights, a long low sofa on frame-left, a small dining table with two chairs on frame-right, a plain door on the far right.", "Light: one warm pendant lamp above the table #F2B45A, cool light from the window."),
 "B9": ("SET_HOUSE", "senpai's nice house", "Props only: a simple two-story rounded house model in the center with warm lit windows, a small car beside it on frame-right.", "Light: warm window light #F2B45A, the rest dark navy."),
 "B10": ("SET_APT3", "small apartment near work, morning", "Props only: a plain window frame on frame-right with soft sunlight, a small round table under it with one coffee mug.", "Light: soft warm morning sunlight from frame-right, the navy studio slightly brighter."),
}
def loc_block(k):
    i, name, lay, light = LOC[k]
    return f"SET {i} ({name}), in the seamless dark navy studio: {lay} {light}"
def master(k):
    return (f"Image 1 = YOU_front (the 3D look only, copy no character).\nCreate an EMPTY minimal 3D set, no characters.\n{loc_block(k)}\n"
            f"View: wide shot, slightly from the side, at eye level. The lower third of the frame is open navy floor where characters will stand. Screens and labels stay blank.\n{ENV_STYLE}\nAspect ratio 16:9, highest resolution.")

PROPS = {
 "G1": ("dripping faucet", "0:37", "a small kitchen faucet with one round drop of water falling from it, close-up"),
 "G2": ("worn-out shoe", "0:41", "one worn-out everyday sneaker with a thin, cracked sole, close-up"),
 "G3": ("pile of bills", "4:01–4:10", "a messy pile of plain paper bills and envelopes, a few with a plain red stamp mark, all paper surfaces blank"),
 "G4": ("car that won't start (also the source for clip V4)", "4:10–4:24", "a small old rounded car stopped with its hood open and a little grey smoke rising"),
 "G5": ("untouched takeout box", "5:30", "a closed takeout food box with chopsticks resting on top, untouched"),
 "G6": ("broken laptop", "7:07–7:13", "an open laptop with a cracked dark screen, close-up"),
}
def prop(desc):
    return f"One object only, centered: {desc}.\n{STYLE}\nBackground: plain solid dark navy #0B2352, nothing else in the frame, no text. 16:9, highest resolution."


# ---- money & happiness symbols (2026-11-19): what the narration says, shown as objects in the same navy studio ----
def symbol(desc):
    return (f"Image 1 = the approved set B1 (the navy studio, the 3D look and the light only; copy none of its props).\n"
            f"In the seamless dark navy studio, one simple symbolic scene, no characters: {desc}\n"
            f"Coins have plain smooth faces, paper money and cards are plain and blank, nothing has letters, numbers or symbols printed on it. "
            f"Centered, lots of empty navy space around it.\n{ENV_STYLE}\nAspect ratio 16:9, highest resolution.")
M = [
 ("M1", "お金の山が育つ", True, "0:02「$75,000 a year」／1:07 昇給", "three stacks of round gold coins in the center, short, medium and tall from left to right, warm light on the gold #F2B45A.",
  "The coin stacks grow taller one coin at a time with small soft bounces. The camera stays still. The studio stays the same."),
 ("M2", "幸せの風船が止まる", True, "0:05「more money stops making you happier」", "a stack of gold coins on the left; on the right, a soft yellow round balloon with a simple smiling face tied to the floor by a string, floating at a fixed height.",
  "Coins keep piling up on the left while the smiling balloon rises a little and then stops, gently bobbing at the same height. The camera stays still."),
 ("M3", "すぐ色あせるプレゼント", True, "1:20「the feeling quietly faded」", "a shiny wrapped gift box glowing warmly with small sparkles around it, on the navy floor.",
  "The warm glow and sparkles slowly fade until the gift box is a plain dull grey box. The camera slowly pushes in a little. Nothing else changes."),
 ("M4", "宝くじの大当たり", True, "1:35「won major lottery prizes」", "a big plain golden ticket shape lying on the floor with a burst of soft colourful confetti frozen in the air above it.",
  "Confetti bursts up from the golden ticket and slowly falls down around it. The camera stays still."),
 ("M5", "上がり続ける床（慣れ）", False, "2:00「When your baseline jumps overnight」", "a short staircase of soft rounded steps rising toward frame-right, a small warm spotlight circle on the lowest step.",
  "The warm spotlight circle slides up one step, then the next, and each step it leaves turns dull. The camera stays still."),
 ("M6", "薄い財布と最初の給料", False, "0:29「Your first paycheck wasn't much」", "a thin worn wallet lying open with a single plain paper bill and two small coins beside it.", None),
 ("M7", "お金の傘", True, "4:01「misfortune hurts more」／8:06「Money is best at softening pain」", "a small umbrella made of a big plain gold coin as its canopy, standing on the floor; grey raindrops fall around it and the floor under it stays dry.",
  "Grey rain falls steadily around the coin umbrella; the drops slide off the gold canopy and the floor under it stays dry. The camera stays still."),
 ("M8", "お金が届かない痛み", True, "6:39「Some suffering is simply beyond the reach of money」", "a cracked grey heart-shaped stone sitting on the floor in a pool of cool light, a few gold coins lying around it untouched.",
  "Gold coins drop from above and bounce away around the cracked grey heart without touching it; the heart stays exactly the same. The camera stays still."),
 ("M9", "天秤（関係はあるけど小さい）", False, "7:20「real, but modest」", "a simple balance scale: on the left pan a tall stack of gold coins, on the right pan a small soft yellow smiling ball; the scale tips only slightly.",
  "The scale sways gently and settles with only a slight tilt. The camera stays still."),
 ("M10", "国ごとに違う頭打ち", False, "7:34「varies widely by country」", "a small round matte globe in the center with five gold coin stacks of very different heights standing around it in a half circle.",
  "The globe turns slowly while the coin stacks rise to their different heights one by one. The camera stays still."),
 ("M11", "一緒に動く2つの風船（原因とは限らない）", False, "7:47「the two move together. Slightly.」", "two balloons floating side by side: a gold coin-shaped balloon and a soft yellow smiling balloon, their strings loosely tied together.",
  "The two balloons drift upward together just a little, side by side, then hover. The camera stays still."),
]

A_LINE = "そのキャラの設定画（作り直すときだけ）"
def files(*names): return "、".join(names)

SECTIONS = []
SECTIONS.append(("S", "0. 正典（キャラ設定画）— 完成済み（記録用。作り直すときだけ使う）", [
 ("S1", "主人公 YOU の設定画", True, A_LINE, "全編の参照のもと", [("画像", sheet("YOU"))]),
 ("S2", "先輩 SENPAI の設定画", True, A_LINE, "先輩が出る全カットの参照", [("画像", sheet("SENPAI"))]),
 ("S3", "BLONDE（パートナー）の設定画", True, A_LINE, "5:25、宝くじ", [("画像", sheet("BLONDE"))]),
 ("S4", "RED の設定画", False, A_LINE, "宝くじの場面", [("画像", sheet("RED"))]),
 ("S5", "BOB の設定画", False, A_LINE, "宝くじの場面", [("画像", sheet("BOB"))]),
]))
SECTIONS.append(("B", "1. 場所のマスター背景（キャラなし・10枚）— 完成済み（記録用）", [
 (k, f"{LOC[k][1]}（{LOC[k][0]}）", k in ("B1", "B2", "B4", "B6", "B7", "B8"), "YOU_front（画風の参考）。2枚目以降は、できたB1も付けると揃う",
  {"B1": "0:32〜0:48", "B2": "1:01〜1:07、2:24〜", "B3": "0:18〜0:23", "B4": "1:14〜1:20（動画V1）", "B5": "1:28〜1:33（動画V2）", "B6": "2:44〜2:51、8:15", "B7": "6:48〜6:57（動画V6）", "B8": "4:24〜、5:26〜5:43（動画V5）", "B9": "2:31〜2:36", "B10": "7:02〜7:07（動画V7）"}[k],
  [("画像", master(k))]) for k in LOC]))
P = [
 ("P1", "YOU 夢を見る", True, ["YOU"], "0:48〜1:00", "YOU looks up dreamily with a soft smile, both hands together at his chest, a small empty round thought bubble floating above his head. Full body, centered."),
 ("P2", "YOU 残業", True, ["YOU"], "1:01〜1:06", "YOU sits on an office chair at a simple desk, typing on a laptop, tired half-closed eyes, a desk lamp glow on his face. Full body, three-quarter view."),
 ("P3", "YOU 買い物袋を持って笑う", True, ["YOU"], "1:07〜1:14", "YOU walks toward frame-right holding one shopping bag, big happy smile, side view, full body."),
 ("P4", "YOU 暗い朝、ため息", False, ["YOU"], "1:28〜1:33", "YOU sits on the edge of a bed, shoulders slumped, sighing, a small puff of breath near his mouth. Full body, front view."),
 ("P5", "YOU スマホの残高を見て不安", False, ["YOU"], "0:23〜0:27、4:05〜4:10", "YOU stands looking down at a phone held in both hands, worried face, one small sweat drop on his head. Full body, front view."),
 ("P6", "YOU 給料の数字を見て固まる", True, ["YOU"], "4:27〜4:35", "YOU stands holding a phone up in front of him with both hands, eyes wide, mouth a small open circle, amazed. Full body, three-quarter view."),
 ("P7", "YOU 古い靴を見る", False, ["YOU"], "0:41〜0:48", "YOU sits on the floor holding one worn-out sneaker, looking at its thin sole, a little sad. Full body, three-quarter view."),
 ("P8", "YOU ひとりで食卓に座る", True, ["YOU"], "5:26〜5:43", "YOU sits alone at a simple dining table on a chair, chin resting on one hand, staring down at a closed takeout box in front of him, lonely. Full body, three-quarter view."),
 ("P9", "YOU ゆっくりコーヒー", True, ["YOU"], "7:02〜7:07", "YOU stands holding a coffee mug with both hands near his chest, eyes closed, calm small smile. Full body, three-quarter view."),
 ("P10", "YOU 考える", False, ["YOU"], "2:55〜3:10、7:56〜", "YOU stands with one hand on his chin, looking up thoughtfully. Full body, front view."),
 ("P11", "SENPAI 自信がある", True, ["SENPAI"], "2:24〜2:40", "SENPAI stands confidently holding a car key in one hand, slight smile. Full body, three-quarter view."),
 ("P12", "SENPAI コーヒーの前でため息", True, ["SENPAI"], "2:44〜2:51、8:15", "SENPAI stands holding a coffee mug, shoulders dropped, tired face, sighing. Full body, three-quarter view."),
 ("P13", "SENPAI 食事中にスマホ", False, ["SENPAI"], "2:51〜2:57", "SENPAI sits on a chair at a small table with a plate, looking down at a phone in his hand, frowning. Full body, three-quarter view."),
 ("P15", "BLONDE 出ていく", False, ["BLONDE"], "5:25〜5:27", "BLONDE walks toward frame-right pulling a small suitcase, head down, side view, full body."),
]
SECTIONS.append(("P", "2. キャラのポーズ（紺の背景・切り抜いて重ねる用）", [
 (i, t, st, f"{keys[0]}_face と {keys[0]}_front", w, [("画像", pose(keys, sc, r1(keys[0])))]) for i, t, st, keys, w, sc in P] + [
 ("P16", "当選者たち、ふつうの顔に戻る", False, "BLONDE_front・RED_front・BOB_front", "1:44〜1:52",
  [("画像", pose(["BLONDE", "RED", "BOB"], "BLONDE stands on the left, RED in the middle, BOB on the right, side by side, arms down, plain ordinary slightly bored faces, holding nothing. Exactly three characters. Full bodies.",
    "Image 1 = BLONDE_front. Image 2 = RED_front. Image 3 = BOB_front. Each image is for that one character only. Use exactly these three characters."))]),
 ("K2", "当選者たち、喜んで跳ねる（動画V3の元）", True, "BLONDE_front・RED_front・BOB_front", "1:40〜1:44",
  [("画像", pose(["BLONDE", "RED", "BOB"], "BLONDE on the left, RED in the middle, BOB on the right jump with joy, arms raised, together holding one big oversized prize check with a clean blank surface. Exactly three characters. Full bodies.",
    "Image 1 = BLONDE_front. Image 2 = RED_front. Image 3 = BOB_front. Each image is for that one character only. Use exactly these three characters."))]),
]))
SECTIONS.append(("G", "3. 小物（紺の背景）", [(k, v[0], k in ("G1", "G4"), "YOU_front＋B1（画風と光の参考）", v[1], [("画像", "Image 1 = YOU_front (the 3D look only, copy no character). Image 2 = the approved set B1 (the studio look and light only).\n" + prop(v[2]))]) for k, v in PROPS.items()]))

SECTIONS.append(("M", "4. お金と幸せのイメージ（キャラなし・同じ紺のスタジオ）", [
 (i, t, st, "B1（スタジオの見た目と光だけ）", w, [("画像", symbol(d))] + ([("Pollo の動画プロンプト（この画像を入れて動かす・5秒）", v)] if v else [])) for i, t, st, w, d, v in M]))

def comp(char_keys, loc, scene, roles):
    blocks = "\n".join(C[k] for k in char_keys)
    return (f"{roles}\n{blocks}\n{loc_block(loc)}\nScene: {scene}\nKeep the set exactly as in the set image: navy studio, props, positions, colours and light. "
            f"Keep the character's face, hair and proportions exactly as in the character images. Light the character with the room's light.\n{STYLE}\nAspect ratio 16:9, highest resolution.")
V = [
 ("V1", "昇給の夜、買い物袋を持って歩く", True, "B4（完成した背景）＋YOU_face＋YOU_front", "1:14〜", comp(["YOU"], "B4", "YOU walks between the street lamps toward frame-right holding one shopping bag, big happy smile, side view, on the navy floor in the lower third.",
   "Image 1 = the set (props, layout and light). Image 2 = YOU_face (face and hair). Image 3 = YOU_front (body shape and proportions)."),
   "YOU walks steadily from left to right between the lamps, swinging the shopping bag slightly, a light bounce in each step. The camera stays still. The lamps and the set stay exactly the same for the whole clip."),
 ("V2", "暗い朝、目覚ましでため息", False, "B5（完成した背景）＋YOU_face＋YOU_front", "1:28〜", comp(["YOU"], "B5", "YOU lies in the bed under the blanket, eyes open, looking at the ceiling.",
   "Image 1 = the set (props, layout and light). Image 2 = YOU_face (face and hair). Image 3 = YOU_front (body shape and proportions)."),
   "The alarm clock glows a little brighter, then YOU slowly sits up in bed and lets out one long tired sigh, shoulders dropping. The camera stays still. The room stays dark and unchanged."),
 ("V3", "宝くじの当選者が跳ねる", True, "K2（できた画像をそのまま使う）", "1:40〜", None,
   "The three characters jump up and down with joy, arms raised, holding the big blank check; colourful confetti falls around them. The camera stays still. Their faces and hair stay the same for the whole clip."),
 ("V4", "車が動かない朝", False, "G4（できた画像をそのまま使う）", "4:15〜", None,
   "The small car shakes a little as the engine fails to start, then a puff of grey smoke rises from the open hood and drifts up. The camera stays still and the car keeps its shape."),
 ("V5", "パートナーが出ていく", True, "B8（完成した背景）＋BLONDE_face＋BLONDE_front", "5:25〜", comp(["BLONDE"], "B8", "BLONDE walks toward the plain door on the far right pulling a small suitcase, head down, side view, in the lower third of the frame.",
   "Image 1 = the set (props, layout and light). Image 2 = BLONDE_face (face and hair). Image 3 = BLONDE_front (body shape and proportions)."),
   "BLONDE slowly walks to the door pulling the suitcase without looking back and leaves the frame. The camera stays still. The apartment stays exactly the same, quiet and still."),
 ("V6", "先輩が車の中で動かない", True, "B7（完成した背景）＋SENPAI_face＋SENPAI_front", "6:48〜", comp(["SENPAI"], "B7", "SENPAI sits in the driver's seat of the dark sedan, seen through its open side window, engine off, one hand resting on the steering wheel, staring ahead.",
   "Image 1 = the set (the car, the lamp and the light). Image 2 = SENPAI_face (face and hair). Image 3 = SENPAI_front (body shape and proportions)."),
   "SENPAI stays almost still, staring ahead, then his shoulders rise and fall in one slow heavy sigh. Faint raindrops slide down the car window. The camera stays still. His face, hair and glasses stay the same for the whole clip."),
 ("V7", "ゆっくり飲むコーヒーの朝", True, "B10（完成した背景）＋YOU_face＋YOU_front", "7:02〜", comp(["YOU"], "B10", "YOU stands by the window frame holding a coffee mug with both hands, eyes closed, calm small smile, three-quarter view, in the lower third of the frame.",
   "Image 1 = the set (props, layout and light). Image 2 = YOU_face (face and hair). Image 3 = YOU_front (body shape and proportions)."),
   "Soft steam rises from the mug; YOU slowly lifts it and takes one calm sip; the sunlight gently brightens. The camera stays still. The room stays the same."),
]

import re as _re, base64 as _b64, io as _io, os as _os
REF_DIR = _os.environ.get("REF_DIR", "/home/user/ia_ep2")
SET_FILES = {"B1": "B1_apt1", "B2": "B2_office", "B3": "B3_grocery", "B4": "B4_street", "B5": "B5_bedroom", "B6": "B6_coffee", "B7": "B7_parking", "B8": "B8_apt2", "B9": "B9_house", "B10": "B10_apt3"}
WHO_JA = {"YOU": "主人公（茶髪）", "SENPAI": "先輩（メガネ）", "BLONDE": "金髪の子", "RED": "赤い巻き毛の子", "BOB": "ボブの子"}
_IMGS = {}
def _ref(tok):
    from PIL import Image
    if tok in SET_FILES: path, label = f"{REF_DIR}/sets/{SET_FILES[tok]}.jpg", f"背景 {tok}"
    else:
        who, part = tok.split("_"); path = f"{REF_DIR}/canon/{tok}.png"; label = f"{WHO_JA[who]}の{'顔' if part == 'face' else '全身'}"
    if tok not in _IMGS and _os.path.exists(path):
        im = Image.open(path).convert("RGB"); im.thumbnail((1400, 1400)); b = _io.BytesIO(); im.save(b, "JPEG", quality=88)
        _IMGS[tok] = "data:image/jpeg;base64," + _b64.b64encode(b.getvalue()).decode()
    return label
def refs_html(att):
    toks = []
    for t in _re.findall(r"(?:YOU|SENPAI|BLONDE|RED|BOB)_(?:face|front)|B10|B\d", att):
        if t not in toks: toks.append(t)
    if not toks: return ""
    items = "".join(f'<figure><img data-ref="{t}" alt=""><figcaption>{html.escape(_ref(t))}</figcaption></figure>' for t in toks)
    return f'<div class="refs">{items}</div><p class="hint">↑この画像を添付（長押しで写真に保存できる）。左から Image 1、Image 2…の順。</p>'

def card(i, title, star, att, when, blocks):
    b = "".join(f'<div class="lab">{html.escape(l)}</div><div class="pr"><pre>{html.escape(t)}</pre><button onclick="cp(this)">コピー</button></div>' for l, t in blocks)
    return f'<section class="card"><h3><span class="id">{i}</span> {html.escape(title)}{" <span class=star>★</span>" if star else ""}</h3><p class="meta">使う場所：{html.escape(when)}</p>{refs_html(att) or f'<p class="meta">添付：{html.escape(att)}</p>'}{b}</section>'
ONLY = [x for x in _os.environ.get("ONLY", "").split(",") if x]   # e.g. ONLY=P1,P2 -> a short sheet with just those cards
if ONLY:
    SECTIONS = [(k, n, [it for it in items if it[0] in ONLY]) for k, n, items in SECTIONS]
    SECTIONS = [x for x in SECTIONS if x[2]]
    V = [v for v in V if v[0] in ONLY]
body = ""
SECTIONS.sort(key=lambda x: {"P":0,"G":1,"M":2,"B":8,"S":9}[x[0]])
for k, name, items in [x for x in SECTIONS if x[0] in "PGM"]:
    body += f'<h2 id="{k}">{html.escape(name)}</h2>' + "".join(card(*it) for it in items)
body += '<h2 id="V">5. キャラの動画（Pollo・5秒・音なし・ロゴなしで書き出す）</h2>'
body += "".join(card(i, t, st, a, w, ([("① 動画の最初のコマになる画像（Flowで作る）", ip)] if ip else []) + [("② Pollo の動画プロンプト（動きだけ。①の画像を入れて使う）", vp)]) for i, t, st, a, w, ip, vp in V)
for k, name, items in [x for x in SECTIONS if x[0] in "BS"]:
    body += f'<h2 id="{k}">{html.escape(name)}</h2>' + "".join(card(*it) for it in items)
NOTE = """<b>作る順番（この順を守るとズレない）</b><br>正典は完成した5人の設定画。添付するのは制作部が切り分けた参照画像（例：YOU_face＝顔と髪、YOU_front＝全身の正面）。カードに書いてある名前のファイルを付ける。<br>背景はぜんぶ「同じ紺のスタジオ＋小物1〜3個」だけにしてある（場面ごとに部屋を作らない）。<br>
① 設定画（S1〜S5）は完成。あとで別の絵が良く見えても、設定画を基準にする。<br>② 参照画像（顔・正面・斜め・横・後ろ）は制作部が切り分け済み。<br>
③ 背景（B）は完成。次は P のポーズ → G の小物 → M のお金と幸せのイメージ。<br>
④ 動画は、まず画像を Flow で作って、気に入ったものだけを Pollo で動かす（M は画像のカードに動画のプロンプトも付いている）。<br>・画像は Flow で選べる一番大きいサイズ（2K／4K）で書き出す。<br><br>
<b>守ること</b><br>
・プロンプトは書き換えずにそのまま貼る（言い換えるとズレる）。直したいときは1回に1か所だけ。<br>
・ズレ始めたら、前の結果ではなく、最初に決めた設定画を添付し直す。<br>
・長く使った会話でズレたら、新しい会話で設定画を添付し直す。<br>
・Pollo には動きだけを書く（見た目を書き直すと、元の画像から離れる）。動きは1つ、カメラは止めたまま。<br>
・画面の文字（看板、スマホ、小切手）は空白で作る。文字はこっちで入れる。<br>
・検品は「設定画と並べて」：髪の形と色、目と口、体の太さと頭の大きさ、背景なら窓・家具・光の向き。動画は最初・真ん中・最後のコマ。"""
page = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IA第2本 3Dプロンプト</title>
<style>
:root{{--bg:#f6f7fb;--card:#fff;--fg:#151a26;--mute:#5d667a;--line:#dde2ec;--acc:#2b6ef2;--pre:#f1f3f8}}
@media (prefers-color-scheme:dark){{:root{{--bg:#0d111a;--card:#161c28;--fg:#e8ecf5;--mute:#98a3b8;--line:#263044;--acc:#7aa7ff;--pre:#0f1520}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Hiragino Sans",system-ui,sans-serif}}
main{{max-width:760px;margin:0 auto;padding:16px}} h1{{font-size:20px;margin:8px 0}} h2{{font-size:17px;margin:28px 0 10px;padding-top:6px;border-top:2px solid var(--line)}}
nav a{{display:inline-block;margin:4px 10px 4px 0;color:var(--acc);text-decoration:none}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:10px 0}}
h3{{font-size:16px;margin:0 0 4px}} .id{{color:var(--acc);font-weight:700}} .star{{color:#e0a020}} .meta{{color:var(--mute);font-size:13px;margin:0 0 8px}} .lab{{font-size:12px;color:var(--mute);margin:8px 0 4px}}
.pr{{position:relative}} pre{{white-space:pre-wrap;word-break:break-word;background:var(--pre);border-radius:8px;padding:10px 10px 38px;margin:0;font:13px/1.5 ui-monospace,Menlo,monospace}}
button{{position:absolute;right:8px;bottom:8px;border:0;border-radius:6px;padding:5px 12px;background:var(--acc);color:#fff;font-size:13px}}
.refs{{display:flex;gap:8px;overflow-x:auto;margin:4px 0}} figure{{margin:0;flex:0 0 auto;width:110px}} figure img{{width:110px;height:110px;object-fit:cover;border-radius:8px;border:1px solid var(--line);background:#9097a6}} figcaption{{font-size:11px;color:var(--mute);line-height:1.3;margin-top:3px}} .hint{{font-size:12px;color:var(--mute);margin:2px 0 8px}}
.note{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:14px}}
</style></head><body><main><h1>The Invisible Audience 第2本　3D版プロンプト</h1><div class="note">{NOTE}</div>
<nav><a href="#P">2 ポーズ</a><a href="#G">3 小物</a><a href="#M">4 お金と幸せ</a><a href="#V">5 キャラ動画</a><a href="#B">1 背景（済）</a><a href="#S">0 設定画（済）</a></nav>{body}</main>
<script>const IMGS=__IMGS__;document.querySelectorAll("img[data-ref]").forEach(i=>{{i.src=IMGS[i.dataset.ref]||""}});function cp(b){{const p=b.previousElementSibling;(navigator.clipboard?navigator.clipboard.writeText(p.innerText):Promise.reject()).then(()=>{{b.textContent='コピーしました';setTimeout(()=>b.textContent='コピー',1500)}}).catch(()=>{{const r=document.createRange();r.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(r);}})}}</script></body></html>"""
import json as _json
page = page.replace("__IMGS__", _json.dumps(_IMGS))
open(sys.argv[1], "w", encoding="utf-8").write(page)
print("cards", sum(len(s[2]) for s in SECTIONS) + len(V))
