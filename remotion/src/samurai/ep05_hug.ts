// Episode data: Samurai Stillness #5 THE HUG (labels, battery schedule, scene times, cover)
export const EP05 = {
 "id": "ep05_hug",
 "title": "THE HUG",
 "duration": 14.0,
 "labels": {
  "left": "NO HUG",
  "right": "ONE HUG"
 },
 "battery": {
  "left": [
   [
    0,
    100
   ],
   [
    2.0,
    20
   ],
   [
    4.0,
    3
   ],
   [
    6.6,
    2
   ],
   [
    8.0,
    0
   ]
  ],
  "right": [
   [
    0,
    100
   ],
   [
    2.0,
    20
   ],
   [
    4.0,
    3
   ],
   [
    6.3,
    40
   ],
   [
    8.6,
    80
   ],
   [
    10.6,
    100
   ]
  ],
  "chargeFrom": 6.3
 },
 "scenes": {
  "evening": 2.0,
  "door": 4.0,
  "turn": 6.0,
  "inside": 8.0,
  "full": 10.0,
  "final": 12.0
 },
 "cover": {
  "time": 0.9,
  "title": "ONE HUG"
 }
} as const;
