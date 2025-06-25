import React from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";

const TheSparkAndTheArt = ({ className = "" }) => {
  const guestLinks = [
    { name: "Stefan Sagmeister - Designer", episode: "24", url: "https://podcasts.apple.com/nz/podcast/24-stefan-sagmeister/id844809800?i=1000430450574" },
    { name: "Jorge Gutierrez - Animation Director", episode: "26", url: "https://podcasts.apple.com/nz/podcast/26-jorge-gutierrez-the-book-of-life-movie/id844809800?i=1000430450489" },
  ];

  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 h-full ${className}`}>
      <div className="flex-1 md:flex-[1.2] min-h-[300px] md:min-h-[400px]">
        <img
          src={`${import.meta.env.BASE_URL}images/tucker/the-spark-the-art.png`}
          alt="The Spark & The Art podcast logo"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6 rounded-lg" style={{ backgroundColor: 'var(--slide-card-bg)', border: '1px solid var(--slide-card-border)' }}>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: 'var(--slide-title)' }}>
            The Spark & The Art
          </h2>
          
          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--slide-text)' }}>
            <p>
              I produced <em>The Spark & The Art</em> for three and half years between March 2014 and September 2017. I interviewed Photographers, Novelists, Film Makers, Songwriters, Art Therapists and more.
            </p>
            
            <div>
              <p className="mb-2" style={{ color: 'var(--slide-title)' }}>Notable guests include:</p>
              <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                {guestLinks.map((guest, index) => (
                  <li key={index}>
                    <a
                      href={guest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline transition-opacity hover:opacity-80"
                      style={{ color: 'var(--slide-accent)' }}
                    >
                      {guest.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
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
              href="https://podcasts.apple.com/nz/podcast/the-spark-the-art/id844809800"
              target="_blank"
              rel="noopener noreferrer"
            >
              Listen on Apple Podcasts
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

TheSparkAndTheArt.propTypes = {
  className: PropTypes.string,
};

export default TheSparkAndTheArt;