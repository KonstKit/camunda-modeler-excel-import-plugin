import menuConfig from './features/MenuActions/menuConfig';
import { MenuActionsHandler } from './features/MenuActions/MenuActionsHandler';

export default class ExcelPlugin {
  constructor(modeler) {
    this.modeler = modeler;
    this.menuActionsHandler = new MenuActionsHandler(modeler);
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
        await this.menuActionsHandler.handleFileSelect(action);
        break;
      case 'exportToExcel':
        await this.menuActionsHandler.handleExportToExcel();
        break;
      default:
        console.warn(`Unknown menu action: ${action}`);
    }
  };
}
