import React from 'react';

interface ProgressIndicatorProps {
  progress: number;
  error?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress, error }) => {
  return (
    <div className="progress-indicator">
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      {error && <div className="error-message">{error}</div>}
      <style jsx>{`
        .progress-indicator {
          width: 100%;
          background-color: #f3f3f3;
          border-radius: 5px;
          overflow: hidden;
          position: relative;
        }
        .progress-bar {
          height: 10px;
          background-color: #4caf50;
          transition: width 0.3s ease;
        }
        .error-message {
          color: red;
          margin-top: 5px;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
};

export default ProgressIndicator;