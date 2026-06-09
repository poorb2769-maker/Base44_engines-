import * as THREE from 'three';
import { Scene, Entity, Transform, GLBLoader, CommandHistory, AddEntityCommand, DeleteEntityCommand, DuplicateEntityCommand, Light, LightType } from '@engine';
import { EditorViewport } from './viewport/EditorViewport';
import { HierarchyPanel } from './panels/HierarchyPanel';
import { InspectorPanel } from './panels/InspectorPanel';
import { EditorToolbar } from './toolbar/EditorToolbar';
import { TransformGizmo } from './viewport/TransformGizmo';
import { SceneSerializer } from '@engine';
import { MaterialPanel } from './panels/MaterialPanel';
import { LightingPanel } from './panels/LightingPanel';
import { AnimationTimeline } from './animation/AnimationTimeline';
import { LightRenderer } from './viewport/LightRenderer';
import { SceneExporter } from './export/SceneExporter';
import { PresetManager } from './managers/PresetManager';
import { MultiSelect } from './managers/MultiSelect';
import { PrefabManager } from './managers/PrefabManager';
import { ViewportSettings, GridSettings } from './settings/ViewportSettings';

class Editor {
  private scene: Scene;
  private commandHistory: CommandHistory;
  private viewport: EditorViewport;
  private hierarchyPanel: HierarchyPanel;
  private inspectorPanel: InspectorPanel;
  private materialPanel: MaterialPanel;
  private lightingPanel: LightingPanel;
  private animationTimeline: AnimationTimeline;
  private toolbar: EditorToolbar;
  private transformGizmo: TransformGizmo;
  private lightRenderer: LightRenderer;
  private selectedEntity: Entity | null = null;
  private presetManager: PresetManager;
  private multiSelect: MultiSelect;
  private prefabManager: PrefabManager;
  private viewportSettings: ViewportSettings;
  private lastFrameTime: number = 0;

  constructor() {
    this.scene = new Scene('Untitled Scene');
    this.commandHistory = new CommandHistory();
    this.presetManager = new PresetManager();
    this.multiSelect = new MultiSelect();
    this.prefabManager = new PrefabManager();
    this.viewportSettings = new ViewportSettings();
    
    // Load saved data
    this.presetManager.loadPresetsFromStorage();
    this.prefabManager.loadPrefabsFromStorage();

    // Initialize UI components
    this.viewport = new EditorViewport(this.scene, this.onEntitySelected.bind(this));
    this.lightRenderer = new LightRenderer(this.viewport.getThreeScene());
    this.transformGizmo = new TransformGizmo(this.viewport);
    this.hierarchyPanel = new HierarchyPanel(this.scene, this.onHierarchySelect.bind(this), this.onHierarchyContextMenu.bind(this));
    this.inspectorPanel = new InspectorPanel(this.onPropertyChanged.bind(this));
    this.materialPanel = new MaterialPanel();
    this.lightingPanel = new LightingPanel(this.scene, this.viewport, this.onLightingChanged.bind(this));
    this.animationTimeline = new AnimationTimeline('animation-timeline');
    this.toolbar = new EditorToolbar(
      this.onAddCube.bind(this),
      this.onAddEmpty.bind(this),
      this.onLoadGLB.bind(this),
      this.onUndo.bind(this),
      this.onRedo.bind(this),
      this.onDelete.bind(this),
      this.onDuplicate.bind(this),
      this.onSaveScene.bind(this),
      this.onLoadScene.bind(this),
      this.onExportWebGL.bind(this),
      this.onAddLight.bind(this),
      this.onSaveAsPreset.bind(this),
      this.onRotateMode.bind(this),
      this.onScaleMode.bind(this)
    );

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    this.setupMultiSelect();
    this.animationLoop();
    this.updateUI();
  }

  private setupMultiSelect(): void {
    this.multiSelect.setOnSelectionChanged((entityIds) => {
      // Update UI for multi-select
    });

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'a') {
          e.preventDefault();
          const allIds = this.scene.getAllEntities().map(e => e.id);
          this.multiSelect.selectAll(allIds);
        }
      }
    });
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
      } else if (e.key === 'g') {
        e.preventDefault();
        this.viewportSettings.gridSettings.snap = !this.viewportSettings.gridSettings.snap;
      } else if (e.key === 'w') {
        e.preventDefault();
        this.onTranslateMode();
      } else if (e.key === 'e') {
        e.preventDefault();
        this.onRotateMode();
      } else if (e.key === 'r') {
        e.preventDefault();
        this.onScaleMode();
      }
    });
  }

  private onEntitySelected(entity: Entity): void {
    this.selectedEntity = entity;
    this.multiSelect.clear();
    this.multiSelect.add(entity.id);
    this.hierarchyPanel.setSelected(entity);
    this.inspectorPanel.updateInspector(entity);
    this.materialPanel.updatePanel(entity);
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
      this.lightRenderer.updateLight(this.selectedEntity);
    }
  }

  private onLightingChanged(): void {
    this.viewport.refresh();
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

  private onAddLight(): void {
    this.lightingPanel.showLightCreationMenu();
  }

  private onDelete(): void {
    if (!this.selectedEntity || this.selectedEntity === this.scene.root) return;

    const command = new DeleteEntityCommand(this.scene, this.selectedEntity);
    this.commandHistory.execute(command);

    this.viewport.removeMesh(this.selectedEntity);
    this.lightRenderer.removeLight(this.selectedEntity.id);
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
      const mesh = duplicated.getComponent<any>('mesh');
      if (mesh && mesh.object3d) {
        this.viewport.addMesh(duplicated, mesh.object3d);
      }

      const light = duplicated.getComponent<Light>('light');
      if (light) {
        const threeLight = this.lightRenderer.createThreeLight(duplicated);
        if (threeLight) {
          this.viewport.addMesh(duplicated, threeLight);
        }
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
        
        this.scene.clear();
        this.viewport.clear();
        this.lightRenderer.clear();
        this.commandHistory.clear();

        this.scene = loadedScene;
        
        const rebuildMeshes = (entity: Entity) => {
          const mesh = entity.getComponent<any>('mesh');
          if (mesh && mesh.object3d) {
            this.viewport.addMesh(entity, mesh.object3d);
          }
          const light = entity.getComponent<Light>('light');
          if (light) {
            const threeLight = this.lightRenderer.createThreeLight(entity);
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

  private onExportWebGL(): void {
    const json = SceneExporter.exportToWebGL(this.scene, this.viewport);
    SceneExporter.downloadFile(json, `${this.scene.name}.json`, 'application/json');
    
    const html = SceneExporter.exportAsHTMLViewer(this.scene, this.viewport, this.scene.name);
    SceneExporter.downloadFile(html, `${this.scene.name}-viewer.html`, 'text/html');
  }

  private onSaveAsPreset(): void {
    if (!this.selectedEntity) return;
    const presetName = prompt('Enter preset name:');
    if (presetName) {
      this.presetManager.savePreset(presetName, this.selectedEntity.toJSON());
      console.log(`Preset '${presetName}' saved`);
    }
  }

  private onTranslateMode(): void {
    // Implementation for translate mode
  }

  private onRotateMode(): void {
    // Implementation for rotate mode
  }

  private onScaleMode(): void {
    // Implementation for scale mode
  }

  private animationLoop = (): void => {
    requestAnimationFrame(this.animationLoop);
    const now = performance.now() / 1000;
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    // Update animations, lights, etc.
  };

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
