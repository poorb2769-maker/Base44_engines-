import { Entity, Transform } from '@engine';

export interface ScriptContext {
  entity: Entity;
  deltaTime: number;
  scene: any;
}

export class ScriptComponent {
  scriptName: string = '';
  scriptCode: string = '';
  enabled: boolean = true;
  variables: Map<string, any> = new Map();

  constructor(name?: string, code?: string) {
    this.scriptName = name || '';
    this.scriptCode = code || '';
  }

  async execute(context: ScriptContext): Promise<void> {
    if (!this.enabled || !this.scriptCode) return;

    try {
      const func = new Function('entity', 'deltaTime', 'scene', 'variables', this.scriptCode);
      await func(context.entity, context.deltaTime, context.scene, this.variables);
    } catch (error) {
      console.error(`Script error in "${this.scriptName}":`, error);
    }
  }

  setVariable(name: string, value: any): void {
    this.variables.set(name, value);
  }

  getVariable(name: string): any {
    return this.variables.get(name);
  }

  toJSON(): any {
    return {
      scriptName: this.scriptName,
      scriptCode: this.scriptCode,
      enabled: this.enabled,
      variables: Object.fromEntries(this.variables),
    };
  }

  static fromJSON(data: any): ScriptComponent {
    const script = new ScriptComponent(data.scriptName, data.scriptCode);
    script.enabled = data.enabled ?? true;
    if (data.variables) {
      for (const [key, value] of Object.entries(data.variables)) {
        script.setVariable(key, value);
      }
    }
    return script;
  }
}
