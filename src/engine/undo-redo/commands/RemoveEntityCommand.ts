import { Command } from '../Command';
import { Scene } from '../../scene/Scene';
import { Entity } from '../../core/Entity';

export class RemoveEntityCommand extends Command {
  private scene: Scene;
  private entity: Entity;
  private parent: Entity | null;
  private childIndex: number;

  constructor(scene: Scene, entity: Entity) {
    super();
    this.scene = scene;
    this.entity = entity;
    this.parent = entity.parent;
    this.childIndex = this.parent?.children.indexOf(entity) ?? -1;
  }

  execute(): void {
    this.scene.removeEntity(this.entity);
  }

  undo(): void {
    if (this.parent) {
      this.parent.children.splice(this.childIndex, 0, this.entity);
      this.entity.parent = this.parent;
      // Re-register entity
      const registerAll = (entity: Entity) => {
        this.scene['entities'].set(entity.id, entity);
        for (const child of entity.children) {
          registerAll(child);
        }
      };
      registerAll(this.entity);
    }
  }

  redo(): void {
    this.execute();
  }

  getDescription(): string {
    return `Remove ${this.entity.name}`;
  }
}
