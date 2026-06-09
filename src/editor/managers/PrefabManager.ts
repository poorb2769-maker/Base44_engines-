import { Scene, Entity } from '@engine';

export class PrefabManager {
  private prefabs: Map<string, Entity> = new Map();

  /**
   * Create prefab from entity
   */
  createPrefab(name: string, entity: Entity): void {
    // Deep clone entity
    const cloned = this.cloneEntity(entity);
    this.prefabs.set(name, cloned);
    this.persistPrefabs();
  }

  /**
   * Instantiate prefab
   */
  instantiate(prefabName: string): Entity | null {
    const prefab = this.prefabs.get(prefabName);
    if (!prefab) return null;
    return this.cloneEntity(prefab);
  }

  /**
   * Get all prefab names
   */
  getPrefabNames(): string[] {
    return Array.from(this.prefabs.keys());
  }

  /**
   * Delete prefab
   */
  deletePrefab(name: string): boolean {
    const result = this.prefabs.delete(name);
    this.persistPrefabs();
    return result;
  }

  private cloneEntity(entity: Entity): Entity {
    const cloned = new Entity(entity.name);
    cloned.active = entity.active;

    // Clone components
    for (const [type, component] of entity.components.entries()) {
      const componentCopy = JSON.parse(JSON.stringify(component));
      cloned.addComponent(type, componentCopy);
    }

    // Clone children
    for (const child of entity.children) {
      const clonedChild = this.cloneEntity(child);
      cloned.addChild(clonedChild);
    }

    return cloned;
  }

  private persistPrefabs(): void {
    try {
      const data = JSON.stringify(
        Array.from(this.prefabs.entries()).map(([name, entity]) => [name, entity.toJSON()])
      );
      localStorage.setItem('base44-engine-prefabs', data);
    } catch (e) {
      console.warn('Failed to persist prefabs:', e);
    }
  }

  loadPrefabsFromStorage(): void {
    try {
      const data = localStorage.getItem('base44-engine-prefabs');
      if (data) {
        const entries = JSON.parse(data);
        for (const [name, entityData] of entries) {
          this.prefabs.set(name, Entity.fromJSON(entityData));
        }
      }
    } catch (e) {
      console.warn('Failed to load prefabs:', e);
    }
  }
}
