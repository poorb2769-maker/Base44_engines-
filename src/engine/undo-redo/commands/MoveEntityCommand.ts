import { Command } from '../Command';
import { Entity } from '../../core/Entity';
import { Transform } from '../../core/Transform';

export class MoveEntityCommand extends Command {
  private entity: Entity;
  private oldPosition: [number, number, number];
  private newPosition: [number, number, number];

  constructor(
    entity: Entity,
    newPosition: [number, number, number]
  ) {
    super();
    this.entity = entity;
    const transform = entity.getComponent<Transform>('transform');
    this.oldPosition = transform?.getPositionArray() || [0, 0, 0];
    this.newPosition = newPosition;
  }

  execute(): void {
    const transform = this.entity.getComponent<Transform>('transform');
    if (transform) {
      transform.setPosition(...this.newPosition);
    }
  }

  undo(): void {
    const transform = this.entity.getComponent<Transform>('transform');
    if (transform) {
      transform.setPosition(...this.oldPosition);
    }
  }

  redo(): void {
    this.execute();
  }

  getDescription(): string {
    return `Move ${this.entity.name}`;
  }
}
