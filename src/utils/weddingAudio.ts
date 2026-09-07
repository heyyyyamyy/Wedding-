/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API based traditional Indian Wedding Bansuri (Flute) & Tanpura Synthesizer
// Generates a calming, auspicious, romantic Raag Yaman / Bhupali melody
// Zero buffering, 100% reliable across all browsers, authentic acoustic warmth.

class WeddingSoundscape {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private droneOscs: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];

  // Frequencies for auspicious wedding Raag Yaman (Key of D)
  // D4 (Sa), E4 (Re), F#4 (Ga), G#4 (Tivra Ma), A4 (Pa), B4 (Dha), C#5 (Ni), D5 (Tar Sa)
  private readonly notes = [
    293.66, // D4 (Sa)
    329.63, // E4 (Re)
    369.99, // F#4 (Ga)
    415.30, // G#4 (Tivra Ma)
    440.00, // A4 (Pa)
    493.88, // B4 (Dha)
    554.37, // C#5 (Ni)
    587.33, // D5 (Tar Sa)
    659.25, // E5
    739.99, // F#5
  ];

  // Auspicious melodic phrases (Raga Yaman classical phrasing for weddings)
  private readonly phrases = [
    [0, 1, 2, 4, 3, 2, 1, 0],
    [2, 3, 4, 6, 7, 6, 4, 2],
    [4, 6, 7, 8, 7, 6, 4],
    [7, 6, 4, 2, 3, 2, 1, 0],
    [0, 2, 4, 6, 7, 9, 8, 7],
    [6, 4, 3, 2, 1, 0],
  ];

  private currentPhrase = 0;
  private noteIndex = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start(volume: number = 0.4) {
    this.initContext();
    if (!this.ctx) return;

    this.stop();
    this.isRunning = true;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.5);
    this.masterGain.connect(this.ctx.destination);

    // Start soothing warm Tanpura Drone (Sa & Pa)
    this.startDrone();

    // Start flute melody sequencer
    this.scheduleNextNote();
  }

  private startDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Low D2 (Sa) - 73.42 Hz, A2 (Pa) - 110.00 Hz, D3 (Sa) - 146.83 Hz
    const droneFreqs = [73.42, 110.00, 146.83, 220.00];

    droneFreqs.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.4, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);

      const targetGain = 0.05 / (i + 1);
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.droneOscs.push(osc);
      this.droneGains.push(gain);
    });
  }

  private playFluteNote(freq: number, duration: number) {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Soft, breathy flute tone with subtle overtones
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Warm vibrato
    vibrato.frequency.setValueAtTime(5.2, now); // ~5 Hz natural human breath vibrato
    vibratoGain.gain.setValueAtTime(2.5, now);
    vibrato.connect(osc.frequency);
    vibrato.start(now);
    vibrato.stop(now + duration + 0.5);

    // Lowpass filter for round, organic acoustic flute warmth
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, now);
    filter.Q.setValueAtTime(1.5, now);

    // Envelope: Gentle swelling attack, sustained warmth, smooth release
    const attack = 0.18;
    const release = 0.35;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + attack);
    gain.gain.setValueAtTime(0.18, now + duration - release);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration + release);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + release + 0.1);

    // Occasional delicate sitar / santoor pluck accent
    if (Math.random() > 0.6) {
      this.playSitarPluck(freq * 2, now + 0.05);
    }
  }

  private playSitarPluck(freq: number, startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    const pluck = this.ctx.createOscillator();
    const pluckGain = this.ctx.createGain();
    const pluckFilter = this.ctx.createBiquadFilter();

    pluck.type = 'triangle';
    pluck.frequency.setValueAtTime(freq, startTime);

    pluckFilter.type = 'bandpass';
    pluckFilter.frequency.setValueAtTime(freq * 1.5, startTime);
    pluckFilter.Q.setValueAtTime(2.0, startTime);

    pluckGain.gain.setValueAtTime(0.06, startTime);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

    pluck.connect(pluckFilter);
    pluckFilter.connect(pluckGain);
    pluckGain.connect(this.masterGain);

    pluck.start(startTime);
    pluck.stop(startTime + 1.3);
  }

  private scheduleNextNote = () => {
    if (!this.isRunning || !this.ctx) return;

    const phrase = this.phrases[this.currentPhrase];
    const noteDegree = phrase[this.noteIndex];
    const freq = this.notes[noteDegree] || 440;

    // Vary note duration for realistic expressiveness
    const noteDuration = 0.9 + Math.random() * 0.5;
    const gap = noteDuration + 0.15 + (Math.random() > 0.8 ? 0.6 : 0.1);

    this.playFluteNote(freq, noteDuration);

    this.noteIndex++;
    if (this.noteIndex >= phrase.length) {
      this.noteIndex = 0;
      this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
    }

    this.intervalId = window.setTimeout(this.scheduleNextNote, gap * 1000);
  };

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.2);
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }

    this.droneOscs.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.droneOscs = [];
    this.droneGains = [];

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch {
        // ignore
      }
    }
  }
}

export const weddingSoundscape = new WeddingSoundscape();
