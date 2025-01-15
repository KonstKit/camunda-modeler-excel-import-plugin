export const parseExcelFile = async (file) => {
  const XLSX = require('xlsx');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd'
        });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });

        resolve(jsonData);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const formatValidationError = (error) => {
  switch (error.type) {
    case 'validation':
      return {
        title: 'Data Validation Error',
        message: 'Some data in the Excel file does not match the expected format:',
        details: Object.entries(error.details).map(([param, errors]) => ({
          parameter: param,
          errors: errors.map(err => `Row ${err.row}: Expected ${err.expectedType}, got ${err.value}`)
        }))
      };
    
    case 'processing':
      return {
        title: 'Processing Error',
        message: error.message,
        details: []
      };
    
    case 'merge':
      return {
        title: 'Merge Error',
        message: error.message,
        details: []
      };
    
    default:
      return {
        title: 'Error',
        message: 'An unexpected error occurred',
        details: []
      };
  }
};

export const validateExcelStructure = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Excel file must contain at least one row of data');
  }

  const headers = Object.keys(data[0]);
  if (headers.length === 0) {
    throw new Error('Excel file must contain at least one column');
  }

  return {
    rowCount: data.length,
    headers
  };
};
