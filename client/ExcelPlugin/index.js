import React from 'react';
import { EnhancedImportController } from '../features/ImportWorkflow/EnhancedImportController';
import { ErrorBoundary } from '../features/ImportWorkflow/ErrorBoundary';
import menuConfig from '../features/MenuActions/menuConfig';
import { MenuActionsHandler } from '../features/MenuActions/MenuActionsHandler';

export default class ExcelPlugin {
  constructor(modeler) {
    this.modeler = modeler;
    this.menuActionsHandler = new MenuActionsHandler(modeler);
    this.moduleRoot = null;
  }

  init(modules) {
    this.moduleRoot = modules;
  }

  registerMenuActions = () => {
    const menuEntries = [];

    menuConfig.importGroup.submenu.forEach(entry => {
      if (entry.type === 'separator') {
        menuEntries.push(entry);
        return;
      }

      menuEntries.push({
        ...entry,
        enabled: () => entry.enabled(this.menuActionsHandler.getMenuState()),
        action: () => this.handleMenuAction(entry.action)
      });
    });

    return [{
      ...menuConfig.importGroup,
      submenu: menuEntries
    }];
  };

  handleMenuAction = async (action) => {
    switch (action) {
      case 'importNewRules':
      case 'mergeRules':
        this.initiateFileSelection(action);
        break;
      case 'exportToExcel':
        await this.menuActionsHandler.handleExportToExcel();
        break;
      default:
        console.warn(`Unknown menu action: ${action}`);
    }
  };

  initiateFileSelection = (action) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      this.renderImportWorkflow(action, file);
    };

    input.click();
  };

  renderImportWorkflow = (action, file) => {
    const container = document.createElement('div');
    container.className = 'excel-import-workflow';
    document.body.appendChild(container);

    const onComplete = () => {
      document.body.removeChild(container);
    };

    const root = require('react-dom').createRoot(container);

    root.render(
      <ErrorBoundary>
        <EnhancedImportController
          modeler={this.modeler}
          file={file}
          mode={action === 'importNewRules' ? 'new' : 'merge'}
          onComplete={onComplete}
        />
      </ErrorBoundary>
    );
  };
}
