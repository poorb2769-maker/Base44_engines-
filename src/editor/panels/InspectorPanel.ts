import { Entity, Transform } from '@engine';

export class InspectorPanel {
  private container: HTMLElement;
  private currentEntity: Entity | null = null;

  constructor() {
    this.container = document.getElementById('inspector-panel') as HTMLElement;
  }

  updateInspector(entity: Entity): void {
    this.currentEntity = entity;
    this.container.innerHTML = '';

    // Entity Info
    const infoGroup = document.createElement('div');
    infoGroup.className = 'property-group';
    infoGroup.innerHTML = `
      <div class="property-group-title">Entity</div>
      <div class="property-row">
        <span class="property-label">Name:</span>
        <input type="text" class="property-input" value="${entity.name}" id="entity-name" />
      </div>
      <div class="property-row">
        <span class="property-label">ID:</span>
        <span style="font-size: 11px; color: #858585; font-family: monospace;">${entity.id.substring(0, 8)}...</span>
      </div>
    `;
    this.container.appendChild(infoGroup);

    // Entity name change listener
    const nameInput = infoGroup.querySelector('#entity-name') as HTMLInputElement;
    nameInput.addEventListener('change', (e) => {
      entity.name = (e.target as HTMLInputElement).value;
    });

    // Transform Component
    const transform = entity.getComponent<Transform>('transform');
    if (transform) {
      const transformGroup = document.createElement('div');
      transformGroup.className = 'property-group';
      transformGroup.innerHTML = `
        <div class="property-group-title">Transform</div>
        
        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; color: #858585; margin-bottom: 4px;">Position</div>
          <div class="property-row">
            <span class="property-label">X:</span>
            <input type="number" class="property-input" value="${transform.position.x.toFixed(2)}" step="0.1" data-field="posX" />
            <span class="property-unit">m</span>
          </div>
          <div class="property-row">
            <span class="property-label">Y:</span>
            <input type="number" class="property-input" value="${transform.position.y.toFixed(2)}" step="0.1" data-field="posY" />
            <span class="property-unit">m</span>
          </div>
          <div class="property-row">
            <span class="property-label">Z:</span>
            <input type="number" class="property-input" value="${transform.position.z.toFixed(2)}" step="0.1" data-field="posZ" />
            <span class="property-unit">m</span>
          </div>
        </div>

        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; color: #858585; margin-bottom: 4px;">Scale</div>
          <div class="property-row">
            <span class="property-label">X:</span>
            <input type="number" class="property-input" value="${transform.scale.x.toFixed(2)}" step="0.1" data-field="scaleX" />
            <span class="property-unit">m</span>
          </div>
          <div class="property-row">
            <span class="property-label">Y:</span>
            <input type="number" class="property-input" value="${transform.scale.y.toFixed(2)}" step="0.1" data-field="scaleY" />
            <span class="property-unit">m</span>
          </div>
          <div class="property-row">
            <span class="property-label">Z:</span>
            <input type="number" class="property-input" value="${transform.scale.z.toFixed(2)}" step="0.1" data-field="scaleZ" />
            <span class="property-unit">m</span>
          </div>
        </div>
      `;
      this.container.appendChild(transformGroup);

      // Add change listeners for transform inputs
      const inputs = transformGroup.querySelectorAll('input[data-field]');
      inputs.forEach((input: Element) => {
        const field = (input as HTMLInputElement).dataset.field;
        (input as HTMLInputElement).addEventListener('change', (e) => {
          const value = parseFloat((e.target as HTMLInputElement).value);
          if (field === 'posX') transform.position.x = value;
          else if (field === 'posY') transform.position.y = value;
          else if (field === 'posZ') transform.position.z = value;
          else if (field === 'scaleX') transform.scale.x = value;
          else if (field === 'scaleY') transform.scale.y = value;
          else if (field === 'scaleZ') transform.scale.z = value;
        });
      });
    }
  }

  clear(): void {
    this.container.innerHTML = '';
    this.currentEntity = null;
  }
}
