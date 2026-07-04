/**
 * Web Audio API Sound Effects Synthesizer
 * Provides cute, playful, tactile feedback for a children's customization game.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMute() {
    return this.isMuted;
  }

  // Play a soft bubble-like "pop" sound when stickers or accessories are placed
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Play a glittering wind-chime/magical sweep when applying glitter or sparks
  playSparkle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      const delay = idx * 0.04;
      const noteTime = now + delay;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.08, noteTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  // Spray-paint hiss sound (white noise with high pass filter)
  private spraySource: AudioBufferSourceNode | null = null;
  private sprayGain: GainNode | null = null;

  startSpray() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.spraySource) return; // already spraying

    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.spraySource = this.ctx.createBufferSource();
    this.spraySource.buffer = buffer;
    this.spraySource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3500, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.sprayGain = this.ctx.createGain();
    this.sprayGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.sprayGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.05);

    this.spraySource.connect(filter);
    filter.connect(this.sprayGain);
    this.sprayGain.connect(this.ctx.destination);

    this.spraySource.start(0);
  }

  stopSpray() {
    if (!this.ctx || !this.spraySource || !this.sprayGain) return;
    const now = this.ctx.currentTime;
    try {
      this.sprayGain.gain.setValueAtTime(this.sprayGain.gain.value, now);
      this.sprayGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      const tempSource = this.spraySource;
      setTimeout(() => {
        try {
          tempSource.stop();
        } catch (e) {}
      }, 100);
    } catch (e) {}
    this.spraySource = null;
    this.sprayGain = null;
  }

  // Paint splash sound (squishy wet sound)
  playSplash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Camera sound when taking a screenshot/photo
  playCameraShutter() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // High frequency click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.12);

    // Brief mechanical metallic friction
    setTimeout(() => {
      if (!this.ctx) return;
      const tNow = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(600, tNow);
      osc2.frequency.exponentialRampToValueAtTime(100, tNow + 0.15);
      gain2.gain.setValueAtTime(0.08, tNow);
      gain2.gain.exponentialRampToValueAtTime(0.001, tNow + 0.18);
      osc2.start(tNow);
      osc2.stop(tNow + 0.2);
    }, 50);
  }

  // Play phone ringing sound for the Play mode
  private ringInterval: any = null;
  startRingtone() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    this.stopRingtone();

    const playRingCycle = () => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;

      // Two rapid beeps
      [0, 0.15].forEach((offset) => {
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx!.destination);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(853, now + offset); // Standard UK/US call tone frequencies combined
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(960, now + offset);

        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + offset + 0.01);
        gain.gain.setValueAtTime(0.06, now + offset + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);

        osc1.start(now + offset);
        osc1.stop(now + offset + 0.16);
        osc2.start(now + offset);
        osc2.stop(now + offset + 0.16);
      });
    };

    playRingCycle();
    this.ringInterval = setInterval(playRingCycle, 1500);
  }

  stopRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  // Synthesize soft piano notes for our app play mode!
  playPianoNote(frequency: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator(); // warm sub-harmonic
    const gain = this.ctx.createGain();

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency / 2, now); // octave lower

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.start(now);
    osc.stop(now + 0.95);
    osc2.start(now);
    osc2.stop(now + 0.95);
  }

  // Play a slide sound when sweeping across menus or opening drawers
  playSlide() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Delete/Trash sound
  playTrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const sounds = new SoundEngine();
