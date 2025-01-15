import React, { useEffect } from 'react';
import { useDialog } from '../Dialog/DialogManager';
import { useNotifications } from '../Notifications/NotificationSystem';
import { ImportProvider, useImportState, useImportDispatch, ImportStates } from './ImportState';
import { EnhancedImporter } from './EnhancedImporter';
import { parseExcelFile, validateExcelStructure } from './utils';

const ImportWorkflow = ({ modeler, file, onComplete }) => {
  const state = useImportState();
  const dispatch = useImportDispatch();
  const { DialogComponent, openDialog, closeDialog } = useDialog();
  const { addNotification } = useNotifications();
  const importer = new EnhancedImporter(modeler);

  useEffect(() => {
    if (file && state.status === ImportStates.IDLE) {
      dispatch({ type: 'FILE_SELECTED', payload: file });
      processExcelFile(file);
    }
  }, [file]);

  const processExcelFile = async (file) => {
    try {
      const excelData = await parseExcelFile(file);
      const { rowCount, headers } = validateExcelStructure(excelData);
      
      addNotification(
        `Successfully loaded Excel file with ${rowCount} rows and ${headers.length} columns`,
        'info'
      );

      dispatch({ type: 'SET_EXCEL_DATA', payload: excelData });
      openMappingDialog(excelData, headers);
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: error.message, type: 'file_processing' }
      });
      addNotification(error.message, 'error');
    }
  };

  const openMappingDialog = async (excelData, headers) => {
    const dmnParameters = await importer.extractDmnParameters();
    
    openDialog(
      <ColumnMappingModal
        excelColumns={headers}
        dmnParameters={dmnParameters}
        onConfirm={handleMappingComplete}
        onClose={() => {
          closeDialog();
          dispatch({ type: 'RESET' });
        }}
      />
    );
  };

  const handleMappingComplete = async (mappings) => {
    dispatch({ type: 'SET_MAPPINGS', payload: mappings });
    
    try {
      const validationResults = importer.validateExcelData(state.excelData, mappings);
      dispatch({ type: 'SET_VALIDATION_RESULTS', payload: validationResults });

      if (validationResults.hasErrors) {
        addNotification('Please correct validation errors before proceeding', 'warning');
        return;
      }

      const mergeResult = await importer.mergeRules(state.excelData, mappings);
      dispatch({ type: 'SET_MERGE_PREVIEW', payload: mergeResult });
      
      openDialog(
        <MergePreview
          mergeStats={mergeResult.stats}
          newRules={mergeResult.mergeResults.successful}
          onConfirm={handleMergeConfirm}
          onCancel={() => {
            closeDialog();
            openMappingDialog(state.excelData, Object.keys(state.excelData[0]));
          }}
        />
      );
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: error.message, type: 'validation' }
      });
      addNotification(error.message, 'error');
    }
  };

  const handleMergeConfirm = async () => {
    dispatch({ type: 'START_IMPORT' });
    
    try {
      const success = await importer.applyMergedRules(
        state.mergePreview.mergedRules
      );

      if (success) {
        dispatch({ type: 'COMPLETE_IMPORT' });
        addNotification('Successfully imported rules from Excel', 'success');
        onComplete?.();
        closeDialog();
      } else {
        throw new Error('Failed to apply merged rules');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: error.message, type: 'import' }
      });
      addNotification(error.message, 'error');
    }
  };

  return (
    <>
      {DialogComponent}
      {state.status === ImportStates.ERROR && (
        <ErrorDisplay 
          error={state.error}
          onClose={() => {
            dispatch({ type: 'RESET' });
            closeDialog();
          }}
        />
      )}
    </>
  );
};

export const EnhancedImportController = (props) => {
  return (
    <ImportProvider>
      <NotificationProvider>
        <ImportWorkflow {...props} />
      </NotificationProvider>
    </ImportProvider>
  );
};
