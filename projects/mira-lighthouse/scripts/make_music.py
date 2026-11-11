#!/usr/bin/env python3
"""Procedural soundtrack for "Мира и Пых" (60 s, 6 scenes x 10 s).

Pads + music-box melody + ocean/rain ambience + a chime burst when the
spark ignites.  Pure numpy, deterministic.  Writes public/soundtrack.wav.
"""
import os
import wave

import numpy as np

SR = 44100
DUR = 60.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

A4 = 440.0


def hz(note):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    n, o = note[:-1], int(note[-1])
    return A4 * 2 ** ((names[n] + (o - 4) * 12) / 12)


def env(start, length, attack, release):
    e = np.zeros(N)
    i0, i1 = int(start * SR), min(N, int((start + length) * SR))
    if i1 <= i0:
        return e
    tt = (np.arange(i1 - i0)) / SR
    a = np.clip(tt / max(attack, 1e-3), 0, 1)
    r = np.clip((length - tt) / max(release, 1e-3), 0, 1)
    e[i0:i1] = np.minimum(a, r)
    return e


def pad(notes, start, length, vol=0.08, bright=0.3):
    out = np.zeros(N)
    e = env(start, length, 2.0, 2.5)
    idx = e > 0
    for k, n in enumerate(notes):
        f = hz(n)
        for det in (-0.12, 0.0, 0.11):
            ph = rng.uniform(0, 2 * np.pi)
            ff = f * 2 ** (det / 12)
            s = np.sin(2 * np.pi * ff * t[idx] + ph)
            s += bright * np.sin(2 * np.pi * 2 * ff * t[idx] + ph) * 0.5
            s += bright * 0.3 * np.sin(2 * np.pi * 3 * ff * t[idx] + ph)
            out[idx] += s
    out *= e * vol / (len(notes) * 3)
    return out


def bell(note, start, vol=0.12, decay=1.8):
    out = np.zeros(N)
    i0 = int(start * SR)
    L = min(N - i0, int(SR * decay * 3))
    if L <= 0:
        return out
    tt = np.arange(L) / SR
    f = hz(note)
    s = (
        np.sin(2 * np.pi * f * tt)
        + 0.45 * np.sin(2 * np.pi * f * 2.0 * tt) * np.exp(-tt * 3)
        + 0.25 * np.sin(2 * np.pi * f * 3.01 * tt) * np.exp(-tt * 5)
        + 0.12 * np.sin(2 * np.pi * f * 4.2 * tt) * np.exp(-tt * 8)
    )
    a = np.clip(tt / 0.004, 0, 1)
    out[i0 : i0 + L] = s * a * np.exp(-tt / decay) * vol
    return out


def filtered_noise(lo, hi, vol):
    x = rng.standard_normal(N)
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(N, 1 / SR)
    mask = 1 / (1 + (lo / np.maximum(fr, 1)) ** 2) / (1 + (fr / hi) ** 2)
    y = np.fft.irfft(X * mask, N)
    return y / np.max(np.abs(y)) * vol


def curve(points):
    """piecewise linear automation, points=[(time, value), ...]"""
    ts, vs = zip(*points)
    return np.interp(t, ts, vs)


music = np.zeros(N)

# --- harmony (one chord bed per scene-ish) -------------------------------
chords = [
    (0, 10.5, ["A2", "E3", "C4", "E4"], 0.25),  # 1 loss – A minor
    (10, 5.5, ["F2", "C3", "A3", "C4"], 0.35),  # 2 path – F
    (15, 5.5, ["G2", "D3", "B3", "D4"], 0.35),  # 2 – G
    (20, 10.5, ["D2", "A2", "F3", "A3"], 0.15),  # 3 abyss – D minor, dark
    (30, 4.8, ["D2", "A2", "D3", "F3", "A3"], 0.2),  # 4 – tension
    (34.6, 5.6, ["C2", "G2", "C3", "E3", "G3", "C4"], 0.6),  # 4 – spark! C major
    (40, 5.2, ["F2", "C3", "A3", "C4", "F4"], 0.5),  # 5 return
    (45, 5.2, ["G2", "D3", "B3", "D4", "G4"], 0.5),
    (50, 10.0, ["F2", "C3", "A3", "E4"], 0.35),  # 6 warmth – Fmaj7
    (54, 6.0, ["C2", "G2", "E3", "G3", "C4"], 0.3),
]
for start, length, notes, br in chords:
    music += pad(notes, start, length, vol=0.11, bright=br)

# --- music-box melodies ---------------------------------------------------
mel = []
# scene 1: slow, lonely
for i, n in enumerate(["E5", "C5", "A4", "B4", "C5", "A4", "E4"]):
    mel.append((1.5 + i * 1.2, n, 0.07))
# scene 2: hopeful arpeggio walking
seq2 = ["F4", "A4", "C5", "A4", "G4", "B4", "D5", "B4"]
for i in range(16):
    mel.append((10.2 + i * 0.6, seq2[i % 8], 0.06))
# scene 3: sparse cave plinks (water drops)
for k, tt in enumerate([21.0, 22.7, 24.1, 25.9, 27.2, 28.6]):
    mel.append((tt, ["A5", "F5", "D6", "A5", "E5", "D5"][k], 0.05))
# scene 4: rising run into the spark
for i, n in enumerate(["D4", "F4", "A4", "D5", "F5", "A5"]):
    mel.append((31.0 + i * 0.55, n, 0.05 + i * 0.01))
# spark chime cluster
for i, n in enumerate(["C6", "E6", "G6", "C7", "G5", "E6"]):
    mel.append((34.73 + i * 0.07, n, 0.09))
# scene 5: triumphant theme
theme = ["C5", "E5", "G5", "C6", "B5", "G5", "A5", "F5", "D5", "G5"]
for i, n in enumerate(theme):
    mel.append((40.8 + i * 0.85, n, 0.08))
# scene 6: lullaby
lull = ["A4", "C5", "E5", "C5", "G4", "C5", "E5", "G5", "F5", "E5", "C5"]
for i, n in enumerate(lull):
    mel.append((50.5 + i * 0.8, n, 0.065))
for tt, n, v in mel:
    music += bell(n, tt, vol=v, decay=1.6)

# low "boom" + shimmer at the spark & at the lighthouse ignition
for tt, f0, v in [(34.73, 55.0, 0.35), (45.35, 49.0, 0.3)]:
    i0 = int(tt * SR)
    L = int(SR * 3)
    tt_ = np.arange(L) / SR
    music[i0 : i0 + L] += np.sin(2 * np.pi * f0 * tt_ * (1 - 0.2 * tt_ / 3)) * np.exp(-tt_ * 1.5) * v
shimmer = filtered_noise(5000, 12000, 1.0) * curve([(0, 0), (34.6, 0), (34.8, 0.08), (37.5, 0.0), (45.2, 0), (45.4, 0.05), (48, 0)])
music += shimmer

# --- ambience ---------------------------------------------------------------
waves_lfo = 0.6 + 0.4 * np.sin(2 * np.pi * t / 6.5) ** 2
sea = filtered_noise(80, 900, 1.0) * waves_lfo
sea_level = curve([(0, 0.05), (10, 0.06), (11, 0.13), (19.5, 0.13), (20.5, 0.03), (39.5, 0.02), (40.5, 0.14), (49.5, 0.12), (50.5, 0.035), (60, 0.03)])
wind = filtered_noise(300, 2500, 1.0) * curve([(0, 0.02), (10, 0.03), (20, 0.03), (21, 0.0), (40, 0.0), (41, 0.05), (50, 0.04), (51, 0.0), (60, 0)])
rain = filtered_noise(2000, 9000, 1.0) * curve([(0, 0), (40, 0), (40.5, 0.05), (49.6, 0.05), (50.2, 0), (60, 0)])
cave = filtered_noise(40, 300, 1.0) * curve([(0, 0), (20, 0), (21, 0.05), (34, 0.05), (36, 0.02), (40, 0)])
amb = sea * sea_level + wind + rain + cave

# thunder in scene 5 (matches lightning ~ frame 28 and 252 of scene 5)
for tt, v in [(41.1, 0.25), (48.6, 0.18)]:
    i0 = int(tt * SR)
    L = int(SR * 3.5)
    th = filtered_noise(30, 200, 1.0)[i0 : i0 + L]
    tt_ = np.arange(len(th)) / SR
    amb[i0 : i0 + len(th)] += th * np.exp(-tt_ * 1.2) * np.clip(tt_ / 0.08, 0, 1) * v

mix = music + amb
# master fades
mix *= curve([(0, 0), (0.6, 1), (57.0, 1), (60, 0)])

# stereo: slight decorrelation for width
delay = int(0.011 * SR)
left = mix + 0.15 * np.roll(amb, delay)
right = mix + 0.15 * np.roll(amb, -delay)
st = np.stack([left, right], axis=1)
st /= max(1e-9, np.max(np.abs(st))) / 0.89

out = os.path.join(os.path.dirname(__file__), "..", "public", "soundtrack.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print("wrote", os.path.abspath(out))
