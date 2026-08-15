#!/usr/bin/env python3
"""
detect-beats.py — extract the beat grid of a soundtrack for Remotion.

    python3 scripts/detect-beats.py promo/public/soundtrack.mp3 --fps 30 \
        --out promo/src/beats.json

Emits BPM plus beat/kick/snare timestamps (seconds AND frames). The promo
composition uses it to land each zoom punch on a beat.

Onset classification follows the approach in the MIT-licensed
`saas-product-demo-video` skill (github.com/noamdorr): split onsets by
spectral centroid — low centroid = kick, high = snare.

Requires: pip install --break-system-packages librosa numpy soundfile
"""
import argparse
import json
import sys

try:
    import librosa
    import numpy as np
except ImportError:
    sys.exit(
        "librosa/numpy missing — pip install --break-system-packages librosa numpy soundfile"
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    y, sr = librosa.load(args.audio, sr=None, mono=True)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)

    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, backtrack=True)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    hop = 512
    onset_centroids = []
    for f in onset_frames:
        idx = min(librosa.frames_to_samples([f])[0] // hop, len(centroid) - 1)
        onset_centroids.append(float(centroid[idx]))

    kicks, snares = [], []
    if onset_centroids:
        median = float(np.median(onset_centroids))
        for t, c in zip(onset_times, onset_centroids):
            (kicks if c < median else snares).append(round(float(t), 4))

    def frames(times):
        return [int(round(t * args.fps)) for t in times]

    bpm = float(np.atleast_1d(tempo)[0])
    data = {
        "audio": args.audio,
        "fps": args.fps,
        "bpm": round(bpm, 2),
        "beats": [round(float(t), 4) for t in beat_times],
        "beatFrames": frames(beat_times),
        "kicks": kicks,
        "snares": snares,
    }
    with open(args.out, "w") as fh:
        json.dump(data, fh, indent=1)
    print(
        f"bpm {data['bpm']} · {len(data['beats'])} beats · "
        f"{len(kicks)} kicks · {len(snares)} snares -> {args.out}"
    )


if __name__ == "__main__":
    main()
