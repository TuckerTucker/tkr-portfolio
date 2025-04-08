import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // Import HashRouter
import { SelectedProjectProvider } from './hooks/SelectedProjectContext.jsx'; // Import context provider
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SelectedProjectProvider> {/* Provide selected project context */}
      <HashRouter> {/* Wrap App with HashRouter */}
        <App />
      </HashRouter>
    </SelectedProjectProvider>
  </StrictMode>,
);
