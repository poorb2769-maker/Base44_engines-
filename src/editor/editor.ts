import * as THREE from 'three';
import { Scene, Entity, Transform, GLBLoader, CommandHistory, AddEntityCommand, DeleteEntityCommand, DuplicateEntityCommand } from '@engine';
import { EditorViewport } from './viewport/EditorViewport';
import { HierarchyPanel } from './panels/HierarchyPanel';
import { InspectorPanel } from './panels/InspectorPanel';
import { EditorToolbar } from './toolbar/EditorToolbar';
import { TransformGizmo } from './viewport/TransformGizmo';
import { SceneSerializer } from '@engine';

class Editor {
  private scene: Scene;
  private commandHistory: CommandHistory;
  private viewport: EditorViewport;
  private hierarchyPanel: HierarchyPanel;
  private inspectorPanel: InspectorPanel;
  private toolbar: EditorToolbar;
  private transformGizmo: TransformGizmo;
  private selectedEntity: Entity | null = null;

  constructor() {
    this.scene = new Scene('Untitled Scene');
    this.commandHistory = new CommandHistory();
    
    // Initialize UI components
    this.viewport = new EditorViewport(this.scene, this.onEntitySelected.bind(this));
    this.transformGizmo = new TransformGizmo(this.viewport);
    this.hierarchyPanel = new HierarchyPanel(this.scene, this.onHierarchySelect.bind(this), this.onHierarchyContextMenu.bind(this));
    this.inspectorPanel = new InspectorPanel(this.onPropertyChanged.bind(this));
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

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    this.updateUI();
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          this.onUndo();
        } else if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) {
          e.preventDefault();
          this.onRedo();
        } else if (e.key === 'd') {
          e.preventDefault();
          this.onDuplicate();
        } else if (e.key === 's') {
          e.preventDefault();
          this.onSaveScene();
        }
      } else if (e.key === 'Delete') {
        e.preventDefault();
        this.onDelete();
      }
    });
  }

  private onEntitySelected(entity: Entity): void {
    this.selectedEntity = entity;
    this.hierarchyPanel.setSelected(entity);
    this.inspectorPanel.updateInspector(entity);
    this.viewport.highlightEntity(entity);
    this.transformGizmo.attachToEntity(entity);
    this.updateUI();
  }

  private onHierarchySelect(entity: Entity): void {
    this.onEntitySelected(entity);
  }

  private onHierarchyContextMenu(entity: Entity, x: number, y: number): void {
    // Context menu implementation
  }

  private onPropertyChanged(): void {
    if (this.selectedEntity) {
      this.viewport.refresh();
      this.transformGizmo.updateGizmo();
    }
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
        const { entity, object } = await loader.loadGLBFromFile(file, file.name.replace('.glb', ''));
        
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

  private onDelete(): void {
    if (!this.selectedEntity || this.selectedEntity === this.scene.root) return;

    const command = new DeleteEntityCommand(this.scene, this.selectedEntity);
    this.commandHistory.execute(command);

    this.viewport.removeMesh(this.selectedEntity);
    this.viewport.refresh();
    this.hierarchyPanel.refresh();
    this.inspectorPanel.clear();
    this.transformGizmo.detach();
    this.selectedEntity = null;
    this.updateUI();
  }

  private onDuplicate(): void {
    if (!this.selectedEntity || this.selectedEntity === this.scene.root) return;

    const command = new DuplicateEntityCommand(this.scene, this.selectedEntity);
    this.commandHistory.execute(command);

    const duplicated = (command as any).getDuplicatedEntity();
    if (duplicated) {
      // Add mesh to viewport
      const mesh = duplicated.getComponent<any>('mesh');
      if (mesh && mesh.object3d) {
        this.viewport.addMesh(duplicated, mesh.object3d);
      }

      this.hierarchyPanel.refresh();
      this.onEntitySelected(duplicated);
      this.updateUI();
    }
  }

  private onUndo(): void {
    if (this.commandHistory.undo()) {
      this.viewport.refresh();
      this.hierarchyPanel.refresh();
      this.inspectorPanel.clear();
      this.transformGizmo.detach();
      this.selectedEntity = null;
      this.updateUI();
    }
  }

  private onRedo(): void {
    if (this.commandHistory.redo()) {
      this.viewport.refresh();
      this.hierarchyPanel.refresh();
      this.inspectorPanel.clear();
      this.transformGizmo.detach();
      this.selectedEntity = null;
      this.updateUI();
    }
  }

  private onSaveScene(): void {
    try {
      const serializer = new SceneSerializer();
      serializer.downloadSceneFile(this.scene);
      console.log('Scene saved successfully');
    } catch (error) {
      console.error('Failed to save scene:', error);
      alert('Failed to save scene');
    }
  }

  private onLoadScene(): void {
    const fileInput = document.getElementById('scene-file-input') as HTMLInputElement;
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const serializer = new SceneSerializer();
        const loadedScene = await serializer.loadSceneFromFile(file);
        
        // Clear current scene
        this.scene.clear();
        this.viewport.clear();
        this.commandHistory.clear();

        // Replace with loaded scene
        this.scene = loadedScene;
        
        // Rebuild viewport
        const rebuildMeshes = (entity: Entity) => {
          const mesh = entity.getComponent<any>('mesh');
          if (mesh && mesh.object3d) {
            this.viewport.addMesh(entity, mesh.object3d);
          }
          for (const child of entity.children) {
            rebuildMeshes(child);
          }
        };
        rebuildMeshes(this.scene.root);

        this.hierarchyPanel.refresh();
        this.inspectorPanel.clear();
        this.transformGizmo.detach();
        this.selectedEntity = null;
        this.updateUI();
        
        console.log('Scene loaded successfully');
      } catch (error) {
        console.error('Failed to load scene:', error);
        alert('Failed to load scene');
      }
    };
    fileInput.click();
  }

  private updateUI(): void {
    this.toolbar.updateButtons(
      this.commandHistory.canUndo(),
      this.commandHistory.canRedo(),
      this.selectedEntity !== null && this.selectedEntity !== this.scene.root
    );
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
