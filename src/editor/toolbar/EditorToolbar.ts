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
    onLoadScene: () => void,
    onExportWebGL: () => void,
    onAddLight: () => void,
    onSaveAsPreset: () => void,
    onRotateMode: () => void,
    onScaleMode: () => void
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
      onLoadScene,
      onExportWebGL,
      onAddLight,
      onSaveAsPreset,
      onRotateMode,
      onScaleMode
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
    onLoadScene: () => void,
    onExportWebGL: () => void,
    onAddLight: () => void,
    onSaveAsPreset: () => void,
    onRotateMode: () => void,
    onScaleMode: () => void
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

    btnAddCube?.addEventListener('click', onAddCube);
    btnAddEmpty?.addEventListener('click', onAddEmpty);
    btnLoadGLB?.addEventListener('click', onLoadGLB);
    btnUndo?.addEventListener('click', onUndo);
    btnRedo?.addEventListener('click', onRedo);
    btnDelete?.addEventListener('click', onDelete);
    btnDuplicate?.addEventListener('click', onDuplicate);
    btnSaveScene?.addEventListener('click', onSaveScene);
    btnLoadScene?.addEventListener('click', onLoadScene);

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
