import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/header';
import ProjectSelector from './components/feature/project-selector';
import { useProjects } from './hooks/useProjects.js';
import { useSelectedProject } from './hooks/SelectedProjectContext.jsx';

import ImageCarousel from './components/feature/image-carousel.jsx';
import Description from './components/feature/description.jsx';
import BulletListContainer from './components/feature/bullet-list-container.jsx';
import PdfDownload from './components/feature/pdf-download.jsx';
import MobileProjectCard from './components/feature/mobile-project-card.jsx';

const HomePage = () => {
  const { projects, loading, error } = useProjects();
  const { selectedProjectId, setSelectedProjectId } = useSelectedProject();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedTitle = selectedProject ? selectedProject.title : 'Select a Project';

  const handleSelectProject = (project) => {
    setSelectedProjectId(project.id);
  };

  // Placeholder images based on project id
  const images = selectedProject
    ? [
        { src: `/placeholder/${selectedProject.id}/slide1.jpg`, alt: 'Screenshot 1' },
        { src: `/placeholder/${selectedProject.id}/slide2.jpg`, alt: 'Screenshot 2' },
        { src: `/placeholder/${selectedProject.id}/slide3.jpg`, alt: 'Screenshot 3' }
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Desktop view */}
      <div className="hidden md:flex flex-col gap-6">
        <ProjectSelector
          projects={projects}
          selectedProjectTitle={selectedTitle}
          onSelectProject={handleSelectProject}
        />
        {loading && <p>Loading projects...</p>}
        {error && <p>Error loading projects.</p>}
        {selectedProject && (
          <>
            <ImageCarousel images={images} />
            <Description
              title={selectedProject.title}
              description={selectedProject.description}
            />
            <BulletListContainer items={selectedProject.bullets} />
            <div className="flex justify-center">
              <PdfDownload />
            </div>
          </>
        )}
      </div>

      {/* Mobile view */}
      <div className="flex flex-col md:hidden">
        {projects.map((project) => (
          <MobileProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            subtitle={project.subtitle}
            color={project.color}
            imageUrl={`/placeholder/${project.id}/thumbnail.jpg`}
            onClick={() => setSelectedProjectId(project.id)}
          />
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <Header />
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
