import React from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";

const WorldplayShowcase = ({ className = "" }) => {
  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 h-full ${className}`}>
      <div className="flex-1 md:flex-[1.2] min-h-[300px] md:min-h-[400px]">
        <img
          src={`${import.meta.env.BASE_URL}worldplay.svg`}
          alt="Worldplay logo"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6 rounded-lg" style={{ backgroundColor: 'var(--slide-card-bg)', border: '1px solid var(--slide-card-border)' }}>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: 'var(--slide-title)' }}>
            Worldplay Analytics
          </h2>
          
          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--slide-text)' }}>
            <p>
              Worldplay needed a comprehensive analytics dashboard to help internal customer support teams monitor live stream events in real-time.
            </p>            
          
            <div>
              <p className="mb-2" style={{ color: 'var(--slide-title)' }}>Key Features:</p>
              <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                <li>Real-time analytics visualization</li>
                <li>Custom report builder</li>
                <li>Audience segmentation tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

WorldplayShowcase.propTypes = {
  className: PropTypes.string,
};

export default WorldplayShowcase;