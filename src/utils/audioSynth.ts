/**
 * CalmCore Web Audio Synthesizer
 * Zero-asset, zero-latency grounding sound engine providing:
 * - Tibetan singing bowl / soft chime tone for breathing guidance
 * - Subtle grounding pink/brown noise harmonic drone
 * - Gentle tap feedback
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private isDronePlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isDronePlaying) {
      this.stopDrone();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play a peaceful Tibetan singing bowl chime with harmonic overtone
   */
  public playBowlChime(freq: number = 432, duration: number = 2.5) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Fundamental oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Harmonic overtone for natural singing bowl resonance
      const overtone = this.ctx.createOscillator();
      const overtoneGain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      overtone.type = "sine";
      overtone.frequency.setValueAtTime(freq * 2.76, now); // Harmonic ratio of singing bowl

      // Soft envelope (Gentle attack, slow exponential release)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      overtoneGain.gain.setValueAtTime(0.0001, now);
      overtoneGain.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

      osc.connect(gain);
      overtone.connect(overtoneGain);
      gain.connect(this.ctx.destination);
      overtoneGain.connect(this.ctx.destination);

      osc.start(now);
      overtone.start(now);

      osc.stop(now + duration + 0.1);
      overtone.stop(now + duration + 0.1);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  /**
   * Play a soft, reassuring breath phase cue
   */
  public playBreathCue(phase: "inhale" | "hold" | "exhale" | "hold_empty") {
    if (this.isMuted) return;
    switch (phase) {
      case "inhale":
        // Rising warm tone (432Hz -> 528Hz Solfeggio frequency)
        this.playRisingTone(432, 528, 1.2);
        break;
      case "hold":
        // Soft single sustaining chime (528Hz)
        this.playBowlChime(528, 1.5);
        break;
      case "exhale":
        // Descending relaxing tone (528Hz -> 396Hz Grounding frequency)
        this.playFallingTone(528, 396, 1.8);
        break;
      case "hold_empty":
        this.playBowlChime(396, 1.2);
        break;
    }
  }

  private playRisingTone(startFreq: number, endFreq: number, duration: number) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.9);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      // Ignore audio restriction
    }
  }

  private playFallingTone(startFreq: number, endFreq: number, duration: number) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.9);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      // Ignore audio restriction
    }
  }

  /**
   * Tactile subtle tap click
   */
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  /**
   * Toggle background soothing binaural theta drone (136.1Hz Om / 140Hz)
   */
  public toggleDrone(): boolean {
    if (this.isDronePlaying) {
      this.stopDrone();
      return false;
    } else {
      this.startDrone();
      return true;
    }
  }

  public startDrone() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Two slightly detuned oscillators for gentle binaural beat (4Hz theta wave)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();

      this.droneOsc1.type = "sine";
      this.droneOsc1.frequency.setValueAtTime(136.1, now); // Earth Om frequency

      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(140.1, now); // +4Hz Theta relaxation beat

      this.droneGain.gain.setValueAtTime(0.0001, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.05, now + 2.0); // Gentle swell

      this.droneOsc1.connect(this.droneGain);
      this.droneOsc2.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
      this.isDronePlaying = true;
    } catch {
      // Ignore
    }
  }

  public stopDrone() {
    try {
      if (this.droneGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        setTimeout(() => {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.droneGain?.disconnect();
          this.droneOsc1 = null;
          this.droneOsc2 = null;
          this.droneGain = null;
        }, 1100);
      }
      this.isDronePlaying = false;
    } catch {
      // Ignore
    }
  }

  public isDroneActive(): boolean {
    return this.isDronePlaying;
  }
}

export const sound = new AudioSynthesizer();
