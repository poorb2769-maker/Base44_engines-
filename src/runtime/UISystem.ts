import { IComponent } from '@engine';
import * as THREE from 'three';

export interface UIElement {
  type: 'button' | 'text' | 'image' | 'panel';
  position: [number, number];
  size: [number, number];
  text?: string;
  onClick?: () => void;
  visible: boolean;
}

export class UISystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private elements: Map<string, UIElement> = new Map();
  private scale: number = 1;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.setupEventListeners();
  }

  addButton(id: string, x: number, y: number, width: number, height: number, text: string, onClick?: () => void): UIElement {
    const element: UIElement = {
      type: 'button',
      position: [x, y],
      size: [width, height],
      text,
      onClick,
      visible: true,
    };
    this.elements.set(id, element);
    return element;
  }

  addText(id: string, x: number, y: number, text: string): UIElement {
    const element: UIElement = {
      type: 'text',
      position: [x, y],
      size: [0, 0],
      text,
      visible: true,
    };
    this.elements.set(id, element);
    return element;
  }

  removeElement(id: string): void {
    this.elements.delete(id);
  }

  updateElement(id: string, updates: Partial<UIElement>): void {
    const element = this.elements.get(id);
    if (element) {
      Object.assign(element, updates);
    }
  }

  render(): void {
    for (const element of this.elements.values()) {
      if (!element.visible) continue;

      switch (element.type) {
        case 'button':
          this.drawButton(element);
          break;
        case 'text':
          this.drawText(element);
          break;
      }
    }
  }

  private drawButton(element: UIElement): void {
    const [x, y] = element.position;
    const [w, h] = element.size;

    this.ctx.fillStyle = '#3e3e42';
    this.ctx.fillRect(x, y, w, h);

    this.ctx.strokeStyle = '#555555';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, w, h);

    if (element.text) {
      this.ctx.fillStyle = '#cccccc';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(element.text, x + w / 2, y + h / 2 + 4);
    }
  }

  private drawText(element: UIElement): void {
    const [x, y] = element.position;
    this.ctx.fillStyle = '#cccccc';
    this.ctx.font = '14px Arial';
    this.ctx.fillText(element.text || '', x, y);
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const element of this.elements.values()) {
        if (element.type === 'button' && element.onClick) {
          const [ex, ey] = element.position;
          const [ew, eh] = element.size;
          if (x >= ex && x <= ex + ew && y >= ey && y <= ey + eh) {
            element.onClick();
          }
        }
      }
    });
  }
}
