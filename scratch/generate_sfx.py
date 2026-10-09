import math
import random
import struct
import wave
import os
import shutil

SAMPLE_RATE = 44100

def create_wav(filename, samples):
    # Normalize with headroom
    max_amp = max(abs(s) for s in samples) if samples else 1.0
    if max_amp == 0:
        max_amp = 1.0
    norm_factor = 0.88 / max_amp

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

def generate_pop_soft():
    # Warm organic wooden/bubble pop - instant punch at t=0
    duration = 0.075
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    phase = 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Immediate attack, rapid exponential decay
        env = math.exp(-t * 65.0)
        # Pitch drops rapidly from 780 Hz to 160 Hz
        freq = 160.0 + 620.0 * math.exp(-t * 110.0)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        s = math.sin(phase) + 0.3 * math.sin(phase * 2.0) * math.exp(-t * 150.0)
        samples.append(s * env)
    return samples

def generate_click():
    # Crisp tactile snap/click - instant transient at t=0
    duration = 0.030
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    phase = 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 220.0)
        freq = 1600.0 + 900.0 * math.exp(-t * 300.0)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 400.0)
        s = (math.sin(phase) * 0.75 + noise * 0.35) * env
        samples.append(s)
    return samples

def generate_highlighter_scratch():
    # Felt-tip highlighter marker friction:
    # Immediate contact bite at t=0 (instant paper friction), then steady stroke decay
    duration = 0.38
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    f_center = 2600.0
    bw = 1100.0
    r = 1.0 - math.pi * (bw / SAMPLE_RATE)
    cos_w = math.cos(2.0 * math.pi * f_center / SAMPLE_RATE)
    y1, y2 = 0.0, 0.0

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Immediate fast 4ms attack, front-loaded initial squeak/bite
        if t < 0.004:
            env = t / 0.004
        else:
            # Front-loaded taper: loudest at the start of the highlight
            env = 0.7 + 0.3 * math.exp(-t * 22.0)
        
        # Soft end fade
        if t > 0.32:
            env *= max(0.0, (0.38 - t) / 0.06)
        
        white = (random.random() * 2.0 - 1.0)
        y = (1.0 - r) * white + 2.0 * r * cos_w * y1 - (r * r) * y2
        y2 = y1
        y1 = y
        
        # Initial felt marker bite transient
        initial_bite = math.sin(2.0 * math.pi * 3200.0 * t) * math.exp(-t * 180.0) * 0.4
        
        # Paper fiber rumble
        rumble = math.sin(t * 2.0 * math.pi * 440.0) * (random.random() * 0.5 + 0.5) * 0.2
        s = (y * 0.75 + initial_bite + rumble * 0.25) * env
        samples.append(s)
    return samples

def generate_paper_slide():
    # Instant paper slide:
    # Initial friction attack hits within 15ms (less than 1 frame!), then smooth whoosh decay
    duration = 0.32
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    y1, y2 = 0.0, 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Front-loaded envelope: rapid 15ms attack, then smooth exponential tail
        if t < 0.015:
            env = t / 0.015
        else:
            env = math.exp(-(t - 0.015) * 11.0)
        
        # Frequency starts high (initial paper scrape 900Hz) and sweeps to warm body (420Hz)
        fc = 420.0 + 520.0 * math.exp(-t * 16.0)
        bw = 550.0
        r = 1.0 - math.pi * (bw / SAMPLE_RATE)
        cos_w = math.cos(2.0 * math.pi * fc / SAMPLE_RATE)
        
        white = (random.random() * 2.0 - 1.0)
        y = (1.0 - r) * white + 2.0 * r * cos_w * y1 - (r * r) * y2
        y2 = y1
        y1 = y
        
        samples.append(y * env)
    return samples

def generate_woosh_soft():
    # Quick, crisp editorial whoosh:
    # Rapid 18ms attack peaking early, followed by resonant aerodynamic tail
    duration = 0.28
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    y1, y2 = 0.0, 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Front-loaded curve: peaks at ~20ms
        if t < 0.020:
            env = t / 0.020
        else:
            env = math.exp(-(t - 0.020) * 13.0)
        
        fc = 350.0 + 850.0 * math.exp(-t * 14.0)
        bw = 650.0
        r = 1.0 - math.pi * (bw / SAMPLE_RATE)
        cos_w = math.cos(2.0 * math.pi * fc / SAMPLE_RATE)
        
        white = (random.random() * 2.0 - 1.0)
        y = (1.0 - r) * white + 2.0 * r * cos_w * y1 - (r * r) * y2
        y2 = y1
        y1 = y
        
        samples.append(y * env)
    return samples

def generate_camera_shutter():
    # Polaroid camera shutter:
    # First click (mirror up) is IMMEDIATE at t=0ms with sharp transient!
    # Second click (shutter close) at 65ms.
    duration = 0.22
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    # Click 1: Immediate punch at t=0ms
    click1_len = int(SAMPLE_RATE * 0.035)
    phase1 = 0.0
    for i in range(click1_len):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 180.0)
        freq = 2100.0 + 800.0 * math.exp(-t * 260.0)
        phase1 += 2.0 * math.pi * freq / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 300.0)
        samples[i] += (math.sin(phase1) * 0.7 + noise * 0.45) * env
        
    # Click 2: Release at 65ms
    offset = int(SAMPLE_RATE * 0.065)
    click2_len = int(SAMPLE_RATE * 0.06)
    phase2 = 0.0
    for i in range(click2_len):
        idx = offset + i
        if idx >= num_samples:
            break
        t = i / SAMPLE_RATE
        env = math.exp(-t * 90.0)
        freq = 1300.0 + 500.0 * math.exp(-t * 180.0)
        phase2 += 2.0 * math.pi * freq / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 200.0)
        samples[idx] += (math.sin(phase2) * 0.65 + noise * 0.4) * env * 0.85

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
    
    for name, s in generators.items():
        wav_path = os.path.join(out_dir, f"{name}.wav")
        mp3_path = os.path.join(out_dir, f"{name}.mp3")
        create_wav(wav_path, s)
        shutil.copyfile(wav_path, mp3_path)
        print(f"Generated instant-attack {name} (.wav & .mp3)")

if __name__ == "__main__":
    main()
