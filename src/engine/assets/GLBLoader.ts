import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Group, Object3D } from 'three';
import { Entity } from '../core/Entity';
import { Transform } from '../core/Transform';

export interface LoadedModel {
  object: Group;
  entity: Entity;
}

export class GLBLoader {
  private loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * Load GLB file and convert to entity
   */
  async loadGLB(url: string, name?: string): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const object = gltf.scene;
          const entity = new Entity(name || object.name || 'Model');
          
          // Add transform component
          const transform = new Transform();
          entity.addComponent('transform', transform);

          // Add three.js object reference
          entity.addComponent('mesh', { 
            type: 'glb',
            object3d: object 
          });

          resolve({ object, entity });
        },
        undefined,
        (error) => {
          console.error('Failed to load GLB:', error);
          reject(new Error(`Failed to load GLB: ${error.message}`));
        }
      );
    });
  }

  /**
   * Load multiple GLB files
   */
  async loadMultipleGLB(urls: string[]): Promise<LoadedModel[]> {
    return Promise.all(urls.map((url) => this.loadGLB(url)));
  }

  /**
   * Load GLB from File object (for drag-drop, file input, etc.)
   */
  async loadGLBFromFile(file: File, name?: string): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);

      this.loader.load(
        url,
        (gltf) => {
          URL.revokeObjectURL(url);
          const object = gltf.scene;
          const entity = new Entity(name || file.name.replace('.glb', ''));
          
          const transform = new Transform();
          entity.addComponent('transform', transform);
          entity.addComponent('mesh', { 
            type: 'glb',
            object3d: object 
          });

          resolve({ object, entity });
        },
        undefined,
        (error) => {
          URL.revokeObjectURL(url);
          console.error('Failed to load GLB from file:', error);
          reject(new Error(`Failed to load GLB: ${error.message}`));
        }
      );
    });
  }
}
