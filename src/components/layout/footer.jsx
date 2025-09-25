import React from 'react';
import { Github, Linkedin, File, Cloud } from 'lucide-react';
import Branding from '@/components/custom/branding';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Footer = () => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/assets/resume.pdf';
    link.download = 'Tucker_Harley_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <footer className="w-full bg-[#613CB0] text-white py-2 mt-2">
      <div className="max-w-5xl mx-auto px-3">
        {/* Top section with branding and resume button */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-2 pb-2 border-b border-white/20">
          <Branding
            className="text-white mb-4 md:mb-0"
            nameClassName="text-xl font-semibold font-heading"
            titleClassName="text-sm opacity-80"
          />
          <Button
            variant="primary"
            className="bg-white hover:bg-white text-[#613CB0] border border-[#613CB0] font-semibold px-4 py-2 rounded transition-colors duration-200"
            onClick={handleDownload}
          >
            <File size={16} className="mr-2 text-[#613CB0]" />
            Download Resumé &nbsp;
          </Button>
        </div>

        {/* Bottom section with links, theme toggle, and copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-5 flex-wrap justify-center md:justify-start">
            <a
              href="https://linkedin.com/in/tuckerharleybrown"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-300 transition-colors text-xs"
            >
              <Linkedin size={16} />
              <span>LinkedIn</span>
            </a>
                        
            <a
              href="https://bsky.app/profile/tucker.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-300 transition-colors text-xs"
            >
              <Cloud size={16} />
              <span>Bluesky</span>
            </a>
            |            
            <a
              href="https://github.com/tuckertucker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-300 transition-colors text-xs"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
            <a
              href="https://tuckertucker.github.io/tkr-portfolio/storybook/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-300 transition-colors text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm11.5 5.5c-.828 0-1.5.672-1.5 1.5S14.672 10.5 15.5 10.5 17 9.828 17 9s-.672-1.5-1.5-1.5zM7 12v2h10v-2H7z"/>
              </svg>
              <span>Storybook</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="mr-1" />
            <div className="text-sm opacity-80">&copy; {new Date().getFullYear()} Sean 'Tucker' Harley</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
