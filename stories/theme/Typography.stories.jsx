import React from 'react';

export default {
  title: 'Theme/Typography',
};

export const ThemeTypography = () => {
  return (
    <div>
      <h1 className="text-3xl font-heading mb-6 border-b pb-2">Theme Typography</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-heading mb-2">Heading Font: Graphite Std</h2>
        <p className="text-lg font-heading mb-4">
          Used for headings (e.g., <code className="bg-gray-200 px-1 rounded">font-heading</code>). Sourced from Adobe Fonts.
        </p>
        <p className="text-4xl font-heading mb-2">Aa Bb Cc Dd Ee Ff Gg</p>
        <p className="text-xl font-heading">The quick brown fox jumps over the lazy dog.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-heading mb-2">Body Font: Ellograph CF</h2>
        <p className="text-lg font-sans mb-4">
          Used for body text (e.g., <code className="bg-gray-200 px-1 rounded">font-sans</code>). Sourced from Adobe Fonts.
        </p>
        <p className="text-4xl font-sans mb-2">Aa Bb Cc Dd Ee Ff Gg</p>
        <p className="text-xl font-sans">The quick brown fox jumps over the lazy dog.</p>
      </div>

      <div>
        <h2 className="text-2xl font-heading mb-2">Font Source</h2>
        <p className="font-sans">
          Fonts are loaded via Adobe Fonts. Ensure the following link is included in your HTML's <code className="bg-gray-200 px-1 rounded">{'<head>'}</code>:
        </p>
        <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
          <code>{'<link rel="stylesheet" href="https://use.typekit.net/lmx7kzc.css" />'}</code>
        </pre>
        <p className="font-sans mt-2">
          This is typically added to <code className="bg-gray-200 px-1 rounded">{'index.html'}</code>.
        </p>
      </div>
    </div>
  );
};

ThemeTypography.storyName = 'Typography';
