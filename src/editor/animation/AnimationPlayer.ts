import { Entity, Animation, Transform } from '@engine';

export class AnimationPlayer {
  private entity: Entity;
  private animation: Animation;
  private currentTime: number = 0;
  private isPlaying: boolean = false;
  private onUpdate: (time: number) => void;

  constructor(entity: Entity, animation: Animation, onUpdate?: (time: number) => void) {
    this.entity = entity;
    this.animation = animation;
    this.onUpdate = onUpdate || (() => {});
  }

  play(): void {
    this.isPlaying = true;
    this.currentTime = 0;
  }

  pause(): void {
    this.isPlaying = false;
  }

  stop(): void {
    this.isPlaying = false;
    this.currentTime = 0;
    this.applyKeyframes(0);
  }

  update(deltaTime: number): void {
    if (!this.isPlaying) return;

    this.currentTime += deltaTime;

    if (this.currentTime > this.animation.duration) {
      if (this.animation.loop) {
        this.currentTime = this.currentTime % this.animation.duration;
      } else {
        this.stop();
        return;
      }
    }

    this.applyKeyframes(this.currentTime);
    this.onUpdate(this.currentTime);
  }

  private applyKeyframes(time: number): void {
    const transform = this.entity.getComponent<Transform>('transform');
    if (!transform) return;

    for (const track of this.animation.tracks) {
      const keyframes = track.keyframes;
      if (keyframes.length === 0) continue;

      // Find surrounding keyframes
      let startKeyframe = keyframes[0];
      let endKeyframe = keyframes[keyframes.length - 1];

      for (let i = 0; i < keyframes.length - 1; i++) {
        if (keyframes[i].time <= time && keyframes[i + 1].time >= time) {
          startKeyframe = keyframes[i];
          endKeyframe = keyframes[i + 1];
          break;
        }
      }

      // Interpolate
      const t = (time - startKeyframe.time) / (endKeyframe.time - startKeyframe.time);
      const alpha = Math.max(0, Math.min(1, t));

      if (startKeyframe.position && endKeyframe.position) {
        transform.position.x = this.lerp(startKeyframe.position[0], endKeyframe.position[0], alpha);
        transform.position.y = this.lerp(startKeyframe.position[1], endKeyframe.position[1], alpha);
        transform.position.z = this.lerp(startKeyframe.position[2], endKeyframe.position[2], alpha);
      }

      if (startKeyframe.scale && endKeyframe.scale) {
        transform.scale.x = this.lerp(startKeyframe.scale[0], endKeyframe.scale[0], alpha);
        transform.scale.y = this.lerp(startKeyframe.scale[1], endKeyframe.scale[1], alpha);
        transform.scale.z = this.lerp(startKeyframe.scale[2], endKeyframe.scale[2], alpha);
      }
    }
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.animation.duration;
  }

  isAnimationPlaying(): boolean {
    return this.isPlaying;
  }
}
