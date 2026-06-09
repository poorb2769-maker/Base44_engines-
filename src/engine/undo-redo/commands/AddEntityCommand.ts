import { Command } from '../Command';
import { Scene } from '../../scene/Scene';
import { Entity } from '../../core/Entity';

export class AddEntityCommand extends Command {
  private scene: Scene;
  private entity: Entity;
  private parent: Entity;

  constructor(scene: Scene, entity: Entity, parent?: Entity) {
    super();
    this.scene = scene;
    this.entity = entity;
    this.parent = parent || scene.root;
  }

  execute(): void {
    this.scene.addEntity(this.entity, this.parent);
  }

  undo(): void {
    this.scene.removeEntity(this.entity);
  }

  redo(): void {
    this.execute();
  }

  getDescription(): string {
    return `Add ${this.entity.name}`;
  }
}
