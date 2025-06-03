import React from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";

const TheOffHoursCreative = ({ className = "" }) => {
  const successes = [
    "A writer who finished the first draft of their novel",
    "A paralegal who started their first regular painting practice"
  ];

  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 h-full ${className}`}>
      <div className="flex-1 md:flex-[1.2] min-h-[300px] md:min-h-[400px]">
        <img
          src={`${import.meta.env.BASE_URL}images/Off-hours-creative.png`}
          alt="The Off-Hours Creative logo"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6 rounded-lg" style={{ backgroundColor: 'var(--slide-card-bg)', border: '1px solid var(--slide-card-border)' }}>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: 'var(--slide-title)' }}>
            The Off-Hours Creative
          </h2>
          
          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--slide-text)' }}>
            <p>
              Doing creative work outside of a day job help keep me sane and fulfilled. I created a group for people, with full-time jobs, who have creative aspirations.
            </p>
            
            <div>
              <p className="mb-2" style={{ color: 'var(--slide-title)' }}>Successes include:</p>
              <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                {successes.map((success, index) => (
                  <li key={index}>{success}</li>
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
              href="https://www.offhourscreative.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Website
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

TheOffHoursCreative.propTypes = {
  className: PropTypes.string,
};

export default TheOffHoursCreative;