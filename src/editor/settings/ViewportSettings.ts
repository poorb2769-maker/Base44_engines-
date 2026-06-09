export class GridSettings {
  enabled: boolean = true;
  size: number = 1;
  divisions: number = 20;
  snap: boolean = false;

  snapValue(value: number): number {
    if (!this.snap) return value;
    return Math.round(value / this.size) * this.size;
  }
}

export class ViewportSettings {
  gridSettings: GridSettings = new GridSettings();
  showLights: boolean = true;
  showHelper: boolean = true;
  showOutline: boolean = true;
  backgroundColor: number = 0x1a1a1a;
}
