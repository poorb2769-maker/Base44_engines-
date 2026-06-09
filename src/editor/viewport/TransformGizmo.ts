import * as THREE from 'three';
import { Entity, Transform } from '@engine';
import { EditorViewport } from './EditorViewport';

export class TransformGizmo {
  private viewport: EditorViewport;
  private currentEntity: Entity | null = null;
  private gizmo: THREE.Group | null = null;
  private translateMode = true;
  private scaleMode = false;
  private isDragging = false;
  private dragAxis: 'x' | 'y' | 'z' | null = null;
  private dragStart = new THREE.Vector2();
  private initialPosition = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(viewport: EditorViewport) {
    this.viewport = viewport;
    this.setupEventListeners();
  }

  attachToEntity(entity: Entity): void {
    this.detach();
    this.currentEntity = entity;
    this.createGizmo();
  }

  detach(): void {
    if (this.gizmo) {
      this.viewport.getThreeScene().remove(this.gizmo);
      this.gizmo = null;
    }
    this.currentEntity = null;
  }

  private createGizmo(): void {
    if (!this.currentEntity) return;

    this.gizmo = new THREE.Group();
    const transform = this.currentEntity.getComponent<Transform>('transform');
    if (!transform) return;

    // Create axes
    const axisLength = 1.5;
    const xAxis = this.createAxis(new THREE.Vector3(axisLength, 0, 0), 0xff0000, 'x'); // Red
    const yAxis = this.createAxis(new THREE.Vector3(0, axisLength, 0), 0x00ff00, 'y'); // Green
    const zAxis = this.createAxis(new THREE.Vector3(0, 0, axisLength), 0x0000ff, 'z'); // Blue

    this.gizmo.add(xAxis, yAxis, zAxis);
    this.gizmo.position.copy(transform.position);

    this.viewport.getThreeScene().add(this.gizmo);
  }

  private createAxis(direction: THREE.Vector3, color: number, axis: 'x' | 'y' | 'z'): THREE.Group {
    const group = new THREE.Group();
    group.userData.axis = axis;

    // Arrow line
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      0, 0, 0,
      direction.x, direction.y, direction.z
    ]), 3));
    const material = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geometry, material);
    group.add(line);

    // Cone (arrow head)
    const coneGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const coneMaterial = new THREE.MeshBasicMaterial({ color });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.copy(direction);
    
    // Rotate cone to point along axis
    if (axis === 'x') cone.rotateZ(Math.PI / 2);
    else if (axis === 'z') cone.rotateX(-Math.PI / 2);
    
    group.add(cone);

    return group;
  }

  updateGizmo(): void {
    if (!this.gizmo || !this.currentEntity) return;
    
    const transform = this.currentEntity.getComponent<Transform>('transform');
    if (transform) {
      this.gizmo.position.copy(transform.position);
    }
  }

  private setupEventListeners(): void {
    const canvas = this.viewport.getRenderer().domElement;
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  private onMouseDown(event: MouseEvent): void {
    if (event.button !== 0 || !this.gizmo || !this.currentEntity) return; // Left click only

    const rect = this.viewport.getRenderer().domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.viewport.getCamera());
    const intersects = this.raycaster.intersectObjects(this.gizmo.children, true);

    if (intersects.length > 0) {
      const axis = (intersects[0].object.parent as any)?.userData?.axis ||
                   (intersects[0].object as any)?.userData?.axis;
      if (axis) {
        this.isDragging = true;
        this.dragAxis = axis;
        this.dragStart.set(event.clientX, event.clientY);
        
        const transform = this.currentEntity.getComponent<Transform>('transform');
        if (transform) {
          this.initialPosition.copy(transform.position);
        }
      }
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.dragAxis || !this.currentEntity) return;

    const deltaX = event.clientX - this.dragStart.x;
    const transform = this.currentEntity.getComponent<Transform>('transform');
    if (!transform) return;

    const movementAmount = deltaX * 0.01;

    const newPos = this.initialPosition.clone();
    if (this.dragAxis === 'x') newPos.x += movementAmount;
    else if (this.dragAxis === 'y') newPos.y += movementAmount;
    else if (this.dragAxis === 'z') newPos.z += movementAmount;

    transform.position.copy(newPos);
    this.gizmo!.position.copy(newPos);
  }

  private onMouseUp(): void {
    this.isDragging = false;
    this.dragAxis = null;
  }
}
