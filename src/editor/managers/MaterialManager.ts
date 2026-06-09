import { Entity, Material } from '@engine';
import * as THREE from 'three';

export class MaterialManager {
  /**
   * Create standard material
   */
  static createMaterial(): Material {
    return new Material({
      color: 0x888888,
      metalness: 0,
      roughness: 0.5,
      emissive: 0x000000,
      emissiveIntensity: 1,
    });
  }

  /**
   * Apply material to Three.js mesh
   */
  static applyMaterialToMesh(material: Material, mesh: THREE.Object3D): void {
    if (mesh instanceof THREE.Mesh) {
      const threeMaterial = new THREE.MeshStandardMaterial({
        color: material.color,
        metalness: material.metalness,
        roughness: material.roughness,
        emissive: material.emissive,
        emissiveIntensity: material.emissiveIntensity,
      });
      mesh.material = threeMaterial;
    }
  }

  /**
   * Convert hex color to RGB object
   */
  static hexToRgb(hex: number): { r: number; g: number; b: number } {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(r: number, g: number, b: number): number {
    return (Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255);
  }
}
