import { Entity, ParticleSystem } from '@engine';

export class ParticleSystemEditor {
  private container: HTMLElement | null = null;
  private currentEntity: Entity | null = null;

  constructor() {
    this.container = document.getElementById('particles-panel');
  }

  editParticleSystem(entity: Entity): void {
    this.currentEntity = entity;
    if (!this.container) return;

    this.container.innerHTML = '';

    let particleSystem = entity.getComponent<ParticleSystem>('particleSystem');
    if (!particleSystem) {
      particleSystem = new ParticleSystem();
      entity.addComponent('particleSystem', particleSystem);
    }

    const config = particleSystem.config;

    const panel = document.createElement('div');
    panel.className = 'property-group';
    panel.innerHTML = `
      <div class="property-group-title">Particle System</div>
      
      <div class="property-row">
        <span class="property-label">Max Particles:</span>
        <input type="number" class="property-input" id="ps-max" value="${config.maxParticles}" />
      </div>

      <div class="property-row">
        <span class="property-label">Emission Rate:</span>
        <input type="number" class="property-input" id="ps-rate" value="${config.emissionRate}" step="10" />
      </div>

      <div class="property-row">
        <span class="property-label">Lifetime:</span>
        <input type="number" class="property-input" id="ps-lifetime" value="${config.lifetime}" step="0.1" />
        <span class="property-unit">s</span>
      </div>

      <div class="property-row">
        <span class="property-label">Size:</span>
        <input type="number" class="property-input" id="ps-size" value="${config.size}" step="0.01" />
      </div>

      <div class="property-row">
        <button style="width: 100%; padding: 8px; background: #0098ff; color: white; border: none; border-radius: 2px; cursor: pointer;">Test Particles</button>
      </div>
    `;

    this.container.appendChild(panel);

    // Event listeners
    const maxInput = panel.querySelector('#ps-max') as HTMLInputElement;
    const rateInput = panel.querySelector('#ps-rate') as HTMLInputElement;
    const lifetimeInput = panel.querySelector('#ps-lifetime') as HTMLInputElement;
    const sizeInput = panel.querySelector('#ps-size') as HTMLInputElement;
    const testBtn = panel.querySelector('button') as HTMLButtonElement;

    maxInput.addEventListener('change', () => {
      config.maxParticles = parseInt(maxInput.value);
    });

    rateInput.addEventListener('change', () => {
      config.emissionRate = parseFloat(rateInput.value);
    });

    lifetimeInput.addEventListener('change', () => {
      config.lifetime = parseFloat(lifetimeInput.value);
    });

    sizeInput.addEventListener('change', () => {
      config.size = parseFloat(sizeInput.value);
    });

    testBtn.addEventListener('click', () => {
      particleSystem!.emit(50);
    });
  }
}
