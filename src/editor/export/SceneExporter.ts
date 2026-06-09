import * as THREE from 'three';
import { Scene, Entity, Transform, Light, LightType } from '@engine';
import { EditorViewport } from './EditorViewport';
import { LightRenderer } from './LightRenderer';

export class SceneExporter {
  /**
   * Export scene to WebGL runtime format
   */
  static exportToWebGL(scene: Scene, viewport: EditorViewport): string {
    const data = {
      metadata: {
        format: 'three-scene',
        version: '1.0',
        exportedAt: new Date().toISOString(),
      },
      scene: scene.toJSON(),
      renderer: {
        clearColor: 0x1a1a1a,
        shadowMap: true,
      },
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export scene as HTML + Three.js viewer
   */
  static exportAsHTMLViewer(scene: Scene, viewport: EditorViewport, sceneName: string = 'scene'): string {
    const sceneData = scene.toJSON();
    const sceneJSON = JSON.stringify(sceneData);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sceneName} - Three.js Viewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      overflow: hidden;
    }
    #canvas { display: block; width: 100vw; height: 100vh; }
    #info {
      position: absolute;
      top: 10px;
      left: 10px;
      color: #888;
      font-size: 12px;
      background: rgba(0,0,0,0.7);
      padding: 10px;
      border-radius: 4px;
      max-width: 300px;
    }
  </style>
</head>
<body>
  <div id="info">
    <h2>${sceneName}</h2>
    <p>Right-click + drag to rotate</p>
    <p>Middle-click + drag to pan</p>
    <p>Scroll to zoom</p>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    const sceneData = ${sceneJSON};
    // TODO: Implement scene loader
    console.log('Scene data:', sceneData);
  </script>
</body>
</html>
    `.trim();

    return html;
  }

  /**
   * Download file helper
   */
  static downloadFile(content: string, filename: string, mimeType: string = 'application/json'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
