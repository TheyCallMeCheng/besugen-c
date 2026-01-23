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
  private volume: number = 0.5;
  private muted: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Create audio context on first user interaction
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = this.volume;
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

  // Public controls
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
export type { SoundType };
