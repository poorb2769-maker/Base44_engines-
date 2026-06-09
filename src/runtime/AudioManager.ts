export class AudioManager {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();
  private currentSources: Map<string, AudioBufferSource> = new Map();
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    this.setMasterVolume(1);
    this.setMusicVolume(0.7);
    this.setSFXVolume(1);
  }

  async loadSound(url: string, id: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(id, audioBuffer);
    } catch (error) {
      console.error(`Failed to load audio: ${url}`, error);
    }
  }

  playSound(id: string, isMusic: boolean = false): void {
    const buffer = this.sounds.get(id);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(isMusic ? this.musicGain : this.sfxGain);
    source.start(0);
    this.currentSources.set(id, source);
  }

  stopSound(id: string): void {
    const source = this.currentSources.get(id);
    if (source) {
      source.stop();
      this.currentSources.delete(id);
    }
  }

  setMasterVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number): void {
    this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number): void {
    this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
  }
}
