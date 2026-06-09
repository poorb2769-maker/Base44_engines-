import { Entity, Transform } from '@engine';

export class TransformGizmoAdvanced {
  private mode: 'translate' | 'rotate' | 'scale' = 'translate';
  private container: HTMLElement | null = null;

  setMode(mode: 'translate' | 'rotate' | 'scale'): void {
    this.mode = mode;
    this.updateModeUI();
  }

  getMode(): 'translate' | 'rotate' | 'scale' {
    return this.mode;
  }

  private updateModeUI(): void {
    // Update UI to show current mode
    const modeDisplay = document.getElementById('gizmo-mode');
    if (modeDisplay) {
      modeDisplay.textContent = `Mode: ${this.mode.toUpperCase()}`;
    }
  }

  /**
   * Apply rotation to entity
   */
  static rotateEntity(entity: Entity, x: number, y: number, z: number): void {
    const transform = entity.getComponent<Transform>('transform');
    if (transform) {
      transform.setRotationFromEuler(x, y, z);
    }
  }

  /**
   * Constrain value to grid
   */
  static snapToGrid(value: number, gridSize: number): number {
    return Math.round(value / gridSize) * gridSize;
  }
}
