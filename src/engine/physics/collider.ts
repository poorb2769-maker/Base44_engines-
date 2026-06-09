import { Component } from '../core/component';
import { Vector3 } from 'three';

export enum ColliderShape {
  Box = 'box',
  Sphere = 'sphere',
  Capsule = 'capsule',
  Cylinder = 'cylinder',
  Mesh = 'mesh'
}

export interface ColliderConfig {
  shape: ColliderShape;
  size?: Vector3; // for Box
  radius?: number; // for Sphere, Cylinder
  height?: number; // for Capsule, Cylinder
  offset?: Vector3;
  isTrigger?: boolean;
}

export class Collider extends Component {
  private shape: ColliderShape;
  private size?: Vector3;
  private radius?: number;
  private height?: number;
  private offset: Vector3 = new Vector3();
  private isTrigger: boolean = false;

  constructor(config: ColliderConfig) {
    super('collider');
    this.shape = config.shape;
    this.size = config.size?.clone();
    this.radius = config.radius;
    this.height = config.height;
    this.offset = config.offset?.clone() || new Vector3();
    this.isTrigger = config.isTrigger || false;
  }

  /**
   * Get collider shape
   */
  getShape(): ColliderShape {
    return this.shape;
  }

  /**
   * Get offset
   */
  getOffset(): Vector3 {
    return this.offset.clone();
  }

  /**
   * Check if trigger
   */
  getIsTrigger(): boolean {
    return this.isTrigger;
  }

  /**
   * Serialize for storage
   */
  serialize(): any {
    return {
      shape: this.shape,
      size: this.size ? [this.size.x, this.size.y, this.size.z] : undefined,
      radius: this.radius,
      height: this.height,
      offset: [this.offset.x, this.offset.y, this.offset.z],
      isTrigger: this.isTrigger
    };
  }

  /**
   * Deserialize from storage
   */
  static deserialize(data: any): Collider {
    const config: ColliderConfig = {
      shape: data.shape,
      radius: data.radius,
      height: data.height,
      isTrigger: data.isTrigger
    };

    if (data.size) {
      config.size = new Vector3(data.size[0], data.size[1], data.size[2]);
    }
    if (data.offset) {
      config.offset = new Vector3(data.offset[0], data.offset[1], data.offset[2]);
    }

    return new Collider(config);
  }
}
