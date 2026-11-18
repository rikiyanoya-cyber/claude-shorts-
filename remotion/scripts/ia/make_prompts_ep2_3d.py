# The Invisible Audience ep2 — 3D prompt sheet (Google Flow / Nano Banana for stills, Pollo image-to-video for clips).
# Built on the 2026-11-19 "prompt guide": canon first (character sheets, location masters, style block), blocks pasted
# verbatim, every reference image given one job, positive wording only (no negative fields in Gemini/Flow),
# image-to-video prompts describe motion only. Output: one HTML page with copy buttons.
# usage: python3 make_prompts_ep2_3d.py <out.html>
import html, sys

STYLE = ("STYLE: stylized 3D animated-film character render, soft matte clay-like material, smooth rounded simple shapes, "
         "clean minimal look, soft even studio light with gentle soft shadows, the same 3D look in every image. "
         "Palette: body white #F4F4F2, background navy #0B2352, warm lamp light #F2B45A.")
ENV_STYLE = ("STYLE: stylized 3D animated-film environment, soft matte clay-like materials, smooth rounded simple shapes, "
             "clean minimal set with few objects, cinematic but calm, the same 3D look in every image. "
             "Palette: deep navy night #0B2352, warm lamp light #F2B45A, cool moonlight #8FA6D6.")
BODY = ("a smooth plain white rounded body with no clothing and no texture, a large round white head, two small solid black dot eyes, "
        "a tiny thin curved line for a mouth, small round ears, short stubby rounded arms and legs with simple rounded hands and feet, about 3 heads tall")
C = {
 "YOU": f"YOU (the main character): {BODY}; short swooping light-brown hair #AC7A55 with a soft wave lifting up on his right side.",
 "SENPAI": f"SENPAI (older coworker): {BODY}, slightly taller than YOU; short neat dark hair #2B2F3A parted on the side; small black rectangular glasses.",
 "BLONDE": f"BLONDE (the partner): {BODY}; long straight golden-blonde hair #F4CC60 falling past the shoulders, center part.",
 "RED": f"RED: {BODY}; short bouncy curly orange-red hair #C44824 made of round curls.",
 "BOB": f"BOB: {BODY}; chin-length dark-brown bob haircut #512D17 with soft side-swept bangs.",
}
NAVY_BG = "Background: plain solid dark navy #0B2352, nothing else in the frame, no text. 16:9, highest resolution."

def sheet(key, extra=""):
    return (f"Create a character reference sheet in 3D of ONE character, the same character in every view.\n"
            f"Image 1 = the character design (head and body shape, hair shape and colour, face) ONLY. Turn this flat drawing into the 3D style below and keep the design identical.\n"
            f"{C[key]}{extra}\n"
            f"Layout: left, a front close-up of the face with a neutral expression; right, four full-body views side by side at equal height with the tops of the heads and the feet aligned: front, three-quarter, true side profile, back. Relaxed standing pose, arms slightly away from the body, hands visible.\n"
            f"Plain flat mid-grey background #9097A6, flat even lighting, no scenery, no text, no labels.\n{STYLE}\nAspect ratio 16:9, highest resolution.")

def pose(keys, scene, roles):
    blocks = "\n".join(C[k] for k in keys)
    return (f"{roles}\n{blocks}\nScene: {scene}\nKeep the face, hair shape, hair colour and body proportions exactly as in the reference images.\n{STYLE}\n{NAVY_BG}")

def r1(k):   # reference roles for one character
    return f"Image 1 = {k} front view (face and hair). Image 2 = {k} full-body view (body shape and proportions). Use them for this character only."

LOC = {
 "B1": ("LOC_APT1_NIGHT", "first cheap apartment", "A small cheap studio apartment. Layout: a tiny kitchen corner on frame-left with a small sink and faucet; a single window on the back wall showing distant city lights; a narrow bed along the right wall; thin plain walls; a worn wooden floor. Anchor props: one bare light bulb hanging from the ceiling in the center, a small round wall clock above the sink.", "Light state NIGHT: the bare bulb gives a dim warm light #F2B45A from above, cool blue city light through the window."),
 "B2": ("LOC_OFFICE_NIGHT", "the office at night", "An open-plan office. Layout: rows of simple desks with dark computer monitors running from frame-left into the distance; big windows across the back wall showing a city at night; one desk in the foreground on frame-right. Anchor props: a desk lamp switched on on the foreground desk, a potted plant at the end of the first row.", "Light state NIGHT: the only warm light is the desk lamp on the foreground desk; the rest of the room is dark navy with cool window light."),
 "B3": ("LOC_GROCERY_NIGHT", "grocery store aisle", "A grocery store aisle seen straight down its length. Shelves on both sides filled with simple rounded box and bottle shapes in soft colours and plain fronts; a shopping basket on the floor in the foreground.", "Light state NIGHT: even soft white store light from the ceiling, slightly cool."),
 "B4": ("LOC_SIDEWALK_NIGHT", "the walk home", "A quiet city sidewalk running from frame-left to frame-right. Behind it, a row of low shops with lit windows and plain awnings; three street lamps evenly spaced along the sidewalk; a clean flat road in the foreground.", "Light state NIGHT: warm street lamp pools #F2B45A on the pavement, deep navy sky."),
 "B5": ("LOC_BEDROOM_PREDAWN", "bedroom before dawn", "A small bedroom. Layout: a bed against the back wall in the center with a simple blanket; a nightstand on frame-right with a small round alarm clock whose face glows plainly; curtains closed on a window on frame-left.", "Light state PRE-DAWN: dark blue light, the alarm clock face is the only small warm glow."),
 "B6": ("LOC_BREAKROOM_MORNING", "office coffee corner", "A small office break area. Layout: a counter along the back wall with a coffee machine in the center and a row of mugs on its left; a window on frame-right; a tall plant in the left corner.", "Light state MORNING: pale grey-blue morning light from the window on frame-right, soft and tired."),
 "B7": ("LOC_PARKING_NIGHT", "company parking lot", "A company parking lot. Layout: a row of parked cars in simple rounded shapes along the back; in the foreground center one sleek dark luxury sedan facing frame-left; two tall lamp posts on the left and right.", "Light state NIGHT: orange lamp light #F2B45A from the two posts, the rest dark navy, faint wet shine on the ground."),
 "B8": ("LOC_APT2_NIGHT", "the new big quiet apartment", "A spacious modern apartment. Layout: a huge window across the back wall showing the city at night; a long sofa on frame-left facing the window; a dining table with two chairs on frame-right; an entrance door on the far right wall.", "Light state NIGHT: one warm pendant lamp over the dining table #F2B45A, the rest lit by cool city light from the window; quiet and a little lonely."),
 "B9": ("LOC_HOUSE_NIGHT", "senpai's nice house", "A nice two-story house seen from the street. Layout: the house in the center with warm lit windows, a neat lawn in front, a short path to the door, a nice car in the driveway on frame-right.", "Light state NIGHT: warm light from the windows #F2B45A, deep navy sky."),
 "B10": ("LOC_APT3_MORNING", "small apartment near work, morning", "A bright small apartment. Layout: a big window on frame-right with morning sun; a small table under the window with one coffee mug on it; a simple shelf with a plant on frame-left.", "Light state MORNING: soft warm sunlight entering from the window on frame-right, calm and peaceful."),
}
def loc_block(k):
    i, name, lay, light = LOC[k]
    return f"LOCATION {i} ({name}): {lay} {light}"
def master(k):
    return (f"Create an EMPTY 3D environment, no people and no characters.\n{loc_block(k)}\n"
            f"View: wide establishing shot from a three-quarter angle at eye level. Keep the lower third of the frame clear and plain so characters can stand there later. Signs, screens and labels stay blank.\n{ENV_STYLE}\nAspect ratio 16:9, highest resolution.")

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

A_LINE = "2Dの4人の並び（今回送ってくれた画像）"
def files(*names): return "、".join(names)

SECTIONS = []
SECTIONS.append(("S", "0. 正典（キャラ設定画）— 最初に作って承認する", [
 ("S1", "主人公 YOU の設定画", True, A_LINE, "全編の参照のもと", [("画像", sheet("YOU"))]),
 ("S2", "先輩 SENPAI の設定画（新キャラ）", True, A_LINE + "（体と顔の形の参考）", "先輩が出る全カットの参照", [("画像", sheet("SENPAI", " He is a NEW character who shares the same body and face design as the characters in Image 1."))]),
 ("S3", "BLONDE（パートナー）の設定画", True, A_LINE, "5:25、宝くじ", [("画像", sheet("BLONDE"))]),
 ("S4", "RED の設定画", False, A_LINE, "宝くじの場面", [("画像", sheet("RED"))]),
 ("S5", "BOB の設定画", False, A_LINE, "宝くじの場面", [("画像", sheet("BOB"))]),
]))
SECTIONS.append(("B", "1. 場所のマスター背景（キャラなし・10枚）", [
 (k, f"{LOC[k][1]}（{LOC[k][0]}）", k in ("B1", "B2", "B4", "B6", "B7", "B8"), "なし（文字だけで作る）。2枚目以降は、できたB1を画風の参考に付けてもいい（Image 1 = style only）",
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
 (i, t, st, files(f"S（{keys[0]}）の正面", f"S（{keys[0]}）の全身"), w, [("画像", pose(keys, sc, r1(keys[0])))]) for i, t, st, keys, w, sc in P] + [
 ("P16", "当選者たち、ふつうの顔に戻る", False, "S3・S4・S5 の正面（3枚）", "1:44〜1:52",
  [("画像", pose(["BLONDE", "RED", "BOB"], "BLONDE stands on the left, RED in the middle, BOB on the right, side by side, arms down, plain ordinary slightly bored faces, holding nothing. Exactly three characters. Full bodies.",
    "Image 1 = BLONDE (face and hair). Image 2 = RED (face and hair). Image 3 = BOB (face and hair). Each image is for that one character only."))]),
 ("K2", "当選者たち、喜んで跳ねる（動画V3の元）", True, "S3・S4・S5 の正面（3枚）", "1:40〜1:44",
  [("画像", pose(["BLONDE", "RED", "BOB"], "BLONDE on the left, RED in the middle, BOB on the right jump with joy, arms raised, together holding one big oversized prize check with a clean blank surface. Exactly three characters. Full bodies.",
    "Image 1 = BLONDE (face and hair). Image 2 = RED (face and hair). Image 3 = BOB (face and hair). Each image is for that one character only."))]),
]))
SECTIONS.append(("G", "3. 小物（紺の背景）", [(k, v[0], k in ("G1", "G4"), "S1（画風の参考として。Image 1 = style only, copy no character）", v[1], [("画像", "Image 1 = 3D style reference only, copy no character.\n" + prop(v[2]))]) for k, v in PROPS.items()]))

def comp(char_keys, loc, scene, roles):
    blocks = "\n".join(C[k] for k in char_keys)
    return (f"{roles}\n{blocks}\n{loc_block(loc)}\nScene: {scene}\nKeep the room exactly as in the location image: layout, furniture, props, colours and lighting. "
            f"Keep the character's face, hair and proportions exactly as in the character images. Light the character with the room's light.\n{STYLE}\nAspect ratio 16:9, highest resolution.")
V = [
 ("V1", "昇給の夜、買い物袋を持って歩く", True, "B4・S1正面・S1全身", "1:14〜", comp(["YOU"], "B4", "YOU walks along the sidewalk toward frame-right holding one shopping bag, big happy smile, side view, standing on the sidewalk in the lower third.",
   "Image 1 = the location (room, layout and light). Image 2 = YOU front view (face and hair). Image 3 = YOU full body (proportions)."),
   "YOU walks steadily from left to right along the sidewalk, swinging the shopping bag slightly, a light bounce in each step. The camera stays still. The street, lamps and shops stay exactly the same for the whole clip."),
 ("V2", "暗い朝、目覚ましでため息", False, "B5・S1正面・S1全身", "1:28〜", comp(["YOU"], "B5", "YOU lies in the bed under the blanket, eyes open, looking at the ceiling.",
   "Image 1 = the location (room, layout and light). Image 2 = YOU front view (face and hair). Image 3 = YOU full body (proportions)."),
   "The alarm clock glows a little brighter, then YOU slowly sits up in bed and lets out one long tired sigh, shoulders dropping. The camera stays still. The room stays dark and unchanged."),
 ("V3", "宝くじの当選者が跳ねる", True, "K2（できた画像をそのまま使う）", "1:40〜", None,
   "The three characters jump up and down with joy, arms raised, holding the big blank check; colourful confetti falls around them. The camera stays still. Their faces and hair stay the same for the whole clip."),
 ("V4", "車が動かない朝", False, "G4（できた画像をそのまま使う）", "4:15〜", None,
   "The small car shakes a little as the engine fails to start, then a puff of grey smoke rises from the open hood and drifts up. The camera stays still and the car keeps its shape."),
 ("V5", "パートナーが出ていく", True, "B8・S3正面・S3全身", "5:25〜", comp(["BLONDE"], "B8", "BLONDE walks toward the entrance door on the right pulling a small suitcase, head down, side view, in the lower third of the frame.",
   "Image 1 = the location (room, layout and light). Image 2 = BLONDE front view (face and hair). Image 3 = BLONDE full body (proportions)."),
   "BLONDE slowly walks to the door pulling the suitcase without looking back and leaves the frame. The camera stays still. The apartment stays exactly the same, quiet and still."),
 ("V6", "先輩が車の中で動かない", True, "B7・S2正面・S2全身", "6:48〜", comp(["SENPAI"], "B7", "SENPAI sits in the driver's seat of the sleek dark luxury sedan, seen through the open side window, engine off, one hand resting on the steering wheel, staring ahead.",
   "Image 1 = the location (parking lot, the car and light). Image 2 = SENPAI front view (face, hair and glasses). Image 3 = SENPAI full body (proportions)."),
   "SENPAI stays almost still, staring ahead, then his shoulders rise and fall in one slow heavy sigh. Faint raindrops slide down the car window. The camera stays still. His face and glasses stay the same for the whole clip."),
 ("V7", "ゆっくり飲むコーヒーの朝", True, "B10・S1正面・S1全身", "7:02〜", comp(["YOU"], "B10", "YOU stands by the sunny window holding a coffee mug with both hands, eyes closed, calm small smile, three-quarter view, in the lower third of the frame.",
   "Image 1 = the location (room, layout and light). Image 2 = YOU front view (face and hair). Image 3 = YOU full body (proportions)."),
   "Soft steam rises from the mug; YOU slowly lifts it and takes one calm sip; the sunlight gently brightens. The camera stays still. The room stays the same."),
]

def card(i, title, star, att, when, blocks):
    b = "".join(f'<div class="lab">{html.escape(l)}</div><div class="pr"><pre>{html.escape(t)}</pre><button onclick="cp(this)">コピー</button></div>' for l, t in blocks)
    return f'<section class="card"><h3><span class="id">{i}</span> {html.escape(title)}{" <span class=star>★</span>" if star else ""}</h3><p class="meta">添付：{html.escape(att)}<br>使う場所：{html.escape(when)}</p>{b}</section>'
body = ""
for k, name, items in SECTIONS:
    body += f'<h2 id="{k}">{html.escape(name)}</h2>' + "".join(card(*it) for it in items)
body += '<h2 id="V">4. 動画（Pollo・5秒・音なし・ロゴなしで書き出す）</h2>'
body += "".join(card(i, t, st, a, w, ([("① 動画の最初のコマになる画像（Flowで作る）", ip)] if ip else []) + [("② Pollo の動画プロンプト（動きだけ。①の画像を入れて使う）", vp)]) for i, t, st, a, w, ip, vp in V)
NOTE = """<b>作る順番（この順を守るとズレない）</b><br>
① S1〜S5 の設定画を作って、気に入ったものを決める（決めた設定画が「正典」。あとで別のが良く見えても、正典を基準にする）。<br>
② できた設定画を制作部に送る → 正面・全身などに切り分けた参照画像を返す（参照は1枚1役のほうがズレにくい）。<br>
③ B の背景（キャラなし）→ P のポーズ → G の小物。<br>
④ 動画は、まず①の画像を Flow で作って、気に入ったものだけを Pollo で動かす。<br><br>
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
.note{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:14px}}
</style></head><body><main><h1>The Invisible Audience 第2本　3D版プロンプト</h1><div class="note">{NOTE}</div>
<nav><a href="#S">0 設定画</a><a href="#B">1 背景</a><a href="#P">2 ポーズ</a><a href="#G">3 小物</a><a href="#V">4 動画</a></nav>{body}</main>
<script>function cp(b){{const p=b.previousElementSibling;(navigator.clipboard?navigator.clipboard.writeText(p.innerText):Promise.reject()).then(()=>{{b.textContent='コピーしました';setTimeout(()=>b.textContent='コピー',1500)}}).catch(()=>{{const r=document.createRange();r.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(r);}})}}</script></body></html>"""
open(sys.argv[1], "w", encoding="utf-8").write(page)
print("cards", sum(len(s[2]) for s in SECTIONS) + len(V))
