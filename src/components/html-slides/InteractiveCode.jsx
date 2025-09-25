import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Download } from 'lucide-react';
import Prism from 'prismjs';

// Import Prism languages
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markup'; // HTML

// Import Prism themes
import 'prismjs/themes/prism.css'; // Light theme
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

const InteractiveCode = ({
  title = "",
  items = [],
  className = ""
}) => {
  const [selectedId, setSelectedId] = useState(items[0]?.id || null);
  const [fileContents, setFileContents] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});

  const selectedItem = items.find(item => item.id === selectedId);

  // Language detection from file extension
  const detectLanguage = (filename) => {
    if (!filename) return 'text';
    const extension = filename.split('.').pop()?.toLowerCase();

    const langMap = {
      'json': 'json',
      'md': 'markdown',
      'markdown': 'markdown',
      'html': 'markup',
      'htm': 'markup',
      'css': 'css',
      'yaml': 'yaml',
      'yml': 'yaml',
      'js': 'javascript',
      'jsx': 'javascript'
    };

    return langMap[extension] || 'text';
  };

  // Load file content
  const loadFileContent = async (item) => {
    if (fileContents[item.id]) return; // Already loaded

    setLoadingStates(prev => ({ ...prev, [item.id]: true }));
    setErrorStates(prev => ({ ...prev, [item.id]: false }));

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}public-docs/${item.filePath}`);
      if (!response.ok) throw new Error('File not found');

      const content = await response.text();
      setFileContents(prev => ({ ...prev, [item.id]: content }));
    } catch (error) {
      setErrorStates(prev => ({ ...prev, [item.id]: true }));
      console.warn(`Failed to load file: ${item.filePath}`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // Load content when item selection changes
  useEffect(() => {
    if (selectedItem) {
      loadFileContent(selectedItem);
    }
  }, [selectedId, selectedItem]);

  // Highlight code after content loads
  useEffect(() => {
    if (selectedItem && fileContents[selectedItem.id]) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        Prism.highlightAll();
      }, 10);
    }
  }, [selectedItem, fileContents]);

  // Download file handler
  const handleDownload = (item, content) => {
    if (!content) return;

    const filename = item.filename || 'code-sample';
    const language = item.language || detectLanguage(item.filePath); // Use filePath for extension detection
    const extension = filename.includes('.') ? '' : `.${language === 'markup' ? 'html' : language}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col h-full p-6 md:p-8 ${className}`}>
      {title && (
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--slide-title)' }}>
          {title}
        </h2>
      )}

      {/* File Cards - Horizontal Layout */}
      <div className="flex flex-wrap gap-3 mb-6">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          const isLoading = loadingStates[item.id];

          return (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`
                flex flex-row items-center justify-start px-4 py-3 rounded-lg
                transition-all duration-200 cursor-pointer
                hover:scale-[1.02] active:scale-[0.98]
                ${isSelected
                  ? 'ring-2'
                  : 'ring-1 ring-opacity-30'
                }
              `}
              style={{
                backgroundColor: 'var(--slide-card-bg)',
                borderColor: 'var(--slide-card-border)',
                ringColor: isSelected ? 'var(--slide-card-border)' : 'var(--slide-text)',
                ...(isSelected && {
                  backgroundColor: 'var(--slide-card-bg)',
                  filter: 'brightness(1.05)'
                })
              }}
              aria-pressed={isSelected}
              aria-label={`Select ${item.label}`}
              disabled={isLoading}
            >
              {/* Icon on Left */}
              {item.icon && (
                <div className="text-2xl mr-3">
                  {typeof item.icon === 'string' && item.icon.startsWith('/') ? (
                    <img
                      src={item.icon}
                      alt={`${item.label} icon`}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <span>{item.icon}</span>
                  )}
                </div>
              )}

              {/* Label on Right */}
              <div
                className="font-medium text-sm md:text-base"
                style={{ color: 'var(--slide-text)' }}
              >
                {isLoading ? 'Loading...' : item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Code Display Area */}
      {selectedItem && (
        <div
          className={`flex-1 rounded-lg overflow-hidden ${selectedItem.image ? 'flex gap-6 items-start' : ''}`}
          style={{
            backgroundColor: 'var(--slide-card-bg)',
            border: '1px solid var(--slide-card-border)'
          }}
        >
          {/* Image - Left Side */}
          {selectedItem.image && selectedItem.imagePosition !== 'right' && (
            <div className="flex-shrink-0 p-4">
              <img
                src={`${import.meta.env.BASE_URL}${selectedItem.image}`}
                alt={selectedItem.imageAlt || `${selectedItem.label} illustration`}
                className="w-auto h-auto max-h-[295px] object-contain rounded-lg"
                style={{
                  border: '1px solid var(--slide-card-border)',
                  maxWidth: '400px'
                }}
              />
            </div>
          )}

          {/* Code Area */}
          <div className={`${selectedItem.image ? 'flex-1' : 'w-full'} flex flex-col`}>
            {/* File Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: 'var(--slide-card-border)' }}
            >
              <div className="flex items-center space-x-2">
                <span
                  className="font-mono text-sm"
                  style={{ color: 'var(--slide-text)' }}
                >
                  {selectedItem.filename || selectedItem.filePath}
                </span>
              </div>

              <button
                onClick={() => handleDownload(selectedItem, fileContents[selectedItem.id])}
                disabled={!fileContents[selectedItem.id]}
                className="flex items-center space-x-1 px-2 py-1 rounded hover:opacity-70 disabled:opacity-30"
                style={{ color: 'var(--slide-text)' }}
                aria-label="Download file"
              >
                <Download size={16} />
                <span className="text-sm">Download</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
              {loadingStates[selectedItem.id] ? (
                <div className="p-6 text-center" style={{ color: 'var(--slide-text)' }}>
                  Loading file content...
                </div>
              ) : errorStates[selectedItem.id] ? (
                <div className="p-6 text-center" style={{ color: 'var(--slide-text)' }}>
                  hmmmm ... can't seem to find the file.
                </div>
              ) : fileContents[selectedItem.id] ? (
                <pre className="p-4 m-0 text-sm leading-relaxed">
                  <code
                    className={`language-${selectedItem.language || detectLanguage(selectedItem.filename)}`}
                    style={{
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {fileContents[selectedItem.id]}
                  </code>
                </pre>
              ) : (
                <div className="p-6 text-center opacity-60" style={{ color: 'var(--slide-text)' }}>
                  Select a file to view its content
                </div>
              )}
            </div>
          </div>

          {/* Image - Right Side */}
          {selectedItem.image && selectedItem.imagePosition === 'right' && (
            <div className="flex-shrink-0 p-4">
              <img
                src={`${import.meta.env.BASE_URL}${selectedItem.image}`}
                alt={selectedItem.imageAlt || `${selectedItem.label} illustration`}
                className="w-auto h-auto max-h-[295px] object-contain rounded-lg"
                style={{
                  border: '1px solid var(--slide-card-border)',
                  maxWidth: '400px'
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

InteractiveCode.propTypes = {
  title: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.string,
    label: PropTypes.string.isRequired,
    filePath: PropTypes.string.isRequired,
    filename: PropTypes.string,
    language: PropTypes.string, // Optional override
    image: PropTypes.string, // Path to image (any aspect ratio)
    imagePosition: PropTypes.oneOf(['left', 'right']), // Image position (default: left)
    imageAlt: PropTypes.string // Alt text for image
  })),
  className: PropTypes.string
};

export default InteractiveCode;