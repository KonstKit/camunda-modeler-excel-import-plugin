import { ImportController } from '../ImportWorkflow/ImportController';

export class MenuActionsHandler {
  constructor(modeler) {
    this.modeler = modeler;
    this.activeEditor = null;
    this.elementRegistry = null;
    this.initializeEditorState();
  }

  initializeEditorState() {
    this.activeEditor = this.modeler.getActiveEditor();
    if (this.activeEditor) {
      this.elementRegistry = this.activeEditor.get('elementRegistry');
    }
  }

  getMenuState() {
    this.initializeEditorState();
    return {
      hasDmnTable: this.hasDmnTable()
    };
  }

  hasDmnTable() {
    if (!this.elementRegistry) return false;
    
    const elements = this.elementRegistry.filter(element => {
      return element.type === 'dmn:DecisionTable';
    });

    return elements.length > 0;
  }

  async handleFileSelect(action) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        await this.processExcelFile(action, file);
      } catch (error) {
        console.error('Error processing file:', error);
        // Handle error appropriately
      }
    };

    input.click();
  }

  async processExcelFile(action, file) {
    switch (action) {
      case 'importNewRules':
        await this.handleImportNewRules(file);
        break;
      case 'mergeRules':
        await this.handleMergeRules(file);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async handleImportNewRules(file) {
    const controller = new ImportController({
      modeler: this.modeler,
      file: file,
      mode: 'new'
    });

    // Render the ImportController component using your preferred method
    // This depends on your application's UI rendering system
  }

  async handleMergeRules(file) {
    const controller = new ImportController({
      modeler: this.modeler,
      file: file,
      mode: 'merge'
    });

    // Render the ImportController component
  }

  async handleExportToExcel() {
    // Implement export functionality
  }
}
