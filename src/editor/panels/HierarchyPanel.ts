import { Scene, Entity } from '@engine';

export class HierarchyPanel {
  private scene: Scene;
  private container: HTMLElement;
  private selectedEntity: Entity | null = null;
  private onSelect: (entity: Entity) => void;
  private onContextMenu: (entity: Entity, x: number, y: number) => void;
  private expandedEntities: Set<string> = new Set();

  constructor(
    scene: Scene,
    onSelect: (entity: Entity) => void,
    onContextMenu: (entity: Entity, x: number, y: number) => void
  ) {
    this.scene = scene;
    this.onSelect = onSelect;
    this.onContextMenu = onContextMenu;
    this.container = document.getElementById('hierarchy-panel') as HTMLElement;
    
    this.refresh();
  }

  setSelected(entity: Entity): void {
    this.selectedEntity = entity;
    this.refresh();
  }

  refresh(): void {
    this.container.innerHTML = '';
    this.renderEntity(this.scene.root, 0);
  }

  private renderEntity(entity: Entity, depth: number): void {
    const div = document.createElement('div');
    div.style.marginLeft = `${depth * 12}px`;
    div.className = `tree-item ${this.selectedEntity?.id === entity.id ? 'selected' : ''}`;

    // Toggle button (if has children)
    if (entity.children.length > 0) {
      const toggleBtn = document.createElement('span');
      toggleBtn.className = 'tree-item-toggle';
      toggleBtn.textContent = this.expandedEntities.has(entity.id) ? '🔽' : '▶';
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        if (this.expandedEntities.has(entity.id)) {
          this.expandedEntities.delete(entity.id);
        } else {
          this.expandedEntities.add(entity.id);
        }
        this.refresh();
      };
      div.appendChild(toggleBtn);
    } else {
      const spacer = document.createElement('span');
      spacer.className = 'tree-item-toggle';
      spacer.textContent = '';
      div.appendChild(spacer);
    }

    // Icon
    const icon = document.createElement('span');
    icon.className = 'tree-item-icon';
    icon.textContent = entity.children.length > 0 ? '📁' : '●';
    div.appendChild(icon);

    // Name
    const name = document.createElement('span');
    name.className = 'tree-item-name';
    name.textContent = entity.name;
    div.appendChild(name);

    // Click handler
    div.onclick = () => this.onSelect(entity);
    div.oncontextmenu = (e) => {
      e.preventDefault();
      this.onContextMenu(entity, e.clientX, e.clientY);
    };

    this.container.appendChild(div);

    // Render children
    if (this.expandedEntities.has(entity.id)) {
      for (const child of entity.children) {
        this.renderEntity(child, depth + 1);
      }
    }
  }
}
