import React from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";

const NutrienShowcase = ({ className = "" }) => {
  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 h-full ${className}`}>
      <div className="flex-1 md:flex-[1.2] min-h-[300px] md:min-h-[400px]">
        <img
          src={`${import.meta.env.BASE_URL}slides/nutrien/multi_file_uploader.png`}
          alt="Nutrien multi-file uploader interface"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6 rounded-lg" style={{ backgroundColor: 'var(--slide-card-bg)', border: '1px solid var(--slide-card-border)' }}>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: 'var(--slide-title)' }}>
            Nutrien Safety Portal
          </h2>
          
          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--slide-text)' }}>
            <p>
              Nutrien, the world's largest provider of crop inputs and services, needed a solution to streamline safety document management across 1300 branch locations.
            </p>            
          
          </div>
        </div>
      </div>
    </div>
  );
};

NutrienShowcase.propTypes = {
  className: PropTypes.string,
};

export default NutrienShowcase;