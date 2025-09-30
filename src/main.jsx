import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // Import HashRouter
import { SelectedProjectProvider } from './hooks/SelectedProjectContext.jsx'; // Import context provider
import { ThemeProvider } from './hooks/useTheme.jsx'; // Import ThemeProvider
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter> {/* Router must be outermost to provide routing context */}
      <ThemeProvider> {/* Provide theme context */}
        <SelectedProjectProvider> {/* Provide selected project context - needs Router hooks */}
          <App />
        </SelectedProjectProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
);
