import * as THREE from 'three';
import { Scene, Entity } from '@engine';

export class RuntimeEngine {
  private scene: Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private threeScene: THREE.Scene;
  private clock: THREE.Clock;
  private isRunning: boolean = false;
  private meshMap: Map<string, THREE.Object3D> = new Map();
  private onUpdate: (deltaTime: number) => void = () => {};

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container "${containerId}" not found`);

    // Scene
    this.scene = new Scene('Runtime Scene');
    this.clock = new THREE.Clock();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x1a1a1a);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Three.js Scene
    this.threeScene = new THREE.Scene();
    this.threeScene.background = new THREE.Color(0x1a1a1a);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.threeScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    this.threeScene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    this.threeScene.add(gridHelper);

    // Events
    window.addEventListener('resize', () => this.onWindowResize(container));
    this.animationLoop();
  }

  loadScene(sceneData: any): void {
    // TODO: Implement scene loading
  }

  addMesh(entity: Entity, mesh: THREE.Object3D): void {
    this.meshMap.set(entity.id, mesh);
    this.threeScene.add(mesh);
  }

  play(): void {
    this.isRunning = true;
    this.clock.start();
  }

  pause(): void {
    this.isRunning = false;
    this.clock.stop();
  }

  stop(): void {
    this.isRunning = false;
    this.clock.stop();
  }

  private animationLoop = (): void => {
    requestAnimationFrame(this.animationLoop);

    if (this.isRunning) {
      const deltaTime = this.clock.getDelta();
      this.onUpdate(deltaTime);
    }

    this.renderer.render(this.threeScene, this.camera);
  };

  private onWindowResize(container: HTMLElement): void {
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setOnUpdate(callback: (deltaTime: number) => void): void {
    this.onUpdate = callback;
  }

  getScene(): Scene {
    return this.scene;
  }

  getThreeScene(): THREE.Scene {
    return this.threeScene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
}
