import { Vector3, Quaternion } from 'three';
import { IComponent } from './Entity';

export class Transform implements IComponent {
  type = 'transform';

  position: Vector3 = new Vector3(0, 0, 0);
  rotation: Quaternion = new Quaternion(0, 0, 0, 1);
  scale: Vector3 = new Vector3(1, 1, 1);

  constructor(
    position?: [number, number, number],
    rotation?: [number, number, number, number],
    scale?: [number, number, number]
  ) {
    if (position) this.position.set(...position);
    if (rotation) this.rotation.set(...rotation);
    if (scale) this.scale.set(...scale);
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
  }

  /**
   * Set rotation from Euler angles (in radians)
   */
  setRotationFromEuler(x: number, y: number, z: number): void {
    this.rotation.setFromEuler(x, y, z);
  }

  /**
   * Set scale
   */
  setScale(x: number, y: number, z: number): void {
    this.scale.set(x, y, z);
  }

  /**
   * Translate position
   */
  translate(x: number, y: number, z: number): void {
    this.position.add(new Vector3(x, y, z));
  }

  /**
   * Get position as array
   */
  getPositionArray(): [number, number, number] {
    return [this.position.x, this.position.y, this.position.z];
  }

  /**
   * Get rotation as array (quaternion)
   */
  getRotationArray(): [number, number, number, number] {
    return [this.rotation.x, this.rotation.y, this.rotation.z, this.rotation.w];
  }

  /**
   * Get scale as array
   */
  getScaleArray(): [number, number, number] {
    return [this.scale.x, this.scale.y, this.scale.z];
  }

  /**
   * Serialize to JSON
   */
  toJSON(): any {
    return {
      position: this.getPositionArray(),
      rotation: this.getRotationArray(),
      scale: this.getScaleArray(),
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: any): Transform {
    return new Transform(data.position, data.rotation, data.scale);
  }
}
