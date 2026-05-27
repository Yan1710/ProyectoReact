import React from 'react';
import './SimpleLoading.css';

const SimpleLoading = ({ text = 'Cargando...' }) => {
  return (
    <div className="simple-loading">
      <div className="loading-muneco-container">
        <div className="loading-muneco">
          <div className="muneco-face">
            <div className="muneco-eyes">
              <div className="eye left">•</div>
              <div className="eye right">•</div>
            </div>
            <div className="muneco-mouth">◡</div>
          </div>
        </div>
        <div className="loading-sparkles">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">⭐</div>
          <div className="sparkle sparkle-3">💫</div>
        </div>
      </div>
      <div className="loading-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default SimpleLoading;
