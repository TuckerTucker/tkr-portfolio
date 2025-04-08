import React from 'react';

export const ThemeColors = () => {
  const colors = {
    primary: "#613CB0",
    secondary: "#FF8800",
    nutrien: "#9ad441",
    worldplay: "#00a4e4",
    shaw: "#0488c1",
    accent: "#00A3FF",
    background: "#F5F5F5",
    card: "#FFFFFF",
    text: "#333333",
  };

  return (
    <div>
      <h1 className="text-2xl font-heading mb-4">Theme Colors</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(colors).map(([name, hex]) => (
          <div key={name} className="border border-gray-300 rounded p-4 shadow-sm">
            <div
              className="h-20 w-full rounded mb-2"
              style={{ backgroundColor: hex }}
            ></div>
            <p className="font-semibold capitalize">{name}</p>
            <p className="text-sm text-gray-600">{hex}</p>
            <p className={`text-sm text-${name}`}>Example Text (text-{name})</p>
            <div className={`mt-1 p-1 rounded bg-${name}`}>
              <p className="text-xs text-white mix-blend-difference">Example BG (bg-{name})</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ThemeColors.storyName = 'Colors';

export default {
  title: 'Theme/Colors',
  component: ThemeColors,
};
