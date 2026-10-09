import math
import random
import struct
import wave
import os
import shutil

SAMPLE_RATE = 44100

def create_wav(filename, samples, target_peak_db=-2.0):
    max_amp = max(abs(s) for s in samples) if samples else 1.0
    if max_amp == 0:
        max_amp = 1.0
    
    # Target peak amplitude (e.g. -2 dBFS = ~0.794)
    target_amp = 10.0 ** (target_peak_db / 20.0)
    norm_factor = target_amp / max_amp

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

# Helper: simple 2-pole resonant bandpass filter
class Bandpass:
    def __init__(self, fc, q):
        self.w0 = 2.0 * math.pi * fc / SAMPLE_RATE
        self.alpha = math.sin(self.w0) / (2.0 * q)
        self.b0 = self.alpha
        self.b1 = 0.0
        self.b2 = -self.alpha
        self.a0 = 1.0 + self.alpha
        self.a1 = -2.0 * math.cos(self.w0)
        self.a2 = 1.0 - self.alpha
        self.x1 = 0.0
        self.x2 = 0.0
        self.y1 = 0.0
        self.y2 = 0.0

    def process(self, x):
        y = (self.b0 * x + self.b1 * self.x1 + self.b2 * self.x2 - self.a1 * self.y1 - self.a2 * self.y2) / self.a0
        self.x2 = self.x1
        self.x1 = x
        self.y2 = self.y1
        self.y1 = y
        return y

# Helper: 1st-order lowpass filter
class Lowpass:
    def __init__(self, fc):
        dt = 1.0 / SAMPLE_RATE
        rc = 1.0 / (2.0 * math.pi * fc)
        self.alpha = dt / (rc + dt)
        self.y = 0.0

    def process(self, x):
        self.y = self.y + self.alpha * (x - self.y)
        return self.y

def generate_organic_pop():
    """
    Warm organic tactile tap (card/badge drop on paper/desk).
    NO cartoon sine frequency glides!
    Uses dual damped physical resonances (210 Hz body, 420 Hz wood/paper slap).
    """
    duration = 0.09
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    bp_low = Bandpass(210.0, 3.5)
    bp_mid = Bandpass(440.0, 4.0)
    lp = Lowpass(800.0)
    
    random.seed(42)
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Initial sharp tactile click (first 2ms)
        impulse = (random.random() * 2.0 - 1.0) * math.exp(-t * 2200.0)
        # Fast thud energy
        thud_noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 85.0)
        
        # Resonances
        low_res = bp_low.process(impulse * 2.0 + thud_noise) * math.exp(-t * 55.0)
        mid_res = bp_mid.process(impulse) * math.exp(-t * 90.0)
        body = lp.process(low_res * 1.5 + mid_res * 0.8)
        
        # Soft warmth sine for subtle low punch
        low_punch = math.sin(2.0 * math.pi * 175.0 * t) * math.exp(-t * 60.0) * 0.35
        
        s = impulse * 0.4 + body * 0.8 + low_punch
        samples.append(s)
    return samples

def generate_organic_click():
    """
    Crisp tactile precision click (matte switch / quality pen toggle).
    Fast, dry, clean, zero cartoon tone.
    """
    duration = 0.035
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    bp = Bandpass(1650.0, 2.2)
    bp_high = Bandpass(3200.0, 3.0)
    
    random.seed(101)
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Double micro-snap (t=0ms latch, t=3ms contact)
        snap1 = math.exp(-t * 1800.0) * (random.random() * 2.0 - 1.0)
        t2 = max(0.0, t - 0.0035)
        snap2 = math.exp(-t2 * 1200.0) * (random.random() * 2.0 - 1.0) * (1.0 if t >= 0.0035 else 0.0)
        
        sig = snap1 + snap2 * 0.7
        body = bp.process(sig)
        high = bp_high.process(sig) * 0.4
        s = (sig * 0.35 + body * 0.7 + high * 0.3) * math.exp(-t * 140.0)
        samples.append(s)
    return samples

def generate_organic_paper_slide():
    """
    Realistic paper sheet sliding over archival paper.
    Features textured fiber friction, granular micro-chatter, warm aerodynamic body.
    """
    duration = 0.35
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    bp_body = Bandpass(460.0, 1.8)
    bp_grain = Bandpass(1350.0, 2.5)
    bp_air = Bandpass(2400.0, 2.0)
    lp = Lowpass(2800.0)
    
    random.seed(333)
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Fast 18ms attack, natural decay
        if t < 0.018:
            env = (t / 0.018) ** 0.8
        else:
            env = math.exp(-(t - 0.018) * 9.5)
        
        # Granular fiber friction modulation (chatter at ~75 Hz)
        friction_mod = 0.75 + 0.25 * math.sin(2.0 * math.pi * 72.0 * t + random.random() * 0.5)
        
        white = (random.random() * 2.0 - 1.0) * friction_mod
        
        body = bp_body.process(white) * 1.2
        grain = bp_grain.process(white) * 0.85
        air = bp_air.process(white) * 0.45
        
        s = lp.process(body + grain + air) * env
        samples.append(s)
    return samples

def generate_organic_woosh_soft():
    """
    Smooth, deep, velvet-like air whoosh for documentary scene transitions.
    No harsh digital noise; warm and aerodynamic.
    """
    duration = 0.30
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    lp = Lowpass(1100.0)
    random.seed(555)
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Smooth fast 22ms rise, soft exponential decay
        if t < 0.022:
            env = (t / 0.022) ** 0.85
        else:
            env = math.exp(-(t - 0.022) * 10.5)
        
        white = random.random() * 2.0 - 1.0
        # Deep body resonance sweeping 280 Hz to 450 Hz then down
        fc = 260.0 + 320.0 * math.sin(math.pi * min(1.0, t / 0.25))
        w0 = 2.0 * math.pi * fc / SAMPLE_RATE
        s_tone = math.sin(w0 * i) * 0.25 * env
        
        filtered_air = lp.process(white) * 0.75 * env
        s = filtered_air + s_tone
        samples.append(s)
    return samples

def generate_organic_highlighter():
    """
    Authentic felt-tip highlighter marker dragging on porous matte paper.
    Features subtle felt tip squeak (2100 Hz), textured dragging friction,
    and warm paper body (520 Hz).
    """
    duration = 0.36
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    bp_felt = Bandpass(2150.0, 3.2)
    bp_paper = Bandpass(580.0, 2.0)
    lp = Lowpass(3200.0)
    
    random.seed(777)
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Instant bite (8ms) with front-loaded energy, steady drag, tapered release
        if t < 0.012:
            env = (t / 0.012)
        elif t < 0.28:
            env = (0.75 + 0.05 * math.sin(2.0 * math.pi * 35.0 * t)) * math.exp(-t * 2.8)
        else:
            env = max(0.0, (0.36 - t) / 0.08) * 0.45
        
        # Paper surface micro-stutter
        stutter = 0.8 + 0.2 * math.sin(2.0 * math.pi * 88.0 * t + random.random() * 0.4)
        noise = (random.random() * 2.0 - 1.0) * stutter
        
        felt_drag = bp_felt.process(noise) * 0.7
        paper_res = bp_paper.process(noise) * 0.75
        
        # Immediate felt bite at initial contact (frame 0)
        initial_bite = math.sin(2.0 * math.pi * 2200.0 * t) * math.exp(-t * 100.0) * 1.2
        
        s = lp.process(felt_drag + paper_res + initial_bite) * env
        samples.append(s)
    return samples

def generate_organic_camera_shutter():
    """
    Vintage mechanical SLR camera shutter.
    Dual tactile mechanical clicks (mirror flip-up at t=0, shutter curtain close at t=55ms).
    Rich metallic/wooden mechanical texture, NOT an electronic chirp.
    """
    duration = 0.20
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    bp_mech1 = Bandpass(1400.0, 2.8)
    bp_mech2 = Bandpass(850.0, 2.2)
    lp = Lowpass(2600.0)
    
    random.seed(999)
    # Click 1: Mirror flip-up (t=0)
    for i in range(int(SAMPLE_RATE * 0.04)):
        t = i / SAMPLE_RATE
        impulse = (random.random() * 2.0 - 1.0) * math.exp(-t * 320.0)
        mech = bp_mech1.process(impulse) * 1.1 + bp_mech2.process(impulse) * 0.6
        samples[i] += lp.process(mech + impulse * 0.3)
        
    # Click 2: Curtain closure (t=0.052s)
    offset = int(SAMPLE_RATE * 0.052)
    curtain_samples = int(SAMPLE_RATE * 0.065)
    for i in range(curtain_samples):
        idx = offset + i
        if idx >= num_samples:
            break
        t = i / SAMPLE_RATE
        impulse = (random.random() * 2.0 - 1.0) * math.exp(-t * 240.0)
        mech = bp_mech2.process(impulse) * 1.3 + bp_mech1.process(impulse) * 0.5
        samples[idx] += lp.process(mech + impulse * 0.25) * 0.85
        
    return samples

def main():
    out_dir = os.path.join(os.getcwd(), "public", "sfx")
    os.makedirs(out_dir, exist_ok=True)
    
    generators = {
        "pop_soft": generate_organic_pop(),
        "click": generate_organic_click(),
        "paper_slide": generate_organic_paper_slide(),
        "woosh_soft": generate_organic_woosh_soft(),
        "highlighter_scratch": generate_organic_highlighter(),
        "camera_shutter": generate_organic_camera_shutter(),
    }
    
    for name, s in generators.items():
        wav_path = os.path.join(out_dir, f"{name}.wav")
        mp3_path = os.path.join(out_dir, f"{name}.mp3")
        create_wav(wav_path, s, target_peak_db=-3.0)
        shutil.copyfile(wav_path, mp3_path)
        print(f"Generated organic foley: {name}")

if __name__ == "__main__":
    main()
