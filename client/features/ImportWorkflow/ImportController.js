import React, { useState } from 'react';
import { EnhancedImporter } from './EnhancedImporter';
import ColumnMappingModal from '../ColumnMapping/ColumnMappingModal';
import MergePreview from '../RuleMerging/MergePreview';

export const ImportController = ({ modeler, file }) => {
  const [step, setStep] = useState('mapping');
  const [columnMappings, setColumnMappings] = useState(null);
  const [mergePreview, setMergePreview] = useState(null);
  const [error, setError] = useState(null);

  const importer = new EnhancedImporter(modeler);
  const activeElement = modeler.getActiveEditor().get('elementRegistry').get(modeler.getActiveElement());

  const handleMappingConfirm = async (mappings) => {
    setColumnMappings(mappings);
    
    try {
      const excelData = await parseExcelFile(file);
      const validationResults = importer.validateExcelData(excelData, mappings);

      if (Object.keys(validationResults).length > 0) {
        setError({
          type: 'validation',
          details: validationResults
        });
        return;
      }

      const mergeResult = await importer.mergeRules(activeElement, excelData, mappings);
      setMergePreview(mergeResult);
      setStep('preview');
    } catch (err) {
      setError({
        type: 'processing',
        message: err.message
      });
    }
  };

  const handleMergeConfirm = async () => {
    try {
      const success = await importer.applyMergedRules(
        activeElement,
        mergePreview.mergedRules
      );

      if (success) {
        setStep('complete');
      } else {
        setError({
          type: 'merge',
          message: 'Failed to apply merged rules'
        });
      }
    } catch (err) {
      setError({
        type: 'merge',
        message: err.message
      });
    }
  };

  if (error) {
    return <ErrorDisplay error={error} onClose={() => setError(null)} />;
  }

  switch (step) {
    case 'mapping':
      return (
        <ColumnMappingModal
          onClose={() => /* handle close */}
          onConfirm={handleMappingConfirm}
          excelData={/* excel data */}
          dmnParameters={/* dmn parameters */}
        />
      );
    
    case 'preview':
      return (
        <MergePreview
          mergeStats={mergePreview.stats}
          newRules={mergePreview.mergeResults.successful}
          onConfirm={handleMergeConfirm}
          onCancel={() => setStep('mapping')}
        />
      );
    
    case 'complete':
      return (
        <div className="import-success">
          <h3>Import Complete</h3>
          <p>Successfully merged new rules into the DMN table.</p>
          <button onClick={() => /* handle close */}>Close</button>
        </div>
      );
  }
};
