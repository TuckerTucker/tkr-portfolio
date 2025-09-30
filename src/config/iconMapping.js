/**
 * Icon Mapping Configuration
 * Maps emoji representations to Lucide React icon names
 * Central source of truth for emoji → Lucide icon replacements
 */

export const iconMapping = {
  // Process & Analysis Icons
  '🔍': 'Search',
  '📊': 'BarChart3',
  '🔗': 'Link',
  '🪝': 'Anchor', // React hooks

  // Document & File Icons
  '📄': 'FileText',
  '📁': 'Folder',
  '📋': 'ClipboardList',
  '📝': 'FileEdit',

  // Status Icons
  '✅': 'CheckCircle2',
  '⚠️': 'AlertTriangle',
  '❌': 'XCircle',
  '⏸️': 'Pause',
  '⏳': 'Loader2',
  '▶️': 'Play',
  '🔄': 'RotateCcw',

  // Design & Creative Icons
  '🎨': 'Palette',
  '⚙️': 'Settings',
  '📐': 'Ruler',
  '🧩': 'Puzzle',

  // Communication & Interaction Icons
  '💬': 'MessageCircle',
  '💡': 'Lightbulb',
  '🎯': 'Target',
  '😫': 'Frown',
  '🤖': 'Bot',
  '🧠': 'Brain',
  '🔬': 'Microscope',
  '👤': 'User',

  // Action Icons
  '✨': 'Sparkles',
  '💾': 'Save',
  '✏️': 'Pencil',
  '🤔': 'HelpCircle',
  '📂': 'FolderOpen',
  '🔄': 'RefreshCw',
  '⏱️': 'Clock',
};

/**
 * Get Lucide icon name from emoji
 * @param {string} emoji - The emoji character
 * @returns {string} - The Lucide icon name
 */
export const getIconName = (emoji) => {
  return iconMapping[emoji] || 'Circle'; // Fallback to Circle if not found
};

/**
 * Check if an emoji has a mapping
 * @param {string} emoji - The emoji character
 * @returns {boolean}
 */
export const hasIconMapping = (emoji) => {
  return emoji in iconMapping;
};

export default iconMapping;