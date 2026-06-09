import { Entity } from '@engine';

export class MultiSelect {
  private selected: Set<string> = new Set();
  private onSelectionChanged: (entities: string[]) => void = () => {};

  add(entityId: string): void {
    this.selected.add(entityId);
    this.notifyChanged();
  }

  remove(entityId: string): void {
    this.selected.delete(entityId);
    this.notifyChanged();
  }

  toggle(entityId: string): void {
    if (this.selected.has(entityId)) {
      this.selected.delete(entityId);
    } else {
      this.selected.add(entityId);
    }
    this.notifyChanged();
  }

  clear(): void {
    this.selected.clear();
    this.notifyChanged();
  }

  isSelected(entityId: string): boolean {
    return this.selected.has(entityId);
  }

  getSelected(): string[] {
    return Array.from(this.selected);
  }

  getCount(): number {
    return this.selected.size;
  }

  setOnSelectionChanged(callback: (entities: string[]) => void): void {
    this.onSelectionChanged = callback;
  }

  private notifyChanged(): void {
    this.onSelectionChanged(this.getSelected());
  }

  /**
   * Select all entities in a set
   */
  selectAll(entityIds: string[]): void {
    this.selected.clear();
    for (const id of entityIds) {
      this.selected.add(id);
    }
    this.notifyChanged();
  }
}
