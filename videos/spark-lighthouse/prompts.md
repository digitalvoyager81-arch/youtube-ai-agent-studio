# «Искра маяка» — промпты для AI-видео

Шесть клипов по 10 сек, вертикаль 9:16, 3D в стиле Pixar, кинематографический свет, без текста на экране.
Промпты на английском: видеомодели (Veo, Kling, Seedance, Minimax) понимают его точнее. Реплики — на русском, в кавычках: модели со звуком (Veo 3.1, Kling 3, Gemini Omni) попытаются их озвучить; иначе озвучку можно наложить отдельно.

## Общая строка стиля (добавлять в каждый промпт)

```
3D animated feature film in the style of Pixar, vertical 9:16 frame, cinematic lighting, volumetric light, soft rim light, shallow depth of field, rich warm-cool color grading, expressive character animation, film grain, no text, no subtitles, no captions, no logos, no watermarks.
```

## Персонажи (вставлять описание дословно, чтобы герои не менялись между клипами)

- **MIRA** — an 8-year-old girl with curly copper-red hair in a messy ponytail, big amber eyes, freckles, a bright yellow raincoat, red rubber boots.
- **PYKH** — a tiny lighthouse spirit the size of a kitten: a round fluffy body of soft smoky-grey fur that puffs like a little cloud, huge glossy dark eyes, two stubby arms, a small hollow glow-spot in his chest that is dim and empty without his spark. Speaks with a small, soft boyish voice.
- **THE KEEPER** — an old lighthouse keeper with a white beard, kind wrinkled face, navy knit sweater, worn captain's cap, holding a brass oil lamp.
- **THE SPARK** — a floating ember the size of a walnut, golden-white, softly pulsing like a heartbeat, with tiny drifting sparkles.
- **МЕСТО** — a rocky northern seacoast at blue-hour dusk, an old white-and-red lighthouse that is dark, cold wind, foamy waves; far away, ship lights wander in the fog.

## Клипы

### 1. Встреча (10 с) — Мира, Пых

```
At the foot of the dark lighthouse at blue-hour dusk, MIRA walks along wet rocks and notices PYKH curled up behind a stone, shivering, his chest glow-spot empty. She crouches down gently. Medium close-up, slow push-in, cold blue ambient light with a warm sliver of sunset on the horizon. MIRA, softly: «Ты потерялся?» PYKH looks up with teary eyes, then glances at the dark lighthouse: «Я потерял свою искру… А без неё маяк не зажжётся.» The lighthouse lamp room above is cold and black.
```

### 2. Решение (10 с) — Мира, Пых

```
Same location. MIRA smiles with determination and offers her open hand; PYKH hesitantly climbs onto her palm. Low-angle shot, wind in her hair, the dark lighthouse towering behind them against a deep-blue sky. MIRA: «Тогда найдём её. Вместе.» PYKH points a stubby arm toward a jagged sea cave glowing faintly gold far down the shore, waves crashing at its mouth: «Но искра далеко. Она упала в пещеру у моря!» Camera cranes up and over them to reveal the long path to the cave.
```

### 3. Пещера (10 с) — Мира, Пых

```
Inside a wet sea cave lit only by flickering golden light from deeper inside and cyan bioluminescent algae on the walls. MIRA carefully steps across slippery stones over dark rushing water; PYKH clings to her shoulder, fur puffed up with fear. A wave surges and splashes; MIRA reaches back for him. Tracking shot, handheld feel, dramatic chiaroscuro. MIRA: «Держись за меня!» PYKH, hiding his face in her raincoat collar: «Я боюсь…» Water droplets sparkle in the light.
```

### 4. Искра (10 с) — Мира, Пых

```
Deep in the cave, THE SPARK floats above a small rock pool. As MIRA and PYKH step closer together, the spark glows brighter and brighter, washing their faces in warm golden light and pushing back the darkness; reflections ripple on the cave ceiling. Close-up two-shot, slow orbit around them, sparkles drifting. MIRA, amazed: «Она светится сильнее, когда мы рядом!» PYKH, gently, looking at her: «Потому что теперь это наша искра.» Both cup their hands together around the spark.
```

### 5. Маяк (10 с) — Мира, Пых, Смотритель

```
Night, top of the lighthouse. MIRA and PYKH, out of breath, release THE SPARK into the great lighthouse lens; it bursts into a powerful warm beam that sweeps across the stormy sea. THE KEEPER rushes in with his brass oil lamp, face lit with joy. Wide shot through the lamp room glass, then cut to the beam reaching ships in the fog, their lights turning toward the shore. KEEPER: «Вы успели! Корабли найдут дорогу домой.» MIRA and PYKH look at each other and smile: «Мы нашли её не одни.»
```

### 6. Финал (10 с) — Мира, Пых, Смотритель

```
Dawn on the lighthouse balcony, the beam still turning, the sea calm and pink-gold. MIRA sits with PYKH on her knees; THE KEEPER stands behind them with a warm smile, hand on her shoulder. PYKH's chest glow-spot now shines softly. PYKH touches it in wonder: «Кажется, искра теперь живёт и во мне.» MIRA shakes her head gently and touches her own heart, then his: «Нет. Она живёт между нами.» A tiny golden light pulses between them. Slow pull-back to a wide shot of the glowing lighthouse at sunrise.
```

## Распределение реплик

По тексту сценария реплики поделены так (поправьте, если задумано иначе):

| Клип | Мира | Пых | Смотритель |
|------|------|-----|------------|
| 1 | Ты потерялся? | Я потерял свою искру… А без неё маяк не зажжётся. | — |
| 2 | Тогда найдём её. Вместе. | Но искра далеко. Она упала в пещеру у моря! | — |
| 3 | Держись за меня! | Я боюсь… | — |
| 4 | Она светится сильнее, когда мы рядом! | Потому что теперь это наша искра. | — |
| 5 | Мы нашли её не одни. (вместе с Пыхом) | | Вы успели! Корабли найдут дорогу домой. |
| 6 | Нет. Она живёт между нами. | Кажется, искра теперь живёт и во мне. | — |

## Советы по генерации

- **Длительность 10 с** поддерживают Kling 3, Seedance 2, Minimax H3, Gemini Omni Flash. Veo 3.1 — максимум 8 с.
- **Одинаковые герои:** сначала сгенерируйте картинку-референс персонажей (character sheet) и подавайте её в каждый клип как reference image / ingredients.
- **Склейка:** последний кадр клипа можно подать как первый кадр следующего (image-to-video), чтобы переходы были плавными.
