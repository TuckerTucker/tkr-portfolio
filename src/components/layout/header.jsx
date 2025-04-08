import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import Branding from '@/components/custom/branding';
import { Button } from '@/components/ui/button';

/**
 * The main header component for the portfolio.
 * Contains branding information and a resume download button.
 * Based on .clinerules definition for header.
 */
const Header = ({
  className,
  ...props
}) => {
  const baseClasses = "bg-primary p-4 flex justify-between items-center";

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/assets/resume.pdf';
    link.download = 'Tucker_Harley_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header
      className={cn(baseClasses, className)}
      role="banner"
      aria-label="Portfolio header"
      {...props}
    >
      <Branding className="text-white" />
      <Button
        variant="primary"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleDownload}
      >
        Resume
      </Button>
    </header>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
