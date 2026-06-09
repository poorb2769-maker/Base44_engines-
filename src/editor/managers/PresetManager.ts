export class PresetManager {
  private presets: Map<string, any> = new Map();

  /**
   * Save preset
   */
  savePreset(name: string, data: any): void {
    this.presets.set(name, JSON.parse(JSON.stringify(data)));
    this.persistPresets();
  }

  /**
   * Load preset
   */
  loadPreset(name: string): any {
    return this.presets.get(name);
  }

  /**
   * Get all presets
   */
  getAllPresets(): string[] {
    return Array.from(this.presets.keys());
  }

  /**
   * Delete preset
   */
  deletePreset(name: string): boolean {
    const result = this.presets.delete(name);
    this.persistPresets();
    return result;
  }

  /**
   * Persist to localStorage
   */
  private persistPresets(): void {
    try {
      const data = JSON.stringify(Array.from(this.presets.entries()));
      localStorage.setItem('base44-engine-presets', data);
    } catch (e) {
      console.warn('Failed to persist presets:', e);
    }
  }

  /**
   * Load from localStorage
   */
  loadPresetsFromStorage(): void {
    try {
      const data = localStorage.getItem('base44-engine-presets');
      if (data) {
        const entries = JSON.parse(data);
        this.presets = new Map(entries);
      }
    } catch (e) {
      console.warn('Failed to load presets:', e);
    }
  }
}
