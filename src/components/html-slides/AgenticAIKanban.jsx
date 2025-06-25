import React from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";

const AgenticAIKanban = ({ className = "" }) => {
  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 h-full ${className}`}>
      <div className="flex-1 md:flex-[1.2] min-h-[300px] md:min-h-[400px]">
        <img
          src={`${import.meta.env.BASE_URL}images/taskboard/screenshot.png`}
          alt="Agentic AI Kanban board interface screenshot"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6 rounded-lg" style={{ backgroundColor: 'var(--slide-card-bg)', border: '1px solid var(--slide-card-border)' }}>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: 'var(--slide-title)' }}>
            Agentic AI Kanban
          </h2>
          
          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--slide-text)' }}>
            <p>
              A lightweight, file-based kanban board system designed for AI agents and human-in-the-loop collaboration.
            </p>            
            <p>
              Features MCP Server integration, JSON-based architecture for easy AI parsing, and real-time collaboration with webhooks.
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
              href="https://github.com/TuckerTucker/taskboardai"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

AgenticAIKanban.propTypes = {
  className: PropTypes.string,
};

export default AgenticAIKanban;