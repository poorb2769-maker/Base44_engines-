import * as THREE from 'three';
import { Entity } from '@engine';

export interface Collider {
  type: 'box' | 'sphere' | 'capsule';
  size: [number, number, number];
  offset: [number, number, number];
  isTrigger: boolean;
}

export interface RigidBody {
  mass: number;
  friction: number;
  restitution: number;
  useGravity: boolean;
  isKinematic: boolean;
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
}

export class PhysicsEngine {
  private bodies: Map<string, { entity: Entity; rigidBody: RigidBody; collider: Collider }> = new Map();
  private gravity: THREE.Vector3 = new THREE.Vector3(0, -9.8, 0);

  addRigidBody(entity: Entity, rigidBody: RigidBody, collider: Collider): void {
    this.bodies.set(entity.id, { entity, rigidBody, collider });
  }

  removeRigidBody(entityId: string): void {
    this.bodies.delete(entityId);
  }

  setGravity(x: number, y: number, z: number): void {
    this.gravity.set(x, y, z);
  }

  update(deltaTime: number): void {
    for (const { entity, rigidBody } of this.bodies.values()) {
      if (rigidBody.isKinematic) continue;

      // Apply gravity
      if (rigidBody.useGravity) {
        const vel = new THREE.Vector3(...rigidBody.velocity);
        vel.addScaledVector(this.gravity, deltaTime);
        rigidBody.velocity = [vel.x, vel.y, vel.z];
      }

      // Update position
      const vel = new THREE.Vector3(...rigidBody.velocity);
      const pos = new THREE.Vector3(...(entity.getComponent<any>('transform')?.getPositionArray() || [0, 0, 0]));
      pos.addScaledVector(vel, deltaTime);

      // Update entity
      const transform = entity.getComponent<any>('transform');
      if (transform) {
        transform.setPosition(pos.x, pos.y, pos.z);
      }
    }
  }

  getBody(entityId: string): RigidBody | undefined {
    return this.bodies.get(entityId)?.rigidBody;
  }

  applyForce(entityId: string, x: number, y: number, z: number): void {
    const body = this.bodies.get(entityId)?.rigidBody;
    if (body && body.mass > 0) {
      const force = new THREE.Vector3(x, y, z).multiplyScalar(1 / body.mass);
      const vel = new THREE.Vector3(...body.velocity);
      vel.add(force);
      body.velocity = [vel.x, vel.y, vel.z];
    }
  }
}
