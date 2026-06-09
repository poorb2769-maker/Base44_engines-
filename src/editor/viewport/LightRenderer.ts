import { Entity, Transform, Light, LightType } from '@engine';
import * as THREE from 'three';

export class LightRenderer {
  private lights: Map<string, THREE.Light> = new Map();
  private scene: THREE.Scene;

  constructor(threeScene: THREE.Scene) {
    this.scene = threeScene;
  }

  /**
   * Create and add light to scene
   */
  addLight(entity: Entity, threeLight: THREE.Light): void {
    const light = entity.getComponent<Light>('light');
    const transform = entity.getComponent<Transform>('transform');

    if (!light || !transform) return;

    // Apply properties
    threeLight.intensity = light.intensity;
    if (threeLight instanceof THREE.PointLight || threeLight instanceof THREE.SpotLight) {
      threeLight.distance = light.distance;
    }
    if (threeLight instanceof THREE.SpotLight) {
      threeLight.angle = light.angle;
      threeLight.penumbra = light.penumbra;
    }
    threeLight.castShadow = light.castShadow;

    // Set position from transform
    threeLight.position.copy(transform.position);

    this.scene.add(threeLight);
    this.lights.set(entity.id, threeLight);
  }

  /**
   * Create Three.js light from entity
   */
  createThreeLight(entity: Entity): THREE.Light | null {
    const light = entity.getComponent<Light>('light');
    if (!light) return null;

    let threeLight: THREE.Light;

    switch (light.lightType) {
      case LightType.POINT:
        threeLight = new THREE.PointLight(light.color, light.intensity, light.distance);
        break;
      case LightType.DIRECTIONAL:
        threeLight = new THREE.DirectionalLight(light.color, light.intensity);
        break;
      case LightType.SPOT:
        threeLight = new THREE.SpotLight(light.color, light.intensity, light.distance, light.angle, light.penumbra);
        break;
      case LightType.AMBIENT:
        threeLight = new THREE.AmbientLight(light.color, light.intensity);
        break;
      default:
        return null;
    }

    this.addLight(entity, threeLight);
    return threeLight;
  }

  /**
   * Update light properties
   */
  updateLight(entity: Entity): void {
    const threeLight = this.lights.get(entity.id);
    if (!threeLight) return;

    const light = entity.getComponent<Light>('light');
    const transform = entity.getComponent<Transform>('transform');

    if (light) {
      threeLight.intensity = light.intensity;
      threeLight.castShadow = light.castShadow;
    }

    if (transform) {
      threeLight.position.copy(transform.position);
    }
  }

  removeLight(entityId: string): void {
    const threeLight = this.lights.get(entityId);
    if (threeLight) {
      this.scene.remove(threeLight);
      this.lights.delete(entityId);
    }
  }

  clear(): void {
    for (const light of this.lights.values()) {
      this.scene.remove(light);
    }
    this.lights.clear();
  }
}
