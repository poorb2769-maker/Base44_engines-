import { EventEmitter } from 'events';

export enum KeyCode {
  // Arrow keys
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  // WASD
  W = 'KeyW',
  A = 'KeyA',
  S = 'KeyS',
  D = 'KeyD',
  // Space and Enter
  Space = 'Space',
  Enter = 'Enter',
  // Other common keys
  Escape = 'Escape',
  Shift = 'ShiftLeft',
  Control = 'ControlLeft',
  Alt = 'AltLeft'
}

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2
}

export interface GamepadState {
  connected: boolean;
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
  buttons: boolean[];
  triggers: { left: number; right: number };
}

export class InputManager extends EventEmitter {
  private keysPressed: Map<string, boolean> = new Map();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private mouseButtons: Map<MouseButton, boolean> = new Map();
  private gamepadStates: Map<number, GamepadState> = new Map();
  private inputBindings: Map<string, string[]> = new Map(); // action -> keys
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.setupListeners();
  }

  private setupListeners(): void {
    // Keyboard
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Mouse
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));

    // Gamepad
    window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnected(e));
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keysPressed.set(event.code, true);
    this.emit('keydown', event.code);
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keysPressed.set(event.code, false);
    this.emit('keyup', event.code);
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition.x = event.clientX - rect.left;
    this.mousePosition.y = event.clientY - rect.top;
    this.emit('mousemove', this.mousePosition);
  }

  private onMouseDown(event: MouseEvent): void {
    this.mouseButtons.set(event.button, true);
    this.emit('mousedown', event.button);
  }

  private onMouseUp(event: MouseEvent): void {
    this.mouseButtons.set(event.button, false);
    this.emit('mouseup', event.button);
  }

  private onGamepadConnected(event: GamepadEvent): void {
    console.log(`Gamepad connected: ${event.gamepad.id}`);
    this.emit('gamepadconnected', event.gamepad.index);
  }

  private onGamepadDisconnected(event: GamepadEvent): void {
    console.log(`Gamepad disconnected: ${event.gamepad.id}`);
    this.emit('gamepaddisconnected', event.gamepad.index);
  }

  /**
   * Check if key is pressed
   */
  isKeyPressed(keyCode: string): boolean {
    return this.keysPressed.get(keyCode) || false;
  }

  /**
   * Check if mouse button is pressed
   */
  isMouseButtonPressed(button: MouseButton): boolean {
    return this.mouseButtons.get(button) || false;
  }

  /**
   * Get mouse position
   */
  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  /**
   * Bind action to keys
   */
  bindAction(action: string, keys: string[]): void {
    this.inputBindings.set(action, keys);
  }

  /**
   * Check if action is performed
   */
  isActionPressed(action: string): boolean {
    const keys = this.inputBindings.get(action);
    if (!keys) return false;
    return keys.some(key => this.isKeyPressed(key));
  }

  /**
   * Update gamepad states
   */
  updateGamepads(): void {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepadStates.set(i, this.parseGamepadState(gamepads[i]));
      }
    }
  }

  private parseGamepadState(gamepad: Gamepad): GamepadState {
    return {
      connected: gamepad.connected,
      leftStick: {
        x: gamepad.axes[0] || 0,
        y: gamepad.axes[1] || 0
      },
      rightStick: {
        x: gamepad.axes[2] || 0,
        y: gamepad.axes[3] || 0
      },
      buttons: gamepad.buttons.map(b => b.pressed),
      triggers: {
        left: gamepad.buttons[4]?.value || 0,
        right: gamepad.buttons[5]?.value || 0
      }
    };
  }

  /**
   * Get gamepad state
   */
  getGamepadState(index: number): GamepadState | undefined {
    return this.gamepadStates.get(index);
  }

  /**
   * Destroy input manager
   */
  destroy(): void {
    // Remove listeners
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.removeAllListeners();
  }
}
