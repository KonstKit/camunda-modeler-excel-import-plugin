import React from 'react';
import { formatValidationError } from './utils';

const ErrorDisplay = ({ error, onClose }) => {
  const formattedError = formatValidationError(error);

  return (
    <div className="error-container">
      <h3>{formattedError.title}</h3>
      <p>{formattedError.message}</p>
      
      {formattedError.details.length > 0 && (
        <div className="error-details">
          {formattedError.details.map((detail, index) => (
            <div key={index} className="error-detail">
              <h4>Parameter: {detail.parameter}</h4>
              <ul>
                {detail.errors.map((err, errIndex) => (
                  <li key={errIndex}>{err}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="button-container">
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
