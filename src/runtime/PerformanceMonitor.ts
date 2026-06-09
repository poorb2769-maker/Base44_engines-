import { Scene, Entity } from '@engine';
import * as THREE from 'three';

export class PerformanceMonitor {
  private frameCount: number = 0;
  private fps: number = 0;
  private lastTime: number = performance.now();
  private memoryUsage: number = 0;
  private drawCalls: number = 0;
  private triangles: number = 0;
  private entities: number = 0;

  update(scene: Scene, renderer: THREE.WebGLRenderer): void {
    const now = performance.now();
    this.frameCount++;

    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;

      // Update memory
      if (performance.memory) {
        this.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024);
      }

      // Count entities
      this.entities = scene.getAllEntities().length;
    }
  }

  getStats(): {
    fps: number;
    memory: number;
    entities: number;
    drawCalls: number;
    triangles: number;
  } {
    return {
      fps: this.fps,
      memory: parseFloat(this.memoryUsage.toFixed(1)),
      entities: this.entities,
      drawCalls: this.drawCalls,
      triangles: this.triangles,
    };
  }

  renderStats(ctx: CanvasRenderingContext2D): void {
    const stats = this.getStats();
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px monospace';
    ctx.fillText(`FPS: ${stats.fps}`, 10, 20);
    ctx.fillText(`Memory: ${stats.memory}MB`, 10, 35);
    ctx.fillText(`Entities: ${stats.entities}`, 10, 50);
  }
}
