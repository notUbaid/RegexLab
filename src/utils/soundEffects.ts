// Sound synthesizer for RegexLab
// Generates keyboard switch clicks and UI sounds with the Web Audio API
// No audio files needed!

export type SoundProfile = 'thock' | 'clicky' | 'tactile' | 'buckling' | 'cyber';

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

class SoundSynthesizer {
  private audioContext: AudioContext | null = null;
  private isAudioEnabled: boolean = true;
  private currentProfile: SoundProfile = 'thock';
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    try {
      const savedEnabled = localStorage.getItem('regexlab_sound');
      if (savedEnabled !== null) {
        this.isAudioEnabled = savedEnabled !== 'false';
      }
      const savedProfile = localStorage.getItem('regexlab_sound_profile') as SoundProfile;
      if (savedProfile) {
        this.currentProfile = savedProfile;
      }
    } catch {
      // ignore
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isAudioEnabled = enabled;
    try {
      localStorage.setItem('regexlab_sound', String(enabled));
    } catch {
      // ignore
    }
    if (enabled) {
      this.initContext();
    }
  }

  public isEnabled(): boolean {
    return this.isAudioEnabled;
  }

  public setProfile(profile: SoundProfile): void {
    this.currentProfile = profile;
    try {
      localStorage.setItem('regexlab_sound_profile', profile);
    } catch {
      // ignore
    }
    // Play a preview sound of the selected profile
    this.playKeypress();
  }

  public getProfile(): SoundProfile {
    return this.currentProfile;
  }

  private initContext(): AudioContext | null {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        const win = window as WindowWithWebkitAudio;
        const CtxClass = window.AudioContext || win.webkitAudioContext;
        if (CtxClass) {
          this.audioContext = new CtxClass();
          this.generateNoiseBuffer();
        }
      } catch {
        this.audioContext = null;
      }
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    return this.audioContext;
  }

  /** Precomputes 1 second of calibrated white/pink noise for switch ping acoustics */
  private generateNoiseBuffer(): void {
    if (!this.audioContext) return;
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = sampleRate; // 1 second
    this.noiseBuffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  private triggerHaptic(durationMs = 12): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(durationMs);
      } catch {
        // ignore
      }
    }
  }

  // ==========================================================================
  // MECHANICAL SWITCH ACOUSTICS
  // ==========================================================================

  /**
   * Main tactile keypress dispatcher based on active sound profile.
   */
  public playKeypress(): void {
    if (!this.isAudioEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(8);

    switch (this.currentProfile) {
      case 'thock':
        this.synthesizeThock(ctx);
        break;
      case 'clicky':
        this.synthesizeClicky(ctx);
        break;
      case 'tactile':
        this.synthesizeTactile(ctx);
        break;
      case 'buckling':
        this.synthesizeBuckling(ctx);
        break;
      case 'cyber':
        this.synthesizeCyber(ctx);
        break;
    }
  }

  /**
   * Lubed Linear / Gateron Ink Black "THOCK"
   * Combines high-pass stem snap with low-frequency resonant bottom-out thud.
   */
  private synthesizeThock(ctx: AudioContext): void {
    const now = ctx.currentTime;

    // 1. Bottom-out low-frequency thump (140Hz -> 50Hz)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    // Slight randomized pitch for realistic variation
    const pitch = 135 + Math.random() * 15;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.045);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);

    // 2. High-frequency switch housing click (noise burst)
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 200, now);
      filter.Q.setValueAtTime(4, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.018);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.018);
    }
  }

  /**
   * Cherry MX Blue / Kailh Box White "CLICKY"
   * Sharp tactile click-leaf snap followed by bottom-out impact.
   */
  private synthesizeClicky(ctx: AudioContext): void {
    const now = ctx.currentTime;

    // Click leaf metallic snap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 2200 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.015);

    // Secondary bottom-out click
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(320, now + 0.008);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 0.035);

    gain2.gain.setValueAtTime(0.05, now + 0.008);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.008);
    osc2.stop(now + 0.035);
  }

  /**
   * Holy Panda "TACTILE"
   * Distinct dual-stage bump followed by round bottom-out pop.
   */
  private synthesizeTactile(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.03);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * IBM Model M "BUCKLING SPRING"
   * Metallic high coil ping with harmonic resonance.
   */
  private synthesizeBuckling(ctx: AudioContext): void {
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(1650, now);
    osc2.frequency.setValueAtTime(3300, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.06);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.06);
    osc2.stop(now + 0.06);
  }

  /**
   * Retro Sci-Fi / Cyber Terminal
   * Pure FM pulse with instant drop.
   */
  private synthesizeCyber(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.02);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  // ==========================================================================
  // UI INTERACTION SOUNDS (LATCHES, SLIDERS, TABS, ACTIONS)
  // ==========================================================================

  /**
   * Heavy mechanical toggle latch (for flag pills and drawer toggles)
   */
  public playSwitch(state: boolean = true): void {
    if (!this.isAudioEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(10);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = state ? 520 : 680;
    const endFreq = state ? 880 : 380;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.025);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * Magnetic latch click (drawer open/close, inspector expand/minimize)
   */
  public playLatch(): void {
    if (!this.isAudioEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(14);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.035);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Smooth pneumatic slide tick (tab switching across inspector or match tables)
   */
  public playTab(): void {
    if (!this.isAudioEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(6);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.02);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * Metallic double-click for 1-click Copy actions and Share URL
   */
  public playCopy(): void {
    if (!this.isAudioEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(12);
    const now = ctx.currentTime;

    // First click
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(840, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.015);
    gain1.gain.setValueAtTime(0.05, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.015);

    // Second click (20ms later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, now + 0.025);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.045);
    gain2.gain.setValueAtTime(0.06, now + 0.025);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.025);
    osc2.stop(now + 0.045);
  }

  /**
   * Precise stepper motor tick for stepping through NFA debugger
   */
  public playStepTick(): void {
    if (!this.isAudioEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(8);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.012);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.012);
  }

  /**
   * Polyphonic pentatonic triumph chord (C5 - E5 - G5 - B5 - D6) with warm envelope
   */
  public playSuccess(): void {
    if (!this.isAudioEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(20);
    const now = ctx.currentTime;
    // Frequencies: C5, E5, G5, B5, D6
    const chordNotes = [523.25, 659.25, 783.99, 987.77, 1174.66];

    chordNotes.forEach((freq, idx) => {
      const startTime = now + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  /**
   * Low resonant hollow wooden knock for invalid regex or backtrack alerts
   */
  public playWarning(): void {
    if (!this.isAudioEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(18);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.12);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Ultra-light glass plink for hovering over capture groups or token nodes
   */
  public playHoverPlink(pitchMult: number = 1.0): void {
    if (!this.isAudioEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400 * pitchMult, now);
    osc.frequency.exponentialRampToValueAtTime(1100 * pitchMult, now + 0.012);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.012);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.012);
  }

  // Alias for backward compatibility
  public playClick(): void {
    this.playKeypress();
  }
}

export const soundFX = new SoundSynthesizer();
