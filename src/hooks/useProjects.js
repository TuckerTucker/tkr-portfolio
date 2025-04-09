import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch and provide project data.
 * Loads from the static JSON file.
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/projects.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load projects.json');
        return res.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading projects:', err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { projects, loading, error };
}

export default useProjects;
