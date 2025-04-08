import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Use Button for styling consistency
import { Download } from 'lucide-react'; // Icon from .clinerules

/**
 * A button component specifically for downloading the PDF resume.
 * Uses an anchor tag for the download functionality, styled like a button.
 * Based on .clinerules definition for pdf_download.
 */
const PdfDownload = ({
  pdfUrl = "/assets/resume.pdf", // Default from .clinerules state template
  filename = "Tucker_Harley_Resume.pdf", // Default from .clinerules state template
  buttonText = "Download PDF Resume", // Default from .clinerules state template
  className,
  ...props
}) => {
  // Base classes from .clinerules properties, adapted for Button component
  // bg-slate-800 text-white rounded px-6 py-3 mt-6 flex items-center
  const baseClasses = "bg-slate-800 text-white mt-6"; // Button handles padding, flex, items-center

  return (
    <Button
      asChild // Render the child anchor tag instead of a button element
      className={cn(baseClasses, className)}
      {...props}
    >
      <a
        href={pdfUrl}
        download={filename}
        role="button" // Accessibility from .clinerules
        aria-label="Download resume as PDF" // Accessibility from .clinerules
      >
        <Download className="mr-2 h-4 w-4" /> {/* Icon size adjusted slightly */}
        {buttonText}
      </a>
    </Button>
  );
};

PdfDownload.propTypes = {
  pdfUrl: PropTypes.string,
  filename: PropTypes.string,
  buttonText: PropTypes.string,
  className: PropTypes.string,
};

export default PdfDownload;
