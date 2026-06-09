import { CommandHistory } from '@engine';

export class EditorToolbar {
  private buttons: Map<string, HTMLElement> = new Map();

  constructor(
    onAddCube: () => void,
    onAddEmpty: () => void,
    onLoadGLB: () => void,
    onUndo: () => void,
    onRedo: () => void,
    onDelete: () => void,
    onDuplicate: () => void,
    onSaveScene: () => void,
    onLoadScene: () => void
  ) {
    this.setupButtons(
      onAddCube,
      onAddEmpty,
      onLoadGLB,
      onUndo,
      onRedo,
      onDelete,
      onDuplicate,
      onSaveScene,
      onLoadScene
    );
  }

  private setupButtons(
    onAddCube: () => void,
    onAddEmpty: () => void,
    onLoadGLB: () => void,
    onUndo: () => void,
    onRedo: () => void,
    onDelete: () => void,
    onDuplicate: () => void,
    onSaveScene: () => void,
    onLoadScene: () => void
  ): void {
    const btnAddCube = document.getElementById('btn-add-cube') as HTMLElement;
    const btnAddEmpty = document.getElementById('btn-add-empty') as HTMLElement;
    const btnLoadGLB = document.getElementById('btn-load-glb') as HTMLElement;
    const btnUndo = document.getElementById('btn-undo') as HTMLElement;
    const btnRedo = document.getElementById('btn-redo') as HTMLElement;
    const btnDelete = document.getElementById('btn-delete') as HTMLElement;
    const btnDuplicate = document.getElementById('btn-duplicate') as HTMLElement;
    const btnSaveScene = document.getElementById('btn-save') as HTMLElement;
    const btnLoadScene = document.getElementById('btn-load') as HTMLElement;

    btnAddCube.onclick = onAddCube;
    btnAddEmpty.onclick = onAddEmpty;
    btnLoadGLB.onclick = onLoadGLB;
    btnUndo.onclick = onUndo;
    btnRedo.onclick = onRedo;
    btnDelete.onclick = onDelete;
    btnDuplicate.onclick = onDuplicate;
    btnSaveScene.onclick = onSaveScene;
    btnLoadScene.onclick = onLoadScene;

    this.buttons.set('undo', btnUndo);
    this.buttons.set('redo', btnRedo);
    this.buttons.set('delete', btnDelete);
    this.buttons.set('duplicate', btnDuplicate);
  }

  updateButtons(canUndo: boolean, canRedo: boolean, hasSelection: boolean): void {
    const undoBtn = this.buttons.get('undo');
    const redoBtn = this.buttons.get('redo');
    const deleteBtn = this.buttons.get('delete');
    const duplicateBtn = this.buttons.get('duplicate');

    if (undoBtn) undoBtn.classList.toggle('disabled', !canUndo);
    if (redoBtn) redoBtn.classList.toggle('disabled', !canRedo);
    if (deleteBtn) deleteBtn.classList.toggle('disabled', !hasSelection);
    if (duplicateBtn) duplicateBtn.classList.toggle('disabled', !hasSelection);
  }
}
