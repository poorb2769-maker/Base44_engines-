import { Entity, Animation, AnimationKeyframe, Transform } from '@engine';

export class AnimationTimeline {
  private container: HTMLElement;
  private animation: Animation | null = null;
  private entity: Entity | null = null;
  private currentTime: number = 0;
  private isPlaying: boolean = false;
  private onTimeChanged: (time: number) => void = () => {};
  private onKeyframeAdded: (trackName: string, keyframe: AnimationKeyframe) => void = () => {};

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    if (!this.container) {
      console.warn(`Timeline container "${containerId}" not found`);
    }
  }

  setAnimation(entity: Entity, animation: Animation): void {
    this.entity = entity;
    this.animation = animation;
    this.currentTime = 0;
    this.render();
  }

  private render(): void {
    if (!this.container || !this.animation) return;

    this.container.innerHTML = '';

    // Timeline header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.gap = '8px';
    header.style.padding = '8px';
    header.style.borderBottom = '1px solid #3e3e42';

    const playBtn = document.createElement('button');
    playBtn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
    playBtn.className = 'toolbar-button';
    playBtn.onclick = () => this.togglePlay();
    header.appendChild(playBtn);

    const stopBtn = document.createElement('button');
    stopBtn.textContent = '⏹ Stop';
    stopBtn.className = 'toolbar-button';
    stopBtn.onclick = () => this.stop();
    header.appendChild(stopBtn);

    const timeDisplay = document.createElement('span');
    timeDisplay.style.padding = '6px 8px';
    timeDisplay.style.color = '#cccccc';
    timeDisplay.style.fontSize = '12px';
    timeDisplay.textContent = `${this.currentTime.toFixed(2)}s / ${this.animation.duration.toFixed(2)}s`;
    header.appendChild(timeDisplay);

    this.container.appendChild(header);

    // Tracks
    for (const track of this.animation.tracks) {
      const trackDiv = document.createElement('div');
      trackDiv.style.padding = '8px';
      trackDiv.style.borderBottom = '1px solid #3e3e42';
      trackDiv.innerHTML = `
        <div style="font-size: 11px; color: #858585; margin-bottom: 4px;">${track.name}</div>
        <div style="height: 20px; background: #3e3e42; border-radius: 2px; position: relative; overflow: hidden;">
          ${track.keyframes.map(kf => `
            <div style="
              position: absolute;
              width: 8px;
              height: 20px;
              background: #0098ff;
              left: ${(kf.time / this.animation!.duration) * 100}%;
              cursor: pointer;
              border-radius: 1px;
            " title="${kf.time.toFixed(2)}s"></div>
          `).join('')}
        </div>
      `;
      this.container.appendChild(trackDiv);
    }
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    this.render();
  }

  stop(): void {
    this.isPlaying = false;
    this.currentTime = 0;
    this.render();
  }

  setTime(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.animation?.duration ?? 0));
    this.onTimeChanged(this.currentTime);
    this.render();
  }

  addKeyframe(trackName: string, keyframe: AnimationKeyframe): void {
    if (this.animation) {
      this.animation.addKeyframe(trackName, keyframe);
      this.onKeyframeAdded(trackName, keyframe);
      this.render();
    }
  }

  getCurrentKeyframeData(): AnimationKeyframe {
    const transform = this.entity?.getComponent<Transform>('transform');
    return {
      time: this.currentTime,
      position: transform?.getPositionArray(),
      rotation: transform?.getRotationArray(),
      scale: transform?.getScaleArray(),
    };
  }
}
