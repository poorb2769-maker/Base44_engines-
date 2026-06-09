import { Component } from '../core/component';
import { AnimationMixer, AnimationClip, AnimationAction } from 'three';

export interface AnimationState {
  name: string;
  clip: AnimationClip;
  weight: number;
  timeScale: number;
  loop: boolean;
  clampWhenFinished: boolean;
}

export class AnimationController extends Component {
  private mixer: AnimationMixer | null = null;
  private animations: Map<string, AnimationClip> = new Map();
  private actions: Map<string, AnimationAction> = new Map();
  private currentState: string = '';
  private nextState: string = '';
  private transitionDuration: number = 0.5;

  constructor() {
    super('animationController');
  }

  /**
   * Initialize mixer with object
   */
  initializeMixer(object: any): void {
    if (object.animations) {
      this.mixer = new AnimationMixer(object);
      
      // Store all animation clips
      object.animations.forEach((clip: AnimationClip) => {
        this.animations.set(clip.name, clip);
      });
    }
  }

  /**
   * Add animation clip
   */
  addAnimation(name: string, clip: AnimationClip): void {
    this.animations.set(name, clip);
    if (this.mixer) {
      const action = this.mixer.clipAction(clip);
      this.actions.set(name, action);
    }
  }

  /**
   * Play animation
   */
  play(name: string, loop: boolean = true): void {
    if (!this.mixer || !this.animations.has(name)) {
      console.warn(`Animation "${name}" not found`);
      return;
    }

    const clip = this.animations.get(name)!;
    let action = this.actions.get(name);

    if (!action) {
      action = this.mixer.clipAction(clip);
      this.actions.set(name, action);
    }

    action.loop = loop ? 2 : 0; // 2 = LoopRepeat, 0 = LoopOnce
    action.clampWhenFinished = !loop;
    action.play();
    this.currentState = name;
  }

  /**
   * Transition between animations
   */
  transition(toState: string, duration: number = this.transitionDuration): void {
    if (!this.mixer || !this.animations.has(toState)) {
      console.warn(`Animation "${toState}" not found`);
      return;
    }

    const fromAction = this.actions.get(this.currentState);
    const toAction = this.actions.get(toState) || this.mixer.clipAction(this.animations.get(toState)!);

    if (fromAction) {
      fromAction.crossFadeTo(toAction, duration, true);
    } else {
      toAction.play();
    }

    this.currentState = toState;
  }

  /**
   * Stop animation
   */
  stop(name?: string): void {
    if (!this.mixer) return;

    if (name) {
      const action = this.actions.get(name);
      if (action) action.stop();
    } else {
      this.mixer.stopAllAction();
    }
  }

  /**
   * Get current animation state
   */
  getCurrentState(): string {
    return this.currentState;
  }

  /**
   * Update mixer (call in render loop)
   */
  update(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  /**
   * Serialize for storage
   */
  serialize(): any {
    return {
      currentState: this.currentState,
      transitionDuration: this.transitionDuration
    };
  }
}
