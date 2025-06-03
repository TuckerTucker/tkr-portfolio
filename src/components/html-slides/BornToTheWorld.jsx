import React from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";

const BornToTheWorld = ({ className = "" }) => {
  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 h-full ${className}`}>
      <div className="flex-1 md:flex-[1.2] min-h-[300px] md:min-h-[400px]">
        <img
          src={`${import.meta.env.BASE_URL}images/Born-To-The-World-Cover-Remade-2021.png`}
          alt="Born to the World album cover"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6 rounded-lg" style={{ backgroundColor: 'var(--slide-card-bg)', border: '1px solid var(--slide-card-border)' }}>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: 'var(--slide-title)' }}>
            Born to the World
          </h2>
          
          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--slide-text)' }}>
            <p>
              I've been a songwriter since I was seventeen. When I turned forty, in 2011, I released my first collection of studio recordings.
            </p>            
            <p>
              <em>Born to the World</em> is five original songs of love-soaked heartache and wanderlust (including a lullaby).
            </p>
          </div>
        </div>
        
        <div className="mt-6 md:mt-8">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full md:w-auto transition-all"
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
              href="https://music.apple.com/us/album/born-to-the-world-ep/1588573507"
              target="_blank"
              rel="noopener noreferrer"
            >
              Listen on Apple Music
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

BornToTheWorld.propTypes = {
  className: PropTypes.string,
};

export default BornToTheWorld;