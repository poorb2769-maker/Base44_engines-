import { Entity, Transform, ScriptComponent, ParticleSystem, Animation } from '@engine';
import { RuntimeEngine } from './RuntimeEngine';
import { UISystem } from './UISystem';
import { PhysicsEngine, RigidBody, Collider } from './PhysicsEngine';
import { AudioManager } from './AudioManager';
import { PerformanceMonitor } from './PerformanceMonitor';

class GameRuntime {
  private runtimeEngine: RuntimeEngine;
  private uiSystem: UISystem;
  private physicsEngine: PhysicsEngine;
  private audioManager: AudioManager;
  private performanceMonitor: PerformanceMonitor;
  private scriptContexts: Map<string, any> = new Map();
  private isPlaying: boolean = false;

  constructor(containerId: string) {
    this.runtimeEngine = new RuntimeEngine(containerId);
    this.uiSystem = new UISystem('ui-canvas');
    this.physicsEngine = new PhysicsEngine();
    this.audioManager = new AudioManager();
    this.performanceMonitor = new PerformanceMonitor();

    this.setupGameLoop();
  }

  private setupGameLoop(): void {
    this.runtimeEngine.setOnUpdate((deltaTime) => {
      if (!this.isPlaying) return;

      // Update physics
      this.physicsEngine.update(deltaTime);

      // Update scripts
      this.updateScripts(deltaTime);

      // Update particles
      this.updateParticles(deltaTime);

      // Update animations
      this.updateAnimations(deltaTime);

      // Update UI
      this.uiSystem.render();

      // Monitor performance
      this.performanceMonitor.update(this.runtimeEngine.getScene(), this.runtimeEngine.getRenderer());
    });
  }

  private updateScripts(deltaTime: number): void {
    const scene = this.runtimeEngine.getScene();
    for (const entity of scene.getAllEntities()) {
      const scripts = entity.getComponent<any>('scripts') as ScriptComponent[];
      if (scripts) {
        for (const script of scripts) {
          script.execute({
            entity,
            deltaTime,
            scene,
          });
        }
      }
    }
  }

  private updateParticles(deltaTime: number): void {
    const scene = this.runtimeEngine.getScene();
    for (const entity of scene.getAllEntities()) {
      const particleSystem = entity.getComponent<ParticleSystem>('particleSystem');
      if (particleSystem) {
        particleSystem.update(deltaTime);
      }
    }
  }

  private updateAnimations(deltaTime: number): void {
    const scene = this.runtimeEngine.getScene();
    for (const entity of scene.getAllEntities()) {
      const animation = entity.getComponent<Animation>('animation');
      if (animation) {
        // Animation update logic
      }
    }
  }

  play(): void {
    this.isPlaying = true;
    this.runtimeEngine.play();
  }

  pause(): void {
    this.isPlaying = false;
    this.runtimeEngine.pause();
  }

  stop(): void {
    this.isPlaying = false;
    this.runtimeEngine.stop();
  }

  addScript(entityId: string, script: ScriptComponent): void {
    const scene = this.runtimeEngine.getScene();
    const entity = scene.getEntityById(entityId);
    if (entity) {
      let scripts = entity.getComponent<ScriptComponent[]>('scripts');
      if (!scripts) {
        scripts = [];
        entity.addComponent('scripts', scripts);
      }
      scripts.push(script);
    }
  }

  addRigidBody(entityId: string, rigidBody: RigidBody, collider: Collider): void {
    const scene = this.runtimeEngine.getScene();
    const entity = scene.getEntityById(entityId);
    if (entity) {
      this.physicsEngine.addRigidBody(entity, rigidBody, collider);
    }
  }

  playSound(soundId: string, isMusic: boolean = false): void {
    this.audioManager.playSound(soundId, isMusic);
  }

  setMasterVolume(volume: number): void {
    this.audioManager.setMasterVolume(volume);
  }

  getPerformanceStats(): any {
    return this.performanceMonitor.getStats();
  }
}

// Export for use
export default GameRuntime;
