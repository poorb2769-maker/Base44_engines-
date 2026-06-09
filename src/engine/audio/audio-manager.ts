import { Vector3 } from 'three';

export interface AudioSource {
  name: string;
  audioBuffer: AudioBuffer;
  volume: number;
  loop: boolean;
  playing: boolean;
}

export class AudioManager {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private audioSources: Map<string, AudioSource> = new Map();
  private playingNodes: Map<string, AudioBufferSourceNode> = new Map();
  private listener: AudioListener | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterGain.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      this.audioContext.currentTime
    );
  }

  /**
   * Load audio from URL
   */
  async loadAudio(name: string, url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.audioSources.set(name, {
      name,
      audioBuffer,
      volume: 1.0,
      loop: false,
      playing: false
    });

    return audioBuffer;
  }

  /**
   * Play audio
   */
  play(name: string, options?: { volume?: number; loop?: boolean; fade?: number }): AudioBufferSourceNode | null {
    const source = this.audioSources.get(name);
    if (!source) {
      console.warn(`Audio "${name}" not loaded`);
      return null;
    }

    const volume = options?.volume ?? source.volume;
    const loop = options?.loop ?? source.loop;

    const audioNode = this.audioContext.createBufferSource();
    audioNode.buffer = source.audioBuffer;
    audioNode.loop = loop;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    
    if (options?.fade) {
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + options.fade);
    }

    audioNode.connect(gainNode);
    gainNode.connect(this.masterGain);
    audioNode.start(0);

    this.playingNodes.set(name, audioNode);
    return audioNode;
  }

  /**
   * Stop audio
   */
  stop(name: string): void {
    const node = this.playingNodes.get(name);
    if (node) {
      try {
        node.stop();
      } catch (e) {
        // Already stopped
      }
      this.playingNodes.delete(name);
    }
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.playingNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.playingNodes.clear();
  }

  /**
   * Create spatial audio source (3D audio)
   */
  createPannerNode(): PannerNode {
    return this.audioContext.createPanner();
  }

  /**
   * Update 3D audio position
   */
  updateSpatialAudio(panner: PannerNode, position: Vector3): void {
    panner.setPosition(position.x, position.y, position.z);
  }

  /**
   * Resume audio context (required by browsers)
   */
  resumeAudioContext(): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Get audio context state
   */
  getState(): string {
    return this.audioContext.state;
  }
}

/**
 * Audio listener for spatial audio
 */
export class AudioListener {
  private panner: PannerNode;

  constructor(audioManager: AudioManager) {
    this.panner = audioManager.createPannerNode();
  }

  /**
   * Update listener position
   */
  setPosition(position: Vector3): void {
    this.panner.setPosition(position.x, position.y, position.z);
  }

  /**
   * Update listener orientation
   */
  setOrientation(forward: Vector3, up: Vector3): void {
    this.panner.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
  }
}
