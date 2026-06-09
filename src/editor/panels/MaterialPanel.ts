import { Entity, Material } from '@engine';
import { MaterialManager } from '../managers/MaterialManager';

export class MaterialPanel {
  private container: HTMLElement | null = null;
  private currentEntity: Entity | null = null;

  constructor() {
    this.container = document.getElementById('material-panel');
  }

  updatePanel(entity: Entity): void {
    this.currentEntity = entity;
    if (!this.container) return;

    this.container.innerHTML = '';

    let material = entity.getComponent<Material>('material');
    if (!material) {
      material = MaterialManager.createMaterial();
      entity.addComponent('material', material);
    }

    const matGroup = document.createElement('div');
    matGroup.className = 'property-group';
    matGroup.innerHTML = `
      <div class="property-group-title">Material</div>
      
      <div class="property-row">
        <span class="property-label">Color:</span>
        <input type="color" class="property-input" id="mat-color" value="#${material.color.toString(16).padStart(6, '0')}" />
      </div>

      <div class="property-row">
        <span class="property-label">Metalness:</span>
        <input type="range" class="property-input" id="mat-metalness" min="0" max="1" step="0.1" value="${material.metalness}" />
        <span class="property-unit">${(material.metalness * 100).toFixed(0)}%</span>
      </div>

      <div class="property-row">
        <span class="property-label">Roughness:</span>
        <input type="range" class="property-input" id="mat-roughness" min="0" max="1" step="0.1" value="${material.roughness}" />
        <span class="property-unit">${(material.roughness * 100).toFixed(0)}%</span>
      </div>

      <div class="property-row">
        <span class="property-label">Emissive:</span>
        <input type="color" class="property-input" id="mat-emissive" value="#${material.emissive.toString(16).padStart(6, '0')}" />
      </div>

      <div class="property-row">
        <span class="property-label">Emissive Int:</span>
        <input type="range" class="property-input" id="mat-emissive-int" min="0" max="2" step="0.1" value="${material.emissiveIntensity}" />
        <span class="property-unit">${material.emissiveIntensity.toFixed(1)}x</span>
      </div>
    `;

    this.container.appendChild(matGroup);

    // Event listeners
    const colorInput = matGroup.querySelector('#mat-color') as HTMLInputElement;
    const metalnessInput = matGroup.querySelector('#mat-metalness') as HTMLInputElement;
    const roughnessInput = matGroup.querySelector('#mat-roughness') as HTMLInputElement;
    const emissiveInput = matGroup.querySelector('#mat-emissive') as HTMLInputElement;
    const emissiveIntInput = matGroup.querySelector('#mat-emissive-int') as HTMLInputElement;

    colorInput?.addEventListener('change', (e) => {
      const hex = (e.target as HTMLInputElement).value.replace('#', '');
      material!.color = parseInt(hex, 16);
    });

    metalnessInput?.addEventListener('input', (e) => {
      material!.metalness = parseFloat((e.target as HTMLInputElement).value);
    });

    roughnessInput?.addEventListener('input', (e) => {
      material!.roughness = parseFloat((e.target as HTMLInputElement).value);
    });

    emissiveInput?.addEventListener('change', (e) => {
      const hex = (e.target as HTMLInputElement).value.replace('#', '');
      material!.emissive = parseInt(hex, 16);
    });

    emissiveIntInput?.addEventListener('input', (e) => {
      material!.emissiveIntensity = parseFloat((e.target as HTMLInputElement).value);
    });
  }
}
