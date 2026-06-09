import { Entity } from '../core/Entity';
import { v4 as uuidv4 } from 'uuid';

export class Scene {
  id: string;
  name: string;
  root: Entity;
  entities: Map<string, Entity> = new Map();

  constructor(name: string = 'Scene', id?: string) {
    this.id = id || uuidv4();
    this.name = name;
    this.root = new Entity('Root');
    this.entities.set(this.root.id, this.root);
  }

  /**
   * Add entity to scene
   */
  addEntity(entity: Entity, parent?: Entity): void {
    const parentEntity = parent || this.root;
    parentEntity.addChild(entity);
    this.registerEntity(entity);
  }

  /**
   * Register entity and all descendants
   */
  private registerEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
    for (const child of entity.children) {
      this.registerEntity(child);
    }
  }

  /**
   * Remove entity from scene
   */
  removeEntity(entity: Entity): boolean {
    if (entity.parent) {
      entity.parent.removeChild(entity);
      this.unregisterEntity(entity);
      return true;
    }
    return false;
  }

  /**
   * Unregister entity and all descendants
   */
  private unregisterEntity(entity: Entity): void {
    this.entities.delete(entity.id);
    for (const child of entity.children) {
      this.unregisterEntity(child);
    }
  }

  /**
   * Find entity by ID
   */
  getEntityById(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Find entity by name
   */
  getEntityByName(name: string): Entity | null {
    return this.root.findByName(name);
  }

  /**
   * Get all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Clear scene
   */
  clear(): void {
    this.root.children = [];
    this.entities.clear();
    this.entities.set(this.root.id, this.root);
  }

  /**
   * Serialize scene to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      root: this.root.toJSON(),
    };
  }

  /**
   * Create scene from JSON
   */
  static fromJSON(data: any): Scene {
    const scene = new Scene(data.name, data.id);
    scene.root = Entity.fromJSON(data.root);
    
    // Re-register all entities
    const registerAll = (entity: Entity) => {
      scene.entities.set(entity.id, entity);
      for (const child of entity.children) {
        registerAll(child);
      }
    };
    registerAll(scene.root);

    return scene;
  }
}
