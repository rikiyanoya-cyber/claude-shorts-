# カメラワーク辞書（24種）

長編（横型・10〜15分）で「静止画の切り替えだけ」にならないよう、映画のカメラワーク24種をコードの部品にしたもの。
社長からの指示（2026-11-09、出典：@uchita_success「AI動画作成で使う、カメラワークの名前24」、追補：usutaku（@usutaku4）「映像ショット用語一覧」）を実装。

- 部品：`camerawork.ts`（`cameraAt(spec, frame)` が、画面全体と4つの奥行きレイヤー bg / mid / subject / fg の変形を返す）
- 見本リール：`CameraReel.tsx`（24種×各3秒、日本語名＋英語名つき）。書き出しは `node camera_render.mjs 出力.mp4`
- 解像度・fps・画風・音声など既存の仕様は変えない。変えるのはカメラの動きだけ。

## 作り分けのきまり
- **zoom in と dolly in は視差の有無で分ける**：zoom＝画面全体を一様に拡大（レンズ）。dolly＝奥行きごとに拡大率が違う（手前ほど大きく）。
- dolly と zoom の基準（参考動画の実例）：被写体まで 14.0m。**ZOOM** はレンズ106mm・14.0mのまま寄る、**DOLLY IN** はレンズ39mmで 10.4m までカメラごと近づく。
  実装は各レイヤーの距離（奥 120m・街 40m・被写体 14.0m・手前 6.5m）からピンホールの式（大きさ∝1/距離）で計算する。
  同じ強さなら被写体の大きさは両方とも ×1.346 で同じになり、違うのは視差だけ（DOLLY IN：奥 ×1.031・街 ×1.099・手前 ×2.241／ZOOM：全部 ×1.346）。
- **pan / tilt** は全レイヤーが同じだけ動く（カメラが向きを変える）。**truck / pedestal** は奥行きで速さが違う（カメラが移動する）。
- **handheld** は ±数px・1度未満。字幕が読めなくならない範囲。
- **bullet time** は被写体のアニメを止めて背景だけ回す。**dolly zoom** は被写体の大きさを固定して背景だけ迫る。

## 別名
- **crane up ＝ Crane Shot（クレーンショット）**：上昇して全体を見せる。オープニングとラスト用。
- **dolly zoom ＝ めまいショット（vertigo shot）**：心理的な不安・驚き。
- 台本に別名で書かれていても `toMove()` で同じ動きとして扱う。

## 組み合わせ（1シーン最大2つ）
- 主役の動き1つ＋補助1つまで（`"with"`）。例：tracking shot ＋ tilt up で「並走しながら見上げる」。
- 補助の強さは 0.5 まで、主役も 0.7 以下に控えめにする。
- 激しい動き（roll / FPV / crash zoom / whip pan）と、1回限りの3つ（bullet time / dolly zoom / tiny planet）は補助にしない。
```json
"camera": { "move": "tracking shot", "duration_frames": 120, "intensity": 0.6, "target": "歩く主人公", "with": { "move": "tilt up", "intensity": 0.4 } }
```

## 台本JSONの camera（必須）
各シーンに必ず入れる。未指定を自動で static にしない。下の選定ルールで必ず割り当てる。
```json
"camera": { "move": "dolly in", "duration_frames": 90, "intensity": 0.6, "target": "主人公の表情" }
```
`move` は `MOVES` の英語名そのまま。`intensity` は 0〜1。

## 選定ルール（長編の配分）
- 基本の12（static〜whip pan）が全体の約7割。映える12（crane up〜bolt cam）は約3割まで。
- bullet time / dolly zoom / tiny planet は1本に各1回まで（`ONCE_PER_VIDEO`）。
- 冒頭フック：aerial drone shot / crane up / dive / FPV のどれかで「場所と規模」を一気に見せる。
- 説明パート：static が基本。pan / tilt / dolly in / dolly out でゆるく変化。同じ動きを3シーン続けない。
- 感情の山場：dolly in で迫る → 決め場面だけ dolly zoom（めまいショット）か bullet time。
- 場面転換：whip pan / dive / truck で「移動」を感じさせる。
- 締め：crane up（Crane Shot）か dolly out で引いて終わる。
- 字幕・テロップが主役のシーンでは激しい動きを使わない。
- 激しい動き（roll / FPV / crash zoom / whip pan ＝ `HARSH`）の直後は static かゆるい動きを置く（酔わせない）。

## チェック
- `checkCameraPlan(scenes)` が上のルール（配分・回数・3連続・激しい動きの直後・字幕が主役の場面・組み合わせ）を確かめる。

## 本編に使うとき
- 次の長編台本の全シーンに camera を割り当て、「シーン番号／move／選んだ理由」の一覧表で社長に報告する。
