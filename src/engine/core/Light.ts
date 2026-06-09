import { IComponent } from './Entity';

export enum LightType {
  DIRECTIONAL = 'directional',
  POINT = 'point',
  SPOT = 'spot',
  AMBIENT = 'ambient',
}

export interface LightProps {
  type: LightType;
  intensity: number;
  color: number;
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
  shadow?: boolean;
}

export class Light implements IComponent {
  type = 'light';

  lightType: LightType = LightType.POINT;
  intensity: number = 1;
  color: number = 0xffffff;
  distance: number = 100;
  decay: number = 2;
  angle: number = Math.PI / 3;
  penumbra: number = 0;
  castShadow: boolean = false;

  constructor(props?: Partial<LightProps>) {
    if (props) {
      this.lightType = props.type ?? this.lightType;
      this.intensity = props.intensity ?? this.intensity;
      this.color = props.color ?? this.color;
      this.distance = props.distance ?? this.distance;
      this.decay = props.decay ?? this.decay;
      this.angle = props.angle ?? this.angle;
      this.penumbra = props.penumbra ?? this.penumbra;
      this.castShadow = props.shadow ?? this.castShadow;
    }
  }

  toJSON(): any {
    return {
      lightType: this.lightType,
      intensity: this.intensity,
      color: this.color,
      distance: this.distance,
      decay: this.decay,
      angle: this.angle,
      penumbra: this.penumbra,
      castShadow: this.castShadow,
    };
  }

  static fromJSON(data: any): Light {
    return new Light({
      type: data.lightType,
      intensity: data.intensity,
      color: data.color,
      distance: data.distance,
      decay: data.decay,
      angle: data.angle,
      penumbra: data.penumbra,
      shadow: data.castShadow,
    });
  }
}
