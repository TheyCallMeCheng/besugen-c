/**
 * Sound Manager using Web Audio API
 * Generates all sounds programmatically for zero dependencies
 */

type SoundType =
  | 'cardSelect'
  | 'cardPlay'
  | 'cardDeal'
  | 'cardShuffle'
  | 'buttonClick'
  | 'bidSubmit'
  | 'timerTick'
  | 'timerWarning'
  | 'sortHand'
  | 'turnStart'
  | 'trickWin'
  | 'trickLose'
  | 'roundEnd'
  | 'lifeLost'
  | 'gameOver';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private volume: number = 0.5;
  private musicVolume: number = 0.3;
  private muted: boolean = false;
  private musicMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicIntervalId: number | null = null;
  private currentChordIndex: number = 0;

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Create audio context on first user interaction
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Master gain for sound effects
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = this.volume;

        // Separate gain for music
        this.musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.audioContext.destination);
        this.musicGain.gain.value = this.musicVolume;
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private ensureContext() {
    if (!this.audioContext) {
      this.init();
    }
    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  play(soundType: SoundType) {
    if (this.muted || !this.audioContext || !this.masterGain) return;

    this.ensureContext();

    const now = this.audioContext.currentTime;

    switch (soundType) {
      case 'cardSelect':
        this.playCardSelect(now);
        break;
      case 'cardPlay':
        this.playCardPlay(now);
        break;
      case 'cardDeal':
        this.playCardDeal(now);
        break;
      case 'cardShuffle':
        this.playCardShuffle(now);
        break;
      case 'buttonClick':
        this.playButtonClick(now);
        break;
      case 'bidSubmit':
        this.playBidSubmit(now);
        break;
      case 'timerTick':
        this.playTimerTick(now);
        break;
      case 'timerWarning':
        this.playTimerWarning(now);
        break;
      case 'sortHand':
        this.playSortHand(now);
        break;
      case 'turnStart':
        this.playTurnStart(now);
        break;
      case 'trickWin':
        this.playTrickWin(now);
        break;
      case 'trickLose':
        this.playTrickLose(now);
        break;
      case 'roundEnd':
        this.playRoundEnd(now);
        break;
      case 'lifeLost':
        this.playLifeLost(now);
        break;
      case 'gameOver':
        this.playGameOver(now);
        break;
    }
  }

  // Card Sounds
  private playCardSelect(when: number) {
    const osc = this.createOscillator('sine', 800, when);
    const gain = this.createGain(0.1, when);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    gain.gain.setValueAtTime(0.1, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.05);
    
    osc.start(when);
    osc.stop(when + 0.05);
  }

  private playCardPlay(when: number) {
    // Swoosh sound - descending noise burst
    const osc = this.createOscillator('sine', 400, when);
    const gain = this.createGain(0.15, when);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.frequency.setValueAtTime(400, when);
    osc.frequency.exponentialRampToValueAtTime(200, when + 0.1);
    
    gain.gain.setValueAtTime(0.15, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.15);
    
    osc.start(when);
    osc.stop(when + 0.15);
  }

  private playCardDeal(when: number) {
    // Quick snap
    const osc = this.createOscillator('square', 150, when);
    const gain = this.createGain(0.08, when);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    gain.gain.setValueAtTime(0.08, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.08);
    
    osc.start(when);
    osc.stop(when + 0.08);
  }

  private playCardShuffle(when: number) {
    // Multiple quick bursts
    for (let i = 0; i < 8; i++) {
      const time = when + i * 0.04;
      const freq = 100 + Math.random() * 100;
      
      const osc = this.createOscillator('square', freq, time);
      const gain = this.createGain(0.05, time);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
      
      osc.start(time);
      osc.stop(time + 0.03);
    }
  }

  // UI Sounds
  private playButtonClick(when: number) {
    // Crisp, mechanical click - two-tone tap for a satisfying feel
    // High frequency click
    const osc1 = this.createOscillator('square', 1200, when);
    const gain1 = this.createGain(0.15, when);
    
    osc1.connect(gain1);
    gain1.connect(this.masterGain!);
    
    gain1.gain.setValueAtTime(0.15, when);
    gain1.gain.exponentialRampToValueAtTime(0.01, when + 0.03);
    
    osc1.start(when);
    osc1.stop(when + 0.03);
    
    // Lower frequency "tap" for depth
    const osc2 = this.createOscillator('sine', 400, when);
    const gain2 = this.createGain(0.12, when);
    
    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    
    gain2.gain.setValueAtTime(0.12, when);
    gain2.gain.exponentialRampToValueAtTime(0.01, when + 0.02);
    
    osc2.start(when);
    osc2.stop(when + 0.02);
  }

  private playBidSubmit(when: number) {
    // Success chord
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.createOscillator('sine', freq, when);
      const gain = this.createGain(0.08, when);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      gain.gain.setValueAtTime(0, when + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.08, when + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, when + 0.3);
      
      osc.start(when + i * 0.05);
      osc.stop(when + 0.3);
    });
  }

  private playTimerTick(when: number) {
    const osc = this.createOscillator('sine', 1000, when);
    const gain = this.createGain(0.05, when);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    gain.gain.setValueAtTime(0.05, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.03);
    
    osc.start(when);
    osc.stop(when + 0.03);
  }

  private playTimerWarning(when: number) {
    // Urgent beep
    const osc = this.createOscillator('sine', 880, when);
    const gain = this.createGain(0.15, when);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    gain.gain.setValueAtTime(0.15, when);
    gain.gain.setValueAtTime(0, when + 0.1);
    gain.gain.setValueAtTime(0.15, when + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.25);
    
    osc.start(when);
    osc.stop(when + 0.25);
  }

  private playSortHand(when: number) {
    // Quick ascending swoosh
    const osc = this.createOscillator('sine', 200, when);
    const gain = this.createGain(0.1, when);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.frequency.setValueAtTime(200, when);
    osc.frequency.exponentialRampToValueAtTime(600, when + 0.12);
    
    gain.gain.setValueAtTime(0.1, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.12);
    
    osc.start(when);
    osc.stop(when + 0.12);
  }

  // Game Event Sounds
  private playTurnStart(when: number) {
    // Gentle chime
    [659.25, 783.99].forEach((freq, i) => {
      const osc = this.createOscillator('sine', freq, when);
      const gain = this.createGain(0.12, when);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      gain.gain.setValueAtTime(0, when + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, when + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, when + 0.4);
      
      osc.start(when + i * 0.08);
      osc.stop(when + 0.4);
    });
  }

  private playTrickWin(when: number) {
    // Victory flourish - ascending arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.createOscillator('sine', freq, when);
      const gain = this.createGain(0.1, when);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      gain.gain.setValueAtTime(0, when + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.1, when + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, when + 0.5);
      
      osc.start(when + i * 0.06);
      osc.stop(when + 0.5);
    });
  }

  private playTrickLose(when: number) {
    // Subtle descending tone
    const osc = this.createOscillator('sine', 400, when);
    const gain = this.createGain(0.08, when);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.frequency.setValueAtTime(400, when);
    osc.frequency.exponentialRampToValueAtTime(200, when + 0.2);
    
    gain.gain.setValueAtTime(0.08, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.2);
    
    osc.start(when);
    osc.stop(when + 0.2);
  }

  private playRoundEnd(when: number) {
    // Longer musical phrase
    [523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.createOscillator('sine', freq, when);
      const gain = this.createGain(0.09, when);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      const noteStart = when + i * 0.12;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.09, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.15);
      
      osc.start(noteStart);
      osc.stop(noteStart + 0.15);
    });
  }

  private playLifeLost(when: number) {
    // Negative tone - descending minor chord
    [523.25, 466.16, 392.00].forEach((freq, i) => {
      const osc = this.createOscillator('sine', freq, when);
      const gain = this.createGain(0.1, when);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      gain.gain.setValueAtTime(0, when + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, when + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, when + 0.5);
      
      osc.start(when + i * 0.08);
      osc.stop(when + 0.5);
    });
  }

  private playGameOver(when: number) {
    // Final fanfare
    const melody = [523.25, 587.33, 659.25, 523.25, 659.25, 783.99, 1046.50];
    melody.forEach((freq, i) => {
      const osc = this.createOscillator('sine', freq, when);
      const gain = this.createGain(0.1, when);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      const noteStart = when + i * 0.15;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.1, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.2);
      
      osc.start(noteStart);
      osc.stop(noteStart + 0.2);
    });
  }

  // Helper methods
  private createOscillator(type: OscillatorType, frequency: number, when: number): OscillatorNode {
    const osc = this.audioContext!.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    return osc;
  }

  private createGain(value: number, when: number): GainNode {
    const gain = this.audioContext!.createGain();
    gain.gain.value = value;
    return gain;
  }

  // ==================== Background Music ====================

  // Happy, uplifting lofi chord progressions in major keys
  private readonly chordProgressions = [
    // C - G - Am - F (happy pop progression) with maj7 extensions for lofi feel
    [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [392.00, 493.88, 587.33, 739.99], // Gmaj7
      [440.00, 523.25, 659.25, 783.99], // Am7
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
    ],
  ];

  // Pentatonic scale for happy, easy-going melodies (C major pentatonic)
  private readonly melodyNotes = [
    523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
    1046.50, 1174.66, 1318.51, // C6, D6, E6 (octave up)
  ];

  startMusic() {
    if (this.musicPlaying || this.musicMuted) return;

    this.ensureContext();
    if (!this.audioContext || !this.musicGain) return;

    this.musicPlaying = true;
    this.currentChordIndex = 0;

    // Play music loop
    this.playMusicLoop();
  }

  private playMusicLoop() {
    if (!this.musicPlaying || !this.audioContext || !this.musicGain) return;

    const now = this.audioContext.currentTime;
    const chordDuration = 2.0; // seconds per chord (faster = more upbeat)
    const progression = this.chordProgressions[0];

    // Play current chord (pad sound)
    const chord = progression[this.currentChordIndex % progression.length];
    this.playPadChord(chord, now, chordDuration);

    // Play melody notes (multiple for more lively feel)
    this.playMelodyNote(now, chordDuration);
    if (Math.random() > 0.5) {
      this.playMelodyNote(now + chordDuration * 0.5, chordDuration * 0.5);
    }

    // Play subtle bass
    this.playBassNote(chord[0] / 2, now, chordDuration);

    // Schedule next chord
    this.currentChordIndex++;
    this.musicIntervalId = window.setTimeout(() => {
      this.playMusicLoop();
    }, chordDuration * 1000);
  }

  private playPadChord(frequencies: number[], when: number, duration: number) {
    if (!this.audioContext || !this.musicGain) return;

    frequencies.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      const filter = this.audioContext!.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;

      // Brighter low-pass filter for happier sound
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      filter.Q.value = 0.7;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);

      // Soft attack and release
      const noteVolume = 0.05;
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(noteVolume, when + 0.15);
      gain.gain.setValueAtTime(noteVolume, when + duration - 0.3);
      gain.gain.linearRampToValueAtTime(0, when + duration);

      osc.start(when);
      osc.stop(when + duration);
    });
  }

  private playMelodyNote(when: number, chordDuration: number) {
    if (!this.audioContext || !this.musicGain) return;

    // Randomly decide whether to play a melody note (85% chance for livelier feel)
    if (Math.random() > 0.85) return;

    const noteIndex = Math.floor(Math.random() * this.melodyNotes.length);
    const freq = this.melodyNotes[noteIndex];
    const noteDuration = 0.4 + Math.random() * 0.3; // Shorter, bouncier notes
    const noteStart = when + Math.random() * Math.max(0.1, chordDuration - noteDuration - 0.1);

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain!);

    const noteVolume = 0.04;
    gain.gain.setValueAtTime(0, noteStart);
    gain.gain.linearRampToValueAtTime(noteVolume, noteStart + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

    osc.start(noteStart);
    osc.stop(noteStart + noteDuration);
  }

  private playBassNote(freq: number, when: number, duration: number) {
    if (!this.audioContext || !this.musicGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.value = 200;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain!);

    const noteVolume = 0.08;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(noteVolume, when + 0.1);
    gain.gain.setValueAtTime(noteVolume, when + duration - 0.3);
    gain.gain.linearRampToValueAtTime(0, when + duration);

    osc.start(when);
    osc.stop(when + duration);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicIntervalId) {
      clearTimeout(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  // Public controls
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicMuted ? 0 : this.musicVolume;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
    return this.muted;
  }

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicMuted ? 0 : this.musicVolume;
    }
    if (this.musicMuted) {
      this.stopMusic();
    }
    return this.musicMuted;
  }

  isMuted() {
    return this.muted;
  }

  isMusicMuted() {
    return this.musicMuted;
  }

  isMusicPlaying() {
    return this.musicPlaying;
  }

  getVolume() {
    return this.volume;
  }

  getMusicVolume() {
    return this.musicVolume;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
export type { SoundType };
