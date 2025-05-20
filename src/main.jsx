import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // Import HashRouter
import { SelectedProjectProvider } from './hooks/SelectedProjectContext.jsx'; // Import context provider
import { ThemeProvider } from './hooks/useTheme.jsx'; // Import ThemeProvider
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider> {/* Provide theme context */}
      <SelectedProjectProvider> {/* Provide selected project context */}
        <HashRouter> {/* Wrap App with HashRouter */}
          <App />
        </HashRouter>
      </SelectedProjectProvider>
    </ThemeProvider>
  </StrictMode>,
);
