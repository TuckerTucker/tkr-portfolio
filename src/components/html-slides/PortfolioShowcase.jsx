import React from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";

const PortfolioShowcase = ({ className = "" }) => {
  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 h-full ${className}`}>
      <div className="flex-1 md:flex-[1.2] min-h-[300px] md:min-h-[400px]">
        <img
          src={`${import.meta.env.BASE_URL}images/tkr-portfolio/screenshot.png`}
          alt="TKR Portfolio website interface screenshot"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6 rounded-lg" style={{ backgroundColor: 'var(--slide-card-bg)', border: '1px solid var(--slide-card-border)' }}>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: 'var(--slide-title)' }}>
            Portfolio Website
          </h2>
          
          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--slide-text)' }}>
            <p>
              A meta-presentation showcasing the design and development process behind this very portfolio website.
            </p>            
            <p>
              Built with React 19, Vite, and Tailwind CSS, featuring a comprehensive design system and interactive HTML slides.
            </p>
          </div>
        </div>
        
        <div className="mt-6 md:mt-8 flex gap-3">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1 md:flex-initial transition-all"
            style={{ 
              backgroundColor: 'var(--slide-button-bg)',
              borderColor: 'var(--slide-button-border)',
              color: 'var(--slide-button-text)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--slide-button-hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--slide-button-bg)';
            }}
          >
            <a
              href="/storybook"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Storybook
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1 md:flex-initial transition-all"
            style={{ 
              backgroundColor: 'var(--slide-button-bg)',
              borderColor: 'var(--slide-button-border)',
              color: 'var(--slide-button-text)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--slide-button-hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--slide-button-bg)';
            }}
          >
            <a
              href="https://github.com/TuckerTucker/tkr-portfolio"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Code
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

PortfolioShowcase.propTypes = {
  className: PropTypes.string,
};

export default PortfolioShowcase;