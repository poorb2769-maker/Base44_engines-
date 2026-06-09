import { Entity, ScriptComponent } from '@engine';

export class ScriptEditor {
  private container: HTMLElement | null = null;
  private currentEntity: Entity | null = null;

  constructor() {
    this.container = document.getElementById('script-panel');
  }

  editScript(entity: Entity): void {
    this.currentEntity = entity;
    if (!this.container) return;

    this.container.innerHTML = '';

    let scripts = entity.getComponent<any>('scripts') as ScriptComponent[];
    if (!scripts) {
      scripts = [];
      entity.addComponent('scripts', scripts);
    }

    // Add script button
    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Add Script';
    addBtn.className = 'toolbar-button';
    addBtn.style.width = '100%';
    addBtn.onclick = () => this.addNewScript();
    this.container.appendChild(addBtn);

    // List existing scripts
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const scriptDiv = document.createElement('div');
      scriptDiv.style.cssText = 'padding: 8px; border-bottom: 1px solid #3e3e42;';
      scriptDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <input type="text" value="${script.scriptName}" placeholder="Script name" style="flex: 1; padding: 4px; margin-right: 8px;" />
          <button style="padding: 4px 8px; background: #c1121f; color: white; border: none; border-radius: 2px; cursor: pointer;">×</button>
        </div>
        <textarea placeholder="// Enter script code here" style="width: 100%; height: 150px; padding: 8px; background: #1e1e1e; color: #cccccc; border: 1px solid #3e3e42; border-radius: 2px; font-family: monospace; font-size: 12px;">${script.scriptCode}</textarea>
      `;
      this.container.appendChild(scriptDiv);

      // Event listeners
      const input = scriptDiv.querySelector('input') as HTMLInputElement;
      const textarea = scriptDiv.querySelector('textarea') as HTMLTextAreaElement;
      const deleteBtn = scriptDiv.querySelector('button') as HTMLButtonElement;

      input.addEventListener('change', () => {
        script.scriptName = input.value;
      });

      textarea.addEventListener('change', () => {
        script.scriptCode = textarea.value;
      });

      deleteBtn.addEventListener('click', () => {
        scripts!.splice(i, 1);
        this.editScript(entity);
      });
    }
  }

  private addNewScript(): void {
    if (!this.currentEntity) return;
    let scripts = this.currentEntity.getComponent<any>('scripts') as ScriptComponent[];
    if (!scripts) {
      scripts = [];
      this.currentEntity.addComponent('scripts', scripts);
    }
    scripts.push(new ScriptComponent('NewScript', ''));
    this.editScript(this.currentEntity);
  }
}
