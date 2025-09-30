import { Routes, Route, Navigate } from 'react-router-dom';
import Footer from './components/layout/footer';
import Navigation from './components/layout/Navigation';
import { useTheme } from './hooks/useTheme.jsx';

import HomePage from './components/pages/HomePage.jsx';
import ProjectPage from './components/pages/ProjectPage.jsx';
import DemoShowcase from './components/pages/DemoShowcase.jsx';

function App() {
  // Get theme for any additional theme-based logic
  const { theme } = useTheme();

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navigation />
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 md:px-0 pt-0 flex flex-col gap-8">
          <Routes>
            {/* Home redirects to first project */}
            <Route path="/" element={<HomePage />} />

            {/* Project pages with URL parameter */}
            <Route path="/project/:projectId" element={<ProjectPage />} />

            {/* Project with specific slide */}
            <Route path="/project/:projectId/slide/:slideIndex" element={<ProjectPage />} />

            {/* Demos page */}
            <Route path="/demos" element={<DemoShowcase />} />

            {/* Catch-all: redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;