/**
 * Base class for all commands that can be undone/redone
 */
export abstract class Command {
  abstract execute(): void;
  abstract undo(): void;
  abstract redo(): void;

  /**
   * Optional: Get a description of this command for UI display
   */
  getDescription(): string {
    return this.constructor.name;
  }
}
