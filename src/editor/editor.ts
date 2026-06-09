import * as THREE from 'three';
import { Scene, Entity, Transform, GLBLoader, CommandHistory, AddEntityCommand } from '@engine';
import { EditorViewport } from './viewport/EditorViewport';
import { HierarchyPanel } from './panels/HierarchyPanel';
import { InspectorPanel } from './panels/InspectorPanel';
import { EditorToolbar } from './toolbar/EditorToolbar';

class Editor {
  private scene: Scene;
  private commandHistory: CommandHistory;
  private viewport: EditorViewport;
  private hierarchyPanel: HierarchyPanel;
  private inspectorPanel: InspectorPanel;
  private toolbar: EditorToolbar;
  private selectedEntity: Entity | null = null;

  constructor() {
    this.scene = new Scene('Untitled Scene');
    this.commandHistory = new CommandHistory();
    
    // Initialize UI components
    this.viewport = new EditorViewport(this.scene, this.onEntitySelected.bind(this));
    this.hierarchyPanel = new HierarchyPanel(this.scene, this.onHierarchySelect.bind(this), this.onHierarchyContextMenu.bind(this));
    this.inspectorPanel = new InspectorPanel();
    this.toolbar = new EditorToolbar(
      this.onAddCube.bind(this),
      this.onAddEmpty.bind(this),
      this.onLoadGLB.bind(this),
      this.onUndo.bind(this),
      this.onRedo.bind(this),
      this.onDelete.bind(this),
      this.onDuplicate.bind(this),
      this.onSaveScene.bind(this),
      this.onLoadScene.bind(this)
    );

    this.updateUI();
  }

  private onEntitySelected(entity: Entity): void {
    this.selectedEntity = entity;
    this.hierarchyPanel.setSelected(entity);
    this.inspectorPanel.updateInspector(entity);
    this.viewport.highlightEntity(entity);
  }

  private onHierarchySelect(entity: Entity): void {
    this.onEntitySelected(entity);
  }

  private onHierarchyContextMenu(entity: Entity, x: number, y: number): void {
    // Context menu implementation
  }

  private onAddCube(): void {
    const entity = new Entity('Cube');
    const transform = new Transform();
    entity.addComponent('transform', transform);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);
    entity.addComponent('mesh', { type: 'cube', object3d: mesh });

    const command = new AddEntityCommand(this.scene, entity, this.scene.root);
    this.commandHistory.execute(command);

    this.viewport.addMesh(entity, mesh);
    this.hierarchyPanel.refresh();
    this.onEntitySelected(entity);
    this.updateUI();
  }

  private onAddEmpty(): void {
    const entity = new Entity('Empty');
    const transform = new Transform();
    entity.addComponent('transform', transform);

    const command = new AddEntityCommand(this.scene, entity, this.scene.root);
    this.commandHistory.execute(command);

    this.hierarchyPanel.refresh();
    this.onEntitySelected(entity);
    this.updateUI();
  }

  private async onLoadGLB(): void {
    const fileInput = document.getElementById('glb-file-input') as HTMLInputElement;
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const loader = new GLBLoader();
        const { entity, object } = await loader.loadGLBFromFile(file, file.name);
        
        const command = new AddEntityCommand(this.scene, entity, this.scene.root);
        this.commandHistory.execute(command);

        this.viewport.addMesh(entity, object);
        this.hierarchyPanel.refresh();
        this.onEntitySelected(entity);
        this.updateUI();
      } catch (error) {
        console.error('Failed to load GLB:', error);
        alert('Failed to load GLB file');
      }
    };
    fileInput.click();
  }

  private onUndo(): void {
    if (this.commandHistory.undo()) {
      this.viewport.refresh();
      this.hierarchyPanel.refresh();
      this.inspectorPanel.clear();
      this.selectedEntity = null;
      this.updateUI();
    }
  }

  private onRedo(): void {
    if (this.commandHistory.redo()) {
      this.viewport.refresh();
      this.hierarchyPanel.refresh();
      this.inspectorPanel.clear();
      this.selectedEntity = null;
      this.updateUI();
    }
  }

  private onDelete(): void {
    // Delete implementation
  }

  private onDuplicate(): void {
    // Duplicate implementation
  }

  private onSaveScene(): void {
    // Save implementation
  }

  private onLoadScene(): void {
    // Load implementation
  }

  private updateUI(): void {
    this.toolbar.updateButtons(this.commandHistory.canUndo(), this.commandHistory.canRedo(), this.selectedEntity !== null);
  }
}

// Initialize editor when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Editor();
  });
} else {
  new Editor();
}
