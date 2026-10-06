import math
import random
import struct
import wave
import os
import subprocess

SAMPLE_RATE = 44100

def create_wav(filename, samples):
    # Normalize
    max_amp = max(abs(s) for s in samples) if samples else 1.0
    if max_amp == 0:
        max_amp = 1.0
    norm_factor = 0.85 / max_amp  # Leave headroom

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        
        frames = bytearray()
        for s in samples:
            val = int(s * norm_factor * 32767.0)
            val = max(-32768, min(32767, val))
            frames.extend(struct.pack('<h', val))
        wav_file.writeframes(frames)
    print(f"Generated {filename}")

def generate_pop_soft():
    # Warm organic wooden/bubble pop
    # Sine wave rapidly pitching down from 720 Hz to 180 Hz over 60ms with soft transient
    duration = 0.08
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    phase = 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 55.0)
        # Pitch drops exponentially
        freq = 180.0 + 540.0 * math.exp(-t * 90.0)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        # Add subtle harmonic overtone for woody warmth
        s = math.sin(phase) + 0.25 * math.sin(phase * 2.0) * math.exp(-t * 120.0)
        samples.append(s * env)
    return samples

def generate_click():
    # Crisp tactile snap/click
    duration = 0.035
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    phase = 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 160.0)
        freq = 1400.0 + 800.0 * math.exp(-t * 220.0)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 300.0)
        s = (math.sin(phase) * 0.7 + noise * 0.3) * env
        samples.append(s)
    return samples

def generate_highlighter_scratch():
    # Felt-tip highlighter marker friction against paper (~0.45s)
    duration = 0.45
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    # Generate filtered noise with friction modulation
    # State variables for simple 2-pole bandpass filter around 2200 Hz (felt tip squeak)
    f_center = 2400.0
    bw = 900.0
    r = 1.0 - math.pi * (bw / SAMPLE_RATE)
    cos_w = math.cos(2.0 * math.pi * f_center / SAMPLE_RATE)
    y1, y2 = 0.0, 0.0

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Envelope: quick attack 20ms, sustained scratch, taper off
        if t < 0.02:
            env = t / 0.02
        elif t > 0.40:
            env = (0.45 - t) / 0.05
        else:
            env = 1.0
        
        # Micro-variations in friction pressure (simulate hand moving)
        pressure = 0.8 + 0.2 * math.sin(t * 70.0) + 0.1 * math.sin(t * 190.0)
        white = (random.random() * 2.0 - 1.0)
        
        # Bandpass filter
        y = (1.0 - r) * white + 2.0 * r * cos_w * y1 - (r * r) * y2
        y2 = y1
        y1 = y
        
        # Low rumble of paper friction (~350Hz)
        rumble = math.sin(t * 2.0 * math.pi * 380.0) * (random.random() * 0.5 + 0.5) * 0.2
        
        s = (y * 0.75 + rumble * 0.25) * env * pressure
        samples.append(s)
    return samples

def generate_paper_slide():
    # Smooth paper sheet swish / slide (~0.38s)
    duration = 0.38
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    # Resonant frequency slides slightly upwards then down
    y1, y2 = 0.0, 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Bell curve envelope
        env = math.sin(math.pi * (t / duration)) ** 1.8
        
        # Center frequency sweep: 450Hz -> 850Hz -> 380Hz
        sweep = math.sin(math.pi * (t / duration))
        fc = 400.0 + 450.0 * sweep
        bw = 500.0
        r = 1.0 - math.pi * (bw / SAMPLE_RATE)
        cos_w = math.cos(2.0 * math.pi * fc / SAMPLE_RATE)
        
        white = (random.random() * 2.0 - 1.0)
        y = (1.0 - r) * white + 2.0 * r * cos_w * y1 - (r * r) * y2
        y2 = y1
        y1 = y
        
        samples.append(y * env)
    return samples

def generate_woosh_soft():
    # Gentle editorial whoosh (~0.32s)
    duration = 0.32
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    y1, y2 = 0.0, 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * (t / duration)) ** 2.2
        
        # Sweeps from 250Hz up to 1200Hz and down
        sweep = math.sin(math.pi * (t / duration))
        fc = 250.0 + 950.0 * sweep
        bw = 600.0
        r = 1.0 - math.pi * (bw / SAMPLE_RATE)
        cos_w = math.cos(2.0 * math.pi * fc / SAMPLE_RATE)
        
        white = (random.random() * 2.0 - 1.0)
        y = (1.0 - r) * white + 2.0 * r * cos_w * y1 - (r * r) * y2
        y2 = y1
        y1 = y
        
        samples.append(y * env)
    return samples

def generate_camera_shutter():
    # Polaroid/vintage mechanical camera shutter (~0.28s)
    # Two distinct mechanical transients: mirror up at 0ms, click-release at 90ms
    duration = 0.28
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    # 1. First click (Mirror up at 0ms)
    click1_len = int(SAMPLE_RATE * 0.04)
    phase1 = 0.0
    for i in range(click1_len):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 110.0)
        freq = 1800.0 + 900.0 * math.exp(-t * 200.0)
        phase1 += 2.0 * math.pi * freq / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 250.0)
        samples[i] += (math.sin(phase1) * 0.6 + noise * 0.4) * env * 0.85
        
    # 2. Second click (Shutter close at 85ms)
    offset = int(SAMPLE_RATE * 0.085)
    click2_len = int(SAMPLE_RATE * 0.08)
    phase2 = 0.0
    for i in range(click2_len):
        idx = offset + i
        if idx >= num_samples:
            break
        t = i / SAMPLE_RATE
        env = math.exp(-t * 60.0)
        freq = 1100.0 + 600.0 * math.exp(-t * 150.0)
        phase2 += 2.0 * math.pi * freq / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 140.0)
        samples[idx] += (math.sin(phase2) * 0.7 + noise * 0.5) * env

    return samples

def main():
    out_dir = os.path.join(os.getcwd(), "public", "sfx")
    os.makedirs(out_dir, exist_ok=True)
    
    generators = {
        "pop_soft": generate_pop_soft(),
        "click": generate_click(),
        "highlighter_scratch": generate_highlighter_scratch(),
        "paper_slide": generate_paper_slide(),
        "woosh_soft": generate_woosh_soft(),
        "camera_shutter": generate_camera_shutter(),
    }
    
    ffmpeg_bin = os.path.join(os.getcwd(), "node_modules", "@remotion", "compositor-darwin-arm64", "ffmpeg")
    has_ffmpeg = os.path.exists(ffmpeg_bin)
    
    for name, s in generators.items():
        wav_path = os.path.join(out_dir, f"{name}.wav")
        mp3_path = os.path.join(out_dir, f"{name}.mp3")
        create_wav(wav_path, s)
        
        if has_ffmpeg:
            try:
                subprocess.run([
                    ffmpeg_bin, "-y", "-i", wav_path,
                    "-codec:a", "libmp3lame", "-qscale:a", "2",
                    mp3_path
                ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print(f"Converted to {mp3_path}")
            except Exception as e:
                print(f"MP3 conversion error: {e}")

if __name__ == "__main__":
    main()
