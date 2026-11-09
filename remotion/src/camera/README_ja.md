# カメラワーク辞書（24種）

長編（横型・10〜15分）で「静止画の切り替えだけ」にならないよう、映画のカメラワーク24種をコードの部品にしたもの。
社長からの指示（2026-11-09、出典：@uchita_success「AI動画作成で使う、カメラワークの名前24」）を実装。

- 部品：`camerawork.ts`（`cameraAt(spec, frame)` が、画面全体と4つの奥行きレイヤー bg / mid / subject / fg の変形を返す）
- 見本リール：`CameraReel.tsx`（24種×各3秒、日本語名＋英語名つき）。書き出しは `node camera_render.mjs 出力.mp4`
- 解像度・fps・画風・音声など既存の仕様は変えない。変えるのはカメラの動きだけ。

## 作り分けのきまり
- **zoom in と dolly in は視差の有無で分ける**：zoom＝画面全体を一様に拡大（レンズ）。dolly＝奥行きごとに拡大率が違う（手前ほど大きく）。
- **pan / tilt** は全レイヤーが同じだけ動く（カメラが向きを変える）。**truck / pedestal** は奥行きで速さが違う（カメラが移動する）。
- **handheld** は ±数px・1度未満。字幕が読めなくならない範囲。
- **bullet time** は被写体のアニメを止めて背景だけ回す。**dolly zoom** は被写体の大きさを固定して背景だけ迫る。

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
- 感情の山場：dolly in で迫る → 決め場面だけ dolly zoom か bullet time。
- 場面転換：whip pan / dive / truck で「移動」を感じさせる。
- 締め：crane up か dolly out で引いて終わる。
- 字幕・テロップが主役のシーンでは激しい動きを使わない。
- 激しい動き（roll / FPV / crash zoom / whip pan ＝ `HARSH`）の直後は static かゆるい動きを置く（酔わせない）。

## 本編に使うとき
- 次の長編台本の全シーンに camera を割り当て、「シーン番号／move／選んだ理由」の一覧表で社長に報告する。
