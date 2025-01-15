import { createContext, useContext, useReducer } from 'react';

const ImportStateContext = createContext();
const ImportDispatchContext = createContext();

export const ImportStates = {
  IDLE: 'idle',
  FILE_SELECTED: 'file_selected',
  MAPPING: 'mapping',
  VALIDATING: 'validating',
  PREVIEW: 'preview',
  IMPORTING: 'importing',
  COMPLETE: 'complete',
  ERROR: 'error'
};

const initialState = {
  status: ImportStates.IDLE,
  file: null,
  excelData: null,
  mappings: null,
  validationResults: null,
  mergePreview: null,
  error: null
};

function importReducer(state, action) {
  switch (action.type) {
    case 'FILE_SELECTED':
      return {
        ...state,
        status: ImportStates.FILE_SELECTED,
        file: action.payload
      };

    case 'SET_EXCEL_DATA':
      return {
        ...state,
        status: ImportStates.MAPPING,
        excelData: action.payload
      };

    case 'SET_MAPPINGS':
      return {
        ...state,
        status: ImportStates.VALIDATING,
        mappings: action.payload
      };

    case 'SET_VALIDATION_RESULTS':
      return {
        ...state,
        validationResults: action.payload,
        status: action.payload.hasErrors ? 
          ImportStates.MAPPING : 
          ImportStates.PREVIEW
      };

    case 'SET_MERGE_PREVIEW':
      return {
        ...state,
        status: ImportStates.PREVIEW,
        mergePreview: action.payload
      };

    case 'START_IMPORT':
      return {
        ...state,
        status: ImportStates.IMPORTING
      };

    case 'COMPLETE_IMPORT':
      return {
        ...state,
        status: ImportStates.COMPLETE
      };

    case 'SET_ERROR':
      return {
        ...state,
        status: ImportStates.ERROR,
        error: action.payload
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function ImportProvider({ children }) {
  const [state, dispatch] = useReducer(importReducer, initialState);

  return (
    <ImportStateContext.Provider value={state}>
      <ImportDispatchContext.Provider value={dispatch}>
        {children}
      </ImportDispatchContext.Provider>
    </ImportStateContext.Provider>
  );
}

export function useImportState() {
  const context = useContext(ImportStateContext);
  if (context === undefined) {
    throw new Error('useImportState must be used within an ImportProvider');
  }
  return context;
}

export function useImportDispatch() {
  const context = useContext(ImportDispatchContext);
  if (context === undefined) {
    throw new Error('useImportDispatch must be used within an ImportProvider');
  }
  return context;
}
