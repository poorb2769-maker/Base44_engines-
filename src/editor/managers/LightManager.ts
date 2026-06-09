import { Entity, Transform, Material, Light, Animation } from '@engine';

export class LightManager {
  private lights: Map<string, Entity> = new Map();

  /**
   * Create a point light
   */
  createPointLight(name: string = 'Point Light'): Entity {
    const entity = new Entity(name);
    entity.addComponent('transform', new Transform());
    entity.addComponent('light', new Light({
      type: 'point',
      intensity: 1,
      color: 0xffffff,
      distance: 100,
    }));
    
    this.lights.set(entity.id, entity);
    return entity;
  }

  /**
   * Create a directional light
   */
  createDirectionalLight(name: string = 'Directional Light'): Entity {
    const entity = new Entity(name);
    entity.addComponent('transform', new Transform([0, 10, 0]));
    entity.addComponent('light', new Light({
      type: 'directional',
      intensity: 0.8,
      color: 0xffffff,
    }));
    
    this.lights.set(entity.id, entity);
    return entity;
  }

  /**
   * Create a spotlight
   */
  createSpotLight(name: string = 'Spot Light'): Entity {
    const entity = new Entity(name);
    entity.addComponent('transform', new Transform());
    entity.addComponent('light', new Light({
      type: 'spot',
      intensity: 1,
      color: 0xffffff,
      angle: Math.PI / 4,
    }));
    
    this.lights.set(entity.id, entity);
    return entity;
  }

  getLight(entityId: string): Entity | undefined {
    return this.lights.get(entityId);
  }

  getAllLights(): Entity[] {
    return Array.from(this.lights.values());
  }

  removeLight(entityId: string): boolean {
    return this.lights.delete(entityId);
  }
}
