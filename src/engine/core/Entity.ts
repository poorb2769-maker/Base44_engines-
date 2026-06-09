import { v4 as uuidv4 } from 'uuid';

export interface IComponent {
  type: string;
}

export class Entity {
  id: string;
  name: string;
  parent: Entity | null = null;
  children: Entity[] = [];
  components: Map<string, IComponent> = new Map();
  active: boolean = true;

  constructor(name: string = 'Entity', id?: string) {
    this.id = id || uuidv4();
    this.name = name;
  }

  /**
   * Add a component to this entity
   */
  addComponent<T extends IComponent>(type: string, component: T): T {
    this.components.set(type, component);
    return component;
  }

  /**
   * Get a component by type
   */
  getComponent<T extends IComponent>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  /**
   * Check if entity has a component
   */
  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * Remove a component
   */
  removeComponent(type: string): boolean {
    return this.components.delete(type);
  }

  /**
   * Add child entity
   */
  addChild(entity: Entity): void {
    if (entity.parent) {
      entity.parent.removeChild(entity);
    }
    entity.parent = this;
    this.children.push(entity);
  }

  /**
   * Remove child entity
   */
  removeChild(entity: Entity): boolean {
    const index = this.children.indexOf(entity);
    if (index !== -1) {
      entity.parent = null;
      this.children.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all children recursively
   */
  getDescendants(): Entity[] {
    const descendants: Entity[] = [];
    for (const child of this.children) {
      descendants.push(child);
      descendants.push(...child.getDescendants());
    }
    return descendants;
  }

  /**
   * Find entity by name in hierarchy
   */
  findByName(name: string): Entity | null {
    if (this.name === name) return this;
    
    for (const child of this.children) {
      const found = child.findByName(name);
      if (found) return found;
    }
    return null;
  }

  /**
   * Serialize entity to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      active: this.active,
      components: Object.fromEntries(this.components),
      children: this.children.map(child => child.toJSON()),
    };
  }

  /**
   * Create entity from JSON
   */
  static fromJSON(data: any): Entity {
    const entity = new Entity(data.name, data.id);
    entity.active = data.active ?? true;

    // Restore components
    if (data.components) {
      for (const [type, component] of Object.entries(data.components)) {
        entity.addComponent(type, component as IComponent);
      }
    }

    // Restore children recursively
    if (data.children) {
      for (const childData of data.children) {
        const child = Entity.fromJSON(childData);
        entity.addChild(child);
      }
    }

    return entity;
  }
}
