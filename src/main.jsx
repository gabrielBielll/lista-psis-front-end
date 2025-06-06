import React from 'react'; // Added React import for clarity, though StrictMode might imply it
import ReactDOM from 'react-dom/client'; // Corrected import for createRoot
import App from './App.jsx'; // Changed to App.jsx
import './App.css';      // Added App.css import
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
