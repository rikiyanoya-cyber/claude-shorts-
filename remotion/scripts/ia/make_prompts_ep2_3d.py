# The Invisible Audience ep2 — 3D prompt sheet (Google Flow / Nano Banana for stills, Pollo image-to-video for clips).
# Built on the 2026-11-19 "prompt guide": canon first (character sheets, location masters, style block), blocks pasted
# verbatim, every reference image given one job, positive wording only (no negative fields in Gemini/Flow),
# image-to-video prompts describe motion only. Output: one HTML page with copy buttons.
# usage: python3 make_prompts_ep2_3d.py <out.html>
import html, sys

STYLE = ("STYLE: the exact 3D look of the attached lineup image: smooth matte white vinyl-toy characters, soft rounded shapes, sculpted clay-like hair, "
         "soft top light with gentle shadows, clean and minimal, the same look in every image. Palette: bodies off-white #ECEBEE, background navy #0B2352, warm accent light #F2B45A.")
ENV_STYLE = ("STYLE: a minimal 3D set in the same look as the attached lineup image: a seamless dark navy studio floor and backdrop #0B2352 that fades into darkness, "
             "only a few simple rounded matte props in soft muted colours, soft light, lots of empty space, clean and calm. Every set in this video uses this same navy studio.")
BODY = ("a smooth matte off-white rounded body with no clothing, a large round head, two small black dot eyes, a small simple mouth, "
        "short rounded arms and legs, about 2.5 heads tall, exactly like the characters in the attached lineup image")
C = {
 "YOU": f"YOU (the main character, 1st from the left in the lineup): {BODY}; short swept light-brown hair #B78F6F with a wave lifting up on top.",
 "BLONDE": f"BLONDE (the partner, 2nd from the left in the lineup): {BODY}; long straight golden-blonde hair #E3C06A falling past the shoulders.",
 "RED": f"RED (3rd from the left in the lineup): {BODY}; short curly orange-red hair #C2502E made of small round curls.",
 "BOB": f"BOB (4th from the left in the lineup): {BODY}; dark-brown bob haircut #5A3A2A at chin length.",
 "SENPAI": f"SENPAI (the older coworker, 5th from the left in the lineup): {BODY}; short neat black hair #2E2E30.",
}
NAVY_BG = "Background: plain solid dark navy #0B2352, nothing else in the frame, no text. 16:9, highest resolution."

def sheet(key, extra=""):
    return (f"Create a 3D character reference sheet of ONE character from the attached lineup, the same character in every view.\n"
            f"Image 1 = the approved lineup (the 3D look and the character designs). Use only the character described below.\n"
            f"{C[key]}{extra}\n"
            f"Layout: left, a front close-up of the face with a neutral expression; right, four full-body views side by side at equal height with the tops of the heads and the feet aligned: front, three-quarter, true side profile, back. Relaxed standing pose, arms slightly away from the body.\n"
            f"Plain flat mid-grey background #9097A6, flat even light, nothing else, no text, no labels.\n{STYLE}\nAspect ratio 16:9, highest resolution.")

def pose(keys, scene, roles):
    blocks = "\n".join(C[k] for k in keys)
    return (f"{roles}\n{blocks}\nScene: {scene}\nKeep the face, hair shape, hair colour and body proportions exactly as in the reference images.\n{STYLE}\n{NAVY_BG}")

def r1(k):   # reference roles for one character
    return f"Image 1 = {k} front view (face and hair). Image 2 = {k} full-body view (body shape and proportions). Use them for this character only."

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
    return (f"Image 1 = the approved lineup (the 3D look only, copy no character).\nCreate an EMPTY minimal 3D set, no characters.\n{loc_block(k)}\n"
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

A_LINE = "3Dの5人の並び（正典）"
def files(*names): return "、".join(names)

SECTIONS = []
SECTIONS.append(("S", "0. 正典（キャラ設定画）— 最初に作って承認する", [
 ("S1", "主人公 YOU の設定画", True, A_LINE, "全編の参照のもと", [("画像", sheet("YOU"))]),
 ("S2", "先輩 SENPAI の設定画", True, A_LINE, "先輩が出る全カットの参照", [("画像", sheet("SENPAI"))]),
 ("S3", "BLONDE（パートナー）の設定画", True, A_LINE, "5:25、宝くじ", [("画像", sheet("BLONDE"))]),
 ("S4", "RED の設定画", False, A_LINE, "宝くじの場面", [("画像", sheet("RED"))]),
 ("S5", "BOB の設定画", False, A_LINE, "宝くじの場面", [("画像", sheet("BOB"))]),
]))
SECTIONS.append(("B", "1. 場所のマスター背景（キャラなし・10枚）", [
 (k, f"{LOC[k][1]}（{LOC[k][0]}）", k in ("B1", "B2", "B4", "B6", "B7", "B8"), "3Dの並び（画風の参考）。2枚目以降は、できたB1も付けると揃う",
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
SECTIONS.append(("G", "3. 小物（紺の背景）", [(k, v[0], k in ("G1", "G4"), "3Dの5人の並び（画風の参考）", v[1], [("画像", "Image 1 = the approved lineup (the 3D look only, copy no character).\n" + prop(v[2]))]) for k, v in PROPS.items()]))

def comp(char_keys, loc, scene, roles):
    blocks = "\n".join(C[k] for k in char_keys)
    return (f"{roles}\n{blocks}\n{loc_block(loc)}\nScene: {scene}\nKeep the set exactly as in the set image: navy studio, props, positions, colours and light. "
            f"Keep the character's face, hair and proportions exactly as in the character images. Light the character with the room's light.\n{STYLE}\nAspect ratio 16:9, highest resolution.")
V = [
 ("V1", "昇給の夜、買い物袋を持って歩く", True, "B4・S1正面・S1全身", "1:14〜", comp(["YOU"], "B4", "YOU walks between the street lamps toward frame-right holding one shopping bag, big happy smile, side view, on the navy floor in the lower third.",
   "Image 1 = the set (props, layout and light). Image 2 = YOU front view (face and hair). Image 3 = YOU full body (proportions)."),
   "YOU walks steadily from left to right between the lamps, swinging the shopping bag slightly, a light bounce in each step. The camera stays still. The lamps and the set stay exactly the same for the whole clip."),
 ("V2", "暗い朝、目覚ましでため息", False, "B5・S1正面・S1全身", "1:28〜", comp(["YOU"], "B5", "YOU lies in the bed under the blanket, eyes open, looking at the ceiling.",
   "Image 1 = the set (props, layout and light). Image 2 = YOU front view (face and hair). Image 3 = YOU full body (proportions)."),
   "The alarm clock glows a little brighter, then YOU slowly sits up in bed and lets out one long tired sigh, shoulders dropping. The camera stays still. The room stays dark and unchanged."),
 ("V3", "宝くじの当選者が跳ねる", True, "K2（できた画像をそのまま使う）", "1:40〜", None,
   "The three characters jump up and down with joy, arms raised, holding the big blank check; colourful confetti falls around them. The camera stays still. Their faces and hair stay the same for the whole clip."),
 ("V4", "車が動かない朝", False, "G4（できた画像をそのまま使う）", "4:15〜", None,
   "The small car shakes a little as the engine fails to start, then a puff of grey smoke rises from the open hood and drifts up. The camera stays still and the car keeps its shape."),
 ("V5", "パートナーが出ていく", True, "B8・S3正面・S3全身", "5:25〜", comp(["BLONDE"], "B8", "BLONDE walks toward the plain door on the far right pulling a small suitcase, head down, side view, in the lower third of the frame.",
   "Image 1 = the set (props, layout and light). Image 2 = BLONDE front view (face and hair). Image 3 = BLONDE full body (proportions)."),
   "BLONDE slowly walks to the door pulling the suitcase without looking back and leaves the frame. The camera stays still. The apartment stays exactly the same, quiet and still."),
 ("V6", "先輩が車の中で動かない", True, "B7・S2正面・S2全身", "6:48〜", comp(["SENPAI"], "B7", "SENPAI sits in the driver's seat of the dark sedan, seen through its open side window, engine off, one hand resting on the steering wheel, staring ahead.",
   "Image 1 = the set (the car, the lamp and the light). Image 2 = SENPAI front view (face and hair). Image 3 = SENPAI full body (proportions)."),
   "SENPAI stays almost still, staring ahead, then his shoulders rise and fall in one slow heavy sigh. Faint raindrops slide down the car window. The camera stays still. His face and hair stay the same for the whole clip."),
 ("V7", "ゆっくり飲むコーヒーの朝", True, "B10・S1正面・S1全身", "7:02〜", comp(["YOU"], "B10", "YOU stands by the window frame holding a coffee mug with both hands, eyes closed, calm small smile, three-quarter view, in the lower third of the frame.",
   "Image 1 = the set (props, layout and light). Image 2 = YOU front view (face and hair). Image 3 = YOU full body (proportions)."),
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
NOTE = """<b>作る順番（この順を守るとズレない）</b><br>正典は送ってくれた3Dの5人の並び（左から YOU／BLONDE／RED／BOB／SENPAI）。毎回これを添付する。<br>背景はぜんぶ「同じ紺のスタジオ＋小物1〜3個」だけにしてある（場面ごとに部屋を作らない）。<br>
① （できれば）S1〜S5 の設定画を作って、気に入ったものを決める（決めた設定画が「正典」。あとで別のが良く見えても、正典を基準にする）。<br>
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
