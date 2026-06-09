import { Command } from './Command';

export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  /**
   * Execute a command and add to history
   */
  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack when new command is executed
  }

  /**
   * Undo last command
   */
  undo(): boolean {
    if (this.undoStack.length === 0) return false;

    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
    return true;
  }

  /**
   * Redo last undone command
   */
  redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const command = this.redoStack.pop()!;
    command.redo();
    this.undoStack.push(command);
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get undo stack size
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get redo stack size
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Get last undo command description
   */
  getLastUndoDescription(): string {
    if (this.undoStack.length === 0) return '';
    return this.undoStack[this.undoStack.length - 1].getDescription();
  }

  /**
   * Get last redo command description
   */
  getLastRedoDescription(): string {
    if (this.redoStack.length === 0) return '';
    return this.redoStack[this.redoStack.length - 1].getDescription();
  }
}
