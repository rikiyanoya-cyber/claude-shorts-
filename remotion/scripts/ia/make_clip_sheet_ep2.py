# IA ep2: the Pollo clip sheet — each card shows the start image (long-press to save) and the motion-only prompt.
# usage: python3 make_clip_sheet_ep2.py <imgs dir> <out.html>
import sys, html, base64, io
from PIL import Image
D, OUT = sys.argv[1], sys.argv[2]
CLIPS = [
 ("M1", "金貨の山が育つ", "M1_coin_stacks", "0:02／1:07", "The coin stacks grow taller one coin at a time with small soft bounces. The camera stays still. The studio stays the same."),
 ("M2", "金貨は増えても、笑顔の風船は止まる", "M2_coins_balloon", "0:05", "Coins keep piling up on the left while the smiling balloon rises a little and then stops, gently bobbing at the same height. The camera stays still."),
 ("M3", "プレゼントの輝きが消える", "M3_gift", "1:20", "The warm glow and sparkles slowly fade until the gift box is a plain dull grey box. The camera slowly pushes in a little. Nothing else changes."),
 ("M4", "当たりくじと紙吹雪", "M4_ticket", "1:35", "Confetti bursts up from the golden ticket and slowly falls down around it. The camera stays still."),
 ("M5", "光が階段を上がる（慣れ）", "M5_stairs", "2:00", "The warm spotlight circle slides up one step, then the next, and each step it leaves turns dull. The camera stays still."),
 ("M7", "金貨の傘と雨", "M7_coin_umbrella", "4:01／8:06", "Grey rain falls slowly and steadily around the coin umbrella; the drops slide off the gold canopy and the floor under it stays dry. The umbrella keeps its shape. The camera stays still."),
 ("M8", "ひびの入ったハートに金貨が届かない", "M8_cracked_heart", "6:39", "Gold coins drop from above and bounce away around the cracked grey heart without touching it; the heart stays exactly the same. The camera stays still."),
 ("M9", "天秤が少しだけ傾く", "M9_scale", "7:20", "The scale sways gently and settles with only a slight tilt. The camera stays still."),
 ("M10", "地球儀と高さの違う金貨の山", "M10_globe", "7:34", "The globe turns slowly while the coin stacks rise to their different heights one by one. The camera stays still."),
 ("M11", "2つの風船が一緒に少し上がる", "M11_two_balloons", "7:47", "The two balloons drift upward together just a little, side by side, then hover. The camera stays still."),
 ("V1", "昇給の夜、買い物袋を持って歩く", "V1_walk_first", "1:14", "YOU walks steadily from left to right between the lamps, swinging the shopping bag slightly, a light bounce in each step. The camera stays still. The lamps and the set stay exactly the same for the whole clip."),
 ("V2", "暗い朝、目覚ましでため息", "V2_bed_first", "1:28", "The alarm clock glows a little brighter, then YOU slowly sits up in bed and lets out one long tired sigh, shoulders dropping. The camera stays still. The room stays dark and unchanged."),
 ("V3", "宝くじの当選者が跳ねる", "K2_winners_jump", "1:40", "The three characters jump up and down with joy holding the big blank sign up high; colourful confetti falls around them. The camera stays still. Their faces and hair stay the same for the whole clip."),
 ("V4", "車が動かない", "G4_car_smoke", "4:15", "The small car shakes a little as the engine fails to start, then a puff of grey smoke rises from the open hood and drifts up. The camera stays still and the car keeps its shape."),
 ("V5", "パートナーが出ていく", "V5_leave_first", "5:25", "BLONDE slowly walks to the door pulling the suitcase without looking back and leaves the frame. The camera stays still. The apartment stays exactly the same, quiet and still."),
 ("V6", "先輩が車の中で動かない", "V6_car_first", "6:48", "SENPAI stays almost still, staring ahead, then his shoulders rise and fall in one slow heavy sigh. Faint raindrops slide down the car window. The camera stays still. His face, hair and glasses stay the same for the whole clip."),
 ("V7", "ゆっくり飲むコーヒーの朝", "V7_coffee_first", "7:02", "Soft steam rises from the mug; YOU slowly lifts it and takes one calm sip; the sunlight gently brightens. The camera stays still. The room stays the same."),
]
def img(name):
    im = Image.open(f"{D}/{name}.jpg").convert("RGB"); b = io.BytesIO(); im.save(b, "JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
cards = "".join(f'''<section class="card"><h3><span class="id">{i}</span> {html.escape(t)}</h3><p class="meta">使う場所：{w}</p>
<img src="{img(f)}" alt=""><p class="hint">↑この画像を Pollo に入れる（長押しで写真に保存）</p>
<div class="lab">動画のプロンプト（動きだけ）</div><div class="pr"><pre>{html.escape(p)}</pre><button onclick="cp(this)">コピー</button></div></section>''' for i, t, f, w, p in CLIPS)
page = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IA第2本 Pollo動画17本</title>
<style>:root{{--bg:#f6f7fb;--card:#fff;--fg:#151a26;--mute:#5d667a;--line:#dde2ec;--acc:#2b6ef2;--pre:#f1f3f8}}
@media (prefers-color-scheme:dark){{:root{{--bg:#0d111a;--card:#161c28;--fg:#e8ecf5;--mute:#98a3b8;--line:#263044;--acc:#7aa7ff;--pre:#0f1520}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Hiragino Sans",system-ui,sans-serif}} main{{max-width:760px;margin:0 auto;padding:16px}}
h1{{font-size:20px;margin:8px 0}} .card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:12px 0}}
h3{{font-size:16px;margin:0 0 4px}} .id{{color:var(--acc);font-weight:700}} .meta,.hint,.lab{{color:var(--mute);font-size:13px;margin:2px 0 6px}}
img{{width:100%;border-radius:8px;display:block}} .pr{{position:relative}} pre{{white-space:pre-wrap;word-break:break-word;background:var(--pre);border-radius:8px;padding:10px 10px 38px;margin:0;font:13px/1.5 ui-monospace,Menlo,monospace}}
button{{position:absolute;right:8px;bottom:8px;border:0;border-radius:6px;padding:5px 12px;background:var(--acc);color:#fff;font-size:13px}}
.note{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:14px}}</style></head><body><main>
<h1>Pollo の動画 17本</h1><div class="note">・どれも画像から動画（Image to Video）、長さ5秒、ロゴなしで書き出す。<br>・プロンプトは動きだけ。見た目は書き足さない（書くと元の画像から離れる）。<br>・顔や形が崩れたら、作り直すか、崩れる前の部分だけ使う（こっちで切る）。<br>・音はこっちで入れるので、音なしでOK。</div>
{cards}</main><script>function cp(b){{const p=b.previousElementSibling;(navigator.clipboard?navigator.clipboard.writeText(p.innerText):Promise.reject()).then(()=>{{b.textContent='コピーしました';setTimeout(()=>b.textContent='コピー',1500)}}).catch(()=>{{const r=document.createRange();r.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(r);}})}}</script></body></html>'''
open(OUT, "w", encoding="utf-8").write(page); print(len(CLIPS))
