import * as THREE from 'three';
import { Scene, Entity, Transform } from '@engine';

export class EditorViewport {
  private scene: Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private threeScene: THREE.Scene;
  private controls: BasicOrbitControls;
  private meshMap: Map<string, THREE.Object3D> = new Map();
  private selectedEntity: Entity | null = null;
  private onEntitySelected: (entity: Entity) => void;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();

  constructor(scene: Scene, onEntitySelected: (entity: Entity) => void) {
    this.scene = scene;
    this.onEntitySelected = onEntitySelected;

    const container = document.getElementById('viewport') as HTMLElement;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x2a2a2a);
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
    this.threeScene.background = new THREE.Color(0x2a2a2a);

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

    // Axes
    const axesHelper = new THREE.AxesHelper(5);
    this.threeScene.add(axesHelper);

    // Controls
    this.controls = new BasicOrbitControls(this.camera, this.renderer.domElement);

    // Events
    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('click', (e) => this.onCanvasClick(e));
    this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Animation loop
    this.animate();
  }

  addMesh(entity: Entity, mesh: THREE.Object3D): void {
    this.meshMap.set(entity.id, mesh);
    
    const transform = entity.getComponent<Transform>('transform');
    if (transform) {
      mesh.position.copy(transform.position);
      mesh.quaternion.copy(transform.rotation);
      mesh.scale.copy(transform.scale);
    }
    
    this.threeScene.add(mesh);
  }

  removeMesh(entity: Entity): void {
    const mesh = this.meshMap.get(entity.id);
    if (mesh) {
      this.threeScene.remove(mesh);
      this.meshMap.delete(entity.id);
    }

    // Remove children meshes
    for (const child of entity.children) {
      this.removeMesh(child);
    }
  }

  highlightEntity(entity: Entity): void {
    // Remove highlight from previous
    if (this.selectedEntity) {
      const prevMesh = this.meshMap.get(this.selectedEntity.id);
      if (prevMesh) {
        this.removeOutline(prevMesh);
      }
    }

    this.selectedEntity = entity;
    const mesh = this.meshMap.get(entity.id);
    if (mesh) {
      this.addOutline(mesh);
    }
  }

  private addOutline(mesh: THREE.Object3D): void {
    let geometry: THREE.BufferGeometry | null = null;
    
    if (mesh instanceof THREE.Mesh) {
      geometry = mesh.geometry;
    } else if (mesh instanceof THREE.Group) {
      // For groups, create a bounding box
      const box = new THREE.Box3().setFromObject(mesh);
      geometry = new THREE.BoxGeometry(
        box.max.x - box.min.x,
        box.max.y - box.min.y,
        box.max.z - box.min.z
      );
    } else {
      geometry = new THREE.BoxGeometry();
    }

    const outline = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(outline, new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 }));
    line.name = 'outline';
    mesh.add(line);
  }

  private removeOutline(mesh: THREE.Object3D): void {
    const outline = mesh.getObjectByName('outline');
    if (outline) {
      mesh.remove(outline);
    }
  }

  private onCanvasClick(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const meshes = Array.from(this.meshMap.values());
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      for (const [entityId, mesh] of this.meshMap.entries()) {
        if (mesh === clickedMesh || mesh.children.includes(clickedMesh) || this.isChildOf(clickedMesh, mesh)) {
          const entity = this.scene.getEntityById(entityId);
          if (entity) {
            this.onEntitySelected(entity);
          }
          break;
        }
      }
    }
  }

  private isChildOf(child: THREE.Object3D, parent: THREE.Object3D): boolean {
    let current: THREE.Object3D | null = child;
    while (current) {
      if (current === parent) return true;
      current = current.parent;
    }
    return false;
  }

  private onWindowResize(): void {
    const container = this.renderer.domElement.parentElement as HTMLElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.threeScene, this.camera);
  };

  refresh(): void {
    // Refresh mesh positions from transforms
    for (const [entityId, mesh] of this.meshMap.entries()) {
      const entity = this.scene.getEntityById(entityId);
      if (entity) {
        const transform = entity.getComponent<Transform>('transform');
        if (transform) {
          mesh.position.copy(transform.position);
          mesh.quaternion.copy(transform.rotation);
          mesh.scale.copy(transform.scale);
        }
      }
    }
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

  getMeshForEntity(entity: Entity): THREE.Object3D | undefined {
    return this.meshMap.get(entity.id);
  }

  clear(): void {
    for (const mesh of this.meshMap.values()) {
      this.threeScene.remove(mesh);
    }
    this.meshMap.clear();
  }
}

/**
 * Basic orbit controls implementation
 */
class BasicOrbitControls {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private isRotating = false;
  private isPanning = false;
  private previousMousePosition = { x: 0, y: 0 };
  private distance = 10;
  private phi = Math.PI / 4;
  private theta = Math.PI / 4;
  private target = new THREE.Vector3(0, 0, 0);
  private panSpeed = 0.005;
  private rotateSpeed = 0.005;
  private zoomSpeed = 0.1;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.domElement.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });
  }

  private onMouseDown(event: MouseEvent): void {
    this.previousMousePosition = { x: event.clientX, y: event.clientY };
    if (event.button === 2) this.isRotating = true; // Right click
    if (event.button === 1) this.isPanning = true;  // Middle click
  }

  private onMouseMove(event: MouseEvent): void {
    const deltaX = event.clientX - this.previousMousePosition.x;
    const deltaY = event.clientY - this.previousMousePosition.y;

    if (this.isRotating) {
      this.theta += deltaX * this.rotateSpeed;
      this.phi -= deltaY * this.rotateSpeed;
      this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));
    }

    if (this.isPanning) {
      const panX = -deltaX * this.panSpeed * (this.distance / 10);
      const panY = deltaY * this.panSpeed * (this.distance / 10);
      this.target.add(new THREE.Vector3(panX, panY, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), this.theta));
    }

    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseUp(): void {
    this.isRotating = false;
    this.isPanning = false;
  }

  private onMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    this.distance += event.deltaY > 0 ? this.zoomSpeed : -this.zoomSpeed;
    this.distance = Math.max(1, Math.min(100, this.distance));
  }

  update(): void {
    const x = this.target.x + this.distance * Math.sin(this.phi) * Math.cos(this.theta);
    const y = this.target.y + this.distance * Math.cos(this.phi);
    const z = this.target.z + this.distance * Math.sin(this.phi) * Math.sin(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}
