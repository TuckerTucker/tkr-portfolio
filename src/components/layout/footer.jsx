import React from 'react';
import { Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#613CB0] text-white py-4 mt-auto">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/tuckertucker"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-gray-300 transition-colors"
          >
            <Github size={20} />
            <span>GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/tuckerharleybrown"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-gray-300 transition-colors"
          >
            <Linkedin size={20} />
            <span>LinkedIn</span>
          </a>
          <a
            href="https://tuckertucker.github.io/tkr-portfolio/storybook/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm11.5 5.5c-.828 0-1.5.672-1.5 1.5S14.672 10.5 15.5 10.5 17 9.828 17 9s-.672-1.5-1.5-1.5zM7 12v2h10v-2H7z"/>
            </svg>
            <span>Storybook</span>
          </a>
        </div>
        <div className="text-sm opacity-80">&copy; {new Date().getFullYear()} Sean 'Tucker' Harley</div>
      </div>
    </footer>
  );
};

export default Footer;
