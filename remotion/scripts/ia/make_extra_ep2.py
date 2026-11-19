# IA ep2: extra images for the second half (more angles and close-ups so it does not get flat).
# Reuses the verbatim character / style blocks from make_prompts_ep2_3d.py. usage: python3 make_extra_ep2.py <ref dir> <out.html>
import sys, html, base64, io, re
from PIL import Image
src = open(__file__.replace("make_extra_ep2.py", "make_prompts_ep2_3d.py"), encoding="utf-8").read()
ns = {}; exec(src[src.index("STYLE = ("):src.index("def sheet(")], ns)
STYLE, ENV, C, NAVY = ns["STYLE"], ns["ENV_STYLE"], ns["C"], ns["NAVY_BG"]
REF, OUT = sys.argv[1], sys.argv[2]
SETS = {"B1": "B1_apt1", "B2": "B2_office", "B3": "B3_grocery", "B4": "B4_street", "B6": "B6_coffee", "B8": "B8_apt2", "B5": "B5_bedroom", "B10": "B10_apt3"}
JA = {"YOU": "主人公（茶髪）", "SENPAI": "先輩（メガネ）", "BLONDE": "金髪の子", "RED": "赤い巻き毛の子", "BOB": "ボブの子"}
def roles(refs):
    out = []
    for i, r in enumerate(refs, 1):
        if r in SETS: out.append(f"Image {i} = set {r} (the set, its props and its light only)")
        else:
            who, part = r.split("_"); out.append(f"Image {i} = {who}_{part} ({'face and hair' if part == 'face' else 'body shape and proportions'})")
    return ". ".join(out) + ". Each image has only that job."
def prompt(refs, who, scene, camera, bg):
    blocks = "\n".join(C[w] for w in who) or "No characters in this image."
    keep = "" if not who else "Keep every character's face, hair shape, hair colour and body proportions exactly as in the reference images."
    back = (f"Use the set from the set image as the background, unchanged: same props, positions, colours and light. Light the characters with the set's light." if bg else NAVY)
    return f"{roles(refs)}\n{blocks}\nScene: {scene}\nCamera: {camera}\n{keep}\n{back}\n{STYLE}\nAspect ratio 16:9, highest resolution."
IMGS = [
 ("N1", "先輩の顔のアップ（ため息）", True, "2:44〜／8:15", ["SENPAI_face", "SENPAI_front"], ["SENPAI"],
  "SENPAI lets out a tired sigh, eyes half closed behind his glasses, mouth a small open line, holding a coffee mug near his chin.", "close-up of the face and shoulders, eye level, the face filling the frame.", False),
 ("N2", "主人公の顔のアップ（ひとりで、さみしい）", True, "5:30〜", ["YOU_face", "YOU_front"], ["YOU"],
  "YOU looks down with a quiet, lonely, empty expression, eyes lowered, small mouth.", "close-up of the face and shoulders, slightly from above, the face filling the frame.", False),
 ("N3", "コーヒーメーカーの前に並ぶ2人（最後の一文）", True, "2:44〜／8:20「standing in the same place」", ["B6", "YOU_front", "SENPAI_front"], ["YOU", "SENPAI"],
  "Exactly two characters standing side by side in front of the coffee machine: YOU on the left, SENPAI on the right, each holding a mug, both looking tired with the same small sigh, shoulders slightly dropped.", "medium shot from the front at eye level, both characters from the knees up.", True),
 ("N4", "先輩が職場を颯爽と歩く（下から見上げる）", True, "2:28「three times what you did」", ["B2", "SENPAI_face", "SENPAI_front"], ["SENPAI"],
  "SENPAI walks confidently across the office toward frame-right, chin up, holding a briefcase.", "low angle from near the floor looking up at him, full body, he looks tall and successful.", True),
 ("N5", "眠れない夜（真上から）", True, "4:05「keep you awake staring at the ceiling」", ["B5", "YOU_face", "YOU_front"], ["YOU"],
  "YOU lies on his back in the bed under the blanket at night, eyes wide open, staring up at the ceiling, worried, one hand on his chest.", "top-down view straight from above the bed, the whole bed in frame.", True),
 ("N6", "たくさんの買い物袋を持って帰る（収入3倍）", False, "4:38「bought nicer things」", ["B8", "YOU_face", "YOU_front"], ["YOU"],
  "YOU walks into the apartment carrying four shopping bags in both hands, happy and a little proud.", "medium-wide shot at eye level from the side of the room.", True),
 ("N7", "いいお店で食事（収入3倍）", False, "4:41「You ate at better places」", ["YOU_face", "YOU_front"], ["YOU"],
  "YOU sits at a small round restaurant table with a white tablecloth, a nice plate of food and a small candle, smiling, holding a fork. A warm candle glow on his face.", "medium shot, slightly from the side, at table height.", False),
 ("N8", "ソファで並ぶ2人（別れる前）", True, "5:22「Your partner left you」の直前の一瞬", ["B8", "YOU_face", "BLONDE_face"], ["YOU", "BLONDE"],
  "Exactly two characters: YOU and BLONDE sit together on the long sofa, close to each other, laughing softly, warm and happy.", "medium shot from the front, slightly low, the sofa filling the lower half.", True),
 ("N9", "大きな部屋でひとり（高い位置から）", True, "5:30〜「sat alone in your quiet, comfortable apartment」", ["B8", "YOU_face", "YOU_front"], ["YOU"],
  "YOU sits alone at the dining table, small in the big quiet room, a closed takeout box in front of him, the second chair empty.", "high angle from the ceiling corner looking down, wide, lots of empty floor around him.", True),
 ("N10", "段ボールを運ぶ（職場の近くへ引っ越し）", False, "7:01「You moved closer to work」", ["B10", "YOU_face", "YOU_front"], ["YOU"],
  "YOU carries one plain cardboard moving box into the small sunny room, smiling a little.", "medium shot at eye level from the doorway side.", True),
 ("N11", "壊れたパソコンをすぐ直す", False, "7:09「you fixed it right away」", ["YOU_face", "YOU_front"], ["YOU"],
  "YOU sits at a small desk with an open laptop, calmly fixing it with a tiny screwdriver, relaxed face.", "over-the-shoulder shot from behind his left shoulder, the laptop in focus.", False),
 ("N12", "朝の窓辺の後ろ姿（エンディング）", False, "8:15〜", ["B10", "YOU_front"], ["YOU"],
  "YOU stands at the window holding a coffee mug, seen from behind, looking out at the soft morning light.", "medium shot from behind him, eye level, the window in front of him.", True),
]
FIRST = [
 ("F1", "暗闇で鳴る目覚まし時計のアップ", True, "0:00「Your alarm went off in the dark」", ["B5"], [],
  "Only the round alarm clock on the nightstand, ringing in the dark: its face glows warm, two small bells on top, tiny motion lines around it. The bed is a dark blur behind.", "extreme close-up of the alarm clock at nightstand height, shallow depth of field.", True),
 ("F2", "まだ暗い朝、仕事へ歩く", True, "0:02「you got up for a paycheck」", ["B4", "YOU_face", "YOU_front"], ["YOU"],
  "YOU walks to work under the street lamps before sunrise, tired, shoulders down, holding a small bag.", "wide shot from the side, the character small in the frame, long shadow.", True),
 ("F3", "迷わずカゴに入れる（夢）", True, "0:18「walking into a grocery store」", ["B3", "YOU_face", "YOU_front"], ["YOU"],
  "YOU happily drops items into the shopping basket without looking at the shelf, big relaxed smile.", "medium shot from the end of the shelf, slightly low angle.", True),
 ("F4", "最初の給料明細を見てがっかり", True, "0:29「Your first paycheck wasn't much」", ["YOU_face", "YOU_front"], ["YOU"],
  "YOU holds a small plain paper pay slip (blank, no writing) close to his face with both hands, disappointed, eyebrows down.", "close-up from the chest up, eye level.", False),
 ("F5", "薄い壁、隣のテレビがうるさい", True, "0:34「walls were thin」", ["B1", "YOU_face", "YOU_front"], ["YOU"],
  "YOU lies in the narrow bed against the wall with a pillow pressed over his ears, annoyed, small sound waves coming through the thin wall.", "high angle looking down at the bed, medium-wide.", True),
 ("F6", "仕事を抱える（残業）", True, "1:01「took on extra tasks」", ["B2", "YOU_face", "YOU_front"], ["YOU"],
  "YOU carries a tall wobbly stack of plain paper folders in both arms across the dark office, straining, one desk lamp on.", "low angle from the floor, the stack looks huge.", True),
 ("F7", "カレンダーの月を×で消していく", False, "1:03「counted down the months」", ["B1", "YOU_face", "YOU_front"], ["YOU"],
  "YOU stands at a simple wall calendar (plain grid, no numbers) and draws a big X over one month with a marker; several months already crossed out.", "over-the-shoulder shot from behind his right shoulder.", True),
 ("F8", "欲しかった物を開ける", True, "1:09「finally bought the thing」", ["B8", "YOU_face", "YOU_front"], ["YOU"],
  "YOU sits on the floor opening a glowing wrapped gift box, delighted, warm light from inside the box on his face.", "medium close-up, slightly from above.", True),
 ("F9", "棚に置かれたままの買った物", False, "1:24「just another object sitting in your room」", ["B8", "YOU_front"], ["YOU"],
  "The opened gift sits forgotten on a shelf in the foreground; YOU walks past in the background without looking at it, blurred.", "close-up on the object, the character out of focus behind it.", True),
 ("F10", "当選者のアップ（大喜び）", True, "1:40「the winners were thrilled」", ["RED_face", "RED_front"], ["RED"],
  "RED laughs with his mouth wide open and both fists up, colourful confetti falling around him.", "close-up of the face and raised fists, slightly low angle.", False),
 ("F11", "当選者のふつうの朝ごはん", True, "1:52「a good breakfast」", ["BLONDE_face", "BLONDE_front"], ["BLONDE"],
  "BLONDE sits at a small breakfast table with toast and a cup in front of her, poking the toast with a flat, bored face.", "medium shot at table height from the side.", False),
 ("F12", "主人公のまぶしい笑顔（昇給の夜）", False, "1:14「Walking home that night, you felt great」", ["B4", "YOU_face", "YOU_front"], ["YOU"],
  "YOU walks under a street lamp with a big proud smile, chin up, holding a shopping bag.", "close-up from the chest up, low angle, the lamp glowing behind his head.", True),
]
def thumb(r):
    path = f"{REF}/sets/{SETS[r]}.jpg" if r in SETS else f"{REF}/canon/{r}.png"
    im = Image.open(path).convert("RGB"); im.thumbnail((1400, 1400)); b = io.BytesIO(); im.save(b, "JPEG", quality=88)
    who = r if r in SETS else f"{JA[r.split('_')[0]]}の{'顔' if r.endswith('face') else '全身'}"
    label = f"背景 {r}" if r in SETS else who
    return f'<figure><img src="data:image/jpeg;base64,{base64.b64encode(b.getvalue()).decode()}"><figcaption>{html.escape(label)}</figcaption></figure>'
if len(sys.argv) > 3 and sys.argv[3] == "first": IMGS = FIRST
cards = "".join(f'''<section class="card"><h3><span class="id">{i}</span> {html.escape(t)}{" <span class=star>★</span>" if st else ""}</h3><p class="meta">使う場所：{w}</p>
<div class="refs">{"".join(thumb(r) for r in refs)}</div><p class="hint">↑この順に添付（長押しで保存）。左から Image 1、2、3。</p>
<div class="pr"><pre>{html.escape(prompt(refs, who, sc, cam, bg))}</pre><button onclick="cp(this)">コピー</button></div></section>''' for i, t, st, w, refs, who, sc, cam, bg in IMGS)
page = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IA第2本 追加の画像</title>
<style>:root{{--bg:#f6f7fb;--card:#fff;--fg:#151a26;--mute:#5d667a;--line:#dde2ec;--acc:#2b6ef2;--pre:#f1f3f8}}
@media (prefers-color-scheme:dark){{:root{{--bg:#0d111a;--card:#161c28;--fg:#e8ecf5;--mute:#98a3b8;--line:#263044;--acc:#7aa7ff;--pre:#0f1520}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Hiragino Sans",system-ui,sans-serif}} main{{max-width:760px;margin:0 auto;padding:16px}} h1{{font-size:20px;margin:8px 0}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:12px 0}} h3{{font-size:16px;margin:0 0 4px}} .id{{color:var(--acc);font-weight:700}} .star{{color:#e0a020}}
.meta,.hint{{color:var(--mute);font-size:13px;margin:2px 0 6px}} .refs{{display:flex;gap:8px;overflow-x:auto}} figure{{margin:0;flex:0 0 auto;width:110px}} figure img{{width:110px;height:110px;object-fit:cover;border-radius:8px;border:1px solid var(--line);background:#9097a6}} figcaption{{font-size:11px;color:var(--mute)}}
.pr{{position:relative}} pre{{white-space:pre-wrap;word-break:break-word;background:var(--pre);border-radius:8px;padding:10px 10px 38px;margin:0;font:13px/1.5 ui-monospace,Menlo,monospace}}
button{{position:absolute;right:8px;bottom:8px;border:0;border-radius:6px;padding:5px 12px;background:var(--acc);color:#fff;font-size:13px}} .note{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:14px}}</style></head><body><main>
<h1>{"前半" if IMGS is FIRST else "後半"}用の追加画像 {len(IMGS)}枚</h1><div class="note">単調にならないように、<b>顔のアップ・見上げ・真上から・高い位置から・肩越し・後ろ姿</b>など、今までにない角度を入れてある。<br>★が優先。背景つきのものは、その背景の画像も添付する。Flow で一番大きいサイズで書き出してね。</div>
{cards}</main><script>function cp(b){{const p=b.previousElementSibling;(navigator.clipboard?navigator.clipboard.writeText(p.innerText):Promise.reject()).then(()=>{{b.textContent='コピーしました';setTimeout(()=>b.textContent='コピー',1500)}}).catch(()=>{{const r=document.createRange();r.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(r);}})}}</script></body></html>'''
open(OUT, "w", encoding="utf-8").write(page); print(len(IMGS))
