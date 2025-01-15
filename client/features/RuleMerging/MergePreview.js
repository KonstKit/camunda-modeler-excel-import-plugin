import React from 'react';

const MergePreview = ({ mergeStats, newRules, onConfirm, onCancel }) => {
  return (
    <div className="merge-preview-container">
      <h3>Rule Merge Preview</h3>
      
      <div className="merge-stats">
        <p>Original Rules: {mergeStats.originalRules}</p>
        <p>New Rules to Add: {mergeStats.addedRules}</p>
        <p>Total Rules After Merge: {mergeStats.totalRules}</p>
      </div>

      <div className="new-rules-preview">
        <h4>New Rules Preview</h4>
        <table>
          <thead>
            <tr>
              {Object.keys(newRules[0] || {}).map(key => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {newRules.map((rule, index) => (
              <tr key={index}>
                {Object.values(rule).map((value, valueIndex) => (
                  <td key={valueIndex}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-container">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm} className="confirm-button">
          Confirm Merge
        </button>
      </div>
    </div>
  );
};

export default MergePreview;
