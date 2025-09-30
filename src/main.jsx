import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter for clean URLs
import { SelectedProjectProvider } from './hooks/SelectedProjectContext.jsx'; // Import context provider
import { ThemeProvider } from './hooks/useTheme.jsx'; // Import ThemeProvider
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* BrowserRouter for clean URLs without hashes */}
      <ThemeProvider> {/* Provide theme context */}
        <SelectedProjectProvider> {/* Provide selected project context - needs Router hooks */}
          <App />
        </SelectedProjectProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
