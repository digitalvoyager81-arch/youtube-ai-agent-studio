#!/usr/bin/env python3
"""
Генерация озвучки (Edge TTS) и src/audioConfig.ts для видео «Искусственный интеллект».

Уже сгенерированные файлы пропускаются; удалите mp3, чтобы перегенерировать сцену.

Использование:
    python3 scripts/generate_audio.py

Зависимости:
    pip install edge-tts, ffprobe (ffmpeg)
"""

import asyncio
import json
import os
import subprocess
from pathlib import Path

try:
    import edge_tts
    import edge_tts.communicate
except ImportError:
    print("❌ Установите edge-tts: pip install edge-tts")
    exit(1)

# edge-tts не читает переменные прокси, передаём явно
PROXY = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")

# edge-tts доверяет только certifi; добавляем CA из SSL_CERT_FILE (нужно за прокси)
if os.environ.get("SSL_CERT_FILE"):
    edge_tts.communicate._SSL_CTX.load_verify_locations(cafile=os.environ["SSL_CERT_FILE"])

VOICE = "ru-RU-DmitryNeural"
RATE = "-5%"
FPS = 30
PADDING_FRAMES = 20  # пауза после реплики перед следующей сценой
RETRIES = 5

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public" / "audio"
CONFIG_FILE = ROOT / "src" / "audioConfig.ts"

SCENES = [
    {
        "id": "01-hook",
        "title": "Вступление",
        "text": (
            "Вы разблокируете телефон взглядом. Получаете подборку видео, которые точно понравятся. "
            "Переводите текст за секунду. За всем этим стоит одна технология — искусственный интеллект. "
            "Но как он на самом деле работает?"
        ),
    },
    {
        "id": "02-what",
        "title": "Что такое ИИ",
        "text": (
            "Обычной программе человек задаёт правила: если так — сделай вот это. "
            "Искусственный интеллект устроен наоборот. Ему показывают данные и правильные ответы, "
            "а правила он находит сам."
        ),
    },
    {
        "id": "03-data",
        "title": "Данные",
        "text": (
            "Представим, что компьютер должен отличать кошку от собаки. "
            "Мы не объясняем ему, что такое уши или усы. Мы показываем тысячи фотографий с подписями. "
            "А для компьютера каждая фотография — это просто таблица чисел."
        ),
    },
    {
        "id": "04-network",
        "title": "Нейронная сеть",
        "text": (
            "Эти числа проходят через нейронную сеть — слои простых вычислительных элементов. "
            "Каждый нейрон умножает входящие числа на свои веса, складывает и передаёт дальше. "
            "На выходе сеть даёт ответ: кошка или собака."
        ),
    },
    {
        "id": "05-learning",
        "title": "Обучение",
        "text": (
            "Сначала веса случайны, и сеть угадывает наугад. Но после каждой ошибки "
            "веса чуть-чуть подправляются в сторону правильного ответа. "
            "Повторите это миллионы раз — и точность вырастет с пятидесяти процентов почти до ста."
        ),
    },
    {
        "id": "06-scale",
        "title": "Масштаб",
        "text": (
            "Точно так же учатся большие языковые модели, которые пишут тексты и отвечают на вопросы. "
            "Только примеров у них — триллионы слов, а весов — сотни миллиардов."
        ),
    },
    {
        "id": "07-outro",
        "title": "Итог",
        "text": (
            "Искусственный интеллект — это не магия и не разум из фантастики. "
            "Это математика, данные и очень много примеров. "
            "Подписывайтесь, чтобы узнать, что у него внутри, ещё глубже."
        ),
    },
]


def get_audio_duration(file_path: Path) -> float:
    """Длительность аудио через ffprobe"""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(file_path)],
        capture_output=True, text=True,
    )
    return float(result.stdout.strip()) if result.stdout.strip() else 0


async def synthesize(text: str, audio_path: Path) -> list:
    """Синтез в файл; возвращает границы предложений [{text, start, end}] в секундах"""
    sentences = []
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, proxy=PROXY)
    with open(audio_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                start = chunk["offset"] / 1e7  # единицы по 100 нс
                sentences.append({
                    "text": chunk["text"],
                    "start": start,
                    "end": start + chunk["duration"] / 1e7,
                })
    return sentences


async def generate_audio(scene: dict) -> tuple:
    output_file = OUTPUT_DIR / f"{scene['id']}.mp3"
    timings_file = OUTPUT_DIR / f"{scene['id']}.json"
    if output_file.exists() and timings_file.exists():
        return output_file, json.loads(timings_file.read_text(encoding="utf-8"))
    tmp_file = output_file.with_suffix(".tmp")
    # Edge TTS иногда случайно отвечает "No audio was received" — повторяем
    for attempt in range(1, RETRIES + 1):
        try:
            sentences = await synthesize(scene["text"], tmp_file)
            break
        except edge_tts.exceptions.NoAudioReceived:
            if attempt == RETRIES:
                raise
            print(f"↻ повтор {attempt}... ", end="", flush=True)
            await asyncio.sleep(2 * attempt)
    tmp_file.rename(output_file)
    timings_file.write_text(json.dumps(sentences, ensure_ascii=False, indent=2), encoding="utf-8")
    return output_file, sentences


def write_config(results: list) -> None:
    items = []
    for r in results:
        sentence_lines = ",\n".join(
            f"      {{ text: {json.dumps(s['text'], ensure_ascii=False)}, from: {s['from']}, to: {s['to']} }}"
            for s in r["sentences"]
        )
        items.append(
            "  {\n"
            f"    id: {json.dumps(r['id'])},\n"
            f"    title: {json.dumps(r['title'], ensure_ascii=False)},\n"
            f"    audioFile: {json.dumps(r['file'])},\n"
            f"    durationInFrames: {r['frames']},\n"
            "    sentences: [\n"
            f"{sentence_lines},\n"
            "    ],\n"
            "  }"
        )
    scenes_content = ",\n".join(items)
    content = f"""// Сгенерировано scripts/generate_audio.py — не редактировать вручную
export interface Sentence {{
  text: string;
  from: number; // кадр начала относительно начала сцены
  to: number;
}}

export interface SceneConfig {{
  id: string;
  title: string;
  audioFile: string;
  durationInFrames: number;
  sentences: Sentence[];
}}

export const FPS = {FPS};

export const SCENES: SceneConfig[] = [
{scenes_content},
];

export const getSceneStart = (index: number): number =>
  SCENES.slice(0, index).reduce((sum, s) => sum + s.durationInFrames, 0);

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.durationInFrames, 0);
"""
    CONFIG_FILE.write_text(content, encoding="utf-8")


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"🎙️  Edge TTS (голос: {VOICE})")
    print("=" * 60)

    results = []
    for i, scene in enumerate(SCENES, 1):
        print(f"[{i}/{len(SCENES)}] {scene['id']}: ", end="", flush=True)
        try:
            output_file, sentences = await generate_audio(scene)
        except Exception as e:
            print(f"❌ {e}")
            exit(1)
        duration = get_audio_duration(output_file)
        frames = round(duration * FPS) + PADDING_FRAMES
        results.append({
            **scene,
            "file": output_file.name,
            "duration": duration,
            "frames": frames,
            "sentences": [
                {"text": s["text"], "from": round(s["start"] * FPS), "to": round(s["end"] * FPS)}
                for s in sentences
            ],
        })
        print(f"✅ {duration:.2f}s ({frames} кадров)")

    write_config(results)
    total = sum(r["frames"] for r in results) / FPS
    print("=" * 60)
    print(f"✅ Готово: {len(results)} сцен, {total:.1f} сек. Конфиг: {CONFIG_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    asyncio.run(main())
