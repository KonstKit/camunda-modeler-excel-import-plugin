const menuConfig = {
  importGroup: {
    id: 'excel-import-group',
    label: 'Excel Integration',
    submenu: [
      {
        id: 'import-new-rules',
        label: 'Import Rules from Excel',
        accelerator: 'CommandOrControl+Shift+I',
        action: 'importNewRules',
        enabled: () => true
      },
      {
        id: 'merge-rules',
        label: 'Merge Excel Rules with DMN',
        accelerator: 'CommandOrControl+Shift+M',
        action: 'mergeRules',
        enabled: (state) => state.hasDmnTable
      },
      {
        type: 'separator'
      },
      {
        id: 'export-to-excel',
        label: 'Export DMN to Excel',
        accelerator: 'CommandOrControl+Shift+E',
        action: 'exportToExcel',
        enabled: (state) => state.hasDmnTable
      }
    ]
  }
};

export default menuConfig;
