import React from 'react';
import PdfDownload from '@/components/feature/pdf-download'; // Use alias

export const Default = () => <PdfDownload />;
Default.storyName = 'Default Download Button';

export const CustomFile = () => (
  <PdfDownload
    pdfUrl="/assets/another_resume.pdf"
    filename="Another_Resume.pdf"
    buttonText="Download Alternate Resume"
  />
);
CustomFile.storyName = 'Custom File & Text';

export const CustomStyling = () => (
  <PdfDownload
    className="rounded-full border-2 border-accent px-8 py-4 text-lg"
    buttonText="Download in Style"
  />
);
CustomStyling.storyName = 'With Custom Styling';


export default {
  title: 'Feature Components/PDF Download Button',
  component: PdfDownload,
  argTypes: {
    pdfUrl: { control: 'text' },
    filename: { control: 'text' },
    buttonText: { control: 'text' },
    className: { control: 'text' },
  },
};
