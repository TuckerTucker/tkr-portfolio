import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/header';
import Footer from './components/layout/footer';
import CustomProjectPicker from './components/feature/custom-project-picker';
import { useProjects } from './hooks/useProjects.js';
import { useSelectedProject } from './hooks/SelectedProjectContext.jsx';

import ImageCarousel from './components/feature/image-carousel.jsx';
import ContentSection from './components/feature/content-section.jsx';

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
    <div className="flex flex-col gap-6">
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
            <ContentSection
              title={selectedProject.title}
              description={selectedProject.description}
              bullets={selectedProject.bullets}
            />
          </>
        )}
      </div>

    </div>
  );
};

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-text">
        <Header />
        <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
