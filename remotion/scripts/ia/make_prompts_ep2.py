import html, json
CH = "Same characters and style as the attached image: simple flat 2D cartoon people with plain white rounded bodies, thin light-grey limb lines, small black dot eyes. Solid flat dark navy background (#0b2352), nothing else on it, no text. One character, full body, centered, 16:9. "
BG = "Flat 2D background illustration matching the look of the attached image: deep navy night palette, soft glowing light, faint dust specks, gentle vignette, simple flat shapes, no outlines. No characters, no text, no logos. Wide 16:9. Keep the lower third plain so characters can stand there. "
GD = "Same flat 2D style as the attached image, simple shapes, soft glow. Solid flat dark navy background (#0b2352), nothing else, no text, no logos, one object centered, 16:9. "
A1 = "①キャラ（4人の並び）"; A4 = "④背景の雰囲気"; K1 = "K1（先輩の完成画像）"
S = [
 ("K", "新しいキャラの基本画像（最初に作る）", [
  ("K1", "先輩", True, A1, "全編（先輩が出る画像すべての添付に使う）", "Same style as the attached image: simple flat 2D cartoon people with plain white rounded bodies, thin light-grey limb lines, small black dot eyes. A NEW character: an adult man a few years older than the brown-haired boy, short neat dark hair parted on the side, small dark rectangular glasses, calm confident posture. Show him three times side by side: front view standing, side view walking, sitting on a chair. Solid flat dark navy background (#0b2352), nothing else, no text, 16:9."),
  ("K2", "宝くじの当選者3人（動画V3の元にもなる）", False, A1, "1:40〜1:52", "Same characters and style as the attached image. The blonde girl, the red curly-haired boy and the dark bob girl stand side by side, jumping with joy and arms raised, holding one big blank oversized prize check together (no text or numbers on it). Solid flat dark navy background (#0b2352), nothing else, no text, 16:9."),
 ]),
 ("B", "背景（キャラなし・10枚）", [
  ("B1", "最初の安いアパート", True, A4, "0:32〜0:48", BG + "A small cheap studio apartment at night: thin plain walls, a tiny kitchen corner with a dripping faucet, a single bare bulb, one window with city lights, a worn floor."),
  ("B2", "夜の職場", True, A4, "1:01〜1:07、2:24〜", BG + "An open-plan office at night, rows of desks with dark monitors, one desk lamp still on, big windows with city lights behind."),
  ("B3", "スーパーの通路", False, A4, "0:18〜0:23", BG + "A grocery store aisle at night, softly lit shelves with simple shapes for products (no labels), a shopping basket on the floor."),
  ("B4", "夜の帰り道（動画V1の背景）", True, A4, "1:14〜1:20", BG + "A quiet city sidewalk at night, warm street lamps, a few lit shop windows without signs, light reflecting on the pavement."),
  ("B5", "夜明け前の寝室（動画V2の背景）", False, A4, "1:28〜1:33", BG + "A small bedroom before dawn, dark blue light, a bed, a nightstand with a glowing alarm clock showing no numbers, curtains closed."),
  ("B6", "会社のコーヒーメーカーの前", True, A4, "2:44〜2:51、8:15", BG + "A small office break area: a coffee machine on a counter, a window with grey morning light, a few mugs, calm and tired mood."),
  ("B7", "会社の駐車場の夜（動画V6の背景）", True, A4, "6:48〜6:57", BG + "A company parking lot at night, a few cars parked under orange lamps, one sleek luxury car in the front, empty and quiet."),
  ("B8", "広くて静かな新しい部屋（動画V5の背景）", True, A4, "4:24〜、5:26〜5:43", BG + "A spacious, quiet, comfortable modern apartment at night, big window with city lights, a sofa, a dining table, warm but lonely lighting."),
  ("B9", "先輩のきれいな家", False, A4, "2:31〜2:36", BG + "A nice two-story house in a good neighborhood at night, warm lit windows, a neat lawn, a nice car in the driveway."),
  ("B10", "職場の近くの朝の部屋（動画V7の背景）", False, A4, "7:02〜7:07", BG + "A bright small apartment in the early morning near the city center, sunlight through the window, a table with a cup of coffee, calm and peaceful."),
 ]),
 ("P", "キャラのポーズ（紺の背景・16枚）", [
  ("P1", "夢を見る", True, A1, "0:48〜1:00", CH + "The brown-haired boy looks up dreamily with a soft smile, hands together at his chest, a small empty thought bubble above his head."),
  ("P2", "残業", True, A1, "1:01〜1:06", CH + "The brown-haired boy sits at a desk typing on a laptop, tired eyes, a desk lamp glow on his face."),
  ("P3", "買い物袋を持って笑う", True, A1, "1:07〜1:14", CH + "The brown-haired boy walks happily holding a shopping bag in one hand, big smile."),
  ("P4", "暗い朝、ため息", False, A1, "1:28〜1:33", CH + "The brown-haired boy sits on the edge of a bed, shoulders slumped, sighing, a small puff of breath near his mouth."),
  ("P5", "スマホの残高を見て不安", False, A1, "0:23〜0:27、4:05〜4:10", CH + "The brown-haired boy stands looking down at a phone in his hands with a worried face, a small sweat drop."),
  ("P6", "給料の数字を見て固まる", True, A1, "4:27〜4:35", CH + "The brown-haired boy stands staring at a phone held up in front of him, eyes wide, mouth slightly open, amazed."),
  ("P7", "古い靴を見る", False, A1, "0:41〜0:48", CH + "The brown-haired boy sits on the floor looking at the worn-out sole of one shoe in his hands, a little sad."),
  ("P8", "ひとりで食卓に座る", True, A1, "5:26〜5:43", CH + "The brown-haired boy sits alone at a dining table, chin resting on his hand, staring down, an untouched takeout box in front of him, lonely."),
  ("P9", "ゆっくりコーヒー", True, A1, "7:02〜7:07", CH + "The brown-haired boy stands by a window holding a coffee mug with both hands, eyes closed, calm small smile."),
  ("P10", "考える", False, A1, "2:55〜3:10、7:56〜", CH + "The brown-haired boy stands with one hand on his chin, looking up thoughtfully."),
  ("P11", "先輩、自信がある", True, A1 + "＋" + K1, "2:24〜2:40", CH + "The older man with glasses from the second attached image stands confidently, holding car keys, slight smile."),
  ("P12", "先輩、コーヒーの前でため息", True, A1 + "＋" + K1, "2:44〜2:51、8:15", CH + "The older man with glasses from the second attached image stands holding a coffee mug, shoulders down, tired face, sighing."),
  ("P13", "先輩、家族との食事中にスマホ", False, A1 + "＋" + K1, "2:51〜2:57", CH + "The older man with glasses from the second attached image sits at a dinner table looking down at a buzzing phone, frowning, his plate untouched."),
  ("P14", "先輩、車の中でハンドルを握ったまま", True, A1 + "＋" + K1, "6:48〜6:58", CH + "The older man with glasses from the second attached image sits in the driver's seat of a car seen through the open side window, engine off, one hand still on the steering wheel, staring ahead, sighing. Simple flat car interior."),
  ("P15", "パートナーが出ていく", False, A1, "5:25〜5:27", CH + "The blonde girl walks away pulling a small suitcase, seen from the side, head down, not looking back."),
  ("P16", "当選者たち、ふつうの顔に戻る", False, A1, "1:44〜1:52", CH.replace("One character, full body, centered", "Three characters, full body, centered") + "The blonde girl, the red curly-haired boy and the dark bob girl stand side by side with plain, ordinary, slightly bored faces, arms down, holding nothing."),
 ]),
 ("G", "小物（紺の背景・6枚）", [
  ("G1", "ポタポタ落ちる蛇口", True, A1, "0:37", GD + "A kitchen faucet with a single water drop falling, close-up."),
  ("G2", "底のすり減った靴", False, A1, "0:41", GD + "One worn-out everyday sneaker with a thin, cracked sole, close-up."),
  ("G3", "請求書の山", False, A1, "4:01〜4:10", GD + "A messy pile of paper bills and envelopes, a few marked with plain red stamps (no words)."),
  ("G4", "ボンネットが開いて止まった車（動画V4の元にもなる）", True, A1, "4:10〜4:24", GD + "A small old car stopped with its hood up and a little smoke rising, simple flat shapes."),
  ("G5", "手つかずの持ち帰りの箱", False, A1, "5:30", GD + "A closed takeout food box with chopsticks on top, untouched, on a plain table edge."),
  ("G6", "壊れたノートパソコン", False, A1, "7:07〜7:13", GD + "An open laptop with a cracked dark screen, close-up."),
 ]),
]
V = [
 ("V1", "昇給の夜、買い物袋を持って歩く", True, A1 + "＋B4", "1:14〜", "Same characters and style as the attached images: simple flat 2D cartoon people with white rounded bodies. The brown-haired boy walks along the night sidewalk from the second image, holding a shopping bag, big happy smile, seen from the side. Same background as the second image. No text, 16:9.", "The boy walks happily from left to right along the sidewalk, swinging the shopping bag a little, a light bounce in each step. The background and street lamps stay still. Simple, smooth movement."),
 ("V2", "暗い朝、目覚ましでため息", False, A1 + "＋B5", "1:28〜", "Same characters and style as the attached images: simple flat 2D cartoon people with white rounded bodies. The brown-haired boy lies in the bed of the second image under a blanket in the dark blue pre-dawn light, the alarm clock glowing on the nightstand. No text, 16:9.", "The alarm clock glows brighter, the boy slowly sits up in bed and lets out a long tired sigh, shoulders dropping. Slow, small movement, the room stays dark."),
 ("V3", "宝くじの当選者が跳ねる", True, "K2（画像はK2をそのまま使う）", "1:40〜", None, "The three people jump up and down with joy, arms in the air, holding the big blank check, colorful confetti falling around them. Bouncy, cheerful, simple movement."),
 ("V4", "車が動かない朝", False, "G4（画像はG4をそのまま使う）", "4:15〜", None, "The small car shakes a little as if the engine tries to start and fails, a puff of grey smoke rises from the open hood and drifts up. Short, simple movement, the background stays still."),
 ("V5", "パートナーが出ていく", True, A1 + "＋B8", "5:25〜", "Same characters and style as the attached images: simple flat 2D cartoon people with white rounded bodies. In the quiet apartment of the second image, the blonde girl walks toward the door pulling a small suitcase, seen from the side, head down. No text, 16:9.", "The girl slowly walks out toward the door pulling the suitcase, without looking back, and leaves the frame. The apartment stays still and quiet."),
 ("V6", "先輩が車の中で動かない", True, A1 + "＋" + K1 + "＋B7", "6:48〜", "Same characters and style as the attached images: simple flat 2D cartoon people with white rounded bodies. The older man with glasses from the second image sits in the driver's seat of the luxury car in the parking lot of the third image, engine off, one hand on the wheel, staring ahead, seen through the side window at night under orange lamps. No text, 16:9.", "He stays almost still, staring ahead, then his shoulders rise and fall in one slow, heavy sigh. Faint rain drops slide down the car window. Very slow and quiet."),
 ("V7", "ゆっくり飲むコーヒーの朝", True, A1 + "＋B10", "7:02〜", "Same characters and style as the attached images: simple flat 2D cartoon people with white rounded bodies. The brown-haired boy stands by the bright window of the second image in the early morning, holding a coffee mug with both hands, eyes closed, calm small smile. No text, 16:9.", "Soft steam rises from the coffee mug, the boy slowly lifts it and takes a calm sip, sunlight gently brightens through the window. Slow, peaceful movement."),
]
def card(i, title, star, att, when, blocks):
    b = "".join(f'<div class="lab">{html.escape(l)}</div><div class="pr"><pre>{html.escape(t)}</pre><button onclick="cp(this)">コピー</button></div>' for l, t in blocks)
    return f'<section class="card"><h3><span class="id">{i}</span> {html.escape(title)}{" <span class=star>★</span>" if star else ""}</h3><p class="meta">添付：{html.escape(att)}<br>使う場所：{html.escape(when)}</p>{b}</section>'
body = ""
for k, name, items in S:
    body += f'<h2 id="{k}">{html.escape(name)}</h2>' + "".join(card(i, t, st, a, w, [("画像のプロンプト", p)]) for i, t, st, a, w, p in items)
body += '<h2 id="V">Pollo の動画（7本・5秒・音なしで使う）</h2>' + "".join(card(i, t, st, a, w, ([("① 画像のプロンプト（キャラと背景を1枚に）", ip)] if ip else []) + [("② 動画のプロンプト（動きだけ）", vp)]) for i, t, st, a, w, ip, vp in V)
page = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IA第2本 画像と動画のプロンプト</title>
<style>
:root{{--bg:#f6f7fb;--card:#fff;--fg:#151a26;--mute:#5d667a;--line:#dde2ec;--acc:#2b6ef2;--pre:#f1f3f8}}
@media (prefers-color-scheme:dark){{:root{{--bg:#0d111a;--card:#161c28;--fg:#e8ecf5;--mute:#98a3b8;--line:#263044;--acc:#7aa7ff;--pre:#0f1520}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Hiragino Sans",system-ui,sans-serif}}
main{{max-width:760px;margin:0 auto;padding:16px}}
h1{{font-size:20px;margin:8px 0 4px}} h2{{font-size:17px;margin:28px 0 10px;padding-top:6px;border-top:2px solid var(--line)}}
nav a{{display:inline-block;margin:4px 8px 4px 0;color:var(--acc);text-decoration:none}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:10px 0}}
h3{{font-size:16px;margin:0 0 4px}} .id{{color:var(--acc);font-weight:700}} .star{{color:#e0a020}}
.meta{{color:var(--mute);font-size:13px;margin:0 0 8px}} .lab{{font-size:12px;color:var(--mute);margin:8px 0 4px}}
.pr{{position:relative}} pre{{white-space:pre-wrap;word-break:break-word;background:var(--pre);border-radius:8px;padding:10px 10px 36px;margin:0;font:13px/1.5 ui-monospace,Menlo,monospace}}
button{{position:absolute;right:8px;bottom:8px;border:0;border-radius:6px;padding:5px 12px;background:var(--acc);color:#fff;font-size:13px}}
.note{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:14px}}
</style></head><body><main>
<h1>The Invisible Audience 第2本　画像と動画のプロンプト</h1>
<div class="note">共通の指定は、各プロンプトの中にもう入っています。そのままコピーして使ってください。<br>
・画像は 16:9、できるだけ大きいサイズで書き出す。<br>
・作る順番：K1（先輩）→ ★の画像 → ★の動画 → 残り。<br>
・先輩が出る画像は、必ず K1 も添付する。<br>
・Pollo の動画はロゴなしで書き出す（今回はロゴなし）。<br>
・合計：画像 34枚＋動画用の画像 5枚、動画 7本。</div>
<nav><a href="#K">K 基本</a><a href="#B">B 背景</a><a href="#P">P ポーズ</a><a href="#G">G 小物</a><a href="#V">V 動画</a></nav>
{body}
</main><script>function cp(b){{const t=b.previousElementSibling.innerText;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{{b.textContent='コピーしました';setTimeout(()=>b.textContent='コピー',1500)}}).catch(()=>{{const r=document.createRange();r.selectNodeContents(b.previousElementSibling);const s=getSelection();s.removeAllRanges();s.addRange(r);}})}}</script></body></html>"""
open('/home/user/ia_ep2/IA_ep2_prompts.html', 'w', encoding='utf-8').write(page)
print(sum(len(x[2]) for x in S), len(V))
