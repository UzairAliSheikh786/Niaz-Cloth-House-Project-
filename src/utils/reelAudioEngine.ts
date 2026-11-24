// Synthesizes a clean, upbeat luxury-editorial electronic groove (112 BPM)
// using the browser Web Audio API so background audio works reliably offline
// and without third-party audio CDN failures.

export class ReelAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private stepTimer: ReturnType<typeof setInterval> | null = null;
  private stepIndex = 0;
  private isPlaying = false;
  private isMuted = false;

  // 112 BPM -> 16th note = 133.9 ms
  private readonly stepMs = 134;

  // Warm luxury Rhodes-style chord progression (Dm9 -> Bbmaj7 -> Gm9 -> A7sus4)
  private readonly chords: number[][] = [
    [293.66, 349.23, 440.0, 523.25],
    [233.08, 293.66, 349.23, 440.0],
    [196.0, 293.66, 349.23, 466.16],
    [220.0, 293.66, 329.63, 392.0],
  ];

  // Pentatonic luxury pluck notes
  private readonly melodyPattern: (number | null)[] = [
    587.33, null, 698.46, 880.0,
    null, 783.99, 698.46, null,
    587.33, null, 659.25, 698.46,
    null, 880.0, 783.99, null,
  ];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.22;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {
        // Browser blocked autoplay before user gesture
      });
    }

    return this.ctx;
  }

  public start(): void {
    if (this.isPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.22, ctx.currentTime, 0.08);
    this.scheduleStep();
    this.stepTimer = setInterval(() => this.scheduleStep(), this.stepMs);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.stepTimer) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.06);
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      if (!muted && this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {});
      }
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.22, this.ctx.currentTime, 0.06);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public dispose(): void {
    this.stop();
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
      this.masterGain = null;
    }
  }

  private scheduleStep(): void {
    if (!this.ctx || !this.masterGain || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const step = this.stepIndex % 16;
    const bar = Math.floor(this.stepIndex / 16) % this.chords.length;

    // 1. Soft four-on-the-floor warm kick on beats 0, 4, 8, 12
    if (step % 4 === 0) {
      this.triggerKick(now);
    }

    // 2. Subtle off-beat boutique shaker hi-hat on steps 2, 6, 10, 14
    if (step % 4 === 2) {
      this.triggerHat(now);
    }

    // 3. Warm pad chord on beat 0 of each bar
    if (step === 0) {
      this.triggerChord(now, this.chords[bar]);
    }

    // 4. Crisp upbeat plucked arpeggio motif
    const note = this.melodyPattern[step];
    if (note) {
      this.triggerPluck(now, note);
    }

    this.stepIndex += 1;
  }

  private triggerKick(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.14);

    gain.gain.setValueAtTime(0.32, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.19);
  }

  private triggerHat(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
  }

  private triggerChord(time: number, freqs: number[]): void {
    if (!this.ctx || !this.masterGain) return;
    freqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(980, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.045, time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 1.95);
    });
  }

  private triggerPluck(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, time);
    filter.frequency.exponentialRampToValueAtTime(750, time + 0.22);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.09, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.26);
  }
}
