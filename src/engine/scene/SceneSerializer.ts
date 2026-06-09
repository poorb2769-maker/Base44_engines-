import { Scene } from './Scene';

export class SceneSerializer {
  /**
   * Export scene to JSON string
   */
  static exportToJSON(scene: Scene): string {
    return JSON.stringify(scene.toJSON(), null, 2);
  }

  /**
   * Import scene from JSON string
   */
  static importFromJSON(jsonString: string): Scene {
    try {
      const data = JSON.parse(jsonString);
      return Scene.fromJSON(data);
    } catch (error) {
      console.error('Failed to import scene:', error);
      throw new Error('Invalid scene JSON format');
    }
  }

  /**
   * Export scene to file
   */
  static downloadSceneFile(scene: Scene): void {
    const json = this.exportToJSON(scene);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scene.name}.scene.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import scene from file
   */
  static async loadSceneFromFile(file: File): Promise<Scene> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const scene = this.importFromJSON(jsonString);
          resolve(scene);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
