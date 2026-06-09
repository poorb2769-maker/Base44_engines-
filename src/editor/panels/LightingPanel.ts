import { Scene, Entity, Light, LightType } from '@engine';
import { EditorViewport } from '../viewport/EditorViewport';
import { LightRenderer } from '../viewport/LightRenderer';

export class LightingPanel {
  private scene: Scene;
  private viewport: EditorViewport;
  private container: HTMLElement | null = null;
  private lightRenderer: LightRenderer;
  private onChanged: () => void;

  constructor(scene: Scene, viewport: EditorViewport, onChanged?: () => void) {
    this.scene = scene;
    this.viewport = viewport;
    this.lightRenderer = new LightRenderer(viewport.getThreeScene());
    this.container = document.getElementById('lighting-panel');
    this.onChanged = onChanged || (() => {});
  }

  showLightCreationMenu(): void {
    if (!this.container) return;

    const menu = document.createElement('div');
    menu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #252526;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      padding: 20px;
      z-index: 1000;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
    `;

    menu.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 12px; color: #cccccc;">Create Light</div>
      <button class="toolbar-button" style="display: block; width: 100%; text-align: left; margin-bottom: 8px;">💡 Point Light</button>
      <button class="toolbar-button" style="display: block; width: 100%; text-align: left; margin-bottom: 8px;">☀️ Directional Light</button>
      <button class="toolbar-button" style="display: block; width: 100%; text-align: left;">🔦 Spot Light</button>
    `;

    const buttons = menu.querySelectorAll('button');
    buttons[0].addEventListener('click', () => this.createPointLight(menu));
    buttons[1].addEventListener('click', () => this.createDirectionalLight(menu));
    buttons[2].addEventListener('click', () => this.createSpotLight(menu));

    document.body.appendChild(menu);
  }

  private createPointLight(menu: HTMLElement): void {
    const entity = new Entity('Point Light');
    const light = new Light({ type: LightType.POINT, intensity: 1, color: 0xffffff });
    entity.addComponent('light', light);
    entity.addComponent('transform', new Transform());

    this.scene.addEntity(entity);
    const threeLight = this.lightRenderer.createThreeLight(entity);
    document.body.removeChild(menu);
    this.onChanged();
  }

  private createDirectionalLight(menu: HTMLElement): void {
    const entity = new Entity('Directional Light');
    const light = new Light({ type: LightType.DIRECTIONAL, intensity: 0.8, color: 0xffffff });
    entity.addComponent('light', light);
    entity.addComponent('transform', new Transform([0, 10, 0]));

    this.scene.addEntity(entity);
    const threeLight = this.lightRenderer.createThreeLight(entity);
    document.body.removeChild(menu);
    this.onChanged();
  }

  private createSpotLight(menu: HTMLElement): void {
    const entity = new Entity('Spot Light');
    const light = new Light({ type: LightType.SPOT, intensity: 1, color: 0xffffff });
    entity.addComponent('light', light);
    entity.addComponent('transform', new Transform());

    this.scene.addEntity(entity);
    const threeLight = this.lightRenderer.createThreeLight(entity);
    document.body.removeChild(menu);
    this.onChanged();
  }
}

import { Transform } from '@engine';
