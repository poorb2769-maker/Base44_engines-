import { Command } from '../Command';
import { Scene } from '../../scene/Scene';
import { Entity } from '../../core/Entity';
import { v4 as uuidv4 } from 'uuid';

export class DuplicateEntityCommand extends Command {
  private scene: Scene;
  private originalEntity: Entity;
  private duplicatedEntity: Entity | null = null;
  private parent: Entity;

  constructor(scene: Scene, entity: Entity) {
    super();
    this.scene = scene;
    this.originalEntity = entity;
    this.parent = entity.parent || scene.root;
  }

  private cloneEntity(entity: Entity): Entity {
    const cloned = new Entity(entity.name + ' (Copy)', uuidv4());
    cloned.active = entity.active;

    // Clone components
    for (const [type, component] of entity.components.entries()) {
      const componentCopy = JSON.parse(JSON.stringify(component));
      cloned.addComponent(type, componentCopy);
    }

    // Clone children recursively
    for (const child of entity.children) {
      const clonedChild = this.cloneEntity(child);
      cloned.addChild(clonedChild);
    }

    return cloned;
  }

  execute(): void {
    this.duplicatedEntity = this.cloneEntity(this.originalEntity);
    this.scene.addEntity(this.duplicatedEntity, this.parent);
  }

  undo(): void {
    if (this.duplicatedEntity) {
      this.scene.removeEntity(this.duplicatedEntity);
    }
  }

  redo(): void {
    if (this.duplicatedEntity) {
      this.scene.addEntity(this.duplicatedEntity, this.parent);
    }
  }

  getDuplicatedEntity(): Entity | null {
    return this.duplicatedEntity;
  }

  getDescription(): string {
    return `Duplicate ${this.originalEntity.name}`;
  }
}
