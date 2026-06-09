import { IComponent } from './Entity';

export interface AnimationKeyframe {
  time: number; // in seconds
  position?: [number, number, number];
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
}

export interface AnimationTrack {
  name: string;
  keyframes: AnimationKeyframe[];
}

export class Animation implements IComponent {
  type = 'animation';

  tracks: AnimationTrack[] = [];
  duration: number = 0;
  loop: boolean = false;
  autoplay: boolean = false;

  constructor() {}

  addTrack(name: string): AnimationTrack {
    const track: AnimationTrack = { name, keyframes: [] };
    this.tracks.push(track);
    return track;
  }

  getTrack(name: string): AnimationTrack | undefined {
    return this.tracks.find(t => t.name === name);
  }

  addKeyframe(trackName: string, keyframe: AnimationKeyframe): void {
    const track = this.getTrack(trackName);
    if (track) {
      track.keyframes.push(keyframe);
      track.keyframes.sort((a, b) => a.time - b.time);
      this.duration = Math.max(this.duration, keyframe.time);
    }
  }

  toJSON(): any {
    return {
      tracks: this.tracks,
      duration: this.duration,
      loop: this.loop,
      autoplay: this.autoplay,
    };
  }

  static fromJSON(data: any): Animation {
    const anim = new Animation();
    anim.tracks = data.tracks || [];
    anim.duration = data.duration || 0;
    anim.loop = data.loop ?? false;
    anim.autoplay = data.autoplay ?? false;
    return anim;
  }
}
