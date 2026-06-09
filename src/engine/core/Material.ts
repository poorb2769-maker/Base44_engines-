import { IComponent } from './Entity';

export interface MaterialProps {
  color: number;
  metalness: number;
  roughness: number;
  emissive: number;
  emissiveIntensity: number;
}

export class Material implements IComponent {
  type = 'material';

  color: number = 0x888888;
  metalness: number = 0;
  roughness: number = 0.5;
  emissive: number = 0x000000;
  emissiveIntensity: number = 1;

  constructor(props?: Partial<MaterialProps>) {
    if (props) {
      this.color = props.color ?? this.color;
      this.metalness = props.metalness ?? this.metalness;
      this.roughness = props.roughness ?? this.roughness;
      this.emissive = props.emissive ?? this.emissive;
      this.emissiveIntensity = props.emissiveIntensity ?? this.emissiveIntensity;
    }
  }

  toJSON(): any {
    return {
      color: this.color,
      metalness: this.metalness,
      roughness: this.roughness,
      emissive: this.emissive,
      emissiveIntensity: this.emissiveIntensity,
    };
  }

  static fromJSON(data: any): Material {
    return new Material(data);
  }
}
