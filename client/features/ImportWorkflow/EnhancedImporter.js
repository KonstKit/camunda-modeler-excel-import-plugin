import { useState } from 'react';
import { RuleMerger } from '../RuleMerging/RuleMerger';
import { validateColumnData } from '../ColumnMapping/ValidationUtils';

export class EnhancedImporter {
  constructor(modeler) {
    this.modeler = modeler;
    this.activeEditor = modeler.getActiveEditor();
    this.modeling = this.activeEditor.get('modeling');
    this.elementRegistry = this.activeEditor.get('elementRegistry');
  }

  async extractDmnParameters(element) {
    const inputParameters = element.inputExpressions.map(input => ({
      id: input.id,
      name: input.label || input.text,
      type: input.typeRef,
      isInput: true
    }));

    const outputParameters = element.outputs.map(output => ({
      id: output.id,
      name: output.label || output.name,
      type: output.typeRef,
      isInput: false
    }));

    return [...inputParameters, ...outputParameters];
  }

  validateExcelData(excelData, columnMappings) {
    const validationResults = {};

    Object.entries(columnMappings).forEach(([parameterId, mapping]) => {
      const columnData = excelData.map(row => row[mapping.excelColumn]);
      const errors = validateColumnData(columnData, mapping.dataType);
      
      if (errors.length > 0) {
        validationResults[parameterId] = errors;
      }
    });

    return validationResults;
  }

  async mergeRules(element, excelData, columnMappings) {
    const existingRules = element.rules || [];
    const ruleMerger = new RuleMerger(existingRules, columnMappings);

    const mergeResults = {
      successful: [],
      failed: []
    };

    for (const row of excelData) {
      const result = ruleMerger.mergeRule(row);
      if (result.success) {
        mergeResults.successful.push(result.rule);
      } else {
        mergeResults.failed.push({
          row,
          error: result.error
        });
      }
    }

    return {
      mergeResults,
      stats: ruleMerger.getStats(),
      mergedRules: ruleMerger.getMergedRules()
    };
  }

  async applyMergedRules(element, mergedRules) {
    try {
      this.modeling.updateProperties(element, {
        rules: mergedRules
      });

      return true;
    } catch (error) {
      console.error('Failed to apply merged rules:', error);
      return false;
    }
  }
}
