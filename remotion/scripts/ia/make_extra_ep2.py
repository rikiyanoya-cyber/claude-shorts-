# IA ep2: extra images for the second half (more angles and close-ups so it does not get flat).
# Reuses the verbatim character / style blocks from make_prompts_ep2_3d.py. usage: python3 make_extra_ep2.py <ref dir> <out.html>
import sys, html, base64, io, re
from PIL import Image
src = open(__file__.replace("make_extra_ep2.py", "make_prompts_ep2_3d.py"), encoding="utf-8").read()
ns = {}; exec(src[src.index("STYLE = ("):src.index("def sheet(")], ns)
STYLE, ENV, C, NAVY = ns["STYLE"], ns["ENV_STYLE"], ns["C"], ns["NAVY_BG"]
REF, OUT = sys.argv[1], sys.argv[2]
SETS = {"B1": "B1_apt1", "B2": "B2_office", "B3": "B3_grocery", "B4": "B4_street", "B6": "B6_coffee", "B7": "B7_parking", "B8": "B8_apt2", "B9": "B9_house", "B5": "B5_bedroom", "B10": "B10_apt3"}
JA = {"YOU": "主人公（茶髪）", "SENPAI": "先輩（メガネ）", "BLONDE": "金髪の子", "RED": "赤い巻き毛の子", "BOB": "ボブの子"}
def roles(refs):
    out = []
    for i, r in enumerate(refs, 1):
        if r in SETS: out.append(f"Image {i} = set {r} (the set, its props and its light only)")
        else:
            who, part = r.split("_"); out.append(f"Image {i} = {who}_{part} ({'face and hair' if part == 'face' else 'body shape and proportions'})")
    return ". ".join(out) + ". Each image has only that job."
def prompt(refs, who, scene, camera, bg):
    if not refs and not who:
        return (f"Image 1 = set B1 (only the look of the navy studio, the 3D style and the light; copy none of its props).\nNo characters in this image.\nScene: {scene}\nCamera: {camera}\nOne object or small group of objects in the seamless dark navy studio, lots of empty space around it. Nothing has letters, numbers or symbols printed on it.\n{STYLE}\nAspect ratio 16:9, highest resolution.")
    blocks = "\n".join(C[w] for w in who) or "No characters in this image."
    keep = "" if not who else ("Expression: exaggerated, cartoon-clear and readable at phone size: the emotion shows in the eye shapes, a big mouth shape and simple extras such as sweat drops, blush or breath puffs, using only the character's own simple face design (black dot eyes that can squeeze into curves, a simple mouth).\n"
                              "Keep every character's face design, hair shape, hair colour and body proportions exactly as in the reference images.")
    back = (f"Use the set from the set image as the background, unchanged: same props, positions, colours and light. Light the characters with the set's light." if bg else NAVY)
    return f"{roles(refs)}\n{blocks}\nScene: {scene}\nCamera: {camera}\n{keep}\n{back}\n{STYLE}\nAspect ratio 16:9, highest resolution."
IMGS = [
 ("N1", "先輩の顔のアップ（ため息）", True, "2:44〜／8:15", ["SENPAI_face", "SENPAI_front"], ["SENPAI"],
  "SENPAI lets out a huge exhausted sigh, eyes half closed behind his glasses with heavy drooping lids, mouth open in a long 'haaa', a visible little puff of breath, holding a coffee mug near his chin.", "close-up of the face and shoulders, eye level, the face filling the frame.", False),
 ("N2", "主人公の顔のアップ（ひとりで、さみしい）", True, "5:30〜", ["YOU_face", "YOU_front"], ["YOU"],
  "YOU looks down with a deeply lonely, heartbroken expression, eyes glistening and drooping at the corners, mouth trembling in a small downturned curve.", "close-up of the face and shoulders, slightly from above, the face filling the frame.", False),
 ("N3", "コーヒーメーカーの前に並ぶ2人（最後の一文）", True, "2:44〜／8:20「standing in the same place」", ["B6", "YOU_front", "SENPAI_front"], ["YOU", "SENPAI"],
  "Exactly two characters standing side by side in front of the coffee machine: YOU on the left, SENPAI on the right, each holding a mug, both letting out the same big tired sigh at the same moment: eyes half shut, mouths open in a long 'haaa', shoulders slumped.", "medium shot from the front at eye level, both characters from the knees up.", True),
 ("N4", "先輩が職場を颯爽と歩く（下から見上げる）", True, "2:28「three times what you did」", ["B2", "SENPAI_face", "SENPAI_front"], ["SENPAI"],
  "SENPAI strides confidently across the office toward frame-right, chest out, chin up, a big self-assured grin, eyes bright, holding a briefcase.", "low angle from near the floor looking up at him, full body, he looks tall and successful.", True),
 ("N5", "眠れない夜（真上から）", True, "4:05「keep you awake staring at the ceiling」", ["B5", "YOU_face", "YOU_front"], ["YOU"],
  "YOU lies on his back in the bed under the blanket at night, eyes wide open and staring in worry, mouth a tight wobbly line, a sweat drop on his forehead, one hand clutching his chest.", "top-down view straight from above the bed, the whole bed in frame.", True),
 ("N6", "たくさんの買い物袋を持って帰る（収入3倍）", False, "4:38「bought nicer things」", ["B8", "YOU_face", "YOU_front"], ["YOU"],
  "YOU struts into the apartment carrying four shopping bags in both hands, eyes sparkling, a huge proud grin, one foot lifted mid-step.", "medium-wide shot at eye level from the side of the room.", True),
 ("N7", "いいお店で食事（収入3倍）", False, "4:41「You ate at better places」", ["YOU_face", "YOU_front"], ["YOU"],
  "YOU sits at a small round restaurant table with a white tablecloth, a nice plate of food and a small candle, eyes closed in bliss, cheeks pink, a big happy smile, holding up a fork. A warm candle glow on his face.", "medium shot, slightly from the side, at table height.", False),
 ("N8", "ソファで並ぶ2人（別れる前）", True, "5:22「Your partner left you」の直前の一瞬", ["B8", "YOU_face", "BLONDE_face"], ["YOU", "BLONDE"],
  "Exactly two characters: YOU and BLONDE sit together on the long sofa, leaning into each other, both laughing out loud with eyes squeezed shut into happy curves and mouths wide open, warm and happy.", "medium shot from the front, slightly low, the sofa filling the lower half.", True),
 ("N9", "大きな部屋でひとり（高い位置から）", True, "5:30〜「sat alone in your quiet, comfortable apartment」", ["B8", "YOU_face", "YOU_front"], ["YOU"],
  "YOU sits alone at the dining table, small in the big quiet room, slumped forward with his head resting on his arms, a closed takeout box in front of him, the second chair empty.", "high angle from the ceiling corner looking down, wide, lots of empty floor around him.", True),
 ("N10", "段ボールを運ぶ（職場の近くへ引っ越し）", False, "7:01「You moved closer to work」", ["B10", "YOU_face", "YOU_front"], ["YOU"],
  "YOU carries one plain cardboard moving box into the small sunny room, eyes bright and hopeful, a big fresh smile.", "medium shot at eye level from the doorway side.", True),
 ("N11", "壊れたパソコンをすぐ直す", False, "7:09「you fixed it right away」", ["YOU_face", "YOU_front"], ["YOU"],
  "YOU sits at a small desk with an open laptop, fixing it with a tiny screwdriver, eyes calm and focused, a relaxed little smile, no stress at all.", "over-the-shoulder shot from behind his left shoulder, the laptop in focus.", False),
 ("N12", "朝の窓辺の後ろ姿（エンディング）", False, "8:15〜", ["B10", "YOU_front"], ["YOU"],
  "YOU stands at the window holding a coffee mug, seen from behind, looking out at the soft morning light.", "medium shot from behind him, eye level, the window in front of him.", True),
]
FIRST = [
 ("F1", "暗闇で鳴る目覚まし時計のアップ", True, "0:00「Your alarm went off in the dark」", ["B5"], [],
  "Only the round alarm clock on the nightstand, ringing in the dark: its face glows warm, two small bells on top, tiny motion lines around it. The bed is a dark blur behind.", "extreme close-up of the alarm clock at nightstand height, shallow depth of field.", True),
 ("F2", "まだ暗い朝、仕事へ歩く", True, "0:02「you got up for a paycheck」", ["B4", "YOU_face", "YOU_front"], ["YOU"],
  "YOU drags himself to work under the street lamps before sunrise, eyes half shut, a huge yawn with a wide open mouth, shoulders slumped forward, holding a small bag.", "wide shot from the side, the character small in the frame, long shadow.", True),
 ("F3", "迷わずカゴに入れる（夢）", True, "0:18「walking into a grocery store」", ["B3", "YOU_face", "YOU_front"], ["YOU"],
  "YOU happily tosses items into the shopping basket without even looking at the shelf, eyes squeezed shut into happy upward curves, a huge open-mouthed grin, one foot kicked up.", "medium shot from the end of the shelf, slightly low angle.", True),
 ("F4", "最初の給料明細を見てがっかり", True, "0:29「Your first paycheck wasn't much」", ["YOU_face", "YOU_front"], ["YOU"],
  "YOU holds a small plain paper pay slip (blank, no writing) up to his face with both hands, totally deflated: eyes wide and drooping, mouth a big wobbly frown, a big sweat drop on his head.", "close-up from the chest up, eye level.", False),
 ("F5", "薄い壁、隣のテレビがうるさい", True, "0:34「walls were thin」", ["B1", "YOU_face", "YOU_front"], ["YOU"],
  "YOU lies in the narrow bed against the wall pressing a pillow hard over his ears, eyes squeezed tightly shut, teeth gritted, very annoyed, small sound waves coming through the thin wall.", "high angle looking down at the bed, medium-wide.", True),
 ("F6", "仕事を抱える（残業）", True, "1:01「took on extra tasks」", ["B2", "YOU_face", "YOU_front"], ["YOU"],
  "YOU staggers across the dark office carrying a tall wobbly stack of plain paper folders, eyes wide in panic, mouth open in a strained 'O', big sweat drops flying off his head.", "low angle from the floor, the stack looks huge.", True),
 ("F7", "カレンダーの月を×で消していく", False, "1:03「counted down the months」", ["B1", "YOU_face", "YOU_front"], ["YOU"],
  "YOU stands at a simple wall calendar (plain grid, no numbers) and slashes a big X over one month with a marker, eyes narrowed with fierce determination, mouth a tight determined line; several months already crossed out.", "over-the-shoulder shot from behind his right shoulder.", True),
 ("F8", "欲しかった物を開ける", True, "1:09「finally bought the thing」", ["B8", "YOU_face", "YOU_front"], ["YOU"],
  "YOU sits on the floor tearing open a glowing wrapped gift box, eyes wide and sparkling with joy, mouth wide open in a huge delighted smile, warm light from the box on his face.", "medium close-up, slightly from above.", True),
 ("F9", "棚に置かれたままの買った物", False, "1:24「just another object sitting in your room」", ["B8", "YOU_front"], ["YOU"],
  "The opened gift sits forgotten on a shelf in the foreground; YOU walks past in the background with a flat, bored face, eyes half closed, not even glancing at it, blurred.", "close-up on the object, the character out of focus behind it.", True),
 ("F10", "当選者のアップ（大喜び）", True, "1:40「the winners were thrilled」", ["RED_face", "RED_front"], ["RED"],
  "RED laughs with his mouth stretched wide open, eyes squeezed shut into happy curves, both fists thrown up in the air, colourful confetti falling around him.", "close-up of the face and raised fists, slightly low angle.", False),
 ("F11", "当選者のふつうの朝ごはん", True, "1:52「a good breakfast」", ["BLONDE_face", "BLONDE_front"], ["BLONDE"],
  "BLONDE sits at a small breakfast table with toast and a cup in front of her, chin propped on one hand, poking the toast, eyes half closed and totally bored, mouth a flat line drooping at one side.", "medium shot at table height from the side.", False),
 ("F12", "主人公のまぶしい笑顔（昇給の夜）", False, "1:14「Walking home that night, you felt great」", ["B4", "YOU_face", "YOU_front"], ["YOU"],
  "YOU walks under a street lamp beaming with pride, chin up, eyes closed in happy curves, a huge open smile, holding a shopping bag.", "close-up from the chest up, low angle, the lamp glowing behind his head.", True),
]
REPL = [
('R1', '有名な話（新聞）', True, "0:16 #4 It's a famous claim", [], [],
  'A big rolled-up newspaper lying on the floor with a blank headline area, a single gold coin resting on top of it.', 'close-up, slightly from above.', False),
('R2', '$75,000（あふれる金貨の瓶）', True, '0:12 #2 $75,000 a year', [], [],
  'A big glass jar overflowing with chunky gold coins, a few coins spilling onto the floor, warm glow.', 'close-up at floor level.', False),
('R3', 'いい車（夢の車）', True, '0:27 #7 a better car', [], [],
  'A shiny small rounded dream car under a soft warm spotlight, sparkles around it.', 'three-quarter view, low angle.', False),
('R4', 'レストランで迷わず注文', True, '0:30 #8 a restaurant without mental math', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU stands at a small cafe counter pointing at a blank menu board with a big confident grin, eyes bright.', 'medium shot from the side of the counter.', False),
('R5', '蛇口の下のコップにたまる水', True, '0:49 #14 dripping', [], [],
  'A small cup in a dark kitchen corner slowly filling with drops from a dripping faucet above it.', 'extreme close-up, shallow depth of field.', False),
('R6', '靴底の穴から靴下', True, '0:53 #15 soles went thin', [], [],
  'A worn sneaker sole seen from below with a small hole, a striped sock peeking through it.', 'extreme close-up from below.', False),
('R7', '3つの貯金箱（大きさがちがう）', True, '1:00 #18 three times as much', [], [],
  'Three gold piggy banks in a row, small, medium and big, the big one glowing.', 'eye level, side by side, centered.', False),
('R8', 'きっと幸せ（夢見る顔のアップ）', True, "1:08 #21 Surely you'd be happier", ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU beams with his eyes closed in happy curves, a big dreamy smile, tiny sparkles floating around his head.', 'close-up of the face.', False),
('R9', '初めての昇給（封筒を受け取る）', True, '1:17 #23 first raise', ['B2', 'YOU_face', 'YOU_front'], ['YOU'],
  'YOU jumps happily in the office holding up a small glowing envelope with both hands, mouth wide open in joy.', 'medium shot, slightly low angle.', True),
('R11', '良いことにも慣れる（プレゼントに飽きる）', True, '2:14 #40 get used to good things', ['B8', 'YOU_face', 'YOU_front'], ['YOU'],
  'YOU lies on the sofa next to a pile of opened presents, yawning hugely, totally bored.', 'medium-wide shot at eye level.', True),
('R12', '慣れのランニングマシン', True, '2:26 #43 that basic pattern', [], [],
  'A small treadmill with a single gold coin running on it in place, motion lines behind it.', 'three-quarter view, eye level.', False),
('R13', '先輩が暗い職場の奥に', True, '2:29 #44 about to see up close', ['B2', 'SENPAI_face', 'SENPAI_front'], ['SENPAI'],
  'SENPAI stands far away at the end of the dark office, small, seen from behind, a desk lamp glowing near him.', 'wide shot from the near end of the office.', True),
('R14', '先輩の家の前で胸を張る', True, '2:40 #47 A nice house', ['B9', 'SENPAI_face', 'SENPAI_front'], ['SENPAI'],
  'SENPAI stands proudly in front of the nice house with his hands on his hips, a big confident grin.', 'wide shot from the street.', True),
('R15', '主人公の『夢のリスト』', True, '2:45 #49 the mental list', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU holds up a long paper list with blank lines and tick boxes, a big hopeful smile.', 'medium close-up, eye level.', False),
('R16', '表彰台の先輩、見上げる主人公', True, '2:49 #50 the dream achieved', ['SENPAI_front', 'YOU_front'], ['SENPAI', 'YOU'],
  'Exactly two characters: SENPAI stands on a small round podium holding a blank gold trophy, smiling; YOU stands below looking up at him in awe with sparkling eyes.', 'medium-wide shot, slightly low angle.', False),
('R17', '家族の夕食、空いた椅子に光るスマホ', True, '3:04 #54 out of dinner with his family', [], [],
  'A dinner table with three plates and food, one chair empty with a phone glowing on its seat.', 'high angle over the table.', False),
('R18', 'ひらめき（電球）', True, '3:06 #55 you realize something', ['YOU_face', 'YOU_front'], ['YOU'],
  "YOU with eyes wide open and mouth in a small 'o', a little glowing light bulb above his head.", 'close-up of the face and the bulb.', False),
('R19', '2つの道しるべ', True, '3:19 #60 two different things', [], [],
  'Two simple round signs on poles pointing in different directions: one with a gold star shape, one with a soft yellow smiley face.', 'eye level, centered.', False),
('R20', '届かない幸せの風船', True, "3:59 #71 wasn't happiness itself", [], [],
  'A big yellow smiley balloon floating high and glowing, its string out of reach above a stack of gold coins.', 'low angle looking up.', False),
('R21', '長い修理代の請求書', True, '4:24 #77 the repair bill', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU holds a long blank paper bill that unrolls all the way to the floor, eyes popping wide, jaw dropped, sweat drops flying.', 'full body, front view.', False),
('R22', '給料が3倍（3枚の封筒）', True, '4:34 #78 income really did triple', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU grins from ear to ear holding three glowing envelopes fanned out like playing cards.', 'close-up from the chest up.', False),
('R23', '夢見た古い部屋（回想）', True, '4:40 #80 that noisy first apartment', ['B1', 'YOU_face', 'YOU_front'], ['YOU'],
  'YOU sits on the floor of the small old apartment hugging his knees, looking up at a big empty dream bubble, a little wistful.', 'medium-wide shot, slightly from above.', True),
('R24', '値札を見ずに支払う', True, '4:48 #82 without checking the price tag', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU hands over a card at a small shop counter without even looking, eyes closed, a breezy carefree smile.', 'medium shot from the side.', False),
('R25', '安心して眠る', True, '4:53 #84 worry finally went quiet', ['B5', 'YOU_face', 'YOU_front'], ['YOU'],
  "YOU sleeps peacefully in the bed, a gentle smile, tiny 'z' bubbles floating up.", 'high angle over the bed.', True),
('R26', 'スマホで請求をサッと払う', True, '4:57 #85 That part was real', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU taps a phone with one finger, relaxed and smiling, a small green check mark glowing above the phone.', 'close-up from the chest up.', False),
('R27', '大きな箱を開けても小さな笑顔', True, "4:59 #86 the rush of joy wasn't bigger", ['B8', 'YOU_face', 'YOU_front'], ['YOU'],
  'YOU opens a huge gift box but only gives a small flat polite smile, eyebrows neutral.', 'medium shot, eye level.', True),
('R28', '金貨の山と小さな笑顔の風船', True, '5:05 #87 the amount was far larger', [], [],
  'A huge mountain of gold coins next to a tiny yellow smiley balloon that is only a little bigger than a coin.', 'wide shot, eye level.', False),
('R29', '2つの同じ花火（低い段と高い段）', True, '5:29 #93 the same single boost', [], [],
  'Two identical small sparkle bursts: one above a low step on the left, one above a high step on the right.', 'eye level, wide, centered.', False),
('R30', '届いた料理の袋がドアに並ぶ', True, '5:47 #100 any meal delivered', [], [],
  'Several takeout bags lined up untouched at an apartment door at night.', 'low angle at floor level.', False),
('R31', 'グリーフ（空いた椅子と白い花）', True, '6:53 #119 Grief', [], [],
  'A single white flower lying on an empty chair in a dim room.', 'close-up, eye level.', False),
('R32', '心の病気（頭の上の雨雲）', True, '6:54 #119 Mental illness', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU sits hugging his knees under a small grey rain cloud that rains only on him, eyes drooping, mouth trembling.', 'medium shot, eye level.', False),
('R33', '論文の結論（光るしおり）', True, '6:46 #117 a clear takeaway', [], [],
  'An open book with blank pages and a small glowing gold bookmark.', 'close-up, slightly from above.', False),
('R34', '金貨でハートを直そうとする', True, "6:56 #120 Money can't fix those", [], [],
  'A gold coin stuck on a cracked grey heart like a bandage, already peeling off and falling.', 'close-up, eye level.', False),
('R35', 'お金の使い方を変える（小さな瓶に分ける）', True, '6:58 #121 changed how you spent', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU sits at a small table sorting gold coins into three little labeled-free jars, focused and calm.', 'medium shot from the side.', False),
('R36', '大きな買い物のために貯める（巨大な貯金箱）', True, '7:01 #122 one big purchase', ['YOU_face', 'YOU_front'], ['YOU'],
  'A giant piggy bank glowing on a pedestal under a spotlight, a tiny YOU looking up at it with an uneasy face.', 'wide shot, low angle.', False),
('R37', '国ごとに違う（家と金貨の山）', True, '7:49 #134 $35,000 to $125,000', [], [],
  'A row of five small houses of different styles, each with a stack of gold coins of a different height beside it.', 'wide shot, eye level.', False),
('R38', '一緒に歩く2つのおもちゃ', True, '8:01 #138 the two move together', [], [],
  'Two small wind-up toys walking side by side: a gold coin toy and a yellow smiley-face toy.', 'eye level, side view.', False),
('R39', '最初の問いにもどる', True, '8:05 #139 if your pay doubled', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU holds up a blank pay slip and tilts his head, looking up thoughtfully, a question mark made of light above him.', 'close-up from the chest up.', False),
('R40', 'お金は大事、でも思っていた形じゃない', True, '8:13 #141 Money matters', ['YOU_face', 'YOU_front'], ['YOU'],
  'YOU holds a single gold coin up to the light with both hands, a soft gentle smile.', 'close-up from the chest up.', False),
('R41', 'やわらかいクッション（痛みをやわらげる）', True, '8:16 #142 softening pain', [], [],
  'A soft gold cushion catching a falling grey stone.', 'eye level, centered.', False),
('R42', '届かない雲（コインが止まる）', True, "8:22 #144 some pain it can't reach", [], [],
  'A gold coin rolling toward a dark grey cloud on the floor and stopping just short of it.', 'low angle at floor level.', False),
('R43', '月曜の先輩（コーヒーの前・後ろ姿）', True, '8:25 #145 your coworker sighs', ['B6', 'SENPAI_face', 'SENPAI_front'], ['SENPAI'],
  'SENPAI stands at the coffee machine seen from behind, shoulders slumped, a breath puff of a sigh.', 'medium shot from behind.', True),
('R44', '家の前でため息の先輩', True, '8:28 #146 the house', ['B9', 'SENPAI_face', 'SENPAI_front'], ['SENPAI'],
  'SENPAI stands in front of the nice house at night, shoulders dropped, sighing, eyes half closed.', 'wide shot from the street.', True),
('R45', '車にもたれる先輩', True, '8:29 #146 the car', ['B7', 'SENPAI_face', 'SENPAI_front'], ['SENPAI'],
  'SENPAI leans against his dark sedan in the parking lot, staring at the ground, tired.', 'medium-wide shot, eye level.', True),
('R46', '肩書きの机の先輩', True, '8:30 #146 the title', ['B2', 'SENPAI_face', 'SENPAI_front'], ['SENPAI'],
  'SENPAI sits at a big executive desk with a blank nameplate, head resting on one hand, exhausted.', 'medium shot, eye level.', True),
('R47', '2人で職場を出る（エンディング）', True, '8:35 #148 the ending', ['YOU_front', 'SENPAI_front'], ['YOU', 'SENPAI'],
  'Exactly two characters: YOU and SENPAI walk side by side away from the camera toward a soft sunrise glow, relaxed, shoulders loose.', 'wide shot from behind, eye level.', False),
]
def thumb(r):
    path = f"{REF}/sets/{SETS[r]}.jpg" if r in SETS else f"{REF}/canon/{r}.png"
    im = Image.open(path).convert("RGB"); im.thumbnail((1100, 1100)); b = io.BytesIO(); im.save(b, "JPEG", quality=85)
    who = r if r in SETS else f"{JA[r.split('_')[0]]}の{'顔' if r.endswith('face') else '全身'}"
    label = f"背景 {r}" if r in SETS else who
    return f'<figure><img src="data:image/jpeg;base64,{base64.b64encode(b.getvalue()).decode()}"><figcaption>{html.escape(label)}</figcaption></figure>'
MODE = sys.argv[3] if len(sys.argv) > 3 else "second"
if MODE == "first": IMGS = FIRST
elif MODE == "all": IMGS = FIRST + IMGS
elif MODE == "repl": IMGS = REPL
cards = "".join((f'<h2>前半（0:00〜2:30）</h2>' if MODE == 'all' and i == 'F1' else f'<h2>後半（2:30〜8:34）</h2>' if MODE == 'all' and i == 'N1' else '') + f'''<section class="card"><h3><span class="id">{i}</span> {html.escape(t)}{" <span class=star>★</span>" if st else ""}</h3><p class="meta">使う場所：{w}</p>
<div class="refs">{"".join(thumb(r) for r in (refs or (["B1"] if not who else [])))}</div><p class="hint">↑この順に添付（長押しで保存）。左から Image 1、2、3。</p>
<div class="pr"><pre>{html.escape(prompt(refs, who, sc, cam, bg))}</pre><button onclick="cp(this)">コピー</button></div></section>''' for i, t, st, w, refs, who, sc, cam, bg in IMGS)
page = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>追加画像プロンプト</title>
<style>:root{{--bg:#f6f7fb;--card:#fff;--fg:#151a26;--mute:#5d667a;--line:#dde2ec;--acc:#2b6ef2;--pre:#f1f3f8}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#0d111a;--card:#161c28;--fg:#e8ecf5;--mute:#98a3b8;--line:#263044;--acc:#7aa7ff;--pre:#0f1520}}}} :root[data-theme="dark"]{{--bg:#0d111a;--card:#161c28;--fg:#e8ecf5;--mute:#98a3b8;--line:#263044;--acc:#7aa7ff;--pre:#0f1520}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Hiragino Sans",system-ui,sans-serif}} main{{max-width:760px;margin:0 auto;padding:16px}} h1{{font-size:20px;margin:8px 0}} h2{{font-size:17px;margin:26px 0 8px;padding-top:6px;border-top:2px solid var(--line)}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:12px 0}} h3{{font-size:16px;margin:0 0 4px}} .id{{color:var(--acc);font-weight:700}} .star{{color:#e0a020}}
.meta,.hint{{color:var(--mute);font-size:13px;margin:2px 0 6px}} .refs{{display:flex;gap:8px;overflow-x:auto}} figure{{margin:0;flex:0 0 auto;width:110px}} figure img{{width:110px;height:110px;object-fit:cover;border-radius:8px;border:1px solid var(--line);background:#9097a6}} figcaption{{font-size:11px;color:var(--mute)}}
.pr{{position:relative}} pre{{white-space:pre-wrap;word-break:break-word;background:var(--pre);border-radius:8px;padding:10px 10px 38px;margin:0;font:13px/1.5 ui-monospace,Menlo,monospace}}
button{{position:absolute;right:8px;bottom:8px;border:0;border-radius:6px;padding:5px 12px;background:var(--acc);color:#fff;font-size:13px}} .note{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:14px}}</style></head><body><main>
<h1>{ {"first": "前半用の", "second": "後半用の", "all": "前半・後半の", "repl": "使い回しをなくす"}[MODE] }追加画像 {len(IMGS)}枚</h1><div class="note">単調にならないように、<b>顔のアップ・見上げ・真上から・高い位置から・肩越し・後ろ姿</b>など、今までにない角度を入れてある。<br>★が優先。背景つきのものは、その背景の画像も添付する。Flow で一番大きいサイズで書き出してね。</div>
{cards}</main><script>function cp(b){{const p=b.previousElementSibling;(navigator.clipboard?navigator.clipboard.writeText(p.innerText):Promise.reject()).then(()=>{{b.textContent='コピーしました';setTimeout(()=>b.textContent='コピー',1500)}}).catch(()=>{{const r=document.createRange();r.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(r);}})}}</script></body></html>'''
open(OUT, "w", encoding="utf-8").write(page); print(len(IMGS))
