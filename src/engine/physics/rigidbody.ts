import { Component } from '../core/component';
import { Vector3, Quaternion } from 'three';

export interface RigidbodyConfig {
  mass: number;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  useGravity: boolean;
  isKinematic: boolean;
  constraints?: {
    freezePositionX?: boolean;
    freezePositionY?: boolean;
    freezePositionZ?: boolean;
    freezeRotationX?: boolean;
    freezeRotationY?: boolean;
    freezeRotationZ?: boolean;
  };
}

export class Rigidbody extends Component {
  private mass: number;
  private friction: number;
  private restitution: number;
  private linearDamping: number;
  private angularDamping: number;
  private useGravity: boolean;
  private isKinematic: boolean;
  private velocity: Vector3 = new Vector3();
  private angularVelocity: Vector3 = new Vector3();
  private forces: Vector3 = new Vector3();
  private torques: Vector3 = new Vector3();
  private constraints: any;

  constructor(config: RigidbodyConfig) {
    super('rigidbody');
    this.mass = config.mass || 1;
    this.friction = config.friction || 0.5;
    this.restitution = config.restitution || 0.3;
    this.linearDamping = config.linearDamping || 0.01;
    this.angularDamping = config.angularDamping || 0.01;
    this.useGravity = config.useGravity !== false;
    this.isKinematic = config.isKinematic || false;
    this.constraints = config.constraints || {};
  }

  /**
   * Apply force to the rigidbody
   */
  applyForce(force: Vector3): void {
    if (!this.isKinematic) {
      this.forces.add(force);
    }
  }

  /**
   * Apply impulse (instant force)
   */
  applyImpulse(impulse: Vector3): void {
    if (!this.isKinematic) {
      this.velocity.addScaledVector(impulse, 1 / this.mass);
    }
  }

  /**
   * Apply torque (rotational force)
   */
  applyTorque(torque: Vector3): void {
    if (!this.isKinematic) {
      this.torques.add(torque);
    }
  }

  /**
   * Set velocity directly
   */
  setVelocity(velocity: Vector3): void {
    this.velocity.copy(velocity);
  }

  /**
   * Get current velocity
   */
  getVelocity(): Vector3 {
    return this.velocity.clone();
  }

  /**
   * Set angular velocity
   */
  setAngularVelocity(angularVelocity: Vector3): void {
    this.angularVelocity.copy(angularVelocity);
  }

  /**
   * Get current angular velocity
   */
  getAngularVelocity(): Vector3 {
    return this.angularVelocity.clone();
  }

  /**
   * Check if rigidbody is kinematic
   */
  getIsKinematic(): boolean {
    return this.isKinematic;
  }

  /**
   * Get mass
   */
  getMass(): number {
    return this.mass;
  }

  /**
   * Serialize for storage
   */
  serialize(): any {
    return {
      mass: this.mass,
      friction: this.friction,
      restitution: this.restitution,
      linearDamping: this.linearDamping,
      angularDamping: this.angularDamping,
      useGravity: this.useGravity,
      isKinematic: this.isKinematic,
      constraints: this.constraints
    };
  }

  /**
   * Deserialize from storage
   */
  static deserialize(data: any): Rigidbody {
    return new Rigidbody(data);
  }
}
