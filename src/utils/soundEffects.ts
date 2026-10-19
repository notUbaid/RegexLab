/**
 * ============================================================================
 * RegexLab - Web Audio API Sound Synthesizer
 * ============================================================================
 * 
 * Welcome! To give RegexLab a tactile, luxury physical feedback feel (similar
 * to high-end mechanical keyboards or Linear/Raycast app interactions),
 * this module synthesizes audio directly in code!
 * 
 * ZERO AUDIO FILES DOWNLOADED:
 * Many web apps load large .mp3 or .wav files over the network, which causes
 * lag and consumes bandwidth. Instead, we use the browser's built-in
 * `AudioContext` to generate pure electronic sound waves (sine, triangle, sawtooth)
 * in real-time with microsecond precision!
 * 
 * AUDIO NODES USED:
 * 1. `OscillatorNode`: Generates the sound wave at a given pitch/frequency (Hz).
 * 2. `GainNode`: Controls the volume (gain) and creates smooth fade-outs (envelopes).
 * 3. `ctx.destination`: The user's speakers or headphones.
 */

// Window type interface supporting legacy WebKit audio contexts
interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * Synthesizer class handling real-time procedural audio generation.
 */
class SoundSynthesizer {
  /** The browser's master Web Audio context */
  private audioContext: AudioContext | null = null;

  /** Global toggle: sound is disabled by default to respect user privacy */
  private isAudioEnabled: boolean = false;

  /**
   * Enables or disables sound effects.
   * 
   * @param enabled - True to play sounds, false to mute
   */
  public setEnabled(enabled: boolean): void {
    this.isAudioEnabled = enabled;

    // Lazily instantiate the AudioContext upon user gesture
    if (enabled && !this.audioContext) {
      this.initializeAudioContext();
    }
  }

  /**
   * Returns whether sound effects are currently turned on.
   */
  public isEnabled(): boolean {
    return this.isAudioEnabled;
  }

  /**
   * Initializes and resumes the AudioContext safely.
   */
  private initializeAudioContext(): void {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        const windowWithAudio = window as WindowWithWebkitAudio;
        const AudioContextClass = window.AudioContext || windowWithAudio.webkitAudioContext;

        if (AudioContextClass) {
          this.audioContext = new AudioContextClass();
        }
      } catch {
        this.audioContext = null;
      }
    }

    // Browsers suspend audio contexts until the user interacts with the page
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {
        // Silently catch autoplay restriction errors
      });
    }
  }

  /**
   * Plays a subtle mechanical keystroke click.
   * Useful when typing regex or clicking quick-insert buttons.
   * 
   * @param pitchFrequencyHz - Pitch of the click in Hertz (default: 600Hz)
   */
  public playClick(pitchFrequencyHz: number = 600): void {
    if (!this.isAudioEnabled) return;
    this.initializeAudioContext();
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const volumeControl = this.audioContext.createGain();

      // Sine wave gives a soft, modern woodblock/mechanical click
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(pitchFrequencyHz, now);
      // Rapid pitch drop simulates a physical switch contact
      oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.04);

      // Volume envelope: quick attack, fast exponential decay
      volumeControl.gain.setValueAtTime(0.04, now);
      volumeControl.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      // Connect: Oscillator -> Volume -> Speakers
      oscillator.connect(volumeControl);
      volumeControl.connect(this.audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.04);
    } catch {
      // Audio playback errors are non-critical and fail gracefully
    }
  }

  /**
   * Plays a higher-pitched tactile tick when the engine visualizer steps forward.
   */
  public playStepTick(): void {
    this.playClick(850);
  }

  /**
   * Plays a harmonic 4-tone chord arpeggio (C5 - E5 - G5 - C6) when a pattern matches
   * or a learning challenge is successfully solved.
   */
  public playSuccess(): void {
    if (!this.isAudioEnabled) return;
    this.initializeAudioContext();
    if (!this.audioContext) return;

    try {
      const startTime = this.audioContext.currentTime;
      // Frequencies corresponding to musical notes C5, E5, G5, and C6
      const musicalChimeNotes = [523.25, 659.25, 783.99, 1046.5];

      musicalChimeNotes.forEach((frequencyHz, noteIndex) => {
        const noteStartTime = startTime + noteIndex * 0.08;
        const oscillator = this.audioContext!.createOscillator();
        const volumeControl = this.audioContext!.createGain();

        // Triangle wave provides a warm, bell-like timbre
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequencyHz, noteStartTime);

        // Volume envelope: smooth fade-in, gentle bell decay
        volumeControl.gain.setValueAtTime(0, noteStartTime);
        volumeControl.gain.linearRampToValueAtTime(0.06, noteStartTime + 0.02);
        volumeControl.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 0.4);

        oscillator.connect(volumeControl);
        volumeControl.connect(this.audioContext!.destination);

        oscillator.start(noteStartTime);
        oscillator.stop(noteStartTime + 0.4);
      });
    } catch {
      // Fail gracefully
    }
  }

  /**
   * Plays a low-frequency alert hum when catastrophic backtracking or ReDoS risk is detected.
   */
  public playWarning(): void {
    if (!this.isAudioEnabled) return;
    this.initializeAudioContext();
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const volumeControl = this.audioContext.createGain();

      // Sawtooth wave provides a rich, buzzy warning timbre
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(160, now);
      oscillator.frequency.linearRampToValueAtTime(110, now + 0.15);

      // Volume envelope
      volumeControl.gain.setValueAtTime(0.05, now);
      volumeControl.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      oscillator.connect(volumeControl);
      volumeControl.connect(this.audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch {
      // Fail gracefully
    }
  }
}

/** Export a singleton instance for use across all components */
export const soundFX = new SoundSynthesizer();
