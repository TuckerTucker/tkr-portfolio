import { useTheme } from "../../hooks/useTheme.jsx";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div 
      className={cn(
        "flex items-center space-x-1 rounded-md theme-toggle",
        "bg-white/20 p-0.5",
        className
      )}
    >
      {/* Light theme icon */}
      <button
        onClick={() => setTheme(themes.light)}
        className={cn(
          "p-1.5 rounded-md transition-colors duration-200",
          theme === themes.light 
            ? 'bg-white text-[#613CB0]' 
            : 'text-white/90 hover:text-white hover:bg-white/10'
        )}
        aria-label="Light theme"
      >
        <span className="sr-only">Light mode</span>
        <SunIcon className="h-3.5 w-3.5" />
      </button>
      
      {/* System/auto theme icon */}
      <button
        onClick={() => setTheme(themes.system)}
        className={cn(
          "p-1.5 rounded-md transition-colors duration-200",
          theme === themes.system 
            ? 'bg-white text-[#613CB0]' 
            : 'text-white/90 hover:text-white hover:bg-white/10'
        )}
        aria-label="System theme preference"
      >
        <span className="sr-only">System theme</span>
        <ComputerIcon className="h-3.5 w-3.5" />
      </button>
      
      {/* Dark theme icon */}
      <button
        onClick={() => setTheme(themes.dark)}
        className={cn(
          "p-1.5 rounded-md transition-colors duration-200",
          theme === themes.dark 
            ? 'bg-white text-[#613CB0]' 
            : 'text-white/90 hover:text-white hover:bg-white/10'
        )}
        aria-label="Dark theme"
      >
        <span className="sr-only">Dark mode</span>
        <MoonIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Sun icon for light mode
function SunIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

// Moon icon for dark mode
function MoonIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

// Computer icon for system preference
function ComputerIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="12" rx="2" ry="2" />
      <path d="M12 16v4" />
      <path d="M9 20h6" />
    </svg>
  );
}