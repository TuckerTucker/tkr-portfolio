import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * SkillsMatrix HTML Slide Component
 * Displays a visual matrix of skills with proficiency levels and categories.
 * Allows filtering by skill category and shows detailed information on hover.
 */
const SkillsMatrix = ({
  title = "Skills Matrix",
  categories = [],
  skills = [],
  selectedCategory = null,
  className,
  isMobile, // Extract isMobile prop
  ...props
}) => {
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'all');
  const [activeSkill, setActiveSkill] = useState(null);
  
  // Filter skills by category
  const filteredSkills = activeCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === activeCategory);
  
  // Get the active skill details
  const activeSkillData = skills.find(skill => skill.id === activeSkill);
  
  // Get color based on proficiency level
  const getProficiencyColor = (level) => {
    switch (level) {
      case 5: return 'bg-green-500';
      case 4: return 'bg-green-400';
      case 3: return 'bg-yellow-400';
      case 2: return 'bg-orange-400';
      case 1: return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };
  
  // Convert proficiency level to text
  const getProficiencyText = (level) => {
    switch (level) {
      case 5: return 'Expert';
      case 4: return 'Advanced';
      case 3: return 'Intermediate';
      case 2: return 'Basic';
      case 1: return 'Novice';
      default: return 'Not specified';
    }
  };

  return (
    <div className={cn("w-full h-full flex flex-col p-6 bg-gradient-to-r from-gray-900 to-gray-800", className)} {...props}>
      <div className="mb-5">
        <h2 className="text-2xl font-heading text-white">{title}</h2>
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          className={cn(
            "px-3 py-1 text-xs rounded-full transition-colors",
            activeCategory === 'all' 
              ? "bg-blue-500 text-white" 
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          )}
          onClick={() => setActiveCategory('all')}
        >
          All Skills
        </button>
        
        {categories.map((category) => (
          <button 
            key={category.id}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors",
              activeCategory === category.id 
                ? "bg-blue-500 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 flex-grow">
        {/* Skills grid */}
        <div className="w-full md:w-2/3 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredSkills.map((skill) => {
              const isActive = skill.id === activeSkill;
              
              return (
                <div 
                  key={skill.id}
                  className={cn(
                    "bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200",
                    isActive ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900" : "hover:bg-gray-700"
                  )}
                  onClick={() => setActiveSkill(isActive ? null : skill.id)}
                >
                  {/* Skill icon or placeholder */}
                  <div className="flex items-center justify-center mb-3">
                    {skill.icon ? (
                      <img 
                        src={skill.icon} 
                        alt={`${skill.name} icon`}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        {skill.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Skill name */}
                  <h3 className="text-sm font-medium text-white text-center mb-2">{skill.name}</h3>
                  
                  {/* Proficiency indicator */}
                  <div className="flex justify-center">
                    <div className="flex space-x-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level}
                          className={cn(
                            "w-2 h-6 rounded-sm",
                            level <= skill.proficiency ? getProficiencyColor(level) : "bg-gray-700"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Skill details */}
        <div className="w-full md:w-1/3 bg-gray-800 rounded-lg p-5">
          {activeSkillData ? (
            <div>
              <div className="flex items-center mb-4">
                {activeSkillData.icon && (
                  <img 
                    src={activeSkillData.icon}
                    alt={`${activeSkillData.name} icon`}
                    className="w-8 h-8 mr-3 object-contain"
                  />
                )}
                <h3 className="text-lg font-medium text-white">{activeSkillData.name}</h3>
              </div>
              
              {/* Category */}
              <div className="mb-4">
                <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">Category</span>
                <span className="text-sm text-white">
                  {categories.find(cat => cat.id === activeSkillData.category)?.name || activeSkillData.category}
                </span>
              </div>
              
              {/* Proficiency */}
              <div className="mb-4">
                <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">Proficiency</span>
                <div className="flex items-center">
                  <div className={cn(
                    "w-4 h-4 rounded-full mr-2",
                    getProficiencyColor(activeSkillData.proficiency)
                  )} />
                  <span className="text-sm text-white">
                    {getProficiencyText(activeSkillData.proficiency)}
                  </span>
                </div>
              </div>
              
              {/* Experience */}
              {activeSkillData.experience && (
                <div className="mb-4">
                  <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">Experience</span>
                  <span className="text-sm text-white">{activeSkillData.experience}</span>
                </div>
              )}
              
              {/* Description */}
              {activeSkillData.description && (
                <div className="mb-4">
                  <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">Description</span>
                  <p className="text-sm text-gray-300">{activeSkillData.description}</p>
                </div>
              )}
              
              {/* Projects */}
              {activeSkillData.projects && activeSkillData.projects.length > 0 && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">Projects</span>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {activeSkillData.projects.map((project, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {project}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-sm">
                Select a skill from the grid to view detailed information
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SkillsMatrix.propTypes = {
  title: PropTypes.string,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  skills: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      proficiency: PropTypes.number.isRequired, // 1-5
      icon: PropTypes.string,
      description: PropTypes.string,
      experience: PropTypes.string,
      projects: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  selectedCategory: PropTypes.string,
  className: PropTypes.string
};

export default SkillsMatrix;