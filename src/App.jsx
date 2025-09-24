import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Footer from './components/layout/footer';
import Navigation from './components/layout/Navigation';
import CustomProjectPicker from './components/feature/custom-project-picker';
import { useProjects } from './hooks/useProjects.js';
import { useSelectedProject } from './hooks/SelectedProjectContext.jsx';
import { useTheme } from './hooks/useTheme.jsx';

import ImageCarousel from './components/feature/image-carousel.jsx';
import DemoShowcase from './components/pages/DemoShowcase.jsx';

const HomePage = () => {
  const { projects, loading, error } = useProjects();
  const { selectedProjectId, setSelectedProjectId } = useSelectedProject();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedTitle = selectedProject ? selectedProject.title : 'Select a Project';

  const handleSelectProject = (project) => {
    setSelectedProjectId(project.id);
  };

  // Effect to select the first project by default
  useEffect(() => {
    if (!loading && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [loading, projects, selectedProjectId, setSelectedProjectId]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto">
      {/* Project picker and content */}
      <div className="flex flex-col gap-0">
        <CustomProjectPicker
          projects={projects}
          selectedProjectTitle={selectedTitle}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
        />
        {loading && <p>Loading projects...</p>}
        {error && <p>Error loading projects.</p>}
        {selectedProject && (
          <>
            <ImageCarousel items={selectedProject.slides || []} />
          </>
        )}
      </div>

    </div>
  );
};

function App() {
  // Get theme for any additional theme-based logic
  const { theme } = useTheme();

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navigation />
        <main className="flex-grow w-full mx-auto px-6 pt-8 pb-8 flex flex-col gap-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demos" element={<DemoShowcase />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;