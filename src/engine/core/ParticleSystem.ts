import { IComponent } from './Entity';
import { Vector3 } from 'three';

export interface ParticleSystemConfig {
  maxParticles: number;
  emissionRate: number;
  lifetime: number;
  initialVelocity: [number, number, number];
  velocityRandomness: number;
  gravity: [number, number, number];
  size: number;
  sizeRandomness: number;
  color: number;
  colorRandomness: number;
}

export interface Particle {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  age: number;
  lifetime: number;
  size: number;
  color: number;
}

export class ParticleSystem implements IComponent {
  type = 'particleSystem';

  particles: Particle[] = [];
  config: ParticleSystemConfig;
  emissionTimer: number = 0;
  isPlaying: boolean = true;

  constructor(config?: Partial<ParticleSystemConfig>) {
    this.config = {
      maxParticles: 1000,
      emissionRate: 100,
      lifetime: 2,
      initialVelocity: [0, 1, 0],
      velocityRandomness: 0.5,
      gravity: [0, -9.8, 0],
      size: 0.1,
      sizeRandomness: 0.02,
      color: 0xffffff,
      colorRandomness: 0,
      ...config,
    };
  }

  emit(count: number): void {
    for (let i = 0; i < count && this.particles.length < this.config.maxParticles; i++) {
      const particle: Particle = {
        position: new Vector3(0, 0, 0),
        velocity: this.getRandomVelocity(),
        acceleration: new Vector3(...this.config.gravity),
        age: 0,
        lifetime: this.config.lifetime,
        size: this.config.size + (Math.random() - 0.5) * this.config.sizeRandomness,
        color: this.config.color,
      };
      this.particles.push(particle);
    }
  }

  update(deltaTime: number): void {
    if (!this.isPlaying) return;

    // Emit new particles
    this.emissionTimer += deltaTime;
    const toEmit = Math.floor(this.config.emissionRate * this.emissionTimer);
    if (toEmit > 0) {
      this.emit(toEmit);
      this.emissionTimer = 0;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.age += deltaTime;

      if (particle.age >= particle.lifetime) {
        this.particles.splice(i, 1);
        continue;
      }

      // Update physics
      particle.velocity.addScaledVector(particle.acceleration, deltaTime);
      particle.position.addScaledVector(particle.velocity, deltaTime);
    }
  }

  private getRandomVelocity(): Vector3 {
    const vel = new Vector3(...this.config.initialVelocity);
    vel.x += (Math.random() - 0.5) * this.config.velocityRandomness;
    vel.y += (Math.random() - 0.5) * this.config.velocityRandomness;
    vel.z += (Math.random() - 0.5) * this.config.velocityRandomness;
    return vel;
  }

  play(): void {
    this.isPlaying = true;
  }

  stop(): void {
    this.isPlaying = false;
  }

  clear(): void {
    this.particles = [];
  }

  toJSON(): any {
    return {
      config: this.config,
      particles: this.particles.map(p => ({
        position: [p.position.x, p.position.y, p.position.z],
        velocity: [p.velocity.x, p.velocity.y, p.velocity.z],
        age: p.age,
        lifetime: p.lifetime,
        size: p.size,
        color: p.color,
      })),
    };
  }

  static fromJSON(data: any): ParticleSystem {
    return new ParticleSystem(data.config);
  }
}
